/**
 * MB-V1.1 Transport Layer
 *
 * Responsible for sending data
 *
 * Current:
 * Bluetooth UART
 */


namespace MBTransport {


    /**
     * Send message
     *
     * Example:
     *
     * ACK:BTN
     *
     */
    export function send(
        message:string
    ){


        bluetooth.uartWriteString(
            message
        )

    }


}