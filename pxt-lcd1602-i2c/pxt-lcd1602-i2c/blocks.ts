/**
 * Block Interface Layer
 * Defines visual blocks for micro:bit editor
 */

import * as lcd1602 from "./main";

/**
 * Initialize LCD at the specified I2C address
 * @param address - The I2C address (0x20-0x27, default: 0x27)
 * @requirements 4.1
 */
//% block="Initialize LCD at address $address"
//% address.min=0x20 address.max=0x27 address.defl=0x27
//% group="Initialization"
//% color="#1f77d4"
export function initLCD(address: number = 0x27): void {
  lcd1602.init(address);
}

/**
 * Display text at the specified row and column
 * @param row - The row (0-1)
 * @param col - The column (0-15)
 * @param text - The text to display
 * @requirements 4.2
 */
//% block="Show $text at row $row column $col"
//% row.min=0 row.max=1 row.defl=0
//% col.min=0 col.max=15 col.defl=0
//% text.defl="Hello"
//% group="Display"
//% color="#1f77d4"
export function showStringBlock(row: number, col: number, text: string): void {
  lcd1602.showString(row, col, text);
}

/**
 * Clear the display
 * @requirements 4.3
 */
//% block="Clear display"
//% group="Display"
//% color="#1f77d4"
export function clearDisplay(): void {
  lcd1602.clear();
}

/**
 * Set cursor position
 * @param row - The row (0-1)
 * @param col - The column (0-15)
 * @requirements 4.4
 */
//% block="Set cursor to row $row column $col"
//% row.min=0 row.max=1 row.defl=0
//% col.min=0 col.max=15 col.defl=0
//% group="Cursor"
//% color="#1f77d4"
export function setCursorBlock(row: number, col: number): void {
  lcd1602.setCursor(row, col);
}

/**
 * Control backlight
 * @param on - true to turn on, false to turn off
 * @requirements 4.4
 */
//% block="Set backlight $on"
//% on.shadow="toggleOnOff"
//% on.defl=true
//% group="Control"
//% color="#1f77d4"
export function setBacklightBlock(on: boolean): void {
  lcd1602.setBacklight(on);
}

/**
 * Show or hide cursor
 * @param visible - true to show, false to hide
 * @requirements 4.4
 */
//% block="Show cursor $visible"
//% visible.shadow="toggleOnOff"
//% visible.defl=true
//% group="Cursor"
//% color="#1f77d4"
export function showCursorBlock(visible: boolean): void {
  lcd1602.showCursor(visible);
}

/**
 * Enable or disable cursor blinking
 * @param blink - true to enable, false to disable
 * @requirements 4.4
 */
//% block="Set cursor blink $blink"
//% blink.shadow="toggleOnOff"
//% blink.defl=false
//% group="Cursor"
//% color="#1f77d4"
export function setCursorBlinkBlock(blink: boolean): void {
  lcd1602.setCursorBlink(blink);
}
