/**
 * PCA9685 舵机控制
 *
 * V1.5
 *
 * 功能：
 * - 舵机角度控制
 * - 舵机回中
 * - 非阻塞平滑移动
 * - 相对角度移动
 * - 每通道独立最大角度
 * - 每通道独立脉宽范围
 * - 舵机移动步长设置
 * - 舵机移动间隔设置
 * - 多通道独立运动
 * - 暂停 / 继续运动
 * - 停止运动
 *
 * 特点：
 * - moveTo() 不阻塞主程序
 * - 后台自动执行舵机运动
 * - 每个 PCA9685 通道独立控制
 * - 每个通道可以使用不同的舵机
 * - 新目标会覆盖原目标
 *
 * 底层：
 * PCA9685
 *
 * 默认：
 * 最大角度：180°
 * 最小脉宽：1000us
 * 最大脉宽：2000us
 * 50Hz
 */

//% color=#2196F3 icon="\uf085" weight=80
namespace MBPCA9685Servo {

    //==================================================
    // 基本参数
    //==================================================

    const CHANNEL_COUNT = 16

    const MIN_ANGLE = 0

    const DEFAULT_MAX_ANGLE = 180

    const DEFAULT_MIN_PULSE = 1000
    const DEFAULT_MAX_PULSE = 2000


    //==================================================
    // 脉宽限制
    //==================================================

    const MIN_PULSE_LIMIT = 500
    const MAX_PULSE_LIMIT = 2500


    //==================================================
    // 移动参数
    //==================================================

    // 每次移动的角度
    let moveStep = 5

    // 每一步之间的等待时间
    let moveDelay = 50


    //==================================================
    // 每个通道的舵机参数
    //==================================================

    // 每个通道的最大角度
    //
    // 例如：
    // channel 0 = 180
    // channel 1 = 270
    let maxAngle: number[] = []

    // 每个通道的最小脉宽
    //
    // 对应当前通道 0°
    let minPulse: number[] = []

    // 每个通道的最大脉宽
    //
    // 对应当前通道 maxAngle
    let maxPulse: number[] = []


    //==================================================
    // 每个通道的运动状态
    //==================================================

    // 当前角度
    let currentAngle: number[] = []

    // 目标角度
    let targetAngle: number[] = []

    // 是否正在运动
    let moving: boolean[] = []

    // 是否处于暂停状态
    let paused: boolean[] = []


    //==================================================
    // 初始化数组
    //==================================================

    for (let i = 0; i < CHANNEL_COUNT; i++) {

        maxAngle[i] = DEFAULT_MAX_ANGLE

        minPulse[i] = DEFAULT_MIN_PULSE
        maxPulse[i] = DEFAULT_MAX_PULSE

        currentAngle[i] =
            DEFAULT_MAX_ANGLE / 2

        targetAngle[i] =
            DEFAULT_MAX_ANGLE / 2

        moving[i] = false
        paused[i] = false
    }


    //==================================================
    // 停止运动
    //==================================================

    /**
     * 停止指定通道舵机的平滑运动
     *
     * 停止后：
     * - 保持当前实际角度
     * - 保持当前 PWM 输出
     * - 舵机继续保持当前位置
     *
     * 注意：
     * stop() 不会关闭 PCA9685 输出
     */
    //% block="PCA9685 舵机通道 %channel 停止运动"
    //% channel.min=0 channel.max=15
    export function stop(
        channel: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        // 目标设置为当前位置
        targetAngle[channel] =
            currentAngle[channel]

        // 停止运动
        moving[channel] = false

        // 取消暂停
        paused[channel] = false
    }


    //==================================================
    // 暂停运动
    //==================================================

    /**
     * 暂停指定通道舵机的平滑运动
     *
     * 暂停后：
     * - 保持当前实际角度
     * - 保持当前目标角度
     * - 保持 PWM 输出
     * - 后台运动任务继续存在
     * - 暂时不改变舵机角度
     */
    //% block="PCA9685 舵机通道 %channel 暂停运动"
    //% channel.min=0 channel.max=15
    export function pause(
        channel: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        if (moving[channel]) {
            paused[channel] = true
        }
    }


    //==================================================
    // 继续运动
    //==================================================

    /**
     * 继续指定通道舵机的平滑运动
     *
     * 从暂停时的实际位置继续向原目标角度移动
     */
    //% block="PCA9685 舵机通道 %channel 继续运动"
    //% channel.min=0 channel.max=15
    export function resume(
        channel: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        paused[channel] = false
    }


