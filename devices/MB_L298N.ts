/**
 * micro:bit GPIO + L298N 双 H 桥电机驱动器
 *
 * 连接方式（默认）：
 *
 * 左轮（0）
 *   P0 -> IN1
 *   P1 -> IN2
 *
 * 右轮（1）
 *   P8 -> IN3
 *   P12 -> IN4
 *
 * ENA / ENB 使用模块跳帽保持使能。
 *
 * 轮子编号：
 *   0 = 左轮
 *   1 = 右轮
 */

//% color=#6D4C41 icon="\uf1b9" weight=75
namespace MB_L298N {

    //==================================================
    // 默认引脚配置
    //==================================================

    // 左轮
    let MOTOR_0_IN1 = AnalogPin.P12
    let MOTOR_0_IN2 = AnalogPin.P13

    // 右轮
    let MOTOR_1_IN1 = AnalogPin.P9
    let MOTOR_1_IN2 = AnalogPin.P8


    //==================================================
    // 初始化
    //==================================================

    /**
     * 初始化 GPIO 电机驱动
     */
    //% block="初始化 MB_L298N"
    export function init(): void {

        stop(0)
        stop(1)
    }


    //==================================================
    // 设置轮子引脚
    //==================================================

    /**
     * 设置轮子的 micro:bit 引脚
     *
     * motor：
     *   0 = 左轮
     *   1 = 右轮
     */
    //% block="设置轮子 %motor IN1 %in1 IN2 %in2"
    //% motor.min=0 motor.max=1
    export function setMotorPins(
        motor: number,
        in1: AnalogPin,
        in2: AnalogPin
    ): void {

        if (motor == 0) {

            MOTOR_0_IN1 = in1
            MOTOR_0_IN2 = in2

        } else {

            MOTOR_1_IN1 = in1
            MOTOR_1_IN2 = in2
        }
    }


    //==================================================
    // 内部：PWM 输出
    //==================================================

    function writePWM(
        pin: AnalogPin,
        duty: number
    ): void {

        pins.analogWritePin(
            pin,
            Math.round(duty * 1023 / 100)
        )
    }


    //==================================================
    // 设置轮子速度
    //==================================================

    /**
     * speed：
     * 100 ~ 1   正转
     * -1~-100   反转
     * 0         停止
     */
    //% block="MB_L298N 轮子 %motor 速度 %speed %%"
    //% motor.min=0 motor.max=1
    //% speed.min=-100 speed.max=100
    export function setSpeed(
        motor: number,
        speed: number
    ): void {

        if (speed > 100)
            speed = 100

        if (speed < -100)
            speed = -100

        if (speed == 0) {
            stop(motor)
            return
        }

        if (speed > 0) {
            forward(motor, speed)
            return
        }

        reverse(motor, -speed)
    }


    //==================================================
    // 正转
    //==================================================

    /**
     * IN1 = PWM
     * IN2 = LOW
     */
    //% block="MB_L298N 轮子 %motor 正转 速度 %speed %%"
    //% motor.min=0 motor.max=1
    //% speed.min=0 speed.max=100
    export function forward(
        motor: number,
        speed: number
    ): void {

        if (speed > 100)
            speed = 100

        let in1: AnalogPin
        let in2: AnalogPin

        if (motor == 0) {

            in1 = MOTOR_0_IN1
            in2 = MOTOR_0_IN2

        } else {

            in1 = MOTOR_1_IN1
            in2 = MOTOR_1_IN2
        }

        pins.digitalWritePin(
            in2,
            0
        )

        writePWM(
            in1,
            speed
        )
    }


    //==================================================
    // 反转
    //==================================================

    /**
     * IN1 = LOW
     * IN2 = PWM
     */
    //% block="MB_L298N 轮子 %motor 反转 速度 %speed %%"
    //% motor.min=0 motor.max=1
    //% speed.min=0 speed.max=100
    export function reverse(
        motor: number,
        speed: number
    ): void {

        if (speed > 100)
            speed = 100

        let in1: AnalogPin
        let in2: AnalogPin

        if (motor == 0) {

            in1 = MOTOR_0_IN1
            in2 = MOTOR_0_IN2

        } else {

            in1 = MOTOR_1_IN1
            in2 = MOTOR_1_IN2
        }

        pins.digitalWritePin(
            in1,
            0
        )

        writePWM(
            in2,
            speed
        )
    }


    //==================================================
    // 停止
    //==================================================

    /**
     * IN1 = LOW
     * IN2 = LOW
     */
    //% block="停止 MB_L298N 轮子 %motor"
    //% motor.min=0 motor.max=1
    export function stop(
        motor: number
    ): void {

        let in1: AnalogPin
        let in2: AnalogPin

        if (motor == 0) {

            in1 = MOTOR_0_IN1
            in2 = MOTOR_0_IN2

        } else {

            in1 = MOTOR_1_IN1
            in2 = MOTOR_1_IN2
        }

        pins.digitalWritePin(in1, 0)
        pins.digitalWritePin(in2, 0)
    }


    //==================================================
    // 刹车
    //==================================================

    /**
     * IN1 = HIGH
     * IN2 = HIGH
     */
    //% block="MB_L298N 轮子 %motor 刹车"
    //% motor.min=0 motor.max=1
    export function brake(
        motor: number
    ): void {

        let in1: AnalogPin
        let in2: AnalogPin

        if (motor == 0) {

            in1 = MOTOR_0_IN1
            in2 = MOTOR_0_IN2

        } else {

            in1 = MOTOR_1_IN1
            in2 = MOTOR_1_IN2
        }

        pins.digitalWritePin(in1, 1)
        pins.digitalWritePin(in2, 1)
    }
}