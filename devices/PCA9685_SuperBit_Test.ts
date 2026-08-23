/**
 * PCA9685 + L298N 官方参考测试版（SuperBit）
 *
 * 目的：
 * 1. 完全复制 SuperBit 官方 PWM 初始化流程。
 * 2. 只保留电机控制相关代码。
 * 3. 不依赖现有 PCA9685 / Motor 模块。
 *
 * M1 -> CH8 / CH9
 * M2 -> CH10 / CH11
 * M3 -> CH12 / CH13
 * M4 -> CH14 / CH15
 */

//% color=#00A6ED icon="\uf085" weight=5
namespace PCA9685_SuperBit_Test {

    //==================================================
    // PCA9685 寄存器
    //==================================================

    const ADDRESS = 0x40

    const MODE1 = 0x00
    const MODE2 = 0x01
    const PRESCALE = 0xFE

    const LED0_ON_L = 0x06

    let initialized = false

    //==================================================
    // 电机编号
    //==================================================

    export enum Motor {
        M1 = 8,
        M2 = 10,
        M3 = 12,
        M4 = 14
    }

    //==================================================
    // I2C 基本读写（官方原样）
    //==================================================

    export function writeRegister(reg: number, value: number): void {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(ADDRESS, buf)
    }

    function readRegister(reg: number): number {
        pins.i2cWriteNumber(
            ADDRESS,
            reg,
            NumberFormat.UInt8BE
        )

        return pins.i2cReadNumber(
            ADDRESS,
            NumberFormat.UInt8BE
        )
    }

    //==================================================
    // 初始化（官方原样）
    //==================================================

    export function init(): void {

        writeRegister(MODE1, 0x00)

        setFrequency(50)

        initialized = true
    }

    //==================================================
    // 设置 PWM 频率（官方原样）
    //==================================================

    export function setFrequency(freq: number): void {

        let prescaleValue = 25000000

        prescaleValue = prescaleValue / 4096
        prescaleValue = prescaleValue / freq
        prescaleValue = prescaleValue - 1

        let prescale = prescaleValue

        let oldMode = readRegister(MODE1)

        let newMode = (oldMode & 0x7F) | 0x10

        // Sleep
        writeRegister(MODE1, newMode)

        // PRE_SCALE
        writeRegister(PRESCALE, prescale)

        // Wake up
        writeRegister(MODE1, oldMode)

        control.waitMicros(5000)

        // Restart + AI + ALLCALL
        writeRegister(MODE1, oldMode | 0xA1)
    }

    //==================================================
    // 设置 PWM（官方原样）
    //==================================================

    export function setPWM(
        channel: number,
        on: number,
        off: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        if (!initialized) {
            init()
        }

        let buf = pins.createBuffer(5)

        buf[0] = LED0_ON_L + channel * 4

        buf[1] = on & 0xFF
        buf[2] = (on >> 8) & 0xFF

        buf[3] = off & 0xFF
        buf[4] = (off >> 8) & 0xFF

        pins.i2cWriteBuffer(ADDRESS, buf)
    }

    //==================================================
    // 停止一个电机（官方原样）
    //==================================================

    export function stopMotor(motor: Motor): void {

        setPWM(motor, 0, 0)
        setPWM(motor + 1, 0, 0)
    }

    //==================================================
    // 停止全部电机
    //==================================================

    export function stopAll(): void {

        stopMotor(Motor.M1)
        stopMotor(Motor.M2)
        stopMotor(Motor.M3)
        stopMotor(Motor.M4)
    }

    //==================================================
    // 电机运行（官方原样）
    // speed：-255 ~ 255
    //==================================================

    export function motorRun(
        motor: Motor,
        speed: number
    ): void {

        if (!initialized) {
            init()
        }

        speed = speed * 16

        if (speed >= 4096)
            speed = 4095

        if (speed <= -4096)
            speed = -4095

        let a = motor
        let b = motor + 1

        // M3 / M4 与 M1 / M2 接线方向不同
        if (a > 10) {

            if (speed >= 0) {

                setPWM(a, 0, speed)
                setPWM(b, 0, 0)

            } else {

                setPWM(a, 0, 0)
                setPWM(b, 0, -speed)
            }

        } else {

            if (speed >= 0) {

                setPWM(b, 0, speed)
                setPWM(a, 0, 0)

            } else {

                setPWM(b, 0, 0)
                setPWM(a, 0, -speed)
            }
        }
    }

    //==================================================
    // 调试：读取 MODE1 / MODE2
    //==================================================

    export function debugRegisters(): void {

        basic.showString("M1")
        basic.showNumber(readRegister(MODE1))
        basic.pause(1000)

        basic.showString("M2")
        basic.showNumber(readRegister(MODE2))
        basic.pause(1000)
    }
}