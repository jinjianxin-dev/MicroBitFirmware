/**
 * PCA9685 舵机控制
 *
 * V1.2
 *
 * 功能：
 * - 舵机角度控制
 * - 舵机回中
 * - 舵机平滑移动
 * - 舵机相对移动
 * - 舵机脉宽范围设置
 * - 舵机移动步长设置
 * - 舵机移动速度设置
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
    let minPulse = 1000

    // 默认最大脉宽
    let maxPulse = 2000


    //==================================================
    // 移动参数
    //==================================================

    // 默认每一步移动角度
    let moveStep = 10

    // 默认每一步等待时间
    let moveDelay = 50


    //==================================================
    // 当前角度
    //==================================================

    // PCA9685 有 16 个通道
    let currentAngle: number[] = []

    for (let i = 0; i < 16; i++) {
        currentAngle[i] = CENTER_ANGLE
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

        // 所有通道默认认为位于 90°
        for (let i = 0; i < 16; i++) {
            currentAngle[i] = CENTER_ANGLE
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
    //% block="设置舵机脉宽范围 最小 %minPulse μs 最大 %maxPulse μs"
    //% minPulse.min=500 minPulse.max=2500 minPulse.defl=1000
    //% maxPulse.min=500 maxPulse.max=2500 maxPulse.defl=2000
    export function setPulseRange(
        minPulseUs: number,
        maxPulseUs: number
    ): void {

        // 防止参数无效
        if (minPulseUs < 500)
            minPulseUs = 500

        if (minPulseUs > 2500)
            minPulseUs = 2500

        if (maxPulseUs < 500)
            maxPulseUs = 500

        if (maxPulseUs > 2500)
            maxPulseUs = 2500

        // 最大值必须大于最小值
        if (maxPulseUs <= minPulseUs)
            return

        minPulse = minPulseUs
        maxPulse = maxPulseUs
    }


    //==================================================
    // 设置移动步长
    //==================================================

    /**
     * 设置平滑移动的步长
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
    // 设置移动速度
    //==================================================

    /**
     * 设置舵机移动速度
     *
     * 实际上是设置每一步之间的等待时间
     *
     * 数值越小：
     * 移动越快
     *
     * 数值越大：
     * 移动越慢
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
     * 设置指定通道舵机角度
     *
     * channel：PCA9685 通道 0~15
     * angle：0~180°
     */
    //% block="PCA9685 舵机通道 %channel 角度 %angle °"
    //% channel.min=0 channel.max=15
    //% angle.min=0 angle.max=180
    //% angle.defl=90
    export function setAngle(
        channel: number,
        angle: number
    ): void {

        // 检查通道
        if (channel < 0 || channel > 15)
            return

        angle = clampAngle(angle)

        // 角度 → 脉宽
        let pulseUs = angleToPulse(angle)

        // 输出 PWM
        PCA9685.setPulse(
            channel,
            pulseUs
        )

        // 保存当前位置
        currentAngle[channel] = angle
    }


    //==================================================
    // 舵机回中
    //==================================================

    /**
     * 让指定通道舵机回到 90°
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
    // 平滑移动
    //==================================================

    /**
     * 舵机平滑移动到指定角度
     */
    //% block="PCA9685 舵机通道 %channel 平滑移动到 %angle °"
    //% channel.min=0 channel.max=15
    //% angle.min=0 angle.max=180
    //% angle.defl=90
    export function moveTo(
        channel: number,
        angle: number
    ): void {

        // 检查通道
        if (channel < 0 || channel > 15)
            return

        angle = clampAngle(angle)

        let startAngle = currentAngle[channel]

        // 已经在目标位置
        if (startAngle == angle)
            return


        // 向前移动
        if (angle > startAngle) {

            while (startAngle < angle) {

                startAngle += moveStep

                if (startAngle > angle)
                    startAngle = angle

                setAngle(
                    channel,
                    startAngle
                )

                basic.pause(moveDelay)
            }
        }

        // 向后移动
        else {

            while (startAngle > angle) {

                startAngle -= moveStep

                if (startAngle < angle)
                    startAngle = angle

                setAngle(
                    channel,
                    startAngle
                )

                basic.pause(moveDelay)
            }
        }
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

        // 检查通道
        if (channel < 0 || channel > 15)
            return

        let targetAngle =
            currentAngle[channel] + delta

        targetAngle = clampAngle(targetAngle)

        moveTo(
            channel,
            targetAngle
        )
    }

}