/**
 * 四舵机蜘蛛机器人
 *
 * Spider4 V2.0
 *
 * 硬件：
 * - PCA9685
 * - 4 个舵机
 * - 每条腿 1 个舵机
 *
 * 底层舵机控制：
 * MBPCA9685Servo
 *
 * V2.0 改进：
 * - 使用非阻塞步态状态机
 * - 四条腿按顺序运动
 * - 不使用 wait() 等待舵机
 * - 不使用 basic.pause() 阻塞主程序
 * - Spider4 自己管理腿部运动状态
 *
 * 注意：
 * 本模块不直接操作 PCA9685。
 * 所有舵机动作通过 MBPCA9685Servo 完成。
 */

//% color=#9C27B0 icon="\uf544" weight=75
namespace Spider4 {

    //==================================================
    // 四条腿编号
    //==================================================

    export enum Leg {

        FrontLeft = 0,
        FrontRight = 1,
        RearLeft = 2,
        RearRight = 3
    }


    //==================================================
    // 默认 PCA9685 通道
    //==================================================

    let frontLeftChannel = 0
    let frontRightChannel = 1

    let rearLeftChannel = 2
    let rearRightChannel = 3


    //==================================================
    // 默认角度
    //==================================================

    let frontLeftStand = 90
    let frontRightStand = 90

    let rearLeftStand = 90
    let rearRightStand = 90


    //==================================================
    // 行走幅度
    //==================================================

    let walkAngle = 30


    //==================================================
    // 动作速度 / 动作间隔
    //==================================================

    let actionDelay = 200


    //==================================================
    // 步态状态机
    //==================================================

    /**
     * 当前是否正在执行步态
     */
    let gaitRunning = false


    /**
     * 当前动作类型
     *
     * 0 = 无动作
     * 1 = 前进
     * 2 = 后退
     * 3 = 左转
     * 4 = 右转
     */
    let gaitType = 0


    /**
     * 当前需要执行多少个 step
     *
     * 例如：
     *
     * forward(5)
     *
     * queuedSteps = 5
     */
    let queuedSteps = 0


    /**
     * 当前 step 所处阶段
     *
     * 一个 step 会分成多个动作：
     *
     * 0 = 启动
     * 1 = 第一个动作
     * 2 = 第二个动作
     * 3 = 第三个动作
     * 4 = 第四个动作
     * 5 = 回站立
     * 6 = step 完成
     */
    let gaitPhase = 0


    /**
     * 当前正在运动的腿
     */
    let currentLeg = Leg.FrontLeft


    /**
     * 当前腿的目标角度
     */
    let currentTargetAngle = 90


    /**
     * 当前动作是否已经发送给舵机
     */
    let currentCommandSent = false


    /**
     * 动作完成后的等待时间
     */
    let phaseWaitUntil = 0


    /**
     * 当前是否正在等待动作间隔
     */
    let phaseWaiting = false


    /**
     * 防止多个后台任务同时运行
     */
    let gaitTaskStarted = false


    //==================================================
    // 内部工具
    //==================================================

    /**
     * 获取指定腿对应的 PCA9685 通道
     */
    function getChannel(
        leg: Leg
    ): number {

        if (leg == Leg.FrontLeft)
            return frontLeftChannel

        if (leg == Leg.FrontRight)
            return frontRightChannel

        if (leg == Leg.RearLeft)
            return rearLeftChannel

        return rearRightChannel
    }


    /**
     * 获取指定腿的站立角度
     */
    function getStandAngle(
        leg: Leg
    ): number {

        if (leg == Leg.FrontLeft)
            return frontLeftStand

        if (leg == Leg.FrontRight)
            return frontRightStand

        if (leg == Leg.RearLeft)
            return rearLeftStand

        return rearRightStand
    }


    /**
     * 设置指定腿角度
     */
    function setLeg(
        leg: Leg,
        angle: number
    ): void {

        MBPCA9685Servo.setAngle(
            getChannel(leg),
            angle
        )
    }


    /**
     * 平滑移动指定腿
     */
    export function moveLeg(
        leg: Leg,
        angle: number
    ): void {

        MBPCA9685Servo.moveTo(
            getChannel(leg),
            angle
        )
    }


