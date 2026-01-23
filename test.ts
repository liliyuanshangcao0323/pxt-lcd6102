// Test file for LCD 1602 I2C extension
lcd1602.init(0x27);
lcd1602.showString(0, 0, "Test");
lcd1602.setCursor(0, 0);
lcd1602.setBacklight(true);
lcd1602.showCursor(true);
lcd1602.setCursorBlink(false);
lcd1602.clear();
