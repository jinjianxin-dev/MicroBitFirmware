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
                
                  MBPCA9685Servo.moveTo(0,90)
                return true
            case "2":
                MBPCA9685Servo.moveTo(0,180)
                return true

            case "3":
   
                return true

            case "4":
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
    export function test1()
    {
        Motor.init()

        MBCar.forward()      // 或者 MBCar.forward(30)

        basic.pause(100)

        PCA9685.writeRegister(0x06, 0x55)
        basic.pause(20)

        let value = PCA9685.readRegister(0x06)
        bluetooth.uartWriteString("TEST:FORWARD=" + value)
    }

}