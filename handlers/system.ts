/**
 * MB-V1.1 System Handler
 *
 * Handle:
 *
 * SYS:PING
 * SYS:VERSION
 * SYS:INFO
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

            case "INFO":
                //L298N.stop(0)

                basic.showString("I")
                return info()
            
            case "SENSOR":
                basic.showString("S")
                return sensor()

            case "RESET":
                return reset()

            default:
                basic.showString(
                    "SYS ERR"
                )
                return false
        }
    }


    function ping():boolean{
     MBTransport.send(
        MBResponse.response(
            "PING",
            "PONG"
        )
    )
        return true
    }



    function version():boolean{
        basic.showString(
            "MB-V1.2.0"
        )
        return true
    }




    function reset():boolean{
        control.reset()
        return true

    }

    export function query(value:string):string
    {

    switch(value){
        case "INFO":
  
            return "FW=MB-V1.2.0;PROTO=1.2"

        default:
            return ""
    }
    }

    function sensor(): boolean{
  
        let temp =
            input.temperature()
        
           let light = 
            input.lightLevel()

        let sound = 
            input.soundLevel()
        
        let response =
            "TEMP="
            + temp
            + ";LIGHT="
            + light
            + ";SOUND="
            + sound
        
        MBTransport.send(
          MBResponse.sensor(
              response
          )
        )
        return true
        
    }

    function info(): boolean {
        MBTransport.send(
            MBResponse.info(
                "FW=MB-V1.2.0;PROTO=1.2"
            )
        )
        return true
    }
 
}