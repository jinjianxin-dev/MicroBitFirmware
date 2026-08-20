/**
 * PCA9685 舵机控制
 *
 * V1.5.1 Stable Final
 *
 * 功能：
 * - PCA9685 舵机初始化
 * - 每通道独立最大角度（1°~360°）
 * - 每通道独立脉宽范围（500~2500us）
 * - 非阻塞平滑运动
 * - Pause / Resume / Stop
 * - 相对移动
 * - 全通道控制
 * - 状态查询
 *
 * 优化：
 * - 精简内部结构
 * - 减少重复代码
 * - 修复 setMaxAngle() 隐藏 Bug
 * - 修复 moveTo() 重复后台任务问题
 */

//% color=#2196F3 icon="\uf085" weight=80
namespace MBPCA9685Servo {

    //==================================================
    // 常量
    //==================================================

    const CHANNEL_COUNT = 16

    const DEFAULT_MAX_ANGLE = 180
    const DEFAULT_MIN_PULSE = 1000
    const DEFAULT_MAX_PULSE = 2000

    const MIN_PULSE_LIMIT = 500
    const MAX_PULSE_LIMIT = 2500


    //==================================================
    // 全局运动参数
    //==================================================

    let moveStep = 5
    let moveDelay = 50


    //==================================================
    // 每通道配置参数
    //==================================================

    let maxAngle: number[] = []
    let minPulse: number[] = []
    let maxPulse: number[] = []


    //==================================================
    // 每通道运动状态
    //==================================================

    let currentAngle: number[] = []
    let targetAngle: number[] = []

    let moving: boolean[] = []
    let paused: boolean[] = []

    // 运动任务 ID
    //
    // 每次新的 moveTo() 都会生成新的 ID。
    // 旧的后台任务发现 ID 不一致后自动退出。
    let moveId: number[] = []


    //==================================================
    // Internal Utilities
    //==================================================

    /**
     * 检查通道是否合法
     */
    function validChannel(channel: number): boolean {

        return channel >= 0 && channel < CHANNEL_COUNT
    }


    /**
     * 初始化单个通道的软件参数
     */
    function resetChannel(channel: number): void {

        maxAngle[channel] = DEFAULT_MAX_ANGLE

        minPulse[channel] = DEFAULT_MIN_PULSE
        maxPulse[channel] = DEFAULT_MAX_PULSE

        currentAngle[channel] = DEFAULT_MAX_ANGLE >> 1
        targetAngle[channel] = DEFAULT_MAX_ANGLE >> 1

        moving[channel] = false
        paused[channel] = false

        // 使旧的后台运动任务失效
        moveId[channel] =
            (moveId[channel] || 0) + 1
    }


    /**
     * 限制角度
     */
    function clampAngle(
        channel: number,
        angle: number
    ): number {

        if (angle < 0)
            return 0

        if (angle > maxAngle[channel])
            return maxAngle[channel]

        return angle
    }


    /**
     * 角度转换为脉宽
     */
    function angleToPulse(
        channel: number,
        angle: number
    ): number {

        angle = clampAngle(channel, angle)

        return Math.round(
            minPulse[channel] +
            (maxPulse[channel] - minPulse[channel]) *
            angle / maxAngle[channel]
        )
    }


    /**
     * 实际输出舵机角度
     */
    function applyAngle(
        channel: number,
        angle: number
    ): void {

        angle = clampAngle(channel, angle)

        PCA9685.setPulse(
            channel,
            angleToPulse(channel, angle)
        )

        currentAngle[channel] = angle
    }


    //==================================================
    // 初始化软件参数
    //==================================================

    for (let i = 0; i < CHANNEL_COUNT; i++) {

        resetChannel(i)
    }


    //==================================================
    // PCA9685 初始化
    //==================================================

    /**
     * 初始化 PCA9685 舵机控制
     *
     * 内部调用 PCA9685.init()
     *
     * PCA9685 将设置为 50Hz 舵机控制模式。
     */
    //% block="初始化 PCA9685 舵机"
    export function init(): void {

        PCA9685.init()
    }