    /**
     * 检查指定腿是否已经到达目标角度
     *
     * 不调用 wait()
     *
     * 因此不会阻塞主程序。
     */
    function isLegAtTarget(
        leg: Leg,
        target: number
    ): boolean {

        let current =
            MBPCA9685Servo.getAngle(
                getChannel(leg)
            )

        return current == target
    }


    /**
     * 获取当前毫秒时间
     */
    function now(): number {

        return input.runningTime()
    }


    /**
     * 设置下一条腿动作
     */
    function startLegMove(
        leg: Leg,
        angle: number
    ): void {

        currentLeg = leg
        currentTargetAngle = angle

        currentCommandSent = true

        moveLeg(
            leg,
            angle
        )
    }


    /**
     * 开始等待
     */
    function startPhaseWait(): void {

        phaseWaiting = true

        phaseWaitUntil =
            now() + actionDelay
    }


    /**
     * 检查等待是否完成
     */
    function isPhaseWaitFinished(): boolean {

        if (!phaseWaiting)
            return true

        if (now() >= phaseWaitUntil) {

            phaseWaiting = false

            return true
        }

        return false
    }


    /**
     * 当前腿动作是否完成
     */
    function currentLegFinished(): boolean {

        if (!currentCommandSent)
            return true

        
        return isLegAtTarget(
            currentLeg,
            currentTargetAngle
        )
    }


    //==================================================
    // 初始化
    //==================================================

    /**
     * 初始化四舵机蜘蛛
     *
     * 默认：
     * FL = PCA9685 CH0
     * FR = PCA9685 CH1
     * RL = PCA9685 CH2
     * RR = PCA9685 CH3
     *
     * 初始化后蜘蛛进入站立姿态。
     */
    //% block="初始化四舵机蜘蛛"
    export function init(): void {

        MBPCA9685Servo.init()

        basic.pause(100)

        stand()
    }


    //==================================================
    // 通道设置
    //==================================================

    /**
     * 设置前左腿使用的 PCA9685 通道
     */
    //% block="设置前左腿通道 %channel"
    //% channel.min=0 channel.max=15
    export function setFrontLeftChannel(
        channel: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        frontLeftChannel = channel
    }


    /**
     * 设置前右腿使用的 PCA9685 通道
     */
    //% block="设置前右腿通道 %channel"
    //% channel.min=0 channel.max=15
    export function setFrontRightChannel(
        channel: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        frontRightChannel = channel
    }


    /**
     * 设置后左腿使用的 PCA9685 通道
     */
    //% block="设置后左腿通道 %channel"
    //% channel.min=0 channel.max=15
    export function setRearLeftChannel(
        channel: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        rearLeftChannel = channel
    }


    /**
     * 设置后右腿使用的 PCA9685 通道
     */
    //% block="设置后右腿通道 %channel"
    //% channel.min=0 channel.max=15
    export function setRearRightChannel(
        channel: number
    ): void {

        if (channel < 0 || channel > 15)
            return

        rearRightChannel = channel
    }


    //==================================================
    // 站立角度设置
    //==================================================

    /**
     * 设置前左腿站立角度
     */
    //% block="设置前左腿站立角度 %angle °"
    //% angle.min=0 angle.max=180 angle.defl=90
    export function setFrontLeftStand(
        angle: number
    ): void {

        if (angle < 0)
            angle = 0

        if (angle > 180)
            angle = 180

        frontLeftStand = angle
    }


    /**
     * 设置前右腿站立角度
     */
    //% block="设置前右腿站立角度 %angle °"
    //% angle.min=0 angle.max=180 angle.defl=90
    export function setFrontRightStand(
        angle: number
    ): void {

        if (angle < 0)
            angle = 0

        if (angle > 180)
            angle = 180

        frontRightStand = angle
    }


    /**
     * 设置后左腿站立角度
     */
    //% block="设置后左腿站立角度 %angle °"
    //% angle.min=0 angle.max=180 angle.defl=90
    export function setRearLeftStand(
        angle: number
    ): void {

        if (angle < 0)
            angle = 0

        if (angle > 180)
            angle = 180

        rearLeftStand = angle
    }


