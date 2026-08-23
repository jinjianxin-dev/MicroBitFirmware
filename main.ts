


//PCA9685.init()

bluetooth.startUartService()


bluetooth.onUartDataReceived(
    serial.delimiters(Delimiters.NewLine),
    
    function () {
        
        let command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
        let result = MBParser.parse(command)
        MBRouter.handle(result)

      
    }
)

