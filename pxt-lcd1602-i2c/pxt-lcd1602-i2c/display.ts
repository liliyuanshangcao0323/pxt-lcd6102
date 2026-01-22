/**
 * LCD Display Manager
 * Manages display state, buffer, and command generation
 */

import { writeI2C } from "./i2c";

/**
 * DisplayState interface represents the complete state of the LCD display
 */
export interface DisplayState {
  address: number;           // I2C address of the LCD module
  initialized: boolean;      // Whether the display has been initialized
  buffer: string[][];        // 2D buffer for display content (2 rows x 16 columns)
  cursorRow: number;         // Current cursor row (0-1)
  cursorCol: number;         // Current cursor column (0-15)
  backlightOn: boolean;      // Backlight state (true=ON, false=OFF)
  cursorVisible: boolean;    // Cursor visibility (true=visible, false=hidden)
  cursorBlink: boolean;      // Cursor blink state (true=blinking, false=steady)
}

/**
 * Global display state instance
 */
let displayState: DisplayState | null = null;

/**
 * Initializes the LCD display at the specified I2C address
 * Sets up the display for 16x2 character mode with default state:
 * - Cursor at position (0,0)
 * - Backlight ON
 * - Buffer cleared
 * 
 * @param address - The I2C address of the LCD module (0x20-0x27 for PCF8574)
 * @throws Error if address is invalid or I2C communication fails
 * @requirements 1.1, 1.2, 1.4, 1.5
 */
export function initDisplay(address: number): void {
  // Validate I2C address range (0x20-0x27 for standard PCF8574 backpack)
  if (address < 0x20 || address > 0x27) {
    throw new Error(`Invalid I2C address: 0x${address.toString(16)}. Must be 0x20-0x27`);
  }

  // Initialize display buffer (2 rows x 16 columns)
  const buffer: string[][] = [
    Array(16).fill(" "),
    Array(16).fill(" ")
  ];

  // Create display state with default values
  displayState = {
    address: address,
    initialized: true,
    buffer: buffer,
    cursorRow: 0,
    cursorCol: 0,
    backlightOn: true,
    cursorVisible: false,
    cursorBlink: false
  };

  // Send initialization commands to hardware via I2C
  try {
    // PCF8574 initialization sequence
    // Send initial byte with backlight ON (bit 4 = 1)
    const initByte = 0x08; // Backlight ON, other bits OFF
    writeI2C(address, initByte);
  } catch (e) {
    displayState = null;
    throw new Error(`Failed to initialize display at address 0x${address.toString(16)}: ${e}`);
  }
}

/**
 * Gets the current display state
 * @returns The current DisplayState or null if not initialized
 */
export function getDisplayState(): DisplayState | null {
  return displayState;
}

/**
 * Checks if the display is initialized
 * @returns true if display is initialized, false otherwise
 */
export function isDisplayInitialized(): boolean {
  return displayState !== null && displayState.initialized;
}

/**
 * Displays a text string at the specified row and column
 * Validates input parameters and truncates text if necessary
 * Updates the display buffer and sends I2C commands to hardware
 * 
 * @param row - The row position (0-1)
 * @param col - The column position (0-15)
 * @param text - The text string to display
 * @throws Error if display is not initialized or parameters are invalid
 * @requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */
export function showString(row: number, col: number, text: string): void {
  // Check if display is initialized
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call initDisplay() first.");
  }

  // Validate row parameter (0-1)
  if (row < 0 || row > 1) {
    throw new Error(`Invalid row: ${row}. Must be 0-1`);
  }

  // Validate column parameter (0-15)
  if (col < 0 || col > 15) {
    throw new Error(`Invalid column: ${col}. Must be 0-15`);
  }

  // Validate text parameter
  if (typeof text !== "string") {
    throw new Error("Text must be a string");
  }

  // Calculate available space from column to end of row
  const availableSpace = 16 - col;

  // Truncate text if it exceeds available space
  const truncatedText = text.length > availableSpace 
    ? text.substring(0, availableSpace) 
    : text;

  // Update display buffer with the text
  for (let i = 0; i < truncatedText.length; i++) {
    displayState!.buffer[row][col + i] = truncatedText[i];
  }

  // Send I2C commands to hardware to display the text
  try {
    // Set cursor position to the specified row and column
    setCursorInternal(row, col);

    // Send each character to the display
    for (let i = 0; i < truncatedText.length; i++) {
      const charCode = truncatedText.charCodeAt(i);
      sendDataByte(charCode);
    }
  } catch (e) {
    throw new Error(`Failed to display text: ${e}`);
  }
}

/**
 * Sets the cursor position to the specified row and column
 * Updates cursor position without clearing text
 * 
 * @param row - The row position (0-1)
 * @param col - The column position (0-15)
 * @throws Error if display is not initialized or parameters are invalid
 * @requirements 2.3, 2.4, 2.6
 */
