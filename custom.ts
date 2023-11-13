
/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */

// This code is currently for internal use only, 
// not to be shared or published without written agreement with Henning Pedersen

enum PingUnit {
    //% block="μs"
    MicroSeconds,
    //% block="cm"
    Centimeters,
    //% block="inches"
    Inches
}

/**
 * makecode BMP280 digital pressure sensor Package.
 * From microbit/micropython Chinese community.
 * http://www.micropython.org.cn
 */

enum BMP280_I2C_ADDRESS {
    //% block="0x76"
    ADDR_0x76 = 0x76,
    //% block="0x77"
    ADDR_0x77 = 0x77
}

/**
 * Custom blocks
 */
//% weight=100 color=#0040ff icon=""
namespace AirBit {
    /**
     * Set of code blocks for the Drone
     */


    let BMP280_I2C_ADDR = BMP280_I2C_ADDRESS.ADDR_0x76

    function setreg(reg: number, dat: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = dat;
        pins.i2cWriteBuffer(BMP280_I2C_ADDR, buf);
    }

    function getreg(reg: number): number {
        pins.i2cWriteNumber(BMP280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BMP280_I2C_ADDR, NumberFormat.UInt8BE);
    }

    function getUInt16LE(reg: number): number {
        pins.i2cWriteNumber(BMP280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BMP280_I2C_ADDR, NumberFormat.UInt16LE);
    }

    function getInt16LE(reg: number): number {
        pins.i2cWriteNumber(BMP280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BMP280_I2C_ADDR, NumberFormat.Int16LE);
    }

    let dig_T1 = getUInt16LE(0x88)
    let dig_T2 = getInt16LE(0x8A)
    let dig_T3 = getInt16LE(0x8C)
    let dig_P1 = getUInt16LE(0x8E)
    let dig_P2 = getInt16LE(0x90)
    let dig_P3 = getInt16LE(0x92)
    let dig_P4 = getInt16LE(0x94)
    let dig_P5 = getInt16LE(0x96)
    let dig_P6 = getInt16LE(0x98)
    let dig_P7 = getInt16LE(0x9A)
    let dig_P8 = getInt16LE(0x9C)
    let dig_P9 = getInt16LE(0x9E)

    // Settings for indoor navigation (ultra high res / osrs_p x16, osrs_t x2, IIR 16, timing 0.5 sec)

    // osrs_t x2, osrs_p x16, power mode: normal 
    setreg(0xF4, 0x57)

    // IIR filter: 16, timing 0.5 sec
    setreg(0xF5, 0x1c)
    // IIR filter: off (?)
    //setreg(0xF5, 0x00)

    // setreg(0xF4, 0x2F)
    // setreg(0xF5, 0x0C)

    let T = 0
    let P = 0

    function get(): void {
        let adc_T = (getreg(0xFA) << 12) + (getreg(0xFB) << 4) + (getreg(0xFC) >> 4)
        let var1 = (((adc_T >> 3) - (dig_T1 << 1)) * dig_T2) >> 11
        let var2 = (((((adc_T >> 4) - dig_T1) * ((adc_T >> 4) - dig_T1)) >> 12) * dig_T3) >> 14
        let t = var1 + var2
        T = ((t * 5 + 128) >> 8) / 100
        var1 = (t >> 1) - 64000
        var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * dig_P6
        var2 = var2 + ((var1 * dig_P5) << 1)
        var2 = (var2 >> 2) + (dig_P4 << 16)
        var1 = (((dig_P3 * ((var1 >> 2) * (var1 >> 2)) >> 13) >> 3) + (((dig_P2) * var1) >> 1)) >> 18
        var1 = ((32768 + var1) * dig_P1) >> 15
        if (var1 == 0)
            return; // avoid exception caused by division by zero
        let adc_P = (getreg(0xF7) << 12) + (getreg(0xF8) << 4) + (getreg(0xF9) >> 4)
        let _p = ((1048576 - adc_P) - (var2 >> 12)) * 3125
        _p = (_p / var1) * 2;
        var1 = (dig_P9 * (((_p >> 3) * (_p >> 3)) >> 13)) >> 12
        var2 = (((_p >> 2)) * dig_P8) >> 13
        P = _p + ((var1 + var2 + dig_P7) >> 4)
    }

    /**
     * get pressure
     */
    //% blockId="BMP280_GET_PRESSURE" block="get pressure"
    //% weight=80 blockGap=8
    export function pressure(): number {
        get();
        return P;
    }

    /**
     * get temperature
     */
    //% blockId="BMP280_GET_TEMPERATURE" block="get temperature"
    //% weight=80 blockGap=8
    export function temperature(): number {
        get();
        return T;
    }

