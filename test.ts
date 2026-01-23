// Test file for test-lcd1602 extension
testlcd.init(0x27);
testlcd.showString(0, 0, "Hello");
testlcd.showString(1, 0, "World");
testlcd.setCursor(0, 5);
testlcd.setBacklight(true);
testlcd.showCursor(false);
testlcd.setCursorBlink(false);
testlcd.clear();