export function setCursor(row: number, col: number): void {
  // Check if display is initialized
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call initDisplay() first.");
  }

  // Validate row parameter (0-1)
  if (row < 0 || row > 1) {
    throw new Error(`Invalid row: ${row}. Must be 0-1`);
  }

  // Validate column parameter (0-15)
  if (col < 0 || col > 15) {
    throw new Error(`Invalid column: ${col}. Must be 0-15`);
  }

  // Update cursor position in display state
  displayState!.cursorRow = row;
  displayState!.cursorCol = col;

  // Send I2C command to hardware
  try {
    setCursorInternal(row, col);
  } catch (e) {
    throw new Error(`Failed to set cursor position: ${e}`);
  }
}

/**
 * Clears the display and resets cursor to (0,0)
 * Erases all characters from the display buffer
 * 
 * @throws Error if display is not initialized or I2C communication fails
 * @requirements 3.1
 */
export function clear(): void {
  // Check if display is initialized
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call initDisplay() first.");
  }

  // Clear the display buffer
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 16; col++) {
      displayState!.buffer[row][col] = " ";
    }
  }

  // Reset cursor to (0,0)
  displayState!.cursorRow = 0;
  displayState!.cursorCol = 0;

  // Send I2C command to hardware to clear display
  try {
    sendCommandByte(0x01); // Clear display command
  } catch (e) {
    throw new Error(`Failed to clear display: ${e}`);
  }
}

/**
 * Controls the backlight of the display
 * 
 * @param on - true to turn backlight ON, false to turn it OFF
 * @throws Error if display is not initialized or I2C communication fails
 * @requirements 3.2, 3.3
 */
export function setBacklight(on: boolean): void {
  // Check if display is initialized
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call initDisplay() first.");
  }

  // Update backlight state
  displayState!.backlightOn = on;

  // Send I2C command to hardware
  try {
    const backlightBit = on ? 0x08 : 0x00; // Bit 4 controls backlight
    writeI2C(displayState!.address, backlightBit);
  } catch (e) {
    throw new Error(`Failed to set backlight: ${e}`);
  }
}

/**
 * Controls the visibility of the cursor
 * 
 * @param visible - true to show cursor, false to hide it
 * @throws Error if display is not initialized or I2C communication fails
 * @requirements 3.4, 3.5
 */
export function showCursor(visible: boolean): void {
  // Check if display is initialized
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call initDisplay() first.");
  }

  // Update cursor visibility state
  displayState!.cursorVisible = visible;

  // Send I2C command to hardware
  try {
    const cursorBit = visible ? 0x02 : 0x00; // Bit 1 controls cursor visibility
    const backlightBit = displayState!.backlightOn ? 0x08 : 0x00;
    const commandByte = cursorBit | backlightBit;
    writeI2C(displayState!.address, commandByte);
  } catch (e) {
    throw new Error(`Failed to set cursor visibility: ${e}`);
  }
}

/**
 * Controls the blinking of the cursor
 * 
 * @param blink - true to enable cursor blink, false to disable it
 * @throws Error if display is not initialized or I2C communication fails
 * @requirements 3.6, 3.7
 */
export function setCursorBlink(blink: boolean): void {
  // Check if display is initialized
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call initDisplay() first.");
  }

  // Update cursor blink state
  displayState!.cursorBlink = blink;

  // Send I2C command to hardware
  try {
    const blinkBit = blink ? 0x01 : 0x00; // Bit 0 controls cursor blink
    const cursorBit = displayState!.cursorVisible ? 0x02 : 0x00;
    const backlightBit = displayState!.backlightOn ? 0x08 : 0x00;
    const commandByte = blinkBit | cursorBit | backlightBit;
    writeI2C(displayState!.address, commandByte);
  } catch (e) {
    throw new Error(`Failed to set cursor blink: ${e}`);
  }
}

/**
 * Internal function to set cursor position via I2C
 * @param row - The row position (0-1)
 * @param col - The column position (0-15)
 */
function setCursorInternal(row: number, col: number): void {
  // LCD cursor position command: 0x80 + row offset + column
  const rowOffset = row === 0 ? 0x00 : 0x40;
  const cursorCommand = 0x80 | rowOffset | col;
  sendCommandByte(cursorCommand);
}

/**
 * Internal function to send a command byte via I2C
 * @param command - The command byte to send
 */
function sendCommandByte(command: number): void {
  // Register Select (RS) bit = 0 for command mode
  const backlightBit = displayState!.backlightOn ? 0x08 : 0x00;
  const commandByte = command | backlightBit; // RS=0 (command mode)
  writeI2C(displayState!.address, commandByte);
}

/**
 * Internal function to send a data byte via I2C
 * @param data - The data byte to send
 */
function sendDataByte(data: number): void {
  // Register Select (RS) bit = 1 for data mode
  const backlightBit = displayState!.backlightOn ? 0x08 : 0x00;
  const dataByte = data | 0x80 | backlightBit; // RS=1 (data mode), backlight
  writeI2C(displayState!.address, dataByte);
}
