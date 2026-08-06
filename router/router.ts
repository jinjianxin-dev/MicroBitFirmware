/**
 * MB-V1.1 Command Router
 *
 * Route parsed command
 * to corresponding handler
 */


namespace MBRouter {

    export function handle(
        result:MBParser.Result
    ) {
        //测试
        bluetooth.uartWriteLine(
            "start MBRouter.handle" 
        )

        if(
            !result.valid
        ){
            MBTransport.send(
                MBResponse.error(
                    "INVALID"
                )
            )
            return
        }

        let success = false

        //测试
        bluetooth.uartWriteLine(
            "start MBRouter.handle:" + result.type
        )

        switch(result.type){
            case "BTN":

                success = MBButtonHandler.execute(
                    result.value
                )

                if (success) {
                    MBTransport.send(
                        MBResponse.ok(
                            "BTN"
                        )
                    )
                } else {
                     MBTransport.send(
                        MBResponse.error(
                            result.value
                        )
                    )                   
                }

                break

            case "DIR":
                success = MBDirectionHandler.execute(
                    result.value
                )

                if (success) {
                    MBTransport.send(
                        MBResponse.ok(
                            "DIR"
                        )
                    )
                } else {
                     MBTransport.send(
                        MBResponse.error(
                            result.value
                        )
                    )                   
                }
                break

            case "NUM":
                success = MBNumberHandler.execute(
                    result.value
                )

                if (success) {
                    MBTransport.send(
                        MBResponse.ok(
                            "NUM"
                        )
                    )
                } else {
                     MBTransport.send(
                        MBResponse.error(
                            result.value
                        )
                    )                   
                }

                break

            case "SYS":

                success =
                    MBSystemHandler.execute(
                        result.value
                    )


                if (!success) {

                    MBTransport.send(
                        MBResponse.error(
                            result.value
                        )
                    )

                }

                break
        }

    }
}