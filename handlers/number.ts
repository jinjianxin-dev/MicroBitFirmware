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
                MBCar.forward(80)
                return true

            case "2":
                MBCar.backward(80)
                
                return true

            case "3":
                MBCar.turnLeft()
                
                basic.showNumber(3)
                return true

            case "4":
                 MBCar.turnRight()

                return true

            case "5":
                MBCar.spinLeft(50)
                return true

            case "6":
                MBCar.stop()
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