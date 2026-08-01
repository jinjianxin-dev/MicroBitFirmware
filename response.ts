/**
 * MB-V1.1 Response Builder
 *
 * Response format:
 *
 * ACK:TYPE
 * ERR:CODE
 * VER:VERSION
 */


namespace MBResponse {


    // =========================
    // Response Prefix
    // =========================


    const ACK = "ACK"

    const ERR = "ERR"

    const VER = "VER"



    // =========================
    // Generate ACK
    // =========================

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



    // =========================
    // Generate Error
    // =========================

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



    // =========================
    // Generate Version
    // =========================

    export function version():string {


        return (
            VER
            +
            MBProtocol.SEPARATOR
            +
            MBProtocol.VERSION
            +
            "\n"
        )

    }

}