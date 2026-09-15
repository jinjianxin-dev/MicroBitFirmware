/**
 * PCA9685 调试命令处理器
 *
 * MB Protocol V2.1.1
 *
 * 功能：
 *   PCA:INFO
 *     返回 PCA9685 基本寄存器信息。
 *
 * 返回格式：
 *
 * RSP:PCA:INFO:MODE1=33;MODE2=4;PRE=121
 *
 * 所有数据均为 PCA9685 当前寄存器真实值。
 */

namespace MBPCAHandler {

    //==================================================
    // PCA9685 寄存器地址
    //==================================================

    const MODE1 = 0x00
    const MODE2 = 0x01
    const PRE_SCALE = 0xFE


    //==================================================
    // 处理 PCA 命令
    //==================================================

    /**
     * 处理 PCA 命令
     *
     * command：
     * INFO
     */
    export function handleCommand(
        command: string
    ): void {

        switch (command) {

            case "INFO":

                sendInfo()

                break

            default:

                bluetooth.uartWriteString(
                    "ERR:PCA_COMMAND\n"
                )

                break
        }
    }


    //==================================================
    // 返回 PCA9685 信息
    //==================================================

    /**
     * 返回 PCA9685 寄存器信息
     *
     * 返回：
     *
     * RSP:PCA:INFO:
     * MODE1=33;
     * MODE2=4;
     * PRE=121
     */
    function sendInfo(): void {

    let mode1 = PCA9685.readRegister(0x00)
    let mode2 = PCA9685.readRegister(0x01)
    let pre   = PCA9685.readRegister(0xFE)

    bluetooth.uartWriteString(
        "RSP:PCA:INFO:" +
        "MODE1=" + mode1 + ";" +
        "MODE2=" + mode2 + ";" +
        "PRE=" + pre + "\n"
    )
    }

}