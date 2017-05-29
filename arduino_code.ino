// Set buttons pin numbers
int upButton = 2;
int downButton = 4;
int joyPinX = 0;
int joyPinY = 1;
int joyValX = 0;
int joyValY = 0;
int const STANDBY_DIFF = 30; // joystick standby diff
int const JOYSTICK_STEPS = 20;
int const JOYSTICK_MAX = 1000;
int const MIDDLE_VALUE = JOYSTICK_MAX / 2;
int const SECTION_LENGTH = (JOYSTICK_MAX / JOYSTICK_STEPS); // Joystick section length
const char* SCROLL_UP = "1";
const char* SCROLL_DOWN = "2";
String MOVE_X = "x:";
String MOVE_Y = "y:";

String MINUS = "0";
String PLUS = "1";

void setup() {
    Serial.begin(9600);
    
    pinMode(upButton, INPUT);
    pinMode(downButton, INPUT);
}

void loop() {
    buttons();
    delay(10);
    
    joystick();
    
    // Reduce communication frequency
    
}

int treatValue(int data) {
  return (data * 9 / 1024) + 48;
}

// Checks if this is a standby joystick value
bool standbyValue(int value) {
  return value > (MIDDLE_VALUE - STANDBY_DIFF) && value < (MIDDLE_VALUE + STANDBY_DIFF);
}

String getMovePosition(int value) {
  int valuePerStep = (value / JOYSTICK_STEPS);
  int middleJoysticSteps = (value - MIDDLE_VALUE) / SECTION_LENGTH;
  
  return String(middleJoysticSteps);
}


void SerialWrite(char* str) {
  Serial.write(str);
  Serial.write("\n");
}

void SerialWrite(String str) {
  int size = str.length() + 1;
  char strArray[size]; 
  str.toCharArray(strArray, size);
  SerialWrite(strArray);
}

void joystick() {
  joyValX = analogRead(joyPinX);   
  // this small pause is needed between reading
  // analog pins, otherwise we get the same value twice
  delay(100);             
  // reads the value of the variable resistor 
  joyValY = analogRead(joyPinY);
  
  if (!standbyValue(joyValX)) {
    SerialWrite(MOVE_X + getMovePosition(joyValX));
  }
  
  if (!standbyValue(joyValY)) {
    SerialWrite(MOVE_Y + getMovePosition(joyValY));
  }
  //delay(100);
}

void buttons() {
    int upState = digitalRead(upButton);
    int downState = digitalRead(downButton);
    
    // Communicate with serial port
    if (upState == HIGH) {
      // Send '1' for scroll up event
      SerialWrite(SCROLL_UP);
    }
    else if (downState == HIGH) {
      // Send '2' for scroll down event
      SerialWrite(SCROLL_DOWN);
    }
}
