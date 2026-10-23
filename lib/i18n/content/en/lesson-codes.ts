import type { LessonId } from '@/lib/lessons'

/** English sketch source shown in the Try-it panel. */
export const LESSON_CODES_EN: Partial<Record<LessonId, string>> = {
  board: `void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);  // onboard LED
  Serial.println("Hello, ESP32!");
  Serial.printf("Chip model: %s\\n", ESP.getChipModel());
}

void loop() {
  digitalWrite(2, HIGH);
  delay(500);
  digitalWrite(2, LOW);
  delay(500);
}`,
  blink: `const int LED_PIN = 2;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // 3.3V, LED on
  Serial.println("LED ON");
  delay(1000);
  digitalWrite(LED_PIN, LOW);   // 0V, LED off
  Serial.println("LED OFF");
  delay(1000);
}`,
  button: `const int BUTTON_PIN = 4;
const int LED_PIN = 2;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // HIGH when released
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  bool pressed = digitalRead(BUTTON_PIN) == LOW;
  digitalWrite(LED_PIN, pressed ? HIGH : LOW);
  Serial.println(pressed ? "pressed" : "released");
  delay(20);
}`,
  pot: `const int POT_PIN = 34;  // input-only pin, good for ADC
const int LED_PIN = 2;

void setup() {
  Serial.begin(115200);
  ledcAttach(LED_PIN, 5000, 12);  // 5kHz, 12-bit
}

void loop() {
  int raw = analogRead(POT_PIN);        // 0 ~ 4095
  float volts = raw * 3.3 / 4095.0;
  ledcWrite(LED_PIN, raw);              // brightness follows knob
  Serial.printf("ADC: %d  V: %.2f V\\n", raw, volts);
  delay(200);
}`,
  rgb: `const int R_PIN = 25, G_PIN = 26, B_PIN = 27;

void setup() {
  ledcAttach(R_PIN, 5000, 8);
  ledcAttach(G_PIN, 5000, 8);
  ledcAttach(B_PIN, 5000, 8);
}

void setColor(int r, int g, int b) {
  ledcWrite(R_PIN, r);
  ledcWrite(G_PIN, g);
  ledcWrite(B_PIN, b);
}

void wheel(int pos) {  // color wheel 0~254
  if (pos < 85)       setColor(255 - pos * 3, pos * 3, 0);
  else if (pos < 170) { pos -= 85;  setColor(0, 255 - pos * 3, pos * 3); }
  else                { pos -= 170; setColor(pos * 3, 0, 255 - pos * 3); }
}

void loop() {
  for (int i = 0; i < 255; i++) { wheel(i); delay(20); }
}`,
  touch: `const int TOUCH_PIN = T0;  // T0 = GPIO4
const int LED_PIN = 2;
const int THRESHOLD = 30;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int value = touchRead(TOUCH_PIN);  // value drops when touched
  Serial.printf("touchRead = %d\\n", value);
  digitalWrite(LED_PIN, value < THRESHOLD ? HIGH : LOW);
  delay(100);
}`,
  dht: `#include <DHT.h>

DHT dht(4, DHT11);
const int LED_PIN = 2;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  Serial.printf("Temp: %.1f °C  Humidity: %.0f %%\\n", t, h);
  digitalWrite(LED_PIN, t > 30 ? HIGH : LOW);  // overheat alarm
  delay(2000);
}`,
  buzzer: `const int BUZZER_PIN = 18;
int melody[] = {262, 262, 392, 392, 440, 440, 392,
                349, 349, 330, 330, 294, 294, 262};

void setup() {}

void loop() {
  for (int i = 0; i < 14; i++) {
    tone(BUZZER_PIN, melody[i], 350);
    delay(i % 7 == 6 ? 800 : 400);
  }
  delay(1000);
}`,
  servo: `#include <ESP32Servo.h>

Servo servo;

void setup() {
  Serial.begin(115200);
  servo.attach(18);  // signal on GPIO18
}

void loop() {
  for (int a = 0; a <= 180; a++) { servo.write(a); delay(10); }
  for (int a = 180; a >= 0; a--) { servo.write(a); delay(10); }
}`,
  oled: `#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\nAdafruit_SSD1306 display(128, 64, &Wire, -1);\n\nvoid setup() {\n  Wire.begin(21, 22);\n  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n  display.setTextColor(SSD1306_WHITE);\n}\n\nvoid loop() {\n  display.clearDisplay();\n  display.setTextSize(1);\n  display.setCursor(0, 0);\n  display.println("ESP32 LAB");\n  display.setTextSize(2);\n  display.setCursor(0, 20);\n  display.printf("Temp: %.1f C", 25.0 + sin(millis() / 1000.0));\n  display.display();\n  delay(1000);\n}`,
  wifi: `#include <WiFi.h>
#include <WebServer.h>

const char* SSID = "YourWiFiSSID";
const char* PASS = "YourWiFiPassword";
const int LED_PIN = 2;
WebServer server(80);

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.localIP());

  server.on("/on", [] {
    digitalWrite(LED_PIN, HIGH);
    server.send(200, "text/plain", "ON");
  });
  server.on("/off", [] {
    digitalWrite(LED_PIN, LOW);
    server.send(200, "text/plain", "OFF");
  });
  server.begin();
}

void loop() {
  server.handleClient();
}`,
  ldr: `const int LDR_PIN = 34;\nconst int LED_PIN = 2;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  int light = analogRead(LDR_PIN);\n  digitalWrite(LED_PIN, light < 1500);\n  Serial.printf("Light ADC: %d\\n", light);\n  delay(200);\n}`,
  ultrasonic: `const int TRIG = 5;\nconst int ECHO = 18;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n}\n\nvoid loop() {\n  digitalWrite(TRIG, LOW); delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH); delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long us = pulseIn(ECHO, HIGH);\n  Serial.printf("Distance: %.1f cm\\n", us * 0.0343 / 2);\n  delay(200);\n}`,
  relay: `const int RELAY = 16;\n\nvoid setup() {\n  pinMode(RELAY, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(RELAY, HIGH);\n  delay(2000);\n  digitalWrite(RELAY, LOW);\n  delay(2000);\n}`,
  motor: `const int IN1 = 18, IN2 = 19, ENA = 25;\n\nvoid setup() {\n  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  ledcAttach(ENA, 5000, 8);\n}\n\nvoid loop() {\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  for (int speed = 0; speed <= 255; speed++) { ledcWrite(ENA, speed); delay(8); }\n  digitalWrite(IN1, LOW); digitalWrite(IN2, HIGH);\n  delay(500);\n}`,
  keypad: `char keys[4][4] = {{'1','2','3','A'}, {'4','5','6','B'},\n                      {'7','8','9','C'}, {'*','0','#','D'}};\n\nvoid setup() { Serial.begin(115200); }\nvoid loop() {\n  // scan rows/cols; print when a key is pressed\n  Serial.println("Waiting for key...");\n  delay(500);\n}`,
  sleep: `#include <esp_sleep.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  Serial.println("Read sensor and send data");\n  esp_sleep_enable_timer_wakeup(10ULL * 1000000);\n  esp_deep_sleep_start();\n}\n\nvoid loop() {}`,
  bluetooth: `#include "BluetoothSerial.h"\nBluetoothSerial SerialBT;\nconst int LED = 2;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  SerialBT.begin("ESP32-LAB");\n}\n\nvoid loop() {\n  if (SerialBT.available()) {\n    char c = SerialBT.read();\n    digitalWrite(LED, c == '1');\n    SerialBT.println(c == '1' ? "LED ON" : "LED OFF");\n  }\n}`,
  neopixel: `#include <Adafruit_NeoPixel.h>\n#define PIN 23\n#define COUNT 8\nAdafruit_NeoPixel strip(COUNT, PIN, NEO_GRB + NEO_KHZ800);\n\nvoid setup() { strip.begin(); strip.show(); }\nvoid loop() {\n  for (int i = 0; i < COUNT; i++) {\n    strip.setPixelColor(i, strip.Color(20, 80, 255));\n    strip.show();\n    delay(80);\n  }\n}`,
  ir: `#include <IRremote.hpp>\nconst int IR_PIN = 27;\nconst int LED = 2;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  IrReceiver.begin(IR_PIN, ENABLE_LED_FEEDBACK);\n}\nvoid loop() {\n  if (IrReceiver.decode()) {\n    digitalWrite(LED, !digitalRead(LED));\n    IrReceiver.resume();\n  }\n}`,
  fan: `const int FAN = 25;\n\nvoid setup() {\n  ledcAttach(FAN, 5000, 8);\n}\n\nvoid loop() {\n  for (int speed = 0; speed <= 255; speed++) {\n    ledcWrite(FAN, speed);\n    delay(12);\n  }\n  delay(500);\n}`,
  rtc: `#include <WiFi.h>\n#include <time.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  configTime(8 * 3600, 0, "pool.ntp.org");\n}\n\nvoid loop() {\n  struct tm now;\n  if (getLocalTime(&now)) {\n    Serial.printf("%04d-%02d-%02d %02d:%02d:%02d\\n",\n      now.tm_year + 1900, now.tm_mon + 1, now.tm_mday,\n      now.tm_hour, now.tm_min, now.tm_sec);\n  }\n  delay(1000);\n}`,
  pir: `const int PIR = 27;\nconst int LED = 2;\n\nvoid setup() {\n  pinMode(PIR, INPUT);\n  pinMode(LED, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  bool motion = digitalRead(PIR);\n  digitalWrite(LED, motion);\n  Serial.println(motion ? "Motion detected" : "Quiet");\n  delay(100);\n}`,
  joystick: `const int PIN_X = 34;\nconst int PIN_Y = 35;\nconst int PIN_SW = 32;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(PIN_SW, INPUT_PULLUP);\n}\n\nvoid loop() {\n  Serial.printf("X=%d Y=%d SW=%d\\n", analogRead(PIN_X), analogRead(PIN_Y), digitalRead(PIN_SW));\n  delay(200);\n}`,
  soil: `const int SOIL = 34;\n\nvoid setup() { Serial.begin(115200); }\n\nvoid loop() {\n  int moisture = analogRead(SOIL);\n  Serial.printf("Soil ADC: %d\\n", moisture);\n  delay(500);\n}`,
  gas: `const int MQ = 34;\nconst int BUZZER = 18;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(BUZZER, OUTPUT);\n}\n\nvoid loop() {\n  int level = analogRead(MQ);\n  digitalWrite(BUZZER, level > 2000);\n  Serial.printf("Gas ADC: %d\\n", level);\n  delay(300);\n}`,
  imu: `#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin(21, 22);\n}\n\nvoid loop() {\n  Serial.println("Reading IMU over I2C...");\n  delay(500);\n}`,
  gps: `void setup() {\n  Serial.begin(115200);\n  Serial2.begin(9600, SERIAL_8N1, 16, 17);\n}\n\nvoid loop() {\n  while (Serial2.available()) Serial.write(Serial2.read());\n}`,
  camera: `void setup() {\n  Serial.begin(115200);\n  Serial.println("ESP32-CAM init...");\n}\n\nvoid loop() {\n  Serial.println("Streaming placeholder");\n  delay(1000);\n}`,
  lightstrip: `#include <Adafruit_NeoPixel.h>\nAdafruit_NeoPixel strip(16, 23, NEO_GRB + NEO_KHZ800);\n\nvoid setup() { strip.begin(); strip.show(); }\nvoid loop() {\n  for (int i = 0; i < strip.numPixels(); i++) {\n    strip.setPixelColor(i, strip.Color(255, 40, 80));\n    strip.show();\n    delay(40);\n  }\n}`,
}
