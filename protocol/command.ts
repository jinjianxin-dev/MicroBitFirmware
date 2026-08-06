/**
 * MB-V1.1 Command Builder
 *
 * Generate:
 *
 * TYPE:VALUE\n
 *
 * Example:
 *
 * BTN:A\n
 * DIR:UP\n
 */
namespace MBCommand {


    function typeToString(
        type: MBProtocol.Type
    ): string {

        switch(type) {

            case MBProtocol.Type.BTN:
                return "BTN"

            case MBProtocol.Type.DIR:
                return "DIR"

            case MBProtocol.Type.NUM:
                return "NUM"

            case MBProtocol.Type.LED:
                return "LED"

            case MBProtocol.Type.TEXT:
                return "TEXT"

            case MBProtocol.Type.MOTOR:
                return "MOTOR"

            case MBProtocol.Type.SERVO:
                return "SERVO"

            case MBProtocol.Type.RGB:
                return "RGB"

            case MBProtocol.Type.SENSOR:
                return "SENSOR"

            case MBProtocol.Type.SYS:
                return "SYS"
        }

        return ""
    }



    export function create(
        type: MBProtocol.Type,
        value: string
    ): string {


        return (
            typeToString(type)
            +
            MBProtocol.SEPARATOR
            +
            value
            +
            "\n"
        )
    }


    export function system(
        command: string
    ): string {

        return create(
            MBProtocol.Type.SYS,
            command
        )
    }

}