/**
 * L298N 双 H 桥电机驱动器
 *
 * 控制方式：
 *
 * Motor A:
 *   PCA9685 CH0 -> L298N IN1
 *   PCA9685 CH1 -> L298N IN2
 *
 * Motor B:
 *   PCA9685 CH2 -> L298N IN3
 *   PCA9685 CH3 -> L298N IN4
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
 */

//% color=#795548 icon="\uf1b9" weight=75
namespace L298N {

    //==================================================
    // 电机编号
    //==================================================

    export enum Motor {
        A = 0,
        B = 1
    }


    //==================================================
    // PCA9685 通道分配
    //==================================================

    // Motor A
    const MOTOR_A_IN1 = 4
    const MOTOR_A_IN2 = 5

    // Motor B
    const MOTOR_B_IN1 = 14
    const MOTOR_B_IN2 = 15


    //==================================================
    // 获取 IN1 通道
    //==================================================

    function getIn1Channel(
        motor: Motor
    ): number {

        if (motor == Motor.A)
            return MOTOR_A_IN1

        return MOTOR_B_IN1
    }


    //==================================================
    // 获取 IN2 通道
    //==================================================

    function getIn2Channel(
        motor: Motor
    ): number {

        if (motor == Motor.A)
            return MOTOR_A_IN2

        return MOTOR_B_IN2
    }


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

        // 初始化 PCA9685
        PCA9685.init()

    
        // 两个电机初始停止
        stop(Motor.A)
        stop(Motor.B)
    }


    //==================================================
    // 设置电机速度
    //==================================================

    /**
     * 设置电机速度
     *
     * speed:
     * -100 ~ 100
     *
     * 正数：正转
     * 负数：反转
     * 0：停止
     */
    //% block="L298N 电机 %motor 速度 %speed %%"
    //% speed.min=-100 speed.max=100
    //% speed.defl=50
    export function setSpeed(
        motor: Motor,
        speed: number
    ): void {

        // 限制速度范围
        if (speed > 100)
            speed = 100

        if (speed < -100)
            speed = -100


        // 0 = 停止
        if (speed == 0) {
            stop(motor)
            return
        }


        // 正数 = 正转
        if (speed > 0) {

            forward(
                motor,
                speed
            )

            return
        }


        // 负数 = 反转
        reverse(
            motor,
            -speed
        )
    }


    //==================================================
    // 电机正转
    //==================================================

    /**
     * 电机正转
     *
     * IN1 = PWM
     * IN2 = LOW
     */
    //% block="L298N 电机 %motor 正转 速度 %speed %%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function forward(
        motor: Motor,
        speed: number
    ): void {

        // 限制速度范围
        if (speed < 0)
            speed = 0

        if (speed > 100)
            speed = 100


        let in1 = getIn1Channel(motor)
        let in2 = getIn2Channel(motor)


        //==================================================
        // 先关闭反方向输入
        //
        // 避免从反转直接切换时，
        // 两个输入同时处于有效状态。
        //==================================================

        PCA9685.setLow(in2)


        //==================================================
        // 再输出正转 PWM
        //==================================================

        PCA9685.setDuty(
            in1,
            speed
        )
    }


    //==================================================
    // 电机反转
    //==================================================

    /**
     * 电机反转
     *
     * IN1 = LOW
     * IN2 = PWM
     */
    //% block="L298N 电机 %motor 反转 速度 %speed %%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function reverse(
        motor: Motor,
        speed: number
    ): void {

        // 限制速度范围
        if (speed < 0)
            speed = 0

        if (speed > 100)
            speed = 100


        let in1 = getIn1Channel(motor)
        let in2 = getIn2Channel(motor)


        //==================================================
        // 先关闭正方向输入
        //==================================================

        PCA9685.setLow(in1)


        //==================================================
        // 再输出反转 PWM
        //==================================================

        PCA9685.setDuty(
            in2,
            speed
        )
    }


    //==================================================
    // 电机停止
    //==================================================

    /**
     * 电机滑行停止
     *
     * IN1 = LOW
     * IN2 = LOW
     */
    //% block="停止 L298N 电机 %motor"
    export function stop(
        motor: Motor
    ): void {

        let in1 = getIn1Channel(motor)
        let in2 = getIn2Channel(motor)

   
        // 两个输入都关闭
        PCA9685.setLow(in1)
        PCA9685.setLow(in2)
    }


    //==================================================
    // 电机制动
    //==================================================

    /**
     * 电机主动刹车
     *
     * IN1 = HIGH
     * IN2 = HIGH
     */
    //% block="L298N 电机 %motor 刹车"
    export function brake(
        motor: Motor
    ): void {

        let in1 = getIn1Channel(motor)
        let in2 = getIn2Channel(motor)


        // 两个输入同时为 HIGH
        PCA9685.setHigh(in1)
        PCA9685.setHigh(in2)
    }
}