    //==================================================
    // 运动参数
    //==================================================

    /**
     * 设置平滑运动步长
     *
     * 数值越大，移动越快。
     */
    //% block="设置运动步长 %step °"
    //% step.min=1 step.max=30
    //% step.defl=5
    export function setMoveStep(
        step: number
    ): void {

        if (step < 1)
            step = 1

        if (step > 30)
            step = 30

        moveStep = step
    }


    /**
     * 设置平滑运动间隔
     *
     * 单位：毫秒
     */
    //% block="设置运动间隔 %delay ms"
    //% delay.min=10 delay.max=1000
    //% delay.defl=50
    export function setMoveDelay(
        delay: number
    ): void {

        if (delay < 10)
            delay = 10

        if (delay > 1000)
            delay = 1000

        moveDelay = delay
    }


    //==================================================
    // 舵机配置
    //==================================================

    /**
     * 设置指定舵机的最大角度
     *
     * 180 = 普通舵机
     * 270 = 270°舵机
     * 360 = 360°舵机
     */
    //% block="设置舵机 %channel 最大角度 %angle °"
    //% angle.min=1 angle.max=360
    //% angle.defl=180
    export function setMaxAngle(
        channel: number,
        angle: number
    ): void {

        if (!validChannel(channel))
            return

        if (angle < 1)
            angle = 1

        if (angle > 360)
            angle = 360

        maxAngle[channel] = angle

        // 最大角度改变后，
        // 当前角度和目标角度都必须重新限制。
        currentAngle[channel] =
            clampAngle(
                channel,
                currentAngle[channel]
            )

        targetAngle[channel] =
            clampAngle(
                channel,
                targetAngle[channel]
            )
    }


    /**
     * 设置指定舵机的脉宽范围
     *
     * 单位：微秒
     */
    //% block="设置舵机 %channel 脉宽范围 最小 %min 最大 %max μs"
    //% min.min=500 min.max=2500 min.defl=1000
    //% max.min=500 max.max=2500 max.defl=2000
    export function setPulseRange(
        channel: number,
        min: number,
        max: number
    ): void {

        if (!validChannel(channel))
            return

        if (min < MIN_PULSE_LIMIT)
            min = MIN_PULSE_LIMIT

        if (max > MAX_PULSE_LIMIT)
            max = MAX_PULSE_LIMIT

        // 最小值必须小于最大值
        if (min >= max)
            return

        minPulse[channel] = min
        maxPulse[channel] = max

        // 使用新的脉宽范围重新输出当前位置
        applyAngle(
            channel,
            currentAngle[channel]
        )
    }


    //==================================================
    // 基础控制
    //==================================================

    /**
     * 立即设置舵机角度
     *
     * 会取消当前平滑运动。
     */
    //% block="舵机 %channel 转到 %angle °"
    //% angle.min=0 angle.max=360
    //% angle.defl=90
    export function setAngle(
        channel: number,
        angle: number
    ): void {

        if (!validChannel(channel))
            return

        angle = clampAngle(
            channel,
            angle
        )

        // 使旧后台任务失效
        moveId[channel] =
            (moveId[channel] || 0) + 1

        moving[channel] = false
        paused[channel] = false

        applyAngle(
            channel,
            angle
        )

        targetAngle[channel] = angle
    }


    /**
     * 舵机回到中心位置
     */
    //% block="舵机 %channel 回到中心"
    export function center(
        channel: number
    ): void {

        if (!validChannel(channel))
            return

        setAngle(
            channel,
            maxAngle[channel] >> 1
        )
    }


    /**
     * 停止舵机
     *
     * 保持当前角度。
     * 不会继续原来的目标。
     */
    //% block="舵机 %channel 停止"
    export function stop(
        channel: number
    ): void {

        if (!validChannel(channel))
            return

        // 使旧后台任务失效
        moveId[channel] =
            (moveId[channel] || 0) + 1

        moving[channel] = false
        paused[channel] = false

        targetAngle[channel] =
            currentAngle[channel]
    }


