/**
 * 主动避障扫描器 V4.0.0 Stable
 *
 * 功能：
 * - 五方向扫描
 * - 左外 / 左前 / 中 / 右前 / 右外
 * - 返回最佳方向
 * - 保留 V3 接口兼容 APP
 */

//% color=#03A9F4 weight=82 icon="\uf140"
namespace Obstacle {

    //==================================================
    // 常量
    //==================================================

    const SERVO_CHANNEL = 0

    const MAX_DISTANCE = 100

    const LEFT_ANGLE = 160
    const LEFT_FRONT_ANGLE = 125
    const CENTER_ANGLE = 90
    const RIGHT_FRONT_ANGLE = 55
    const RIGHT_ANGLE = 20

    /**
     * 舵机稳定等待时间
     */
    const SERVO_DELAY = 45

    //==================================================
    // 距离缓存
    //==================================================

    let leftDistanceValue = MAX_DISTANCE
    let leftFrontDistanceValue = MAX_DISTANCE
    let centerDistanceValue = MAX_DISTANCE
    let rightFrontDistanceValue = MAX_DISTANCE
    let rightDistanceValue = MAX_DISTANCE

    //==================================================
    // 初始化
    //==================================================

    export function init(): void {

        MBPCA9685Servo.setAngle(SERVO_CHANNEL, CENTER_ANGLE)

        basic.pause(100)

        leftDistanceValue = MAX_DISTANCE
        leftFrontDistanceValue = MAX_DISTANCE
        centerDistanceValue = MAX_DISTANCE
        rightFrontDistanceValue = MAX_DISTANCE
        rightDistanceValue = MAX_DISTANCE
    }

    //==================================================
    // 测一个角度
    //==================================================

    function readAtAngle(angle: number): number {

        MBPCA9685Servo.setAngle(SERVO_CHANNEL, angle)

        basic.pause(SERVO_DELAY)

        let d = Ultrasonic.distanceCM()

        if (d <= 0 || d > MAX_DISTANCE) {
            d = MAX_DISTANCE
        }

        return d
    }

    //==================================================
    // 扫描五个方向
    //==================================================

    export function scan(): void {

        //------------------------------------------
        // 左外
        //------------------------------------------

        leftDistanceValue = readAtAngle(LEFT_ANGLE)

        //------------------------------------------
        // 左前
        //------------------------------------------

        leftFrontDistanceValue = readAtAngle(LEFT_FRONT_ANGLE)

        //------------------------------------------
        // 中
        //------------------------------------------

        centerDistanceValue = readAtAngle(CENTER_ANGLE)

        //------------------------------------------
        // 右前
        //------------------------------------------

        rightFrontDistanceValue = readAtAngle(RIGHT_FRONT_ANGLE)

        //------------------------------------------
        // 右外
        //------------------------------------------

        rightDistanceValue = readAtAngle(RIGHT_ANGLE)

        //------------------------------------------
        // 回中
        //------------------------------------------

        MBPCA9685Servo.setAngle(SERVO_CHANNEL, CENTER_ANGLE)
    }

    //==================================================
    // 单方向读取
    //==================================================

    export function leftDistance(): number {
        return leftDistanceValue
    }

    export function leftFrontDistance(): number {
        return leftFrontDistanceValue
    }

    export function centerDistance(): number {
        return centerDistanceValue
    }

    export function rightFrontDistance(): number {
        return rightFrontDistanceValue
    }

    export function rightDistance(): number {
        return rightDistanceValue
    }

    //==================================================
    // 保留 V3 接口（兼容旧代码）
    //==================================================

    export function leftBestDistance(): number {

        if (leftDistanceValue > leftFrontDistanceValue)
            return leftDistanceValue

        return leftFrontDistanceValue
    }

    export function rightBestDistance(): number {

        if (rightDistanceValue > rightFrontDistanceValue)
            return rightDistanceValue

        return rightFrontDistanceValue
    }

    //==================================================
    // 返回最佳方向
    //
    // -1 = 左
    //  0 = 前
    //  1 = 右
    //==================================================

    export function bestDirection(): number {

        let leftScore = leftDistanceValue + leftFrontDistanceValue
        let rightScore = rightDistanceValue + rightFrontDistanceValue

        //------------------------------------------
        // 前方已经很空
        //------------------------------------------

        if (centerDistanceValue >= leftScore &&
            centerDistanceValue >= rightScore) {
            return 0
        }

        //------------------------------------------
        // 左边更空
        //------------------------------------------

        if (leftScore > rightScore)
            return -1

        //------------------------------------------
        // 右边更空
        //------------------------------------------

        if (rightScore > leftScore)
            return 1

        //------------------------------------------
        // 一样远
        //------------------------------------------

        return 0
    }

    //==================================================
    // 最大可通行距离
    //==================================================

    export function maxDistance(): number {

        let m = centerDistanceValue

        if (leftDistanceValue > m)
            m = leftDistanceValue

        if (leftFrontDistanceValue > m)
            m = leftFrontDistanceValue

        if (rightFrontDistanceValue > m)
            m = rightFrontDistanceValue

        if (rightDistanceValue > m)
            m = rightDistanceValue

        return m
    }

    //==================================================
    // 调试字符串（APP 使用）
    //==================================================

    export function getStatusString(): string {

        return "L=" + leftDistanceValue
            + ";LF=" + leftFrontDistanceValue
            + ";C=" + centerDistanceValue
            + ";RF=" + rightFrontDistanceValue
            + ";R=" + rightDistanceValue
    }

    //==================================================
    // 调试显示（micro:bit LED）
    //==================================================

    //% block="显示扫描结果"
    export function showResult(): void {

        basic.showString("L")
        basic.showNumber(leftDistanceValue)

        basic.showString("F")
        basic.showNumber(leftFrontDistanceValue)

        basic.showString("C")
        basic.showNumber(centerDistanceValue)

        basic.showString("f")
        basic.showNumber(rightFrontDistanceValue)

        basic.showString("R")
        basic.showNumber(rightDistanceValue)
    }
}