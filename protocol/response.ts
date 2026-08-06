namespace MBResponse {


    const ACK = "ACK"

    const ERR = "ERR"

    const RSP = "RSP"



    export function ok(
        type:string
    ):string {

        return (
            ACK
            +
            MBProtocol.SEPARATOR
            +
            type
            +
            "\n"
        )

    }



    export function error(
        code:string
    ):string {

        return (
            ERR
            +
            MBProtocol.SEPARATOR
            +
            code
            +
            "\n"
        )

    }


    export function response(
        type:string,
        data:string
    ):string {

        return (

            RSP
            +
            MBProtocol.SEPARATOR
            +
            type
            +
            MBProtocol.SEPARATOR
            +
            data
            +
            "\n"

        )

    }

    export function info(
        data: string
    ): string {


        return (
            "RSP:INFO:"
            +
            data
            +
            "\n"
        )

    }

    export function sensor(
        data: string
    ): string {


        return (
            "RSP:SENSOR:"+
            data
            +
            "\n"
        )

    }
}