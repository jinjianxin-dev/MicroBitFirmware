/**
 * L298N 双 H 桥电机驱动器
 *
 * 控制方式：
 *
 * 轮子 0：
 *   PCA9685 CH8 -> L298N IN1
 *   PCA9685 CH9 -> L298N IN2
 *
 * 轮子 1：
 *   PCA9685 CH10 -> L298N IN3
 *   PCA9685 CH11 -> L298N IN4
 *
 * ENA / ENB 不参与软件控制。
 * 使用 L298N 模块上的使能跳帽保持使能。
 *
 * 电机控制方式：
 *
 * 正转：
 *   IN1 = PWM
 *   IN2 = LOW
 *
 * 反转：
 *   IN1 = LOW
 *   IN2 = PWM
 *
 * 停止：
 *   IN1 = LOW
 *   IN2 = LOW
 *
 * 刹车：
 *   IN1 = HIGH
 *   IN2 = HIGH
 *
 * 轮子编号：
 *
 *   0 = 左轮
 *   1 = 右轮
 */

//% color=#795548 icon="\uf1b9" weight=75
namespace L298N {

    //==================================================
    // PCA9685 通道
    //==================================================

    // 轮子 0
    let MOTOR_0_IN1 = 8
    let MOTOR_0_IN2 = 9

    // 轮子 1
    let MOTOR_1_IN1 = 10
    let MOTOR_1_IN2 = 11


    //==================================================
    // 初始化
    //==================================================

    /**
     * 初始化 L298N
     *
     * L298N 本身没有 I2C。
     * 实际初始化的是 PCA9685。
     */
    //% block="初始化 L298N"
    export function init(): void {

        PCA9685.init()

        stop(0)
        stop(1)
    }


    //==================================================
    // 设置轮子 IN1 / IN2 通道
    //==================================================

    /**
     * 设置轮子的 PCA9685 通道
     *
     * motor：
     *   0 = 左轮
     *   1 = 右轮
     *
     * in1 / in2：
     *   PCA9685 通道 0~15
     */
    //% block="设置轮子 %motor IN1 %in1 IN2 %in2"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    //% in1.min=0 in1.max=15
    //% in1.defl=8
    //% in2.min=0 in2.max=15
    //% in2.defl=9
    export function setMotorPins(
        motor: number,
        in1: number,
        in2: number
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
    // 设置轮子速度
    //==================================================

    /**
     * 设置轮子速度
     *
     * speed:
     *
     *   0 ~ 100   正转
     *  -1 ~ -100  反转
     *   0         停止
     */
    //% block="L298N 轮子 %motor 速度 %speed %%"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    //% speed.min=-100 speed.max=100
    //% speed.defl=50
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

            forward(
                motor,
                speed
            )

            return
        }


        reverse(
            motor,
            -speed
        )
    }


    //==================================================
    // 轮子正转
    //==================================================

    /**
     * 轮子正转
     *
     * IN1 = PWM
     * IN2 = LOW
     */
    //% block="L298N 轮子 %motor 正转 速度 %speed %%"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function forward(
        motor: number,
        speed: number
    ): void {

        if (speed < 0)
            speed = 0

        if (speed > 100)
            speed = 100


        let in1: number
        let in2: number


        if (motor == 0) {

            in1 = MOTOR_0_IN1
            in2 = MOTOR_0_IN2

        } else {

            in1 = MOTOR_1_IN1
            in2 = MOTOR_1_IN2
        }


        // 先关闭反方向
        PCA9685.setLow(in2)

        // 再输出正转 PWM
        PCA9685.setDuty(
            in1,
            speed
        )
    }


    //==================================================
    // 轮子反转
    //==================================================

    /**
     * 轮子反转
     *
     * IN1 = LOW
     * IN2 = PWM
     */
    //% block="L298N 轮子 %motor 反转 速度 %speed %%"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function reverse(
        motor: number,
        speed: number
    ): void {

        if (speed < 0)
            speed = 0

        if (speed > 100)
            speed = 100


        let in1: number
        let in2: number


        if (motor == 0) {

            in1 = MOTOR_0_IN1
            in2 = MOTOR_0_IN2

        } else {

            in1 = MOTOR_1_IN1
            in2 = MOTOR_1_IN2
        }


        // 先关闭正方向
        PCA9685.setLow(in1)

        // 再输出反转 PWM
        PCA9685.setDuty(
            in2,
            speed
        )
    }


    //==================================================
    // 轮子停止
    //==================================================

    /**
     * 轮子滑行停止
     *
     * IN1 = LOW
     * IN2 = LOW
     */
    //% block="停止 L298N 轮子 %motor"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    export function stop(
        motor: number
    ): void {

        let in1: number
        let in2: number


        if (motor == 0) {

            in1 = MOTOR_0_IN1
            in2 = MOTOR_0_IN2

        } else {

            in1 = MOTOR_1_IN1
            in2 = MOTOR_1_IN2
        }


        PCA9685.setLow(in1)
        PCA9685.setLow(in2)
    }


    //==================================================
    // 轮子刹车
    //==================================================

    /**
     * 轮子主动刹车
     *
     * IN1 = HIGH
     * IN2 = HIGH
     */
    //% block="L298N 轮子 %motor 刹车"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    export function brake(
        motor: number
    ): void {

        let in1: number
        let in2: number


        if (motor == 0) {

            in1 = MOTOR_0_IN1
            in2 = MOTOR_0_IN2

        } else {

            in1 = MOTOR_1_IN1
            in2 = MOTOR_1_IN2
        }


        PCA9685.setHigh(in1)
        PCA9685.setHigh(in2)
    }
}