    /**
     * power on
     */
    //% blockId="BMP280_POWER_ON" block="Power On"
    //% weight=61 blockGap=8
    export function PowerOn() {
        setreg(0xF4, 0x2F)
    }

    /**
     * power off
     */
    //% blockId="BMP280_POWER_OFF" block="Power Off"
    //% weight=60 blockGap=8
    export function PowerOff() {
        setreg(0xF4, 0)
    }

    /**
     * set I2C address
     */
    //% blockId="BMP280_SET_ADDRESS" block="set address %addr"
    //% weight=50 blockGap=8
    export function Address(addr: BMP280_I2C_ADDRESS) {
        BMP280_I2C_ADDR = addr
    }

    let charLength = 0
    let stringIndex = 0
    let stringLength = 0
    let radio1 = 0
    let radio2 = 0
    let radio3 = 0
    let radio4 = 0
    let telemetriBuffer = pins.createBuffer(24)


    //% block
    export function getBatteryVoltage(): number {
        /**
         * 
         * Get the battery voltage from flight controller (telemetry data) 
         * 
         */
        let BattVoltage = 0
        telemetriBuffer = serial.readBuffer(10)
        for (let index = 0; index <= 10; index++) {
            if (telemetriBuffer[index] == 83) {
                BattVoltage = telemetriBuffer[index + 2] * 256 + telemetriBuffer[index + 1]
            }
        }
        return BattVoltage
    }


