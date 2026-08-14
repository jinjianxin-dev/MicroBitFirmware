/**
 * PCA9685 16通道 PWM 控制器
 *
 * 功能：
 * - I2C 寄存器读写
 * - PWM 输出
 * - 占空比控制
 * - PWM 频率控制
 * - 高电平 / 低电平输出
 */

//% color=#FF9800 icon="\uf1de" weight=70
namespace PCA9685 {

    //==================================================
    // PCA9685 基本参数
    //==================================================

    // 默认 I2C 地址
    const ADDRESS = 0x41

    // 内部振荡器频率
    const OSCILLATOR_FREQUENCY = 25000000

    // PWM 分辨率
    const PWM_RESOLUTION = 4096


    //==================================================
    // PCA9685 寄存器
    //==================================================

    const MODE1 = 0x00
    const MODE2 = 0x01

    const LED0_ON_L = 0x06

    const PRE_SCALE = 0xFE


    //==================================================
    // MODE1
    //==================================================

    const MODE1_RESTART = 0x80
    const MODE1_AI = 0x20
    const MODE1_SLEEP = 0x10


    //==================================================
    // MODE2
    //==================================================

    const MODE2_OUTDRV = 0x04


    //==================================================
    // 内部：写寄存器
    //==================================================

    function writeRegister(
        reg: number,
        value: number
    ): void {

        let buffer = pins.createBuffer(2)

        buffer[0] = reg
        buffer[1] = value

        pins.i2cWriteBuffer(
            ADDRESS,
            buffer,
            false
        )
    }


    //==================================================
    // 内部：读寄存器
    //==================================================

    function readRegister(
        reg: number
    ): number {

        let buffer = pins.createBuffer(1)

        buffer[0] = reg

        // 指定要读取的寄存器
        pins.i2cWriteBuffer(
            ADDRESS,
            buffer,
            true
        )

        // 读取一个字节
        let result = pins.i2cReadBuffer(
            ADDRESS,
            1,
            false
        )

        return result[0]
    }


    //==================================================
    // 内部：写一个 PWM 通道的 4 个寄存器
    //
    // ON_L
    // ON_H
    // OFF_L
    // OFF_H
    //==================================================

    function writePWMRegisters(
        channel: number,
        on: number,
        off: number
    ): void {

        let base = LED0_ON_L + channel * 4

        let buffer = pins.createBuffer(5)

        buffer[0] = base

        // ON
        buffer[1] = on & 0xFF
        buffer[2] = (on >> 8) & 0x0F

        // OFF
        buffer[3] = off & 0xFF
        buffer[4] = (off >> 8) & 0x0F

        // 一次 I2C 写入完成四个寄存器
        pins.i2cWriteBuffer(
            ADDRESS,
            buffer,
            false
        )
    }


    //==================================================
    // 内部：FULL_ON
    //==================================================

    function setFullOn(
        channel: number
    ): void {

        let base = LED0_ON_L + channel * 4

        let buffer = pins.createBuffer(5)

        buffer[0] = base

        // ON_L
        buffer[1] = 0x00

        // ON_H + FULL_ON
        buffer[2] = 0x10

        // OFF_L
        buffer[3] = 0x00

        // OFF_H
        buffer[4] = 0x00

        pins.i2cWriteBuffer(
            ADDRESS,
            buffer,
            false
        )
    }


    //==================================================
    // 内部：FULL_OFF
    //==================================================

    function setFullOff(
        channel: number
    ): void {

        let base = LED0_ON_L + channel * 4

        let buffer = pins.createBuffer(5)

        buffer[0] = base

        // ON_L
        buffer[1] = 0x00

        // ON_H
        buffer[2] = 0x00

        // OFF_L
        buffer[3] = 0x00

        // OFF_H + FULL_OFF
        buffer[4] = 0x10

        pins.i2cWriteBuffer(
            ADDRESS,
            buffer,
            false
        )
    }


    //==================================================
    // 初始化
    //==================================================

