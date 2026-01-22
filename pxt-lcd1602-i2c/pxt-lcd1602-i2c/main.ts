/**
 * micro:bit LCD 1602 I2C Extension
 * Main API module - Public TypeScript/JavaScript API
 */

import {
  initDisplay,
  showString as displayShowString,
  setCursor as displaySetCursor,
  clear as displayClear,
  setBacklight as displaySetBacklight,
  showCursor as displayShowCursor,
  setCursorBlink as displaySetCursorBlink,
  isDisplayInitialized
} from "./display";

/**
 * Initializes the LCD display at the specified I2C address
 * Sets up the display for 16x2 character mode with default state:
 * - Cursor at position (0,0)
 * - Backlight ON
 * - Buffer cleared
 * 
 * @param address - The I2C address of the LCD module (0x20-0x27, default: 0x27)
 * @throws Error if address is invalid or I2C communication fails
 * @example
 * ```typescript
 * // Initialize at default address (0x27)
 * lcd1602.init()
 * 
 * // Initialize at custom address
 * lcd1602.init(0x26)
 * ```
 * @requirements 5.1
 */
export function init(address: number = 0x27): void {
  try {
    initDisplay(address);
  } catch (e) {
    throw new Error(`Failed to initialize LCD: ${e}`);
  }
}

/**
 * Displays a text string at the specified row and column
 * Validates input parameters and truncates text if necessary
 * Updates the display buffer and sends I2C commands to hardware
 * 
 * @param row - The row position (0-1)
 * @param col - The column position (0-15)
 * @param text - The text string to display (max 16 characters, longer text will be truncated)
 * @throws Error if display is not initialized or parameters are invalid
 * @example
 * ```typescript
 * // Display text at row 0, column 0
 * lcd1602.showString(0, 0, "Hello World")
 * 
 * // Display text at row 1, column 5
 * lcd1602.showString(1, 5, "micro:bit")
 * ```
 * @requirements 5.2
 */
export function showString(row: number, col: number, text: string): void {
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call init() first.");
  }

  try {
    displayShowString(row, col, text);
  } catch (e) {
    throw new Error(`Failed to display text: ${e}`);
  }
}

/**
 * Clears all characters from the display and moves cursor to (0,0)
 * Erases all characters from the display buffer
 * 
 * @throws Error if display is not initialized or I2C communication fails
 * @example
 * ```typescript
 * // Clear the display
 * lcd1602.clear()
 * ```
 * @requirements 5.3
 */
export function clear(): void {
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call init() first.");
  }

  try {
    displayClear();
  } catch (e) {
    throw new Error(`Failed to clear display: ${e}`);
  }
}

/**
 * Sets the cursor position to the specified row and column
 * Updates cursor position without clearing text
 * 
 * @param row - The row position (0-1)
 * @param col - The column position (0-15)
 * @throws Error if display is not initialized or parameters are invalid
 * @example
 * ```typescript
 * // Move cursor to row 1, column 5
 * lcd1602.setCursor(1, 5)
 * ```
 * @requirements 5.4
 */
export function setCursor(row: number, col: number): void {
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call init() first.");
  }

  try {
    displaySetCursor(row, col);
  } catch (e) {
    throw new Error(`Failed to set cursor position: ${e}`);
  }
}

/**
 * Controls the backlight of the display
 * 
 * @param on - true to turn backlight ON, false to turn it OFF
 * @throws Error if display is not initialized or I2C communication fails
 * @example
 * ```typescript
 * // Turn on backlight
 * lcd1602.setBacklight(true)
 * 
 * // Turn off backlight
 * lcd1602.setBacklight(false)
 * ```
 * @requirements 5.5
 */
export function setBacklight(on: boolean): void {
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call init() first.");
  }

  try {
    displaySetBacklight(on);
  } catch (e) {
    throw new Error(`Failed to set backlight: ${e}`);
  }
}

/**
 * Controls the visibility of the cursor
 * 
 * @param visible - true to show cursor, false to hide it
 * @throws Error if display is not initialized or I2C communication fails
 * @example
 * ```typescript
 * // Show the cursor
 * lcd1602.showCursor(true)
 * 
 * // Hide the cursor
 * lcd1602.showCursor(false)
 * ```
 * @requirements 5.6
 */
export function showCursor(visible: boolean): void {
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call init() first.");
  }

  try {
    displayShowCursor(visible);
  } catch (e) {
    throw new Error(`Failed to set cursor visibility: ${e}`);
  }
}

/**
 * Controls the blinking of the cursor
 * 
 * @param blink - true to enable cursor blink, false to disable it
 * @throws Error if display is not initialized or I2C communication fails
 * @example
 * ```typescript
 * // Enable cursor blinking
 * lcd1602.setCursorBlink(true)
 * 
 * // Disable cursor blinking
 * lcd1602.setCursorBlink(false)
 * ```
 * @requirements 5.7
 */
export function setCursorBlink(blink: boolean): void {
  if (!isDisplayInitialized()) {
    throw new Error("LCD display not initialized. Call init() first.");
  }

  try {
    displaySetCursorBlink(blink);
  } catch (e) {
    throw new Error(`Failed to set cursor blink: ${e}`);
  }
}
