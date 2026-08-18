namespace MBExamples {

    export function motoBasic() {
        MBMotor.init()
        MBMotor.forward(MBMotor.Motor.A)
        MBMotor.forward(MBMotor.Motor.B)
    }

    export function servoTest1() {
        MBPCA9685Servo.init()

        MBPCA9685Servo.setAngle(4, 0)
        basic.pause(1000)

        MBPCA9685Servo.setAngle(4, 90)
        basic.pause(1000)

        MBPCA9685Servo.setAngle(4, 180)
        basic.pause(1000)

        MBPCA9685Servo.center(4)
    }

     export function servoTest2() {
         MBPCA9685Servo.init()

         MBPCA9685Servo.setPulseRange(1100, 1900)

         MBPCA9685Servo.setAngle(4, 0)
         basic.pause(1000)

         MBPCA9685Servo.setAngle(4, 90)
         basic.pause(1000)

         MBPCA9685Servo.setAngle(4, 180)
         basic.pause(1000)

         MBPCA9685Servo.center(4)
    }

         export function servoTest3() {
             MBPCA9685Servo.init()

             // 每次移动 5°
             MBPCA9685Servo.setMoveStep(5)

             // 每一步等待 100ms
             MBPCA9685Servo.setMoveDelay(100)

             // 先回中
             MBPCA9685Servo.center(4)
             basic.pause(1000)

             // 平滑移动到 180°
             MBPCA9685Servo.moveTo(4, 180)
             basic.pause(1000)

             // 平滑移动回 0°
             MBPCA9685Servo.moveTo(4, 0)
             basic.pause(1000)

             // 再回中
             MBPCA9685Servo.center(4)
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

    export function moveTo() {
        basic.forever(function () {
            if (!iStop) {
                MBServo.moveTo(
                    MBEnums.ServoPort.S1,
                    180,
                    3000
                )

                basic.pause(500)

                MBServo.moveTo(
                    MBEnums.ServoPort.S1,
                    0,
                    3000
                )

                basic.pause(500)
            } else { return }

        })
    }

} 