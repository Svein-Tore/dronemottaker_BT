bluetooth.onUartDataReceived(serial.delimiters(Delimiters.Dollar), function () {
    mottattTekst = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Dollar))
})
bluetooth.onBluetoothConnected(function () {
    bluetooth.startUartService()
    music.play(music.stringPlayable("C D E F G A B C5 ", 700), music.PlaybackMode.UntilDone)
})
let mottattTekst = ""
bluetooth.startUartService()
let Pitch = 0
let Roll = 0
let Throttle = 0
let Yaw = 0
mottattTekst = "P0R0T0Y0"
serial.redirect(
SerialPin.P1,
SerialPin.P2,
BaudRate.BaudRate115200
)
basic.forever(function () {
    basic.clearScreen()
    Pitch = AirBit.getNumber("P", mottattTekst)
    Roll = AirBit.getNumber("R", mottattTekst)
    Throttle = AirBit.getNumber("T", mottattTekst)
    Yaw = AirBit.getNumber("Y", mottattTekst)
    led.plot(2, 0)
    led.plot(4, 4)
    led.plot(0, Math.map(Throttle, 0, 90, 4, 0))
    led.plot(Math.map(Roll, -90, 90, 0, 4), Math.map(Pitch, -90, 90, 0, 4))
    AirBit.FlightControl(
    Throttle,
    Yaw,
    Pitch,
    Roll,
    0,
    1,
    0
    )
})
