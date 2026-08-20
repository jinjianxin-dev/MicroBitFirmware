

/**
 * 当前测试：
 * MBServo Example
 */

MBPCA9685Servo.init()
MBPCA9685Servo.setMoveStep(5)
MBPCA9685Servo.setMoveDelay(50)

MBPCA9685Servo.setPulseRange(4, 600, 2400)
MBPCA9685Servo.setPulseRange(3, 600, 2400)
MBPCA9685Servo.setMaxAngle(3, 180)
MBPCA9685Servo.setMaxAngle(4,270)

MBPCA9685Servo.setAngle(3,0)
MBPCA9685Servo.setAngle(4,0)



bluetooth.startUartService()


bluetooth.onUartDataReceived(
    serial.delimiters(Delimiters.NewLine),
    
    function () {
        
        let command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
        let result = MBParser.parse(command)
        MBRouter.handle(result)

      
    }
)

