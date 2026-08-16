namespace MBExamples {

    export function servoBasic() {

        PCA9685.init()

        basic.forever(function () {

            PCA9685.setPulse(
                4,
                1000
            )

            basic.pause(2000)

            PCA9685.setPulse(
                4,
                1500
            )

            basic.pause(2000)

            PCA9685.setPulse(
                4,
                2000
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