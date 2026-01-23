/**
 * micro:bit LCD 1602 I2C Extension
 * Main API module - Public TypeScript/JavaScript API
 */

// Global display state
let displayInitialized = false;
let displayAddress = 0x27;

/**
 * Initializes the LCD display at the specified I2C address
 * @param address - The I2C address of the LCD module (0x20-0x27, default: 0x27)
 */
export function init(address: number = 0x27): void {
  if (address < 0x20 || address > 0x27) {
    throw new Error(`Invalid I2C address: 0x${address.toString(16)}. Must be 0x20-0x27`);
  }
  
  displayAddress = address;
  displayInitialized = true;
  
  // Initialize LCD hardware
  try {
    // PCF8574 initialization sequence for 4-bit mode
    const backlightBit = 0x10; // Backlight ON (bit 4)
    
    // Initial setup - send 0x30 three times in 8-bit mode to ensure sync
    pins.i2cWriteNumber(address, 0x30 | backlightBit, NumberFormat.UInt8LE, false);
    control.waitMicros(5000);
    pins.i2cWriteNumber(address, 0x30 | backlightBit, NumberFormat.UInt8LE, false);
    control.waitMicros(5000);
    pins.i2cWriteNumber(address, 0x30 | backlightBit, NumberFormat.UInt8LE, false);
    control.waitMicros(5000);
    
    // Switch to 4-bit mode: send 0x20
    pins.i2cWriteNumber(address, 0x20 | backlightBit, NumberFormat.UInt8LE, false);
    control.waitMicros(5000);
    
    // Function set: 0x28 (4-bit mode, 2 lines, 5x8 font)
    sendCommand(0x28);
    
    // Display control: 0x0C (display ON, cursor OFF, blink OFF)
    sendCommand(0x0C);
    
    // Clear display: 0x01
    sendCommand(0x01);
    control.waitMicros(2000);
    
    // Entry mode: 0x06 (increment cursor, no shift)
    sendCommand(0x06);
    
  } catch (e) {
    displayInitialized = false;
    throw new Error(`Failed to initialize display: ${e}`);
  }
}

/**
 * Displays a text string at the specified row and column
 */
export function showString(row: number, col: number, text: string): void {
  if (!displayInitialized) {
    throw new Error("LCD display not initialized. Call init() first.");
  }
  
  if (row < 0 || row > 1) {
    throw new Error(`Invalid row: ${row}. Must be 0-1`);
  }
  
  if (col < 0 || col > 15) {
    throw new Error(`Invalid column: ${col}. Must be 0-15`);
  }
  
  // Set cursor position
  setCursorInternal(row, col);
  
  // Send text
  const availableSpace = 16 - col;
  const truncatedText = text.length > availableSpace 
    ? text.substring(0, availableSpace) 
    : text;
  
  for (let i = 0; i < truncatedText.length; i++) {
    sendData(truncatedText.charCodeAt(i));
  }
}

/**
 * Clears all characters from the display
 */
export function clear(): void {
  if (!displayInitialized) {
    throw new Error("LCD display not initialized. Call init() first.");
  }
  
  sendCommand(0x01); // Clear display command
  control.waitMicros(2000);
}

/**
 * Sets the cursor position
 */
export function setCursor(row: number, col: number): void {
  if (!displayInitialized) {
    throw new Error("LCD display not initialized. Call init() first.");
  }
  
  if (row < 0 || row > 1) {
    throw new Error(`Invalid row: ${row}. Must be 0-1`);
  }
  
  if (col < 0 || col > 15) {
    throw new Error(`Invalid column: ${col}. Must be 0-15`);
  }
  
  setCursorInternal(row, col);
}

/**
 * Controls the backlight
 */
export function setBacklight(on: boolean): void {
  if (!displayInitialized) {
    throw new Error("LCD display not initialized. Call init() first.");
  }
  
  const backlightBit = on ? 0x10 : 0x00;
  pins.i2cWriteNumber(displayAddress, backlightBit, NumberFormat.UInt8LE, false);
}

/**
 * Controls cursor visibility
 */
export function showCursor(visible: boolean): void {
  if (!displayInitialized) {
    throw new Error("LCD display not initialized. Call init() first.");
  }
  
  let displayControl = 0x08; // Base: display ON
  if (visible) displayControl |= 0x02; // Cursor ON
  sendCommand(displayControl);
}

/**
 * Controls cursor blinking
 */
export function setCursorBlink(blink: boolean): void {
  if (!displayInitialized) {
    throw new Error("LCD display not initialized. Call init() first.");
  }
  
  let displayControl = 0x08; // Base: display ON
  if (blink) displayControl |= 0x01; // Blink ON
  sendCommand(displayControl);
}

// Internal helper functions

function setCursorInternal(row: number, col: number): void {
  const rowOffset = row === 0 ? 0x00 : 0x40;
  const cursorCommand = 0x80 | rowOffset | col;
  sendCommand(cursorCommand);
}

function sendCommand(command: number): void {
  const backlightBit = 0x10; // Assume backlight is ON
  
  // Send high nibble (bits 7-4)
  const highNibble = (command & 0xF0) >> 4;
  const highByte = (highNibble << 4) | backlightBit; // RS=0, RW=0 (command, write)
  
  pins.i2cWriteNumber(displayAddress, highByte, NumberFormat.UInt8LE, false);
  // Pulse enable bit
  pins.i2cWriteNumber(displayAddress, highByte | 0x20, NumberFormat.UInt8LE, false); // Enable = 1
  control.waitMicros(1000);
  pins.i2cWriteNumber(displayAddress, highByte, NumberFormat.UInt8LE, false); // Enable = 0
  
  // Send low nibble (bits 3-0)
  const lowNibble = command & 0x0F;
  const lowByte = (lowNibble << 4) | backlightBit;
  
  pins.i2cWriteNumber(displayAddress, lowByte, NumberFormat.UInt8LE, false);
  // Pulse enable bit
  pins.i2cWriteNumber(displayAddress, lowByte | 0x20, NumberFormat.UInt8LE, false); // Enable = 1
  control.waitMicros(1000);
  pins.i2cWriteNumber(displayAddress, lowByte, NumberFormat.UInt8LE, false); // Enable = 0
  
  control.waitMicros(1000);
}

function sendData(data: number): void {
  const backlightBit = 0x10; // Assume backlight is ON
  const rsBit = 0x80; // Bit 7 = 1 for data mode
  
  // Send high nibble (bits 7-4)
  const highNibble = (data & 0xF0) >> 4;
  const highByte = (highNibble << 4) | backlightBit | rsBit;
  
  pins.i2cWriteNumber(displayAddress, highByte, NumberFormat.UInt8LE, false);
  // Pulse enable bit
  pins.i2cWriteNumber(displayAddress, highByte | 0x20, NumberFormat.UInt8LE, false); // Enable = 1
  control.waitMicros(1000);
  pins.i2cWriteNumber(displayAddress, highByte, NumberFormat.UInt8LE, false); // Enable = 0
  
  // Send low nibble (bits 3-0)
  const lowNibble = data & 0x0F;
  const lowByte = (lowNibble << 4) | backlightBit | rsBit;
  
  pins.i2cWriteNumber(displayAddress, lowByte, NumberFormat.UInt8LE, false);
  // Pulse enable bit
  pins.i2cWriteNumber(displayAddress, lowByte | 0x20, NumberFormat.UInt8LE, false); // Enable = 1
  control.waitMicros(1000);
  pins.i2cWriteNumber(displayAddress, lowByte, NumberFormat.UInt8LE, false); // Enable = 0
  
  control.waitMicros(1000);
}
