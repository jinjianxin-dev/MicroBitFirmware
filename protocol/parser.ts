/**
 * MB-V1.1 Parser
 *
 * Parse command format:
 *
 * TYPE:VALUE
 *
 * Example:
 *
 * BTN:A
 * DIR:UP
 * SYS:PING
 */


namespace MBParser {


    // =========================
    // Parse Result
    // =========================

    export class Result {

        valid: boolean

        type: string

        value: string


        constructor(
            valid: boolean,
            type: string,
            value: string
        ) {

            this.valid = valid

            this.type = type

            this.value = value
        }
    }



    // =========================
    // Parse command
    // =========================

    export function parse(
        command: string
    ): Result {


        let index = -1


        // find ":"
        for (
            let i = 0;
            i < command.length;
            i++
        ) {

            if (
                command.charAt(i)
                ==
                MBProtocol.SEPARATOR
            ) {

                index = i

                break
            }
        }



        // no separator
        if (index < 0) {

            return new Result(
                false,
                "",
                ""
            )
        }



        let type =
            command.substr(
                0,
                index
            )


        let value =
            command.substr(
                index + 1
            )



        // empty check

        if (
            type.length == 0 ||
            value.length == 0
        ) {

            return new Result(
                false,
                "",
                ""
            )
        }



        return new Result(
            true,
            type,
            value
        )
    }

}