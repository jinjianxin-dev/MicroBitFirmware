/**
 * PCA9685 + L298N 电机控制
 *
 * Motor 是面向 MakeCode 用户的基础电机控制接口。
 *
 * 底层硬件：
 *
 * Motor
 *   ↓
 * PCA_L298N
 *   ↓
 * PCA9685
 *   ↓
 * L298N
 *   ↓
 * Motor
 *
 * 轮子编号：
 *
 * 0 = 左轮
 * 1 = 右轮
 *
 * Motor 只负责单个轮子的速度控制。
 *
 * 小车前进、后退、转向等组合运动，
 * 由上层 MBCar 负责。
 */

//% color=#E91E63 icon="\uf1b9" weight=80
namespace Motor_bak {

    //==================================================
    // 当前速度
    //==================================================

    /**
     * 保存两个轮子的当前速度
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
     * 初始化电机
     *
     * 同时初始化 PCA9685 + L298N。
     */
    //% block="初始化电机"
    export function init(): void {

        PCA_L298N.init()

        motorSpeed[0] = 0
        motorSpeed[1] = 0
    }


    //==================================================
    // 设置速度
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
     * 1 ~ 100   正转
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

        // 限制速度

        if (speed > 100)
            speed = 100

        if (speed < -100)
            speed = -100


        // 保存当前速度

        motorSpeed[motor] = speed


        // 交给底层驱动

        PCA_L298N.setSpeed(
            motor,
            speed
        )
    }


    //==================================================
    // 获取速度
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
    // 全速正转
    //==================================================

    /**
     * 轮子全速正转
     *
     * 速度 = 100%
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
    // 全速反转
    //==================================================

    /**
     * 轮子全速反转
     *
     * 速度 = -100%
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
    // 停止
    //==================================================

    /**
     * 停止轮子
     *
     * 停止后轮子进入滑行状态。
     */
    //% block="停止轮子 %motor"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    export function stop(
        motor: number
    ): void {

        motorSpeed[motor] = 0

        PCA_L298N.stop(
            motor
        )
    }


    //==================================================
    // 刹车
    //==================================================

    /**
     * 主动刹车轮子
     *
     * 刹车后两个 L298N 输入均为 HIGH。
     */
    //% block="刹车轮子 %motor"
    //% motor.min=0 motor.max=1
    //% motor.defl=0
    export function brake(
        motor: number
    ): void {

        motorSpeed[motor] = 0

        PCA_L298N.brake(
            motor
        )
    }
}