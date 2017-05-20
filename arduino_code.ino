// Set buttons pin numbers
int upButton = 2;
int downButton = 4;

void setup() {
    Serial.begin(9600);
    
    pinMode(upButton, INPUT);
    pinMode(downButton, INPUT);
}

void loop() {
    int upState = digitalRead(upButton);
    int downState = digitalRead(downButton);
    
    // Communicate with serial port
    if (upState == HIGH) {
      // Send '1' for scroll up event
      Serial.println("1");
    }
    else if (downState == HIGH) {
      // Send '2' for scroll down event
      Serial.println("2");
    }
    
    // Redude communication frequency
    delay(10);
}
