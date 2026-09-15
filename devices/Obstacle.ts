/**
 * 超声波舵机扫描
 *
 * 硬件：
 * HC-SR04
 *   Trig -> P13
 *   Echo -> P14
 *
 * SG90
 *   PCA9685 CH0
 *
 * 扫描角度：
 * 左   150°
 * 中   90°
 * 右   30°
 */

//% color=#FF9800 icon="\uf1d8" weight=70
namespace Obstacle {

    //==================================================
    // 常量
    //==================================================

    const SERVO = 0

    const LEFT_ANGLE = 180
    const CENTER_ANGLE = 90
    const RIGHT_ANGLE = 0

    //==================================================
    // 扫描结果
    //==================================================

    let left = 0
    let center = 0
    let right = 0

    //==================================================
    // 扫描
    //==================================================

    /**
     * 扫描左、中、右三个方向
     */
    //% block="扫描障碍物"
    export function scan(): void {

        // 左
        MBPCA9685Servo.setAngle(
            SERVO,
            LEFT_ANGLE
        )

        basic.pause(500)

        left = Ultrasonic.distanceCM()


        // 中
        MBPCA9685Servo.setAngle(
            SERVO,
            CENTER_ANGLE
        )

        basic.pause(500)

        center = Ultrasonic.distanceCM()


        // 右
        MBPCA9685Servo.setAngle(
            SERVO,
            RIGHT_ANGLE
        )

        basic.pause(500)

        right = Ultrasonic.distanceCM()


        // 回到中间
        MBPCA9685Servo.setAngle(
            SERVO,
            CENTER_ANGLE
        )
    }

    //==================================================
    // 获取扫描结果
    //==================================================

    /**
     * 左侧距离
     */
    export function leftDistance(): number {
        return left
    }

    /**
     * 中间距离
     */
    export function centerDistance(): number {
        return center
    }

    /**
     * 右侧距离
     */
    export function rightDistance(): number {
        return right
    }

    //==================================================
    // 最佳方向
    //==================================================

    /**
     * 返回较空的一侧
     *
     * 0 = 左
     * 1 = 右
     */
    export function bestDirection(): number {

        if (left > right)
            return 0

        return 1
    }
}
