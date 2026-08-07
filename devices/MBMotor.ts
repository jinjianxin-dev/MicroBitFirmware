/**
 * Motor 控制
 */
//% color=#E91E63 icon="\uf1b9" weight=80
namespace MBMotor {


    /**
     * 电机编号
     */
    export enum Motor {
        A = 0,
        B = 1
    }


    // 保存当前速度
    let motorSpeed: number[] = [
        0,
        0
    ]



    /**
     * 设置电机速度
     */
    //% block="设置电机 %motor 速度为 %speed %%"
    //% speed.min=-100 speed.max=100
    //% speed.defl=50
    export function setSpeed(
        motor: Motor,
        speed: number
    ) {


        // 限制范围

        if(speed > 100)
            speed = 100


        if(speed < -100)
            speed = -100



        motorSpeed[motor] = speed


        /*
         * 这里以后接真实驱动
         *
         * PWM输出
         * 方向控制
         *
         */



    }




    /**
     * 停止电机
     */
    //% block="停止电机 %motor"
    export function stop(
        motor: Motor
    ){

        setSpeed(motor,0)

    }



    /**
     * 电机正转
     */
    //% block="电机 %motor 正转"
    export function forward(
        motor: Motor
    ){

        setSpeed(motor,50)

    }



    /**
     * 电机反转
     */
    //% block="电机 %motor 反转"
    export function reverse(
        motor: Motor
    ){

        setSpeed(motor,-50)

    }



}