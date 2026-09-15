/**
 * 两轮差速小车控制
 *
 * MBCar 是面向 MakeCode 用户的小车运动控制接口。
 *
 * V3.0.0
 *
 * 新增：
 * - 自动避障
 * - 超声波检测
 * - 左 / 中 / 右扫描
 *
 * 依赖：
 * - Motor.ts
 * - Ultrasonic.ts
 * - Obstacle.ts
 *
 * 硬件：
 * - HC-SR04
 * - SG90 + PCA9685 CH0
 *
 * 自动避障：
 * - 安全距离：20cm
 * - 左：150°
 * - 中：90°
 * - 右：30°
 */

//% color=#4CAF50 icon="\uf1b9" weight=85
namespace MBCar {

    //==================================================
    // 常量
    //==================================================

    const STEP = 10

    /**
     * 自动避障安全距离
     *
     * 前方距离小于等于此值时开始避障
     */
    const SAFE_DISTANCE = 20

    /**
     * 避障转向时间
     */
    const AVOID_TURN_TIME = 350

    /**
     * 三面都被挡住时的后退时间
     */
    const AVOID_BACK_TIME = 300

    /**
     * 三面都被挡住时的转向时间
     */
    const AVOID_SPIN_TIME = 500


    //==================================================
    // 当前运动状态
    //==================================================

    let speed = 0

    let direction = 1

    /**
     * 当前转弯幅度（0~100）
     */
    let turnAmount = 0

    /**
     * 当前转向方向
     *
     * -1 = 左转
     *  0 = 直行
     *  1 = 右转
     */
    let turnDirection = 0


    //==================================================
    // 初始化
    //==================================================

    //% block="初始化小车"
    export function init(): void {

        Motor.init()

        speed = 0
        direction = 1
        turnAmount = 0
        turnDirection = 0
    }


    //==================================================
    // 左右轮独立驱动
    //==================================================

    //% block="小车 左轮 %leftSpeed %% 右轮 %rightSpeed %%"
    //% leftSpeed.min=-100 leftSpeed.max=100
    //% leftSpeed.defl=50
    //% rightSpeed.min=-100 rightSpeed.max=100
    //% rightSpeed.defl=50
    export function drive(
        leftSpeed: number,
        rightSpeed: number
    ): void {

        Motor.setSpeed(0, leftSpeed)
        Motor.setSpeed(1, rightSpeed)
    }


    //==================================================
    // 前进
    //==================================================

    //% block="小车前进"
    export function forward(): void {

        if (direction != 1) {

            speed = 50
            direction = 1

        } else {

            speed += STEP

            if (speed > 100)
                speed = 100
        }

        // 恢复直行
        turnAmount = 0
        turnDirection = 0

        drive(speed, speed)
    }


    //==================================================
    // 后退
    //==================================================

    //% block="小车后退"
    export function backward(): void {

        if (direction != -1) {

            speed = 50
            direction = -1

        } else {

            speed += STEP

            if (speed > 100)
                speed = 100
        }

        // 恢复直行
        turnAmount = 0
        turnDirection = 0

        drive(-speed, -speed)
    }


    //==================================================
    // 左转（弧线）
    //==================================================

    //% block="小车左转"
    export function turnLeft(): void {

        if (speed == 0)
            return

        // 如果之前是右转，重新开始左转
        if (turnDirection != -1) {
            turnAmount = 0
            turnDirection = -1
        }

        turnAmount += STEP

        if (turnAmount > 100)
            turnAmount = 100

        let innerSpeed = speed - Math.round(
            speed * turnAmount / 100
        )

        if (innerSpeed < 0)
            innerSpeed = 0

        if (direction == 1) {

            drive(innerSpeed, speed)

        } else {

            drive(-innerSpeed, -speed)
        }
    }


    //==================================================
    // 右转（弧线）
    //==================================================

    //% block="小车右转"
    export function turnRight(): void {

        if (speed == 0)
            return

        // 如果之前是左转，重新开始右转
        if (turnDirection != 1) {
            turnAmount = 0
            turnDirection = 1
        }

        turnAmount += STEP

        if (turnAmount > 100)
            turnAmount = 100

        let innerSpeed = speed - Math.round(
            speed * turnAmount / 100
        )

        if (innerSpeed < 0)
            innerSpeed = 0

        if (direction == 1) {

            drive(speed, innerSpeed)

        } else {

            drive(-speed, -innerSpeed)
        }
    }


    //==================================================
    // 原地左转
    //==================================================

    //% block="小车原地左转 速度 %speed %%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function spinLeft(speed: number): void {

        drive(-speed, speed)
    }


    //==================================================
    // 原地右转
    //==================================================

    //% block="小车原地右转 速度 %speed %%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function spinRight(speed: number): void {

        drive(speed, -speed)
    }


    //==================================================
    // 自动避障
    //==================================================

    /**
     * 自动避障
     *
     * 每调用一次执行一次检测：
     *
     * 1. 检测前方
     * 2. 无障碍 -> 前进
     * 3. 有障碍 -> 停止
     * 4. 扫描左、中、右
     * 5. 选择较远的一侧
     * 6. 转向
     *
     * 建议放在 forever 中使用。
     */
    //% block="小车自动避障"
    export function autoAvoid(): void {

        //================================================
        // 检测前方
        //================================================

        let front = Ultrasonic.distanceCM()

        if (front > SAFE_DISTANCE) {

            // 前方没有障碍
            forward()

            return
        }


        //================================================
        // 前方有障碍
        //================================================

        stop()


        //================================================
        // 扫描左、中、右
        //================================================

        Obstacle.scan()


        let left = Obstacle.leftDistance()
        let right = Obstacle.rightDistance()


        //================================================
        // 左右都有空间
        //================================================

        if (left > SAFE_DISTANCE || right > SAFE_DISTANCE) {

            if (left > right) {

                spinLeft(50)
                basic.pause(AVOID_TURN_TIME)

            } else {

                spinRight(50)
                basic.pause(AVOID_TURN_TIME)
            }

            return
        }


        //================================================
        // 三面都被挡住
        //================================================

        backward()

        basic.pause(AVOID_BACK_TIME)

        spinRight(50)

        basic.pause(AVOID_SPIN_TIME)

        stop()
    }


    //==================================================
    // 停止
    //==================================================

    //% block="小车停止"
    export function stop(): void {

        Motor.stop(0)
        Motor.stop(1)

        speed = 0
        direction = 1
        turnAmount = 0
        turnDirection = 0
    }


    //==================================================
    // 刹车
    //==================================================

    //% block="小车刹车"
    export function brake(): void {

        Motor.brake(0)
        Motor.brake(1)

        speed = 0
        direction = 1
        turnAmount = 0
        turnDirection = 0
    }
}