    /**
     * 暂停舵机
     *
     * 保留原来的目标角度。
     */
    //% block="舵机 %channel 暂停"
    export function pause(
        channel: number
    ): void {

        if (!validChannel(channel))
            return

        if (moving[channel])
            paused[channel] = true
    }


    /**
     * 继续舵机运动
     */
    //% block="舵机 %channel 继续"
    export function resume(
        channel: number
    ): void {

        if (!validChannel(channel))
            return

        if (paused[channel]) {

            paused[channel] = false
            moving[channel] = true
        }
    }

    /**
     * 等待指定通道舵机运动完成
     *
     * 注意：
     * 这是阻塞函数。
     * 常用于多个动作顺序执行。
     */
    //% block="等待 PCA9685 舵机通道 %channel 完成运动"
    //% channel.min=0 channel.max=15
    export function wait(
        channel: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        while (moving[channel]) {
            basic.pause(10)
        }
    }

    //==================================================
    // 非阻塞平滑运动
    //==================================================

    /**
     * 平滑移动到指定角度
     *
     * 非阻塞。
     *
     * 如果同一个通道正在执行 moveTo()，
     * 新的 moveTo() 会自动取代旧目标。
     */
    //% block="舵机 %channel 平滑移动到 %angle °"
    //% angle.min=0 angle.max=360
    //% angle.defl=90
    export function moveTo(
        channel: number,
        angle: number
    ): void {

        if (!validChannel(channel))
            return

        angle = clampAngle(
            channel,
            angle
        )

        // 创建新的运动任务 ID
        moveId[channel] =
            (moveId[channel] || 0) + 1

        let id = moveId[channel]

        targetAngle[channel] = angle
        paused[channel] = false
        moving[channel] = true

        control.inBackground(function () {

            // 只有最新的运动任务可以继续运行
            while (
                moving[channel] &&
                moveId[channel] == id
            ) {

                // 暂停
                if (paused[channel]) {

                    basic.pause(20)
                    continue
                }

                // 已经到达目标
                if (
                    currentAngle[channel] ==
                    targetAngle[channel]
                ) {

                    moving[channel] = false
                    break
                }

                let nextAngle =
                    currentAngle[channel]

                // 正方向
                if (
                    nextAngle <
                    targetAngle[channel]
                ) {

                    nextAngle += moveStep

                    if (
                        nextAngle >
                        targetAngle[channel]
                    )
                        nextAngle =
                            targetAngle[channel]

                // 负方向
                } else {

                    nextAngle -= moveStep

                    if (
                        nextAngle <
                        targetAngle[channel]
                    )
                        nextAngle =
                            targetAngle[channel]
                }

                applyAngle(
                    channel,
                    nextAngle
                )

                basic.pause(moveDelay)
            }
        })
    }


    //==================================================
    // 相对移动
    //==================================================

    /**
     * 从当前位置相对移动
     *
     * 正数：增加角度
     * 负数：减少角度
     */
    //% block="舵机 %channel 相对移动 %delta °"
    //% delta.min=-360 delta.max=360
    //% delta.defl=10
    export function moveBy(
        channel: number,
        delta: number
    ): void {

        if (!validChannel(channel))
            return

        moveTo(
            channel,
            currentAngle[channel] + delta
        )
    }

    
    //==================================================
    // 两舵机同步移动
    //==================================================

