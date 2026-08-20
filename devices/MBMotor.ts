/**
 * 电机控制
 *
 * MBMotor 是面向 MakeCode 用户的基础电机控制接口。
 *
 * 底层硬件：
 *
 * MBMotor
 *    ↓
 * L298N
 *    ↓
 * PCA9685
 *    ↓
 * Motor
 *
 * 轮子编号：
 *
 *   0 = 左轮
 *   1 = 右轮
 *
 * MBMotor 只负责单个轮子的速度控制。
 * 小车前进、后退、转向等组合运动，
 * 由上层 MBCar 负责。
 */

//% color=#E91E63 icon="\uf1b9" weight=80
namespace MBMotor {

    //==================================================
    // 当前速度
    //==================================================

    /**
     * 当前轮子速度
     *
     * -100 ~ 100
     *
     * 正数：正转
     * 负数：反转
     * 0：停止
     *
     * 0 = 左轮
     * 1 = 右轮
     */
    let motorSpeed: number[] = [
        0,
        0
    ]


    //==================================================
    // 初始化
    //==================================================

    /**
     * 初始化电机驱动器
     */
    //% block="初始化电机"
    export function init(): void {

        L298N.init()

        motorSpeed[0] = 0
        motorSpeed[1] = 0
    }


    //==================================================
    // 设置电机速度
    //==================================================

    /**
     * 设置轮子速度
     *
     * motor：
     *
     * 0 = 左轮
     * 1 = 右轮
     *
     * speed：
     *
     * 0 ~ 100   正转
     * -1 ~ -100 反转
     * 0         停止
     */
    //% block="设置轮子 %motor 速度为 %speed %%"
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


        motorSpeed[motor] = speed


        L298N.setSpeed(
            motor,
            speed
        )
    }


    //==================================================
    // 获取当前速度
    //==================================================

    /**
     * 获取轮子当前速度
     *
     * 0 = 左轮
     * 1 = 右轮
     */
    export function getSpeed(
        motor: number
    ): number {

        return motorSpeed[motor]
    }


    //==================================================
    // 停止电机
    //==================================================

    /**
     * 停止轮子
     */
    //% block="停止轮子 %motor"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    export function stop(
        motor: number
    ): void {

        motorSpeed[motor] = 0

        L298N.stop(
            motor
        )
    }


    //==================================================
    // 电机正转
    //==================================================

    /**
     * 轮子全速正转
     */
    //% block="轮子 %motor 全速正转"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    export function forward(
        motor: number
    ): void {

        setSpeed(
            motor,
            100
        )
    }


    //==================================================
    // 电机反转
    //==================================================

    /**
     * 轮子全速反转
     */
    //% block="轮子 %motor 全速反转"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    export function reverse(
        motor: number
    ): void {

        setSpeed(
            motor,
            -100
        )
    }


    //==================================================
    // 电机制动
    //==================================================

    /**
     * 轮子主动刹车
     */
    //% block="刹车轮子 %motor"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    export function brake(
        motor: number
    ): void {

        motorSpeed[motor] = 0

        L298N.brake(
            motor
        )
    }
}