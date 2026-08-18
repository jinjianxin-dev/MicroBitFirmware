/**
 * MB-V1.1 Number Handler
 *
 * Handle:
 *
 * NUM:0
 * NUM:1
 * ...
 * NUM:9
 */


namespace MBNumberHandler {


    export function execute(
        value: string
    ):boolean {

        switch(value) {

            case "0":
                return number0()

            case "1":
                return number1()

            case "2":
                return number2()

            case "3":
                return number3()

            case "4":
                return number4()

            case "5":
                return number5()

            case "6":
                return number6()

            case "7":
                return number7()

            case "8":
                return number8()

            case "9":
                return number9()

            default:
                basic.showString(
                    "ERR"
                )
                return false
        }

    }

    function number0(): boolean{

        showNumber(0)
       
        return true
     }

    function number1(): boolean{
        MBExamples.servoTest1()
        showNumber(1)
        
        //MBExamples.servoBasic()
        
        return true
    }

    function number2(): boolean{
        MBExamples.servoTest2()
        showNumber(2)
        
        return true
    }

    function number3(): boolean{
        MBExamples.servoTest3()
        showNumber(3)        
    
        return true
    }

    function number4(): boolean{

        iStop=true
        showNumber(4)
  
        return true
    }

    function number5(): boolean{
        iStop=true
        showNumber(5)
        return true
    }

    function number6(): boolean{

        showNumber(6)
        return true
    }

    function number7(): boolean{
        PCA9685.setDuty(0, 50)
        showNumber(7)
        return true
    }

    function number8():boolean{
        showNumber(8)
        return true
    }

    function number9(): boolean{
        L298N.stop(0)
        showNumber(9)
        return true
    }



    function showNumber(
        value:number
    ){

        basic.showNumber(
            value
        )

    }

}