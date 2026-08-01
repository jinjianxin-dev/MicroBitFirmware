/**
 * MB-V1.1 System Handler
 *
 * Handle:
 *
 * SYS:PING
 * SYS:VERSION
 * SYS:RESET
 */


namespace MBSystemHandler {

    export function execute(
        value:string
    ):boolean{

        switch(value){

            case "PING":
                return ping()

            case "VERSION":
                return version()

            case "RESET":
                return reset()

            default:
                basic.showString(
                    "ERR"
                )
                return false
                        }

    }


    function ping():boolean{
        basic.showString(
            "PONG"
        )
        return true
    }



    function version():boolean{
        basic.showString(
            "V1.1"
        )
        return true
    }



    function reset():boolean{
        control.reset()
        return true
    }

}