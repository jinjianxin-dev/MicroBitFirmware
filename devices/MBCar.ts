/**
 * 两轮差速小车控制
 *
 * MBCar 是面向 MakeCode 用户的小车运动控制接口。
 *
 * 底层硬件：
 *
 * MBCar
 *    ↓
 * Motor
 *    ↓
 * PCA_L298N 或 MB_L298N
 *
 * 轮子定义：
 *
 * 0 = 左轮
 * 1 = 右轮
 */

//% color=#4CAF50 icon="\uf1b9" weight=85
namespace MBCar {

    //==================================================
    // 当前基础速度
    //==================================================

    /**
     * 小车当前基础速度
     *
     * 正数：前进
     * 负数：后退
     * 0：停止
     *
     * turnLeft / turnRight
     * 都以此速度作为转弯基准。
     */
    let baseSpeed = 0


    //==================================================
    // 初始化
    //==================================================

    /**
     * 初始化小车
     */
    //% block="初始化小车"
    export function init(): void {

        Motor.init()

        baseSpeed = 0
    }


    //==================================================
    // 差速驱动
    //==================================================

    /**
     * 左右轮独立驱动
     *
     * leftSpeed：
     * 左轮速度（-100~100）
     *
     * rightSpeed：
     * 右轮速度（-100~100）
     */
    //% block="小车 左轮 %leftSpeed %% 右轮 %rightSpeed %%"
    //% leftSpeed.min=-100 leftSpeed.max=100
    //% leftSpeed.defl=50
    //% rightSpeed.min=-100 rightSpeed.max=100
    //% rightSpeed.defl=50
    export function drive(
        leftSpeed: number,
        rightSpeed: number
    ): void {

        Motor.setSpeed(
            0,
            leftSpeed
        )

        Motor.setSpeed(
            1,
            rightSpeed
        )
    }


    //==================================================
    // 前进
    //==================================================

    /**
     * 小车前进
     *
     * speed：
     * 0~100
     */
    //% block="小车前进 速度 %speed %%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function forward(
        speed: number
    ): void {

        baseSpeed = speed

        drive(
            speed,
            speed
        )
    }


    //==================================================
    // 后退
    //==================================================

    /**
     * 小车后退
     *
     * speed：
     * 0~100
     */
    //% block="小车后退 速度 %speed %%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function backward(
        speed: number
    ): void {

        baseSpeed = -speed

        drive(
            -speed,
            -speed
        )
    }


    //==================================================
    // 弧线左转
    //==================================================

    /**
     * 小车弧线左转
     *
     * 左轮速度为基础速度的一半，
     * 右轮保持基础速度。
     *
     * 连续调用不会越来越慢。
     */
    //% block="小车左转"
    export function turnLeft(): void {

        drive(
            Math.round(baseSpeed / 2),
            baseSpeed
        )
    }


    //==================================================
    // 弧线右转
    //==================================================

    /**
     * 小车弧线右转
     *
     * 左轮保持基础速度，
     * 右轮速度为基础速度的一半。
     *
     * 连续调用不会越来越慢。
     */
    //% block="小车右转"
    export function turnRight(): void {

        drive(
            baseSpeed,
            Math.round(baseSpeed / 2)
        )
    }


    //==================================================
    // 原地左旋转
    //==================================================

    /**
     * 小车原地左旋转
     *
     * 左轮反转
     * 右轮正转
     */
    //% block="小车原地左转 速度 %speed %%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function spinLeft(
        speed: number
    ): void {

        drive(
            -speed,
            speed
        )
    }


    //==================================================
    // 原地右旋转
    //==================================================

    /**
     * 小车原地右旋转
     *
     * 左轮正转
     * 右轮反转
     */
    //% block="小车原地右转 速度 %speed %%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function spinRight(
        speed: number
    ): void {

        drive(
            speed,
            -speed
        )
    }


    //==================================================
    // 停止
    //==================================================

    /**
     * 小车停止
     *
     * 两个轮子进入滑行停止状态。
     */
    //% block="小车停止"
    export function stop(): void {

        Motor.stop(0)
        Motor.stop(1)

        baseSpeed = 0
    }


    //==================================================
    // 刹车
    //==================================================

    /**
     * 小车主动刹车
     */
    //% block="小车刹车"
    export function brake(): void {

        Motor.brake(0)
        Motor.brake(1)

        baseSpeed = 0
    }

}