



//MBCar.init()
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

basic.forever(function () {

    Obstacle.scan()

    basic.showString(
        "L" + Obstacle.leftDistance()
    )

    basic.showString(
        "C" + Obstacle.centerDistance()
    )

    basic.showString(
        "R" + Obstacle.rightDistance()
    )

    basic.pause(1000)
})