    /**
     * 两个舵机同步移动到目标角度
     *
     * 两个舵机会同时开始，
     * 同时结束。
     */
    //% block="同步移动 舵机%ch1 到%angle1° 舵机%ch2 到%angle2°"
    //% inlineInputMode=inline
    export function moveToSync2(
        ch1: number,
        angle1: number,
        ch2: number,
        angle2: number
    ): void {

        if (ch1 < 0 || ch1 >= CHANNEL_COUNT)
            return

        if (ch2 < 0 || ch2 >= CHANNEL_COUNT)
            return

        angle1 = clampAngle(ch1, angle1)
        angle2 = clampAngle(ch2, angle2)

        let d1 = Math.abs(angle1 - currentAngle[ch1])
        let d2 = Math.abs(angle2 - currentAngle[ch2])

        let maxDistance = Math.max(d1, d2)

        if (maxDistance == 0)
            return

        let steps = Math.ceil(maxDistance / moveStep)

        control.runInBackground(function () {

            let p1 = currentAngle[ch1]
            let p2 = currentAngle[ch2]

            let step1 = (angle1 - p1) / steps
            let step2 = (angle2 - p2) / steps

            moving[ch1] = true
            moving[ch2] = true

            paused[ch1] = false
            paused[ch2] = false

            for (let i = 0; i < steps; i++) {

                while (paused[ch1] || paused[ch2]) {

                    basic.pause(10)
                }

                p1 += step1
                p2 += step2

                applyAngle(ch1, Math.round(p1))
                applyAngle(ch2, Math.round(p2))

                basic.pause(moveDelay)
            }

            applyAngle(ch1, angle1)
            applyAngle(ch2, angle2)

            moving[ch1] = false
            moving[ch2] = false
        })
    }




    //==================================================
    // 状态查询
    //==================================================

    /**
     * 判断舵机是否正在运动
     *
     * 暂停状态返回 false。
     */
    //% block="舵机 %channel 正在运动"
    /*
    export function isMoving(
        channel: number
    ): boolean {

        if (!validChannel(channel))
            return false

        return moving[channel] &&
            !paused[channel]
    }
    */


    /**
     * 判断舵机是否处于暂停状态
     */
    //% block="舵机 %channel 已暂停"
    /*
    export function isPaused(
        channel: number
    ): boolean {

        if (!validChannel(channel))
            return false

        return paused[channel]
    }
    */


    /**
     * 获取当前角度
     */
    //% block="舵机 %channel 当前角度"
    /*
    export function getAngle(
        channel: number
    ): number {

        if (!validChannel(channel))
            return 0

        return currentAngle[channel]
    }
    */


    /**
     * 获取目标角度
     */
    //% block="舵机 %channel 目标角度"
    /*
    export function getTargetAngle(
        channel: number
    ): number {

        if (!validChannel(channel))
            return 0

        return targetAngle[channel]
    }
    */


    //==================================================
    // 全通道控制
    //==================================================

    /**
     * 停止所有舵机
     *
     * 保持当前位置。
     */
    //% block="停止所有舵机"
    /*
    export function stopAll(): void {

        for (
            let channel = 0;
            channel < CHANNEL_COUNT;
            channel++
        ) {

            if (moving[channel]) {

                // 使后台任务失效
                moveId[channel] =
                    (moveId[channel] || 0) + 1

                moving[channel] = false
                paused[channel] = false

                targetAngle[channel] =
                    currentAngle[channel]
            }
        }
    }
    */


    /**
     * 暂停所有舵机
     */
    //% block="暂停所有舵机"
    /*
    export function pauseAll(): void {

        for (
            let channel = 0;
            channel < CHANNEL_COUNT;
            channel++
        ) {

            if (moving[channel])
                paused[channel] = true
        }
    }
    */

    /**
     * 继续所有舵机
     */
    //% block="继续所有舵机"
    /*
    export function resumeAll(): void {

        for (
            let channel = 0;
            channel < CHANNEL_COUNT;
            channel++
        ) {

            if (paused[channel]) {

                paused[channel] = false
                moving[channel] = true
            }
        }
    }
    */


    //==================================================
    // 软件参数复位
    //==================================================

    /**
     * 恢复指定通道默认参数
     *
     * 只恢复软件参数。
     * 不重新初始化 PCA9685。
     */
    //% block="恢复舵机 %channel 默认设置"
    /*
    export function reset(
        channel: number
    ): void {

        if (!validChannel(channel))
            return

        resetChannel(channel)
    }
    */


    /**
     * 恢复所有通道默认参数
     *
     * 只恢复软件参数。
     * 不重新初始化 PCA9685。
     */
    //% block="恢复所有舵机默认设置"
    /*
    export function resetAll(): void {

        for (
            let channel = 0;
            channel < CHANNEL_COUNT;
            channel++
        ) {

            resetChannel(channel)
        }
    }
    */
}