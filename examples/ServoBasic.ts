namespace MBExamples {

    export function motoBasic() {
        MBMotor.init()
        MBMotor.forward(MBMotor.Motor.A)
        MBMotor.forward(MBMotor.Motor.B)
    }

   
    export function testPulse(
        channel: number,
        pulseUs: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        PCA9685.setPulse(
            channel,
            pulseUs
        )
    }
        


     export function servoTest2() {
         
    }

         export function servoTest3() {
             MBPCA9685Servo.init()

             MBPCA9685Servo.setMoveStep(5)
             MBPCA9685Servo.setMoveDelay(100)

             MBPCA9685Servo.center(3)
             MBPCA9685Servo.center(4)

             basic.pause(1000)

             // 两个舵机同时运动
             MBPCA9685Servo.moveTo(3, 180)
             MBPCA9685Servo.moveTo(4, 0)

             basic.pause(200)

             // 只停止通道 0
             //MBPCA9685Servo.stop(3)

             //basic.pause(3000)
    }
    

    export function servoBasic() {

        MBPCA9685Servo.init()

        basic.forever(function () {

            MBPCA9685Servo.setAngle(
                4,
                0
            )

            basic.pause(2000)

            MBPCA9685Servo.setAngle(
                4,
                90
            )

            basic.pause(2000)

            MBPCA9685Servo.setAngle(
                4,
                180
            )
        }
        )
    }



} 