


let i_stop = 1

//MBCar.init()
MBPCA9685Servo.init()
MBPCA9685Servo.setPulseRange(0, 500, 2500)
MBPCA9685Servo.setPulseRange(1,500,2500)
MBPCA9685Servo.setPulseRange(2, 500, 2500)
MBPCA9685Servo.setPulseRange(3, 500, 2500)
MBPCA9685Servo.setPulseRange(4, 500, 2900)
MBPCA9685Servo.setPulseRange(5,500,2900)

//Spider4.init()

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


