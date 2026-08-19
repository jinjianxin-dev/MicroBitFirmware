/**
 * PCA9685 舵机控制
 *
 * V1.3
 *
 * 功能：
 * - 舵机角度控制
 * - 舵机回中
 * - 非阻塞平滑移动
 * - 相对角度移动
 * - 舵机脉宽范围设置
 * - 舵机移动步长设置
 * - 舵机移动间隔设置
 * - 多通道独立运动
 *
 * 特点：
 * - moveTo() 不阻塞主程序
 * - 后台自动执行舵机运动
 * - 每个 PCA9685 通道独立控制
 * - 新目标会覆盖原目标
 *
 * 底层：
 * PCA9685
 *
 * 默认：
 * 50Hz
 * 0°   ≈ 1000us
 * 90°  ≈ 1500us
 * 180° ≈ 2000us
 */

//% color=#2196F3 icon="\uf085" weight=80
namespace MBPCA9685Servo {

    //==================================================
    // 舵机基本参数
    //==================================================

    const MIN_ANGLE = 0
    const MAX_ANGLE = 180

    const CENTER_ANGLE = 90


    //==================================================
    // 舵机脉宽参数
    //==================================================

    // 默认最小脉宽
    //let minPulse = 1000
    let minPulse = 600

    // 默认最大脉宽
    //let maxPulse = 2000
    let maxPulse = 2000


    //==================================================
    // 移动参数 
    //==================================================

    // 每次移动的角度
    let moveStep = 5

    // 每一步之间的等待时间
    let moveDelay = 50


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

    for (let i = 0; i < 16; i++) {

        currentAngle[i] = CENTER_ANGLE
        targetAngle[i] = CENTER_ANGLE
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

        // 检查通道
        if (channel < 0 || channel > 15)
            return

        // 将目标角度设置为当前角度
        //
        // 后台运动任务看到：
        //
        // currentAngle == targetAngle
        //
        // 就会结束运动
        targetAngle[channel] =
            currentAngle[channel]

        // 标记停止运动
        moving[channel] = false
        paused[channel] = false
    }

    /**
    * 暂停指定通道舵机的平滑运动
    *
    * 暂停后：
    * - 保持当前实际角度
    * - 保持当前目标角度
    * - 保持 PWM 输出
    * - 后台运动任务继续存在，但暂时不移动
    */
    //% block="PCA9685 舵机通道 %channel 暂停运动"
    //% channel.min=0 channel.max=15
    export function pause(
        channel: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        // 只有正在运动时才允许暂停
        if (moving[channel]) {
            paused[channel] = true
        }
    }

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

        if (channel < 0 || channel > 15)
            return

        paused[channel] = false
    }


    //==================================================
    // 内部：实际输出舵机角度
    //==================================================

    function applyAngle(
        channel: number,
        angle: number
    ): void {

        angle = clampAngle(angle)

        let pulseUs = angleToPulse(angle)

        PCA9685.setPulse(
            channel,
            pulseUs
        )

        // 这里只更新实际当前位置
        currentAngle[channel] = angle
    }

    //==================================================
    // 内部：限制角度
    //==================================================

    function clampAngle(
        angle: number
    ): number {

        if (angle < MIN_ANGLE)
            angle = MIN_ANGLE

        if (angle > MAX_ANGLE)
            angle = MAX_ANGLE

        return angle
    }


    //==================================================
    // 内部：角度转换为脉宽
    //==================================================

    function angleToPulse(
        angle: number
    ): number {

        angle = clampAngle(angle)

        let pulseUs =
            minPulse +
            (maxPulse - minPulse) *
            angle /
            MAX_ANGLE

        return Math.round(pulseUs)
    }


    //==================================================
    // 初始化
    //==================================================

    /**
     * 初始化 PCA9685 舵机
     */
    //% block="初始化 PCA9685 舵机"
    export function init(): void {

        PCA9685.init()

        // 恢复默认参数
        minPulse = 1000
        maxPulse = 2000

        moveStep = 10
        moveDelay = 50

        // 初始化所有通道
        for (let i = 0; i < 16; i++) {

            currentAngle[i] = CENTER_ANGLE
            targetAngle[i] = CENTER_ANGLE
            moving[i] = false
        }
    }


    //==================================================
    // 设置舵机脉宽范围
    //==================================================

    /**
     * 设置舵机脉宽范围
     *
     * minPulse：0° 对应的脉宽
     * maxPulse：180° 对应的脉宽
     */
    //% block="设置舵机脉宽范围 最小 %minPulseUs μs 最大 %maxPulseUs μs"
    //% minPulseUs.min=500 minPulseUs.max=2500 minPulseUs.defl=1000
    //% maxPulseUs.min=500 maxPulseUs.max=2500 maxPulseUs.defl=2000
    export function setPulseRange(
        minPulseUs: number,
        maxPulseUs: number
    ): void {

        if (minPulseUs < 500)
            minPulseUs = 500

        if (minPulseUs > 2500)
            minPulseUs = 2500

        if (maxPulseUs < 500)
            maxPulseUs = 500

        if (maxPulseUs > 2500)
            maxPulseUs = 2500

        if (maxPulseUs <= minPulseUs)
            return

        minPulse = minPulseUs
        maxPulse = maxPulseUs
    }


    //==================================================
    // 设置移动步长
    //==================================================

    /**
     * 设置舵机移动步长
     *
     * 单位：度
     */
    //% block="设置舵机移动步长 %step °"
    //% step.min=1 step.max=30 step.defl=10
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
     * 设置舵机移动间隔
     *
     * 单位：毫秒
     *
     * 数值越小：
     * 移动越快
     *
     * 数值越大：
     * 移动越慢
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
    //% angle.min=0 angle.max=180
    //% angle.defl=90
    export function setAngle(
        channel: number,
        angle: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        angle = clampAngle(angle)

        // 立即输出
        applyAngle(
            channel,
            angle
        )

        // 立即设置时，
        // 当前角度和目标角度相同
        targetAngle[channel] = angle

        moving[channel] = false
    }

    //==================================================
    // 回中
    //==================================================

    /**
     * 立即让指定通道舵机回到 90°
     */
    //% block="PCA9685 舵机通道 %channel 回中"
    //% channel.min=0 channel.max=15
    export function center(
        channel: number
    ): void {

        setAngle(
            channel,
            CENTER_ANGLE
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
    //% angle.min=0 angle.max=180
    //% angle.defl=90
    export function moveTo(
        channel: number,
        angle: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        angle = clampAngle(angle)

        // 设置新的目标
        targetAngle[channel] = angle

        // 已经到达目标
        if (currentAngle[channel] == angle) {
            moving[channel] = false
            return
        }

        // 如果已经有后台任务，
        // 只需要更新目标角度
        if (moving[channel])
            return

        // 标记开始运动
        moving[channel] = true

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
    //% delta.min=-180 delta.max=180
    //% delta.defl=10
    export function moveBy(
        channel: number,
        delta: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        let target =
            currentAngle[channel] + delta

        target = clampAngle(target)

        moveTo(
            channel,
            target
        )
    }

}