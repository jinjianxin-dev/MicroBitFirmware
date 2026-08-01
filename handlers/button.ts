/**
 * MB-V1.1 Button Handler
 *
 * Handle:
 *
 * BTN:A
 * BTN:B
 * BTN:AB
 */


namespace MBButtonHandler {


    export function execute(
        value: string
    ):boolean {


        switch(value) {

            case "A":
                return buttonA()   
            
            case "B":
               return buttonB()

            case "AB":

               return buttonAB()

            default:

                basic.showString(
                    "ERR"
                )

                return false    

        }

    }



    function buttonA():boolean{

        basic.showString(
            "A"
        )
 
        return true
    }



    function buttonB():boolean{

        basic.showString(
            "B"
        )

        return true

    }



    function buttonAB():boolean{

        basic.showString(
            "AB"
        )

        return true
    }

}