    //==================================================
    // 内部：限制角度
    //==================================================

    function clampAngle(
        channel: number,
        angle: number
    ): number {

        if (angle < MIN_ANGLE)
            angle = MIN_ANGLE

        if (angle > maxAngle[channel])
            angle = maxAngle[channel]

        return angle
    }


    //==================================================
    // 内部：角度转换为脉宽
    //==================================================

    function angleToPulse(
        channel: number,
        angle: number
    ): number {

        angle =
            clampAngle(
                channel,
                angle
            )

        let pulseUs =
            minPulse[channel] +
            (maxPulse[channel] -
                minPulse[channel]) *
            angle /
            maxAngle[channel]

        return Math.round(pulseUs)
    }


    //==================================================
    // 内部：实际输出舵机角度
    //==================================================

    function applyAngle(
        channel: number,
        angle: number
    ): void {

        angle =
            clampAngle(
                channel,
                angle
            )

        let pulseUs =
            angleToPulse(
                channel,
                angle
            )

        PCA9685.setPulse(
            channel,
            pulseUs
        )

        // 更新软件中的实际当前位置
        currentAngle[channel] =
            angle
    }


    //==================================================
    // 初始化
    //==================================================

    /**
     * 初始化 PCA9685 舵机
     *
     * 初始化后：
     * - 所有通道最大角度 = 180°
     * - 所有通道脉宽 = 1000～2000μs
     * - 所有通道回到 90°
     */
    //% block="初始化 PCA9685 舵机"
    export function init(): void {

        PCA9685.init()

        // 恢复移动参数
        moveStep = 5
        moveDelay = 50

        // 初始化所有通道
        for (let i = 0; i < CHANNEL_COUNT; i++) {

            maxAngle[i] =
                DEFAULT_MAX_ANGLE

            minPulse[i] =
                DEFAULT_MIN_PULSE

            maxPulse[i] =
                DEFAULT_MAX_PULSE

            currentAngle[i] =
                DEFAULT_MAX_ANGLE / 2

            targetAngle[i] =
                DEFAULT_MAX_ANGLE / 2

            moving[i] = false
            paused[i] = false
        }
    }


    //==================================================
    // 设置最大角度
    //==================================================

    /**
     * 设置指定通道舵机的最大角度
     *
     * 例如：
     * 180° 舵机 → 180
     * 270° 舵机 → 270
     *
     * 该参数决定：
     * 当前通道的最大角度对应 maxPulse
     */
    //% block="设置 PCA9685 舵机通道 %channel 最大角度 %angle °"
    //% channel.min=0 channel.max=15
    //% angle.min=1 angle.max=360
    //% angle.defl=180
    export function setMaxAngle(
        channel: number,
        angle: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        if (angle < 1)
            angle = 1

        if (angle > 360)
            angle = 360

        maxAngle[channel] = angle

        // 如果当前角度超过新的最大角度
        if (currentAngle[channel] > angle) {

            currentAngle[channel] = angle
        }

        // 如果目标角度超过新的最大角度
        if (targetAngle[channel] > angle) {

            targetAngle[channel] = angle
        }
    }


    //==================================================
    // 设置脉宽范围
    //==================================================

    /**
     * 设置指定通道舵机的脉宽范围
     *
     * minPulse：
     * 对应 0°
     *
     * maxPulse：
     * 对应当前通道最大角度
     *
     * 例如：
     *
     * 180° 舵机：
     * 1000～2000μs
     *
     * 270° 舵机：
     * 600～2400μs
     */
    //% block="设置 PCA9685 舵机通道 %channel 脉宽 最小 %minPulseUs μs 最大 %maxPulseUs μs"
    //% channel.min=0 channel.max=15
    //% minPulseUs.min=500 minPulseUs.max=2500 minPulseUs.defl=1000
    //% maxPulseUs.min=500 maxPulseUs.max=2500 maxPulseUs.defl=2000
    export function setPulseRange(
        channel: number,
        minPulseUs: number,
        maxPulseUs: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        if (minPulseUs < MIN_PULSE_LIMIT)
            minPulseUs = MIN_PULSE_LIMIT

        if (minPulseUs > MAX_PULSE_LIMIT)
            minPulseUs = MAX_PULSE_LIMIT

        if (maxPulseUs < MIN_PULSE_LIMIT)
            maxPulseUs = MIN_PULSE_LIMIT

        if (maxPulseUs > MAX_PULSE_LIMIT)
            maxPulseUs = MAX_PULSE_LIMIT

        // 最大脉宽必须大于最小脉宽
        if (maxPulseUs <= minPulseUs)
            return

        minPulse[channel] =
            minPulseUs

        maxPulse[channel] =
            maxPulseUs
    }