    //% block
    export function echoStart(trig: DigitalPin): number {
        /** 
         * Send an echo signal to the Sonar, use echoGetCm to read the result
         */

        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);
        return input.runningTimeMicros()
    }


    //% block
    export function echoGetCm(eTime: number, unit: PingUnit): number {
        /**
         * We recommend to run this block in an OnPulsed (interrupt) command.
         */
        let eDist = (input.runningTimeMicros() - eTime)
        //    return (input.runningTimeMicros() / 58)
        switch (unit) {
            case PingUnit.Centimeters: return eDist / 58;
            case PingUnit.Inches: return eDist / 148;
            default: return eDist;
        }
    }



    //% block
    export function Plot(displayString: string): void {

        led.plot(0, pins.map(
            getNumber("T", displayString),
            0,
            180,
            4,
            0
        ))
        led.plot(pins.map(
            getNumber("Y", displayString),
            45,
            -45,
            4,
            0
        ), 0)
        led.plot(pins.map(
            getNumber("R", displayString),
            -45,
            45,
            0,
            4
        ), pins.map(
            getNumber("P", displayString),
            -45,
            45,
            4,
            0
        ))

    }


    //% block
    export function blinkXLine(x1: number, x2: number, y: number, speed: number): void {
        /**
         * Draw a blinking line along an X axis with speed 0-7
         */
        if (((input.runningTime() >> (12 - speed) & 1)) == 1) {
            for (let x = x1; x <= x2; x++) {
                led.plot(x, y)
            }
        }
    }

    //% block
    export function blinkYLine(y1: number, y2: number, x: number, speed: number): void {
        /**
         * Draw a blinking line along the Y axis with speed 0-7
         */
        if (((input.runningTime() >> (12 - speed) & 1)) == 1) {
            for (let y = y1; y <= y2; y++) {
                led.plot(x, y)
            }
        }
    }

    //% block
    export function plotYLine(y1: number, y2: number, x: number): void {
        /**
         * Draw a line along the Y axis. y1: first pixel, y2: last pixel
         */

        if (y1 >= y2) {
            for (let y = y2; y <= y1; y++) {
                led.plot(x, y)
            }
        }
        else if (y1 < y2) {
            for (let y = y1; y <= y2; y++) {
                led.plot(x, y)
            }
        }
    }


    //% block
    export function plotXLine(x1: number, x2: number, y: number): void {
        /**
        * Draw a line along the X axis
        */
        if (x1 >= x2) {
            for (let x = x2; x <= x1; x++) {
                led.plot(x, y)
            }
        }
        else if (x1 < x2) {
            for (let x = x1; x <= x2; x++) {
                led.plot(x, y)
            }
        }
    }







    //% block
    export function blinkLed(x: number, y: number, speed: number): void {
        /**
         * Plot a blinking led at x,y with speed 0-7
         */
        if (((input.runningTime() >> (12 - speed) & 1)) == 1) {
            led.plot(x, y)
        }

    }

    //%block
    export function rotateDotCw(speed: number): void {
        /**
         * Draw a dot that is rotating in a clockwise manner with chosen speed
         */
        let posisjon = (input.runningTime() >> (12 - speed)) & 15
        posisjon = pins.map(
            posisjon,
            0,
            15,
            1,
            12
        )
        if (posisjon == 1) {
            led.plot(1, 0)
        }
        if (posisjon == 2) {
            led.plot(2, 0)
        }
        if (posisjon == 3) {
            led.plot(3, 0)
        }
        if (posisjon == 4) {
            led.plot(4, 1)
        }
        if (posisjon == 5) {
            led.plot(4, 2)
        }
        if (posisjon == 6) {
            led.plot(4, 3)
        }
        if (posisjon == 7) {
            led.plot(3, 4)
        }
        if (posisjon == 8) {
            led.plot(2, 4)
        }
        if (posisjon == 9) {
            led.plot(1, 4)
        }
        if (posisjon == 10) {
            led.plot(0, 3)
        }
        if (posisjon == 11) {
            led.plot(0, 2)
        }
        if (posisjon == 12) {
            led.plot(0, 1)
        }
        // Add code here
    }


    //% block="flightcontrol|Throttle $Throttle|Yaw $Yaw|Pitch $Pitch|Roll $Roll|Aux $Arm|flightMode $flightMode|Buzzer $Buzzer"
    export function FlightControl(Throttle: number, Yaw: number, Pitch: number, Roll: number, Arm: number, flightMode: number, Buzzer: number): void {
        /**
         * Control TYPR12 (Throttle, Yaw, Pitch, Roll and AUX1 and AUX2) using the Spektsat 2048 protocol
         * Throttle min: 0, max: 100
         * Yaw, Pitch Roll: min -90, max 90
         * Arm: 0 = Disarm, 1 = Arm 
         * FlightModes: (Not currently used)
         * Buzzer: 1 = make a beep sound, 0 = no beep (flight controller can still make sounds like battery warning and others)
         * Led: Color of the LED
         */
        let Led = 0
        let buf = pins.createBuffer(16)
        let scaling = 5
        let offset = 512
        // Header "Fade" (Spektsat code)
        buf[0] = 0
        // Header "System" (Spektsat code)  
        buf[1] = 0x01
        // 0x01 22MS 1024 DSM2 
        // 0x12 11MS 2048 DSM2
        // 0xa2 22MS 2048 DSMS 
        // 0xb2 11MS 2048 DSMX

        // Reverse the pitch (For F3 flight controller)
        //Pitch = - Pitch

        // Calibrate mode, perform a calibration of the acc using stick command
        if (flightMode == 3) {

            Throttle = 100
            Yaw = -90
            Pitch = -90
            Roll = 0
            Arm = 0
            flightMode = 1
        }

        // Upscale Arm (Arm = true or false)
        let Arm11 = 0
        if (Arm == 0) {
            Arm11 = 0
        }

        if (Arm == 1) {
            Arm11 = 180 * scaling
        }

        // Upscale Buzzer (Buzzer = 0 or 1)

        let Buzzer11 = 0

        if (Buzzer == 0) {
            Buzzer11 = 0
        }

        if (Buzzer == 1) {
            Buzzer11 = 180 * scaling
        }


        // Acro mode (no self level)
        if (flightMode == 0) {
            flightMode = 0
        }

        // Stabilise / self level mode
        if (flightMode == 1) {
            flightMode = 45
        }

        // Alt hold mode
        if (flightMode == 2) {
            flightMode = 90
        }

        // Led color, limit between 0 and 255
        if (Led > 255) {
            Led = 255
        }
        if (Led < 0) {
            Led = 0
        }

        if (Throttle > 99) {
            Throttle = 99
        }
        if (Throttle < 0) {
            Throttle = 0
        }
        if (Yaw > 90) {
            Yaw = 90
        }
        if (Yaw < -90) {
            Yaw = -90
        }
        if (Pitch > 90) {
            Pitch = 90
        }
        if (Pitch < -90) {
            Pitch = -90
        }
        if (Roll > 90) {
            Roll = 90
        }
        if (Roll < -90) {
            Roll = -90
        }
        Pitch = Math.round(0.7004 * Pitch + 0.2335)
        Roll = Math.round(0.7182 * Roll + 1.8636)
        Throttle = Math.round(2 * Throttle / 3 + 20)
        let pitch11 = Pitch * scaling + offset
        let roll11 = Roll * scaling + offset
        let yaw11 = Yaw * scaling + offset
        let throttle10 = (Throttle * 512) / 50
        let flightMode11 = flightMode * scaling
        let led10 = Led << 2

        buf[2] = (0 << 2) | ((roll11 >> 8) & 3)
        buf[3] = roll11 & 255
        buf[4] = (1 << 2) | ((pitch11 >> 8) & 3)
        buf[5] = pitch11 & 255
        buf[6] = (2 << 2) | ((throttle10 >> 8) & 3)
        buf[7] = throttle10 & 255
        buf[8] = (3 << 2) | ((yaw11 >> 8) & 3)
        buf[9] = yaw11 & 255
        buf[10] = (4 << 2) | ((Arm11 >> 8) & 3)
        buf[11] = Arm11 & 255
        buf[12] = (5 << 2) | ((flightMode11 >> 8) & 3)
        buf[13] = flightMode11 & 255
        buf[14] = (6 << 2) | ((Buzzer11 >> 8) & 3)
        buf[15] = Buzzer11 & 255
        serial.writeBuffer(buf)


    }





    //% block
    export function getNumber(atLabel: string, fromString: string): number {
        /**
         * Decode string to get a number after a given label.
         * At Label: The label, eg "T", the string: Eg the RadioString
         * Function will be returning the number following the Letter.
         * 
         */
        stringLength = fromString.length
        stringIndex = 0
        // Search for the label until end of string:
        while (stringIndex < stringLength && fromString.substr(stringIndex, 1) != atLabel) {
            stringIndex += 1
        }
        // stringIndex is now at the label. Calculating charLength of number until next label or end of string: 
        let charLength = 0
        // Step to the first character in the number after the label:    
        stringIndex += 1
        // Search to the next label or end of string. A label must be an "A" or bigger (all letters are "bigger" or similar to "A")
        while (stringIndex < stringLength && fromString.substr(stringIndex, 1) < "A") {
            stringIndex += 1
            charLength += 1
        }
        // Now we can return the integer based on the index and length of that number
        return parseInt(fromString.substr(stringIndex - charLength, charLength))
    }


    //% block
    export function getBoolean(atLabel: string, fromString: string): boolean {
        /**
         * Decode string to get a boolean (true or false) after a given label.
         * At Label: The label, eg "A", the string: Eg the RadioString
         * Function will be returning the boolean following the Letter, based on "true" or "false" in the string.
         * 
         */
        stringLength = fromString.length
        stringIndex = 0
        // Search for the label until end of string:
        while (stringIndex < stringLength && fromString.substr(stringIndex, 1) != atLabel) {
            stringIndex += 1
        }
        // stringIndex is now at the label. Calculating charLength of number until next label or end of string: 
        let charLength = 0
        // Step to the first character in the number after the label:    
        stringIndex += 1
        // Search to the next label or end of string. A label must be an "A" or bigger (all letters are "bigger" or similar to "A")
        while (stringIndex < stringLength && fromString.substr(stringIndex, 1) >= "a") {
            stringIndex += 1
            charLength += 1
        }
        // Find the "true" or "false" inside the string and return a boolean
        if ((fromString.substr((stringIndex - charLength), charLength) == "true")) {
            return true;
        }
        else return false;


    }


    //% block
    export function sendCppm(Throttle: number, Yaw: number, Pitch: number, Roll: number, ch5: number): void {
        /**
         * Unstable CPPM encoder, similar to the SpektSat but analog Sum PPM based.
         */
        let midPoint = 1025

        let wait = 400
        if (Throttle > 180) {
            Throttle = 180
        }
        if (Throttle < 0) {
            Throttle = 0
        }
        if (Yaw > 90) {
            Yaw = 90
        }
        if (Yaw < -90) {
            Yaw = -90
        }
        if (Pitch > 90) {
            Pitch = 90
        }
        if (Pitch < -90) {
            Pitch = -90
        }
        if (Roll > 90) {
            Roll = 90
        }
        if (Roll < -90) {
            Roll = -90
        }
        if (ch5 > 180) {
            ch5 = 180
        }
        if (ch5 < 0) {
            ch5 = 0
        }

        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(wait)
        // Throttle
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros((midPoint) + Roll * 5)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(wait)
        // Yaw
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros((midPoint) + Pitch * 5)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(wait)
        // Pitch
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros((midPoint - 450) + Throttle * 5)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(wait)
        // Roll
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros((midPoint) + Yaw * 5)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(wait)
        // CH5
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros((midPoint - 450) + ch5 * 5)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(wait)
        // CH6
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros(midPoint - 450)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(wait)
        // CH7
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros(midPoint - 450)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(wait)
        // CH8
        pins.digitalWritePin(DigitalPin.P0, 1)
        control.waitMicros(midPoint - 450)
        pins.digitalWritePin(DigitalPin.P0, 0)
        control.waitMicros(wait)
        // Return to high
        pins.digitalWritePin(DigitalPin.P0, 1)



    }
}