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
       // MBPCA9685Servo.init()
        MBPCA9685Servo.moveTo(3,180)
        MBPCA9685Servo.moveTo(4, 180)
        basic.showNumber(1)
       
        return true
    }

    function number2(): boolean {
        MBPCA9685Servo.setAngle(4,90)
        MBPCA9685Servo.setAngle(3,90)

        return true
    }

    function number3(): boolean {
        MBPCA9685Servo.setAngle(4,45)
        MBPCA9685Servo.setAngle(3,45)

        return true
    }

    function number4(): boolean {
        MBPCA9685Servo.setAngle(4, 0)
        MBPCA9685Servo.setAngle(3, 0)

        return true
    }

    function number5(): boolean {
        MBPCA9685Servo.moveTo(4, 270)
        showNumber(5)
        return true
    }

    function number6(): boolean {
        MBPCA9685Servo.pause(3)
        MBPCA9685Servo.pause(4)
        showNumber(6)
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