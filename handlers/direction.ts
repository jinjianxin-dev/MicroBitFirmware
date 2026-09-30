/**
 * MB-V1.1 Direction Handler
 *
 * Handle:
 *
 * DIR:UP
 * DIR:DOWN
 * DIR:LEFT
 * DIR:RIGHT
 */


namespace MBDirectionHandler {


    export function execute(value: string):boolean {

        switch (value) {

            case "UP":
               return up()

            case "DOWN":
                return down()

              case "LEFT":
                return left()

            case "RIGHT":
                return right()

            default:
                basic.showString(
                    "ERR"
                )
                return false
        }

    }



    function up():boolean{
       // MBCar.forward()

        basic.showArrow(
            ArrowNames.North
        )

        return true
    }



    function down(): boolean{
       // MBCar.backward()

        basic.showArrow(
            ArrowNames.South
        )
        return true
    }



    function left(): boolean{
        
       // MBCar.turnLeft()
        basic.showArrow(
            ArrowNames.West
        )
        return true
    }



    function right(): boolean{
        
       // MBCar.turnRight()
        basic.showArrow(
            ArrowNames.East
        )
        return true
    }

}