    /**
     * 设置后右腿站立角度
     */
    //% block="设置后右腿站立角度 %angle °"
    //% angle.min=0 angle.max=180 angle.defl=90
    export function setRearRightStand(
        angle: number
    ): void {

        if (angle < 0)
            angle = 0

        if (angle > 180)
            angle = 180

        rearRightStand = angle
    }


    //==================================================
    // 行走参数
    //==================================================

    /**
     * 设置蜘蛛行走幅度
     *
     * 数值越大，腿摆动越明显。
     */
    //% block="设置蜘蛛行走幅度 %angle °"
    //% angle.min=5 angle.max=60 angle.defl=25
    export function setWalkAngle(
        angle: number
    ): void {

        if (angle < 5)
            angle = 5

        if (angle > 90)
            angle = 90

        walkAngle = angle
    }


    /**
     * 设置动作之间的等待时间
     */
    //% block="设置蜘蛛动作间隔 %delay ms"
    //% delay.min=50 delay.max=1000 delay.defl=150
    export function setActionDelay(
        delay: number
    ): void {

        if (delay < 50)
            delay = 50

        if (delay > 1000)
            delay = 1000

        actionDelay = delay
    }


    //==================================================
    // 站立
    //==================================================

    /**
     * 蜘蛛站立
     *
     * 注意：
     * 站立是一个姿态命令。
     * 四条腿会同时开始向站立角度移动。
     *
     * 它不会调用 wait()。
     */
    //% block="蜘蛛站立"
    export function stand(): void {

        moveLeg(
            Leg.FrontLeft,
            frontLeftStand
        )

        moveLeg(
            Leg.FrontRight,
            frontRightStand
        )

        moveLeg(
            Leg.RearLeft,
            rearLeftStand
        )

        moveLeg(
            Leg.RearRight,
            rearRightStand
        )
    }


    //==================================================
    // 趴下
    //==================================================

    /**
     * 蜘蛛趴下
     *
     * 第一版采用四腿向同一方向收缩的简单动作。
     *
     * 四条腿同时开始运动。
     * 不阻塞主程序。
     */
    //% block="蜘蛛趴下"
    export function sit(): void {

        moveLeg(
            Leg.FrontLeft,
            frontLeftStand - walkAngle
        )

        moveLeg(
            Leg.FrontRight,
            frontRightStand + walkAngle
        )

        moveLeg(
            Leg.RearLeft,
            rearLeftStand - walkAngle
        )

        moveLeg(
            Leg.RearRight,
            rearRightStand + walkAngle
        )
    }


    //==================================================
    // 停止
    //==================================================

    /**
     * 停止四条腿
     *
     * 保持当前位置。
     */
    //% block="蜘蛛停止"
    export function stop(): void {

        // 先停止 Spider4 自己的步态状态机

        gaitRunning = false
        gaitType = 0

        queuedSteps = 0

        gaitPhase = 0

        currentCommandSent = false

        phaseWaiting = false


        // 再停止四个舵机

        MBPCA9685Servo.stop(
            frontLeftChannel
        )

        MBPCA9685Servo.stop(
            frontRightChannel
        )

        MBPCA9685Servo.stop(
            rearLeftChannel
        )

        MBPCA9685Servo.stop(
            rearRightChannel
        )
    }


    //==================================================
    // 前进步态
    //==================================================

    /**
     * 前进一步的状态机
     *
     * 注意：
     *
     * 本函数不直接执行全部动作。
     *
     * 它只启动状态机。
     *
     * 后台状态机随后按顺序执行：
     *
     * FL
     * ↓
     * FR
     * ↓
     * RL
     * ↓
     * RR
     *
     * 每条腿完成后才进入下一条腿。
     */
    //% block="蜘蛛前进一步"
    export function forwardStep(): void {

        // 如果当前已经是前进状态
        // 只增加一个等待执行的 step

        if (gaitRunning) {

            if (gaitType == 1) {

                queuedSteps++

                return
            }

            // 如果正在执行其它动作
            // 不强行覆盖

            return
        }


        gaitType = 1

        queuedSteps = 1

        gaitPhase = 0

        currentCommandSent = false

        phaseWaiting = false

        gaitRunning = true


        startGaitTask()
    }


