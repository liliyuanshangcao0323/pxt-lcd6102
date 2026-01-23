// Test file for test-lcd1602 extension
testlcd.init(0x27);
testlcd.showString(0, 0, "Test");
testlcd.setCursor(0, 0);
testlcd.setBacklight(true);
testlcd.showCursor(true);
testlcd.setCursorBlink(false);
testlcd.clear();
