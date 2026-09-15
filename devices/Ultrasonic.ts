/**
 * HC-SR04 超声波测距模块
 *
 * 固定接线：
 * Trig -> P13
 * Echo -> P14
 */

//% color=#00BCD4 icon="\uf1b2" weight=65
namespace Ultrasonic {

    const TRIG = DigitalPin.P13
    const ECHO = DigitalPin.P14

    let lastDistance = 0

    /**
     * 测量距离（厘米）
     */
    function measureDistance(): number {

        pins.digitalWritePin(TRIG, 0)
        control.waitMicros(2)

        pins.digitalWritePin(TRIG, 1)
        control.waitMicros(10)
        pins.digitalWritePin(TRIG, 0)

        let duration = pins.pulseIn(ECHO, PulseValue.High, 25000)

        if (duration == 0) {
            return lastDistance
        }

        let distance = Math.idiv(duration, 58)

        if (distance > 400) {
            distance = 400
        }

        if (distance > 0) {
            lastDistance = distance
        }

        return lastDistance
    }

    /**
     * 返回距离（厘米）
     */
    //% block="distance (cm)"
    //% group="Ultrasonic"
    export function distanceCM(): number {
        return measureDistance()
    }

    /**
     * 是否检测到障碍物
     */
    //% block="obstacle within %cm cm"
    //% group="Ultrasonic"
    export function isBlocked(cm: number): boolean {
        return measureDistance() <= cm
    }

}