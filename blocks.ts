/**
 * Block Interface Layer
 * Defines visual blocks for micro:bit editor
 */

import * as api from "./main";

/**
 * Initialize LCD at the specified I2C address
 */
//% block="Initialize LCD at address $address"
//% address.min=0x20 address.max=0x27 address.defl=0x27
//% color="#1f77d4"
export function initLCD(address: number = 0x27): void {
  api.init(address);
}

/**
 * Display text at the specified row and column
 */
//% block="Show $text at row $row column $col"
//% row.min=0 row.max=1 row.defl=0
//% col.min=0 col.max=15 col.defl=0
//% text.defl="Hello"
//% color="#1f77d4"
export function showString(row: number, col: number, text: string): void {
  api.showString(row, col, text);
}

/**
 * Clear the display
 */
//% block="Clear display"
//% color="#1f77d4"
export function clear(): void {
  api.clear();
}

/**
 * Set cursor position
 */
//% block="Set cursor to row $row column $col"
//% row.min=0 row.max=1 row.defl=0
//% col.min=0 col.max=15 col.defl=0
//% color="#1f77d4"
export function setCursor(row: number, col: number): void {
  api.setCursor(row, col);
}

/**
 * Control backlight
 */
//% block="Set backlight $on"
//% on.shadow="toggleOnOff"
//% color="#1f77d4"
export function setBacklight(on: boolean): void {
  api.setBacklight(on);
}

/**
 * Show or hide cursor
 */
//% block="Show cursor $visible"
//% visible.shadow="toggleOnOff"
//% color="#1f77d4"
export function showCursor(visible: boolean): void {
  api.showCursor(visible);
}

/**
 * Enable or disable cursor blinking
 */
//% block="Set cursor blink $blink"
//% blink.shadow="toggleOnOff"
//% color="#1f77d4"
export function setCursorBlink(blink: boolean): void {
  api.setCursorBlink(blink);
}
