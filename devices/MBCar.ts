/**
 * 两轮差速小车控制
 *
 * MBCar 是面向 MakeCode 用户的小车运动控制接口。
 *
 * 底层硬件：
 *
 * MBCar
 *    ↓
 * Motor_PCA
 *    ↓
 * PCA_L298N
 *    ↓
 * PCA9685
 *    ↓
 * L298N
 *    ↓
 * 左右轮
 *
 * 轮子定义：
 *
 * 0 = 左轮
 * 1 = 右轮
 *
 * V2.2.1
 *
 * 控制方式：
 *
 * forward()
 *   每调用一次，速度增加 10%
 *
 * backward()
 *   每调用一次，速度增加 10%
 *
 * turnLeft()
 *   每调用一次，左转幅度增加 10%
 *
 * turnRight()
 *   每调用一次，右转幅度增加 10%
 *
 * spinLeft(speed)
 *   原地左转
 *
 * spinRight(speed)
 *   原地右转
 */

//% color=#4CAF50 icon="\uf1b9" weight=85
namespace MBCar {

    //==================================================
    // 常量
    //==================================================

    /**
     * 每次调用增加的速度 / 转弯幅度
     */
    const STEP = 10


    //==================================================
    // 当前运动状态
    //==================================================

    /**
     * 当前速度
     *
     * 0~100
     *
     * 这里保存的是速度绝对值，
     * 不包含前进 / 后退方向。
     */
    let speed = 0


    /**
     * 当前运动方向
     *
     * 1  = 前进
     * -1 = 后退
     */
    let direction = 1


    /**
     * 当前转弯幅度
     *
     * 0~100
     *
     * 0：
     * 直行
     *
     * 数值越大：
     * 转弯越急
     */
    let turnAmount = 0


    //==================================================
    // 初始化
    //==================================================

    /**
     * 初始化小车
     */
    //% block="初始化小车"
    export function init(): void {

        Motor.init()

        speed = 0
        direction = 1
        turnAmount = 0
    }


    //==================================================
    // 差速驱动
    //==================================================

    /**
     * 左右轮独立驱动
     *
     * leftSpeed：
     * 左轮速度 -100~100
     *
     * rightSpeed：
     * 右轮速度 -100~100
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
     * 每调用一次增加 10%。
     *
     * 第一次：
     * 10%
     *
     * 第二次：
     * 20%
     *
     * 第三次：
     * 30%
     *
     * 同时恢复直行状态。
     */
    //% block="小车前进"
    export function forward(): void {

        // 如果当前不是前进状态
        // 从 10% 开始
        if (direction != 1) {

            speed = STEP
            direction = 1

        } else {

            speed += STEP

            if (speed > 100)
                speed = 100
        }


        // 前进时重新恢复直行
        turnAmount = 0
        
        //basic.showNumber(speed)
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
     * 每调用一次增加 10%。
     *
     * 第一次：
     * -10%
     *
     * 第二次：
     * -20%
     *
     * 第三次：
     * -30%
     *
     * 同时恢复直行状态。
     */
    //% block="小车后退"
    export function backward(): void {

        // 如果当前不是后退状态
        // 从 10% 开始
        if (direction != -1) {

            speed = STEP
            direction = -1

        } else {

            speed += STEP

            if (speed > 100)
                speed = 100
        }


        // 后退时重新恢复直行
        turnAmount = 0


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
     * 每调用一次增加 10% 转弯幅度。
     *
     * 基础速度保持不变。
     *
     * 前进时：
     *
     * 左轮逐渐减速
     * 右轮保持速度
     *
     * 后退时：
     *
     * 左轮逐渐减小反转速度
     * 右轮保持速度
     */
    //% block="小车左转"
    export function turnLeft(): void {

        // 没有速度时不执行
        if (speed == 0)
            return


        // 增加转弯幅度
        turnAmount += STEP


        if (turnAmount > 100)
            turnAmount = 100


        let innerSpeed = speed - Math.round(
            speed * turnAmount / 100
        )


        if (innerSpeed < 0)
            innerSpeed = 0


        //==================================================
        // 前进
        //==================================================

        if (direction == 1) {

            drive(
                innerSpeed,
                speed
            )

            return
        }


        //==================================================
        // 后退
        //==================================================

        drive(
            -innerSpeed,
            -speed
        )
    }


    //==================================================
    // 弧线右转
    //==================================================

    /**
     * 小车弧线右转
     *
     * 每调用一次增加 10% 转弯幅度。
     *
     * 基础速度保持不变。
     */
    //% block="小车右转"
    export function turnRight(): void {

        // 没有速度时不执行
        if (speed == 0)
            return


        // 增加转弯幅度
        turnAmount += STEP


        if (turnAmount > 100)
            turnAmount = 100


        let innerSpeed = speed - Math.round(
            speed * turnAmount / 100
        )


        if (innerSpeed < 0)
            innerSpeed = 0


        //==================================================
        // 前进
        //==================================================

        if (direction == 1) {

            drive(
                speed,
                innerSpeed
            )

            return
        }


        //==================================================
        // 后退
        //==================================================

        drive(
            -speed,
            -innerSpeed
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
     *
     * 不修改小车当前速度状态。
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
     *
     * 不修改小车当前速度状态。
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
     * 清除速度和转弯状态。
     */
    //% block="小车停止"
    export function stop(): void {

        Motor.stop(0)
        Motor.stop(1)

        speed = 0
        direction = 1
        turnAmount = 0
    }


    //==================================================
    // 刹车
    //==================================================

    /**
     * 小车主动刹车
     *
     * 清除速度和转弯状态。
     */
    //% block="小车刹车"
    export function brake(): void {

        Motor.brake(0)
        Motor.brake(1)

        speed = 0
        direction = 1
        turnAmount = 0
    }

}