    //==================================================
    // 前进状态机
    //==================================================

    /**
     * 执行前进状态机
     */
    function processForward(): void {

        // ------------------------------------------
        // Phase 0
        // 开始第一个腿动作
        // ------------------------------------------

        if (gaitPhase == 0) {

            currentCommandSent = false

            startLegMove(
                Leg.FrontLeft,
                frontLeftStand - walkAngle
            )

            gaitPhase = 1

            return
        }


        // ------------------------------------------
        // Phase 1
        // 等待前左腿完成
        // ------------------------------------------

        if (gaitPhase == 1) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 2

            return
        }


        // ------------------------------------------
        // Phase 2
        // 等待动作间隔
        // ------------------------------------------

        if (gaitPhase == 2) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontRight,
                frontRightStand + walkAngle
            )

            gaitPhase = 3

            return
        }


        // ------------------------------------------
        // Phase 3
        // 等待前右腿完成
        // ------------------------------------------

        if (gaitPhase == 3) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 4

            return
        }


        // ------------------------------------------
        // Phase 4
        // 启动后左腿
        // ------------------------------------------

        if (gaitPhase == 4) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearLeft,
                rearLeftStand - walkAngle
            )

            gaitPhase = 5

            return
        }


        // ------------------------------------------
        // Phase 5
        // 等待后左腿完成
        // ------------------------------------------

        if (gaitPhase == 5) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 6

            return
        }


        // ------------------------------------------
        // Phase 6
        // 启动后右腿
        // ------------------------------------------

        if (gaitPhase == 6) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearRight,
                rearRightStand + walkAngle
            )

            gaitPhase = 7

            return
        }


        // ------------------------------------------
        // Phase 7
        // 等待后右腿完成
        // ------------------------------------------

        if (gaitPhase == 7) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 8

            return
        }


        // ------------------------------------------
        // Phase 8
        // 所有腿回到站立位置
        //
        // 这里同样使用状态机。
        //
        // FL
        // FR
        // RL
        // RR
        // ------------------------------------------

        if (gaitPhase == 8) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontLeft,
                frontLeftStand
            )

            gaitPhase = 9

            return
        }


        // ------------------------------------------
        // Phase 9
        // 等待 FL 回站
        // ------------------------------------------

        if (gaitPhase == 9) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontRight,
                frontRightStand
            )

            gaitPhase = 10

            return
        }


        // ------------------------------------------
        // Phase 10
        // 等待 FR 回站
        // ------------------------------------------

        if (gaitPhase == 10) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearLeft,
                rearLeftStand
            )

            gaitPhase = 11

            return
        }


        // ------------------------------------------
        // Phase 11
        // 等待 RL 回站
        // ------------------------------------------

        if (gaitPhase == 11) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearRight,
                rearRightStand
            )

            gaitPhase = 12

            return
        }


        // ------------------------------------------
        // Phase 12
        // 等待 RR 回站
        // ------------------------------------------

        if (gaitPhase == 12) {

            if (!currentLegFinished())
                return

            gaitPhase = 13

            return
        }


        // ------------------------------------------
        // Phase 13
        // 一个 step 完成
        // ------------------------------------------

        if (gaitPhase == 13) {

            if (queuedSteps > 0)
                queuedSteps--

            // 还有 step
            if (queuedSteps > 0) {

                gaitPhase = 0

                currentCommandSent = false

                phaseWaiting = false

                return
            }


            // 全部完成

            gaitRunning = false

            gaitType = 0

            gaitPhase = 0

            currentCommandSent = false

            phaseWaiting = false

            return
        }
    }


    //==================================================
    // 后退
    //==================================================

    /**
     * 蜘蛛向后走一步
     *
     * 同样使用非阻塞状态机。
     */
    //% block="蜘蛛后退一步"
    export function backwardStep(): void {

        if (gaitRunning) {

            if (gaitType == 2) {

                queuedSteps++

                return
            }

            return
        }


        gaitType = 2

        queuedSteps = 1

        gaitPhase = 0

        currentCommandSent = false

        phaseWaiting = false

        gaitRunning = true


        startGaitTask()
    }


    //==================================================
    // 后退状态机
    //==================================================

    function processBackward(): void {

        // ------------------------------------------
        // FL 后退
        // ------------------------------------------

        if (gaitPhase == 0) {

            currentCommandSent = false

            startLegMove(
                Leg.FrontLeft,
                frontLeftStand - walkAngle
            )

            gaitPhase = 1

            return
        }


        if (gaitPhase == 1) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 2

            return
        }


        // ------------------------------------------
        // RR 后退
        // ------------------------------------------

        if (gaitPhase == 2) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearRight,
                rearRightStand - walkAngle
            )

            gaitPhase = 3

            return
        }


        if (gaitPhase == 3) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 4

            return
        }


        // ------------------------------------------
        // FR 前进
        // ------------------------------------------

        if (gaitPhase == 4) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontRight,
                frontRightStand + walkAngle
            )

            gaitPhase = 5

            return
        }


        if (gaitPhase == 5) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 6

            return
        }


        // ------------------------------------------
        // RL 前进
        // ------------------------------------------

        if (gaitPhase == 6) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearLeft,
                rearLeftStand + walkAngle
            )

            gaitPhase = 7

            return
        }


        if (gaitPhase == 7) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 8

            return
        }


        // ------------------------------------------
        // 回站
        // ------------------------------------------

        if (gaitPhase == 8) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontLeft,
                frontLeftStand
            )

            gaitPhase = 9

            return
        }


        if (gaitPhase == 9) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontRight,
                frontRightStand
            )

            gaitPhase = 10

            return
        }


        if (gaitPhase == 10) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearLeft,
                rearLeftStand
            )

            gaitPhase = 11

            return
        }


        if (gaitPhase == 11) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearRight,
                rearRightStand
            )

            gaitPhase = 12

            return
        }


        if (gaitPhase == 12) {

            if (!currentLegFinished())
                return

            gaitPhase = 13

            return
        }


        // ------------------------------------------
        // 完成一个 step
        // ------------------------------------------

        if (gaitPhase == 13) {

            if (queuedSteps > 0)
                queuedSteps--

            if (queuedSteps > 0) {

                gaitPhase = 0

                currentCommandSent = false

                phaseWaiting = false

                return
            }


            gaitRunning = false

            gaitType = 0

            gaitPhase = 0

            currentCommandSent = false

            phaseWaiting = false
        }
    }


    //==================================================
    // 左转
    //==================================================

    /**
     * 蜘蛛左转一步
     *
     * 左侧向后
     * 右侧向前
     *
     * 四条腿依次动作。
     */
    //% block="蜘蛛左转一步"
    export function turnLeftStep(): void {

        if (gaitRunning) {

            if (gaitType == 3) {

                queuedSteps++

                return
            }

            return
        }


        gaitType = 3

        queuedSteps = 1

        gaitPhase = 0

        currentCommandSent = false

        phaseWaiting = false

        gaitRunning = true


        startGaitTask()
    }


    //==================================================
    // 左转状态机
    //==================================================

    function processTurnLeft(): void {
        if (gaitPhase == 0) {
            currentCommandSent = false
            startLegMove(
                Leg.FrontLeft,
                frontLeftStand - walkAngle
            )

            gaitPhase = 1

            return
        }


        if (gaitPhase == 1) {
            if (!currentLegFinished())
                return
            startPhaseWait()
            gaitPhase = 2

            return
        }


        if (gaitPhase == 2) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearLeft,
                rearLeftStand - walkAngle
            )

            gaitPhase = 3

            return
        }


        if (gaitPhase == 3) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 4

            return
        }


        if (gaitPhase == 4) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontRight,
                frontRightStand + walkAngle
            )

            gaitPhase = 5

            return
        }


        if (gaitPhase == 5) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 6

            return
        }


        if (gaitPhase == 6) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearRight,
                rearRightStand + walkAngle
            )

            gaitPhase = 7

            return
        }


        if (gaitPhase == 7) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 8

            return
        }


        // 回站

        if (gaitPhase == 8) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontLeft,
                frontLeftStand
            )

            gaitPhase = 9

            return
        }


        if (gaitPhase == 9) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontRight,
                frontRightStand
            )

            gaitPhase = 10

            return
        }


        if (gaitPhase == 10) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearLeft,
                rearLeftStand
            )

            gaitPhase = 11

            return
        }


        if (gaitPhase == 11) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearRight,
                rearRightStand
            )

            gaitPhase = 12

            return
        }


        if (gaitPhase == 12) {

            if (!currentLegFinished())
                return

            gaitPhase = 13

            return
        }


        if (gaitPhase == 13) {

            if (queuedSteps > 0)
                queuedSteps--

            if (queuedSteps > 0) {

                gaitPhase = 0

                currentCommandSent = false

                phaseWaiting = false

                return
            }


            gaitRunning = false

            gaitType = 0

            gaitPhase = 0

            currentCommandSent = false

            phaseWaiting = false
        }
    }


    //==================================================
    // 右转
    //==================================================

    /**
     * 蜘蛛右转一步
     */
    //% block="蜘蛛右转一步"
    export function turnRightStep(): void {

        if (gaitRunning) {

            if (gaitType == 4) {

                queuedSteps++

                return
            }

            return
        }


        gaitType = 4

        queuedSteps = 1

        gaitPhase = 0

        currentCommandSent = false

        phaseWaiting = false

        gaitRunning = true


        startGaitTask()
    }


    //==================================================
    // 右转状态机
    //==================================================

    function processTurnRight(): void {

        if (gaitPhase == 0) {

            currentCommandSent = false

            startLegMove(
                Leg.FrontLeft,
                frontLeftStand + walkAngle
            )

            gaitPhase = 1

            return
        }


        if (gaitPhase == 1) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 2

            return
        }


        if (gaitPhase == 2) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearLeft,
                rearLeftStand + walkAngle
            )

            gaitPhase = 3

            return
        }


        if (gaitPhase == 3) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 4

            return
        }


        if (gaitPhase == 4) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontRight,
                frontRightStand - walkAngle
            )

            gaitPhase = 5

            return
        }


        if (gaitPhase == 5) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 6

            return
        }


        if (gaitPhase == 6) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearRight,
                rearRightStand - walkAngle
            )

            gaitPhase = 7

            return
        }


        if (gaitPhase == 7) {

            if (!currentLegFinished())
                return

            startPhaseWait()

            gaitPhase = 8

            return
        }


        // 回站

        if (gaitPhase == 8) {

            if (!isPhaseWaitFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontLeft,
                frontLeftStand
            )

            gaitPhase = 9

            return
        }


        if (gaitPhase == 9) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.FrontRight,
                frontRightStand
            )

            gaitPhase = 10

            return
        }


        if (gaitPhase == 10) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearLeft,
                rearLeftStand
            )

            gaitPhase = 11

            return
        }


        if (gaitPhase == 11) {

            if (!currentLegFinished())
                return

            currentCommandSent = false

            startLegMove(
                Leg.RearRight,
                rearRightStand
            )

            gaitPhase = 12

            return
        }


        if (gaitPhase == 12) {

            if (!currentLegFinished())
                return

            gaitPhase = 13

            return
        }


        if (gaitPhase == 13) {

            if (queuedSteps > 0)
                queuedSteps--

            if (queuedSteps > 0) {

                gaitPhase = 0

                currentCommandSent = false

                phaseWaiting = false

                return
            }


            gaitRunning = false

            gaitType = 0

            gaitPhase = 0

            currentCommandSent = false

            phaseWaiting = false
        }
    }


    //==================================================
    // 步态后台任务
    //==================================================

    /**
     * 启动 Spider4 步态后台任务
     *
     * 这里的 basic.pause(5) 只存在于 Spider4
     * 自己的后台任务中。
     *
     * 不会阻塞 Micro:bit 主程序。
     */
    function startGaitTask(): void {

        if (gaitTaskStarted)
            return

        gaitTaskStarted = true

        control.runInBackground(function () {

            while (gaitRunning) {
                if (gaitType == 1) {
                    processForward()
                }
                else if (gaitType == 2) {
                    processBackward()
                }

                else if (gaitType == 3) {
                    processTurnLeft()
                }

                else if (gaitType == 4) {
                    processTurnRight()
                }

                else {
                    gaitRunning = false
                }


                // 让出 CPU
                //
                // 这里只暂停 Spider4 的后台任务。
                //
                // 主程序、其它后台任务仍然可以运行。

                basic.pause(5)
            }

            gaitTaskStarted = false
        })
    }


    //==================================================
    // 连续前进
    //==================================================

    /**
     * 连续向前走
     *
     * steps：
     * 行走步数
     *
     * 本函数不会阻塞。
     */
    //% block="蜘蛛向前走 %steps 步"
    //% steps.min=1 steps.max=100 steps.defl=1
    export function forward(
        steps: number
    ): void {

        if (steps < 1)
            steps = 1


        // 当前已经在前进
        if (gaitRunning) {

            if (gaitType == 1) {

                queuedSteps += steps

                return
            }

            return
        }


        gaitType = 1
        queuedSteps = steps
        gaitPhase = 0
        currentCommandSent = false
        phaseWaiting = false
        gaitRunning = true


        startGaitTask()
    }


    //==================================================
    // 连续后退
    //==================================================

    /**
     * 连续后退
     */
    //% block="蜘蛛向后走 %steps 步"
    //% steps.min=1 steps.max=100 steps.defl=1
    export function backward(
        steps: number
    ): void {

        if (steps < 1)
            steps = 1


        if (gaitRunning) {

            if (gaitType == 2) {

                queuedSteps += steps

                return
            }

            return
        }


        gaitType = 2

        queuedSteps = steps

        gaitPhase = 0

        currentCommandSent = false

        phaseWaiting = false

        gaitRunning = true


        startGaitTask()
    }


    //==================================================
    // 左转
    //==================================================

    /**
     * 左转
     */
    //% block="蜘蛛左转 %steps 步"
    //% steps.min=1 steps.max=100 steps.defl=1
    export function turnLeft(
        steps: number
    ): void {

        if (steps < 1)
            steps = 1

        if (gaitRunning) {
            if (gaitType == 3) {
                queuedSteps += steps
                return
            }

            return
        }

        gaitType = 3
        queuedSteps = steps
        gaitPhase = 0
        currentCommandSent = false
        phaseWaiting = false
        gaitRunning = true

        startGaitTask()
    }


    //==================================================
    // 右转
    //==================================================

    /**
     * 右转
     */
    //% block="蜘蛛右转 %steps 步"
    //% steps.min=1 steps.max=100 steps.defl=1
    export function turnRight(
        steps: number
    ): void {

        if (steps < 1)
            steps = 1


        if (gaitRunning) {

            if (gaitType == 4) {

                queuedSteps += steps

                return
            }

            return
        }


        gaitType = 4

        queuedSteps = steps

        gaitPhase = 0

        currentCommandSent = false

        phaseWaiting = false

        gaitRunning = true


        startGaitTask()
    }


    //==================================================
    // 单腿控制
    //==================================================

    /**
     * 立即设置指定腿角度
     */
    //% block="蜘蛛第 %leg 条腿转到 %angle °"
    //% leg.min=0 leg.max=3
    //% angle.min=0 angle.max=180
    export function setLegAngle(
        leg: Leg,
        angle: number
    ): void {

        if (leg < 0 || leg > 3)
            return

        setLeg(
            leg,
            angle
        )
    }


    /**
     * 平滑移动指定腿
     */
    //% block="蜘蛛第 %leg 条腿平滑移动到 %angle °"
    //% leg.min=0 leg.max=3
    //% angle.min=0 angle.max=180
    export function moveLegTo(
        leg: Leg,
        angle: number
    ): void {

        if (leg < 0 || leg > 3)
            return

        moveLeg(
            leg,
            angle
        )
    }


    /**
     * 等待指定腿完成
     *
     * 注意：
     *
     * 这个函数保留，是为了兼容原来的 API。
     *
     * 它本身仍然是阻塞函数。
     *
     * Spider4 自己的 forward/backward/turn
     * 不再使用它。
     */
    //% block="等待蜘蛛第 %leg 条腿完成"
    //% leg.min=0 leg.max=3
    export function waitLegMove(
        leg: Leg
    ): void {

        if (leg < 0 || leg > 3)
            return

        MBPCA9685Servo.wait(
            getChannel(leg)
        )
    }
}