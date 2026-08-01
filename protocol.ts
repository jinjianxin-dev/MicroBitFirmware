/**
 * MB-V1.1 Protocol Definition
 *
 * Format:
 * TYPE:VALUE
 *
 * Example:
 * BTN:A
 * DIR:UP
 * NUM:1
 */

namespace MBProtocol {

    // =========================
    // Protocol Version
    // =========================

    export const VERSION = "1.1.0"


    // =========================
    // Separator
    // =========================

    export const SEPARATOR = ":"


    // =========================
    // Command Type
    // =========================

    export enum Type {

        // Button
        BTN,

        // Direction
        DIR,

        // Number
        NUM,

        // LED
        LED,

        // Text
        TEXT,

        // Motor
        MOTOR,

        // Servo
        SERVO,

        // RGB
        RGB ,

        // Sensor
        SENSOR,

        // System
        SYS 
    }


    // =========================
    // Button Commands
    // =========================

    export enum Button {

        A ,

        B ,

        AB
    }


    // =========================
    // Direction Commands
    // =========================

    export enum Direction {

        UP ,

        DOWN ,

        LEFT ,

        RIGHT
    }


    // =========================
    // System Commands
    // =========================

    export enum System {

        PING,

        VERSION ,

        RESET 
    }

}