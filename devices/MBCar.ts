/**
 * 两轮差速小车控制
 *
 * MBCar V4.0.0 Stable
 *
 * 特点：
 * - 停车扫描五方向避障
 * - 冷却时间，避免连续修正
 * - 一次转向 + 前进脱离
 * - 保持 MakeCode 积木接口不变
 */

//% color=#4CAF50 icon="\uf1b9" weight=85
namespace MBCar {

    //==================================================
    // 常量
    //==================================================

    const STEP = 10

    /**
     * 开始避障距离
     */
    const SAFE_DISTANCE = 22

    /**
     * 紧急距离（立即后退）
     */
    const DANGER_DISTANCE = 8

    /**
     * 自动巡航速度
     */
    const AUTO_SPEED = 50

    /**
     * 转向时间（约45°）
     */
    const TURN_TIME = 480

    /**
     * 后退时间
     */
    const BACK_TIME = 300

    /**
     * 转向后继续前进一段
     */
    const FORWARD_TIME = 250

    /**
     * 避障完成后的冷却时间
     */
    const SCAN_COOLDOWN = 350

    //==================================================
    // 当前运动状态
    //==================================================

    let speed = 0
    let direction = 1
    let turnAmount = 0
    let turnDirection = 0

    /**
     * 下次允许扫描时间
     */
    let nextScanTime = 0

    //==================================================
    // 初始化
    //==================================================

    //% block="初始化小车"
    export function init(): void {

        Motor.init()
        Obstacle.init()

        speed = 0
        direction = 1
        turnAmount = 0
        turnDirection = 0
        nextScanTime = 0
    }

    //==================================================
    // 左右轮驱动
    //==================================================

    //% block="小车 左轮 %leftSpeed %% 右轮 %rightSpeed %%"
    //% leftSpeed.min=-100 leftSpeed.max=100
    //% rightSpeed.min=-100 rightSpeed.max=100
    export function drive(leftSpeed: number, rightSpeed: number): void {

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
            if (speed > 100) speed = 100
        }

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
            if (speed > 100) speed = 100
        }

        turnAmount = 0
        turnDirection = 0

        drive(-speed, -speed)
    }

    //==================================================
    // 左转（弧线）
    //==================================================

    //% block="小车左转"
    export function turnLeft(): void {

        if (speed == 0) return

        if (turnDirection != -1) {
            turnAmount = 0
            turnDirection = -1
        }

        turnAmount += STEP
        if (turnAmount > 100) turnAmount = 100

        let inner = speed - Math.round(speed * turnAmount / 100)
        if (inner < 0) inner = 0

        if (direction == 1)
            drive(inner, speed)
        else
            drive(-inner, -speed)
    }

    //==================================================
    // 右转（弧线）
    //==================================================

    //% block="小车右转"
    export function turnRight(): void {

        if (speed == 0) return

        if (turnDirection != 1) {
            turnAmount = 0
            turnDirection = 1
        }

        turnAmount += STEP
        if (turnAmount > 100) turnAmount = 100

        let inner = speed - Math.round(speed * turnAmount / 100)
        if (inner < 0) inner = 0

        if (direction == 1)
            drive(speed, inner)
        else
            drive(-speed, -inner)
    }

    //==================================================
    // 原地左转
    //==================================================

    //% block="小车原地左转 速度 %speed %%"
    export function spinLeft(speed: number): void {

        drive(-speed, speed)
    }

    //==================================================
    // 原地右转
    //==================================================

    //% block="小车原地右转 速度 %speed %%"
    export function spinRight(speed: number): void {

        drive(speed, -speed)
    }

    //==================================================
    // 自动避障 V4 Stable
    //==================================================

    //% block="小车自动避障"
    export function autoAvoid(): void {

        //------------------------------------------
        // 冷却期间直接前进
        //------------------------------------------

        if (input.runningTime() < nextScanTime) {

            drive(AUTO_SPEED, AUTO_SPEED)
            return
        }

        //------------------------------------------
        // 前方距离
        //------------------------------------------

        let front = Ultrasonic.distanceCM()

        //------------------------------------------
        // 前方安全
        //------------------------------------------

        if (front > SAFE_DISTANCE) {

            drive(AUTO_SPEED, AUTO_SPEED)
            return
        }

        //------------------------------------------
        // 停车
        //------------------------------------------

        stop()

        //------------------------------------------
        // 太近先后退
        //------------------------------------------

        if (front <= DANGER_DISTANCE) {

            drive(-AUTO_SPEED, -AUTO_SPEED)
            basic.pause(BACK_TIME)

            stop()
        }

        //------------------------------------------
        // 五方向扫描
        //------------------------------------------

        Obstacle.scan()

        let left = Obstacle.leftBestDistance()
        let center = Obstacle.centerDistance()
        let right = Obstacle.rightBestDistance()

        //------------------------------------------
        // 前方恢复安全
        //------------------------------------------

        if (center > SAFE_DISTANCE) {

            drive(AUTO_SPEED, AUTO_SPEED)
            nextScanTime = input.runningTime() + SCAN_COOLDOWN
            return
        }

        //------------------------------------------
        // 选择方向
        //------------------------------------------

        let dir = Obstacle.bestDirection()

        if (dir < 0) {

            spinLeft(AUTO_SPEED)
            basic.pause(TURN_TIME)

        } else if (dir > 0) {

            spinRight(AUTO_SPEED)
            basic.pause(TURN_TIME)

        } else {

            if (left >= right) {

                spinLeft(AUTO_SPEED)

            } else {

                spinRight(AUTO_SPEED)
            }

            basic.pause(TURN_TIME)
        }

        //------------------------------------------
        // 转完后前进一点，离开障碍
        //------------------------------------------

        drive(AUTO_SPEED, AUTO_SPEED)
        basic.pause(FORWARD_TIME)

        //------------------------------------------
        // 冷却，避免连续扫描
        //------------------------------------------

        nextScanTime = input.runningTime() + SCAN_COOLDOWN
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