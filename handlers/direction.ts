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

        basic.showArrow(
            ArrowNames.North
        )

        return true
    }



    function down(): boolean{
        //L298N.reverse(0,100)
        basic.showArrow(
            ArrowNames.South
        )
        return true
    }



    function left():boolean{

        basic.showArrow(
            ArrowNames.West
        )
        return true
    }



    function right():boolean{

        basic.showArrow(
            ArrowNames.East
        )
        return true
    }

}