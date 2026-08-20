/**
 * MB-V1.1 Number Handler
 *
 * Handle:
 *
 * NUM:0
 * NUM:1
 * ...
 * NUM:9
 */


namespace MBNumberHandler {


    export function execute(
        value: string
    ): boolean {

        switch (value) {

            case "0":
                return number0()

            case "1":
                return number1()

            case "2":
                return number2()

            case "3":
                return number3()

            case "4":
                return number4()

            case "5":
                return number5()

            case "6":
                return number6()

            case "7":
                return number7()

            case "8":
                return number8()

            case "9":
                return number9()

            default:
                basic.showString(
                    "ERR"
                )
                return false
        }

    }

    function number0(): boolean {

        showNumber(0)

        return true
    }

    function number1(): boolean {
        MBPCA9685Servo.moveToSync2(
            0, 180,
            1, 90
        )
        return true
    }

    function number2(): boolean {
         MBPCA9685Servo.pauseAll()

        return true
    }

    function number3(): boolean {
        MBPCA9685Servo.resumeAll()

        return true
    }

    function number4(): boolean {
        MBPCA9685Servo.setAngle(4, 0)
        MBPCA9685Servo.setAngle(3, 0)

        return true
    }

    function number5(): boolean {

        MBPCA9685Servo.setMaxAngle(0, 270)
        MBPCA9685Servo.setPulseRange(0, 600, 2400)

        MBPCA9685Servo.setAngle(0, 30)

        basic.showNumber(MBPCA9685Servo.getAngle(0))
        basic.pause(1000)

        MBPCA9685Servo.moveTo(0, 180)

        basic.showNumber(MBPCA9685Servo.getTargetAngle(0))
        return true
    }

    function number6(): boolean {

        MBPCA9685Servo.moveTo(3, 270)

            basic.forever(function () {

                if (MBPCA9685Servo.isMoving(3)) {
                    basic.showIcon(IconNames.Yes)
                } else {
                    basic.showIcon(IconNames.No)
                }

            })

            return true
        }

    function number7(): boolean {
        MBPCA9685Servo.resume(3)
        MBPCA9685Servo.resume(4)
        showNumber(7)
        return true
    }

    function number8(): boolean {
        MBPCA9685Servo.moveBy(3, 15)
        MBPCA9685Servo.moveBy(4,15)
        showNumber(8)
        return true
    }

    function number9(): boolean {
        L298N.stop(0)
        showNumber(9)
        return true
    }



    function showNumber(
        value: number
    ) {

        basic.showNumber(
            value
        )

    }

}