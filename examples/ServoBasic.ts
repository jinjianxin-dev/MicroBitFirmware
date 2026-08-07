namespace MBExamples {

    export function servoBasic() {

        basic.forever(function () {

            if (!iStop) {
                MBServo.resetAngle(MBEnums.ServoPort.S1)

                basic.pause(1000)

                MBServo.setAngle(
                    MBEnums.ServoPort.S1,
                    0
                )

                basic.pause(1000)

                MBServo.setAngle(
                    MBEnums.ServoPort.S1,
                    180
                )

                basic.pause(1000)
            } else {
                return
                
            }

        })

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