/**
 * Block Interface Layer
 * Defines visual blocks for micro:bit editor
 */

import * as lcd1602 from "./main";

//% color="#1f77d4" icon="\uf108"
namespace lcd1602 {
  /**
   * Initialize LCD at the specified I2C address
   */
  //% block="Initialize LCD at address $address"
  //% address.min=0x20 address.max=0x27 address.defl=0x27
  export function initLCD(address: number = 0x27): void {
    lcd1602.init(address);
  }

  /**
   * Display text at the specified row and column
   */
  //% block="Show $text at row $row column $col"
  //% row.min=0 row.max=1 row.defl=0
  //% col.min=0 col.max=15 col.defl=0
  //% text.defl="Hello"
  export function showString(row: number, col: number, text: string): void {
    lcd1602.showString(row, col, text);
  }

  /**
   * Clear the display
   */
  //% block="Clear display"
  export function clear(): void {
    lcd1602.clear();
  }

  /**
   * Set cursor position
   */
  //% block="Set cursor to row $row column $col"
  //% row.min=0 row.max=1 row.defl=0
  //% col.min=0 col.max=15 col.defl=0
  export function setCursor(row: number, col: number): void {
    lcd1602.setCursor(row, col);
  }

  /**
   * Control backlight
   */
  //% block="Set backlight $on"
  //% on.shadow="toggleOnOff"
  export function setBacklight(on: boolean): void {
    lcd1602.setBacklight(on);
  }

  /**
   * Show or hide cursor
   */
  //% block="Show cursor $visible"
  //% visible.shadow="toggleOnOff"
  export function showCursor(visible: boolean): void {
    lcd1602.showCursor(visible);
  }

  /**
   * Enable or disable cursor blinking
   */
  //% block="Set cursor blink $blink"
  //% blink.shadow="toggleOnOff"
  export function setCursorBlink(blink: boolean): void {
    lcd1602.setCursorBlink(blink);
  }
}