    /**
     * 初始化 PCA9685
     */
    //% block="初始化 PCA9685"
    export function init(): void {

        // 读取 MODE1
        let mode1 = readRegister(MODE1)

        // 开启 Auto Increment
        mode1 = mode1 | MODE1_AI

        // 退出 SLEEP
        mode1 = mode1 & ~MODE1_SLEEP

        writeRegister(
            MODE1,
            mode1
        )

        // 设置输出为推挽模式
        let mode2 = readRegister(MODE2)

        mode2 = mode2 | MODE2_OUTDRV

        writeRegister(
            MODE2,
            mode2
        )
    }


    //==================================================
    // 设置高电平
    //==================================================

    /**
     * 设置指定通道为高电平
     */
    //% block="PCA9685 通道 %channel 输出高电平"
    export function setHigh(
        channel: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        setFullOn(channel)
    }


    //==================================================
    // 设置低电平
    //==================================================

    /**
     * 设置指定通道为低电平
     */
    //% block="PCA9685 通道 %channel 输出低电平"
    export function setLow(
        channel: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        setFullOff(channel)
    }


    //==================================================
    // 设置 PWM
    //==================================================

    /**
     * 设置 PWM
     *
     * channel: 0~15
     * on:     0~4095
     * off:    0~4095
     */
    //% block="PCA9685 通道 %channel PWM ON %on OFF %off"
    export function setPWM(
        channel: number,
        on: number,
        off: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        if (on < 0)
            on = 0

        if (on > 4095)
            on = 4095

        if (off < 0)
            off = 0

        if (off > 4095)
            off = 4095

        writePWMRegisters(
            channel,
            on,
            off
        )
    }


    //==================================================
    // 设置占空比
    //==================================================

    /**
     * 设置 PWM 占空比
     *
     * duty: 0~100
     */
    //% block="PCA9685 通道 %channel 占空比 %duty %%"
    export function setDuty(
        channel: number,
        duty: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        if (duty < 0)
            duty = 0

        if (duty > 100)
            duty = 100


        // 0%
        if (duty == 0) {

            setFullOff(channel)

            return
        }


        // 100%
        if (duty == 100) {

            setFullOn(channel)

            return
        }


        // 普通 PWM
        let off = Math.round(
            (PWM_RESOLUTION - 1) *
            duty /
            100
        )

        setPWM(
            channel,
            0,
            off
        )
    }


    //==================================================
    // 设置 PWM 频率
    //==================================================

    /**
     * 设置 PWM 频率
     *
     * frequency: Hz
     */
    //% block="PCA9685 PWM 频率 %frequency Hz"
    export function setFrequency(
        frequency: number
    ): void {

        // PCA9685 工作范围
        if (frequency < 24)
            frequency = 24

        if (frequency > 1526)
            frequency = 1526


        // 计算 PRE_SCALE
        let prescale = Math.round(
            OSCILLATOR_FREQUENCY /
            (PWM_RESOLUTION * frequency) -
            1
        )


        if (prescale < 3)
            prescale = 3

        if (prescale > 255)
            prescale = 255


        // 保存当前 MODE1
        let oldMode = readRegister(MODE1)


        // 进入 SLEEP
        writeRegister(
            MODE1,
            (oldMode & 0x7F) |
            MODE1_SLEEP
        )


        // 设置 PRE_SCALE
        writeRegister(
            PRE_SCALE,
            prescale
        )


        // 恢复 MODE1
        writeRegister(
            MODE1,
            oldMode
        )


        // 等待振荡器恢复
        basic.pause(1)


        // RESTART
        writeRegister(
            MODE1,
            oldMode |
            MODE1_RESTART
        )
    }


    //==================================================
    // 读取 MODE1
    //==================================================

    /**
     * 读取 PCA9685 MODE1
     */
    //% block="读取 PCA9685 MODE1"
    export function readMode1(): number {

        return readRegister(MODE1)
    }


    //==================================================
    // 读取 MODE2
    //==================================================

    /**
     * 读取 PCA9685 MODE2
     */
    //% block="读取 PCA9685 MODE2"
    export function readMode2(): number {

        return readRegister(MODE2)
    }

    /**
     * 读取 寄存器的值
     */
    //% block="读取 PCA9685 指定寄存器的内容"    
    export function readReg(reg: number): number {
        return readRegister(reg)
    }
    

}