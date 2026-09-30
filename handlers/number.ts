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
                /*
                i_stop = 0
                basic.forever(function () {
                    if (i_stop == 0) {
                        MBCar.autoAvoid()
                    }
                   
                })
                */

                return true
            case "2":
                //Spider4.setWalkAngle(30)
                //Spider4.forwardStep()
               return true

            case "3":
                //FrontLeft
                //Spider4.forward(5)   
                
                return true

            case "4":
                MBPCA9685Servo.setAngle(4, 0)
                MBPCA9685Servo.setAngle(5, 0)
                
                //FrontRight
                //Spider4.moveLeg(1,90+30)   
                return true

            case "5":
                
                MBPCA9685Servo.setAngle(5, 360)
                MBPCA9685Servo.setAngle(4,360)
                
                 //backLeft
                //Spider4.moveLeg(2,90-30)   
                return true

            case "6":
                //BackRight
                //Spider4.moveLeg(3,90+30)   
                return true

            case "7":
            
                return true

            case "8":
                        return true

            case "9":
                //Spider4.setWalkAngle(30)
                //Spider4.forward(5)
                return true

            default:
                basic.showString(
                    "ERR"
                )
                return false
        }

    }
   

}