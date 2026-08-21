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
                return true

            case "1":
                MBMotor.forward(0)
                MBMotor.forward(1)
                return true

            case "2":
                MBPCA9685Servo.moveTo(3, 180)
                MBPCA9685Servo.moveTo(4, 180)
                basic.showNumber(2)
                return true

            case "3":
                MBPCA9685Servo.pause(3)
                MBPCA9685Servo.pause(4)
                basic.showNumber(3)
                return true

            case "4":
                MBPCA9685Servo.setAngle(4, 0)
                MBPCA9685Servo.setAngle(3, 0)

                return true

            case "5":
                return true

            case "6":
                return true

            case "7":
                return true

            case "8":
                return true

            case "9":
                return true

            default:
                basic.showString(
                    "ERR"
                )
                return false
        }

    }


}