/// <reference path="protocol/protocol.ts" />
/// <reference path="protocol/command.ts" />
/// <reference path="protocol/parser.ts" />
/// <reference path="protocol/response.ts" />
/// <reference path="handlers/button.ts" />
/// <reference path="handlers/direction.ts" />
/// <reference path="handlers/number.ts" />
/// <reference path="handlers/system.ts" />
/// <reference path="communication/transport.ts" />
/// <reference path="router/router.ts" />
/// <reference path="router/router.ts" />
/// <reference path="examples/ServoBasic.ts" />

/**
 * 当前测试：
 * MBServo Example
 */

let iStop = false


/*
let response =
    MBResponse.ok(
        "TEST"
    )

input.onButtonPressed(Button.A, function () {
	MBTransport.send(
    response
)
})

let result =
    MBParser.parse(
        "BTN:A"
    )


input.onButtonPressed(Button.B, function () {
    MBRouter.handle(
    result
    )
})
    */


bluetooth.startUartService()


bluetooth.onUartDataReceived(
    serial.delimiters(Delimiters.NewLine),
    
    function () {
        
        let command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
        let result = MBParser.parse(command)
        MBRouter.handle(result)

       
        //let res = new MBParser.Result(true, 'NUM', '1')
        //MBRouter.handle(res)
        
      
    }
)


/*
let command=""


bluetooth.startUartService()
basic.showIcon(IconNames.Yes)

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {

    command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))

    handleCommand(command)

})

function handleCommand(cmd: string) {

    bluetooth.uartWriteLine("OK:" + command)

    cmd = cmd.trim()

    if (cmd == "UP") {

        executeUp()

    } else if (cmd == "DOWN") {

        executeDown()

    } else if (cmd == "LEFT") {

        executeLeft()

    } else if (cmd == "RIGHT") {

        executeRight()

    } else if (cmd == "1") {

        executeNumber(1)

    } else if (cmd == "2") {

        executeNumber(2)

    } else if (cmd == "3") {

        executeNumber(3)

    }else if (cmd == "4") {

        executeNumber(4)

    } else if (cmd == "5") {

        executeNumber(5)

    } else if (cmd == "6") {

        executeNumber(6)

    }else if (cmd == "7") {

        executeNumber(7)

    } else if (cmd == "8") {

        executeNumber(8)

    } else if (cmd == "9") {

        executeNumber(9)
    }else {basic.showIcon(IconNames.No)}

}

function executeUp(){

    basic.showArrow(ArrowNames.North)

}

function executeDown(){

    basic.showArrow(ArrowNames.South)

}

function executeLeft(){

    basic.showArrow(ArrowNames.West)

}

function executeRight(){

    basic.showArrow(ArrowNames.East)

}

function executeNumber(num:number){

    basic.showNumber(num)

}
    */