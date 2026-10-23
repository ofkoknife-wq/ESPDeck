import type { LessonId } from '@/lib/lessons'

export type CalloutText = { title: string; body: string }

export const CALLOUTS_EN: Partial<Record<LessonId, CalloutText[]>> = {
  'board': [
    { title: 'USB port', body: 'Power, flashing, and serial' },
    { title: 'ESP32 module', body: 'Dual-core + 4MB flash, shield for RF' },
    { title: 'PCB antenna', body: 'Wi-Fi and Bluetooth radiate here' },
    { title: 'BOOT / EN buttons', body: 'EN resets; BOOT enters download mode' },
    { title: 'Onboard LED', body: 'Usually wired to GPIO2' },
    { title: 'GPIO headers', body: 'Two rows, 38 pins for peripherals' },
  ],
  'blink': [
    { title: 'GPIO2', body: 'Firmware drives it to 3.3V or 0V' },
    { title: '220Ω resistor', body: 'Limits current to protect the LED' },
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
    { title: 'GND', body: 'Current returns to the board here' },
  ],
  'button': [
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
    { title: 'GPIO4', body: 'Internal pull-up; reads LOW when pressed' },
    { title: 'Button (clickable)', body: 'Hold to light the LED' },
  ],
  'pot': [
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
    { title: 'GPIO34 (ADC)', body: 'Maps 0–3.3V to 0–4095' },
    { title: 'Potentiometer', body: 'Turn to change the wiper voltage' },
  ],
  'rgb': [
    { title: 'GPIO25 / 26 / 27', body: 'Three PWMs for red, green, blue' },
    { title: 'RGB LED', body: 'Longest pin is common cathode → GND' },
    { title: '3 resistors', body: 'One 220Ω per color' },
  ],
  'touch': [
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
    { title: 'T0 = GPIO4', body: 'Built-in capacitive touch channel' },
    { title: 'Touch pad (clickable)', body: 'Hold to simulate a finger touch' },
  ],
  'dht': [
    { title: 'DHT11', body: 'One data line for temp and humidity' },
    { title: 'DATA → GPIO4', body: 'Single-wire bus' },
    { title: 'Alarm LED', body: 'Lights when temperature exceeds 30°C' },
  ],
  'buzzer': [
    { title: 'Passive buzzer', body: 'Sounds at the square-wave frequency' },
    { title: 'GPIO18', body: 'tone() outputs the square wave here' },
    { title: 'GND', body: 'Current returns to the board here' },
  ],
  'servo': [
    { title: 'Servo SG90', body: 'The horn points at the current angle' },
    { title: 'Orange → GPIO18', body: 'PWM signal wire' },
    { title: 'Red → 5V', body: 'Servo needs a 5V supply' },
  ],
  'oled': [
    { title: 'I2C OLED', body: '128×64 display, address often 0x3C' },
    { title: 'SDA → GPIO21', body: 'I2C data line' },
    { title: 'SCL → GPIO22', body: 'I2C clock line' },
  ],
  'ldr': [
    { title: 'GPIO34 / ADC', body: 'Reads the photoresistor divider' },
    { title: 'Photoresistor', body: 'Drag the knob to fake light level' },
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
  ],
  'ultrasonic': [
    { title: 'HC-SR04', body: 'Sends ultrasound and hears the echo' },
    { title: 'TRIG → GPIO5', body: 'Sends a 10μs trigger pulse' },
    { title: 'Distance readout', body: 'Drag to simulate target distance' },
  ],
  'relay': [
    { title: 'Relay module', body: 'GPIO16 drives the coil' },
    { title: 'IN → GPIO16', body: 'Low-voltage signal switches the load' },
    { title: 'Load indicator', body: 'On real hardware use low-voltage loads only' },
  ],
  'wifi': [
    { title: 'PCB antenna', body: 'Connects 2.4 GHz Wi-Fi' },
    { title: 'GPIO2', body: 'Firmware drives it to 3.3V or 0V' },
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
  ],
  'motor': [
    { title: 'DC motor', body: 'Driver board protects ESP32; PWM sets speed' },
    { title: 'IN1 / IN2', body: 'Two GPIOs set direction' },
    { title: 'ENA · PWM', body: 'Duty cycle sets speed' },
  ],
  'keypad': [
    { title: 'Matrix keypad', body: 'Click to simulate one key press' },
    { title: 'Row lines', body: 'Drive rows low and read columns' },
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
  ],
  'sleep': [
    { title: 'Low-power mode', body: 'Most peripherals off while sleeping' },
    { title: 'Wake pin', body: 'GPIO or timer can wake ESP32' },
  ],
  'bluetooth': [
    { title: 'Bluetooth antenna', body: 'Phone connects as ESP32-LAB' },
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
    { title: 'GPIO2', body: 'Bluetooth commands drive the LED' },
  ],
  'neopixel': [
    { title: 'NeoPixel', body: 'Each pixel has its own color' },
    { title: 'DIN → GPIO23', body: 'One data line chains the whole strip' },
    { title: '5V supply', body: 'Use a separate supply for many LEDs' },
  ],
  'ir': [
    { title: 'IR receiver', body: 'Click to fake a remote code' },
    { title: 'OUT → GPIO27', body: 'Reads 38 kHz IR' },
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
  ],
  'fan': [
    { title: 'PWM fan', body: 'Speed follows duty cycle smoothly' },
    { title: 'PWM → GPIO25', body: 'Drives the MOSFET gate' },
    { title: 'Common ground', body: 'External supply ground must share ESP32 GND' },
  ],
  'rtc': [
    { title: 'Real-time clock', body: 'After NTP sync, updates every second' },
    { title: 'Wi-Fi / NTP', body: 'Syncs time from NTP servers' },
  ],
  'pir': [
    { title: 'PIR sensor (clickable)', body: 'Click to fake motion detect' },
    { title: 'OUT → GPIO27', body: 'HIGH means motion detected' },
    { title: 'LED', body: 'Long leg (+) to resistor, short (−) to GND' },
  ],
  'joystick': [
    { title: 'Dual-axis joystick', body: 'Read X/Y axes and the button' },
  ],
  'soil': [
    { title: 'Soil moisture', body: 'Drag to fake wet/dry soil' },
  ],
  'gas': [
    { title: 'MQ gas sensor', body: 'Alarms when reading exceeds threshold' },
  ],
  'imu': [
    { title: 'MPU6050', body: 'I2C reads orientation changes' },
  ],
  'gps': [
    { title: 'GPS coordinates', body: 'Waits for a fix, then lat/lon' },
  ],
  'camera': [
    { title: 'ESP32-CAM', body: 'Streams images once on Wi-Fi' },
  ],
  'lightstrip': [
    { title: 'Addressable strip', body: 'Colors travel along the data line' },
  ],
}