    //==================================================
    // 设置移动步长
    //==================================================

    /**
     * 设置所有舵机的移动步长
     *
     * 单位：度
     */
    //% block="设置舵机移动步长 %step °"
    //% step.min=1 step.max=30 step.defl=5
    export function setMoveStep(
        step: number
    ): void {

        if (step < 1)
            step = 1

        if (step > 30)
            step = 30

        moveStep = step
    }


    //==================================================
    // 设置移动间隔
    //==================================================

    /**
     * 设置所有舵机的移动间隔
     *
     * 单位：毫秒
     */
    //% block="设置舵机移动间隔 %delay 毫秒"
    //% delay.min=10 delay.max=500 delay.defl=50
    export function setMoveDelay(
        delay: number
    ): void {

        if (delay < 10)
            delay = 10

        if (delay > 500)
            delay = 500

        moveDelay = delay
    }


    //==================================================
    // 设置舵机角度
    //==================================================

    /**
     * 立即设置指定通道舵机角度
     */
    //% block="PCA9685 舵机通道 %channel 角度 %angle °"
    //% channel.min=0 channel.max=15
    //% angle.min=0 angle.max=360
    //% angle.defl=90
    export function setAngle(
        channel: number,
        angle: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        angle =
            clampAngle(
                channel,
                angle
            )

        applyAngle(
            channel,
            angle
        )

        targetAngle[channel] =
            angle

        moving[channel] = false
        paused[channel] = false
    }


    //==================================================
    // 回中
    //==================================================

    /**
     * 让指定通道舵机回到机械角度中心
     *
     * 例如：
     * 180° → 90°
     * 270° → 135°
     * 360° → 180°
     */
    //% block="PCA9685 舵机通道 %channel 回中"
    //% channel.min=0 channel.max=15
    export function center(
        channel: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        let centerAngle =
            maxAngle[channel] / 2

        setAngle(
            channel,
            centerAngle
        )
    }


    //==================================================
    // 非阻塞移动
    //==================================================

    /**
     * 舵机平滑移动到指定角度
     *
     * 此函数不会阻塞主程序
     */
    //% block="PCA9685 舵机通道 %channel 平滑移动到 %angle °"
    //% channel.min=0 channel.max=15
    //% angle.min=0 angle.max=360
    //% angle.defl=90
    export function moveTo(
        channel: number,
        angle: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        angle =
            clampAngle(
                channel,
                angle
            )

        // 设置新的目标
        targetAngle[channel] =
            angle

        // 已经到达目标
        if (
            currentAngle[channel] ==
            angle
        ) {

            moving[channel] = false
            paused[channel] = false

            return
        }

        // 如果已经存在后台任务
        // 只更新目标角度
        if (moving[channel])
            return

        moving[channel] = true
        paused[channel] = false

        // 创建后台运动任务
        control.runInBackground(function () {

            while (
                currentAngle[channel] !=
                targetAngle[channel]
            ) {

                // 暂停状态
                if (paused[channel]) {

                    basic.pause(10)

                    continue
                }

                let current =
                    currentAngle[channel]

                let target =
                    targetAngle[channel]


                // 向正方向移动
                if (current < target) {

                    current += moveStep

                    if (current > target)
                        current = target
                }

                // 向负方向移动
                else {

                    current -= moveStep

                    if (current < target)
                        current = target
                }


                // 设置舵机位置
                applyAngle(
                    channel,
                    current
                )


                // 等待下一步
                basic.pause(moveDelay)
            }


            // 运动完成
            moving[channel] = false
            paused[channel] = false
        })
    }


    //==================================================
    // 相对移动
    //==================================================

    /**
     * 舵机相对当前角度移动
     *
     * 正数：增加角度
     * 负数：减少角度
     */
    //% block="PCA9685 舵机通道 %channel 移动 %delta °"
    //% channel.min=0 channel.max=15
    //% delta.min=-360 delta.max=360
    //% delta.defl=10
    export function moveBy(
        channel: number,
        delta: number
    ): void {

        if (channel < 0 || channel >= CHANNEL_COUNT)
            return

        let target =
            currentAngle[channel] +
            delta

        target =
            clampAngle(
                channel,
                target
            )

        moveTo(
            channel,
            target
        )
    }

}