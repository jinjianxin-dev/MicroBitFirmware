/**
 * Servo 控制
 */
//% color=#1E88E5 icon="\uf085" weight=90
namespace MBServo {

    let servoAngles: number[] = [
    90,
    90,
    90,
    90
    ]

    /**
     * 设置舵机角度
     */
    //% block="设置舵机 %port 角度为 %angle °"
    //% angle.min=0 angle.max=180
    //% angle.defl=90
    export function setAngle(
        port: MBEnums.ServoPort,
        angle: number
    ): void {

        if (angle < 0) angle = 0
        if (angle > 180) angle = 180

        pins.servoWritePin(
            MBBoard.ServoPins[port],
            angle
        )

        servoAngles[port] = angle
    }

      /**
     * 增加舵机角度
     */
    //% block="舵机 %port 增加角度 %delta °"
    //% delta.min=-180 delta.max=180
    //% delta.defl=10
    export function moveBy(port:number, delta:number){

        let angle = servoAngles[port] + delta

        if(angle < 0)
            angle = 0

        if(angle > 180)
            angle = 180

        setAngle(port, angle)
    }

    /**
     * 舵机回中
     */
    //% block="舵机 %port 回中"
    export function resetAngle(
        port: MBEnums.ServoPort
    ): void {

        setAngle(port,90)
        servoAngles[port] = 90
    }

    /**
     * 停止舵机
     */
    //% block="停止舵机 %port"
    export function stop(
        port: MBEnums.ServoPort
    ): void {

    }

    /**
 * 舵机平滑移动
 */
    //% block="舵机 %port 平滑转到 %angle ° 用时 %duration ms"
    //% angle.min=0 angle.max=180
    //% angle.defl=90
    //% duration.defl=1000
    export function moveTo(
        port: MBEnums.ServoPort,
        angle: number,
        duration: number
    ): void {

        // 参数限制
        if (angle < 0) {
            angle = 0
        }

        if (angle > 180) {
            angle = 180
        }


        // 当前角度
        let current = servoAngles[port]


        // 每一步间隔
        let stepDelay = 20


        let steps = duration / stepDelay


        if (steps < 1) {
            steps = 1
        }


        let step = (angle - current) / steps


        for (let i = 0; i < steps; i++) {

            current += step

            setAngle(
                port,
                Math.round(current)
            )

            basic.pause(stepDelay)
        }


        // 保证最终角度准确
        setAngle(
            port,
            angle
        )
    }

}

