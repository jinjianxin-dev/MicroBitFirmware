


let i_stop = 1

MBCar.init()
MBPCA9685Servo.init()

bluetooth.startUartService()


bluetooth.onUartDataReceived(
    serial.delimiters(Delimiters.NewLine),
    
    function () {
        
        let command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
        let result = MBParser.parse(command)
        MBRouter.handle(result)

      
    }
)

/*
basic.forever(function () {
    basic.showNumber(Ultrasonic.distanceCM())
    basic.pause(300)
})
*/


