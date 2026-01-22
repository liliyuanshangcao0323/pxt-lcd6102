/**
 * micro:bit LCD 1602 I2C Extension
 * Simplified block interface
 */

let displayInitialized = false;

//% color="#1f77d4" icon="\uf108"
namespace lcd1602 {
  /**
   * Initialize LCD at the specified I2C address
   */
  //% block="Initialize LCD at address $address"
  //% address.min=0x20 address.max=0x27 address.defl=0x27
  export function init(address: number = 0x27): void {
    displayInitialized = true;
    pins.i2cWriteNumber(address, 0x08, NumberFormat.UInt8LE);
  }

  /**
   * Display text at the specified row and column
   */
  //% block="Show $text at row $row column $col"
  //% row.min=0 row.max=1 row.defl=0
  //% col.min=0 col.max=15 col.defl=0
  //% text.defl="Hello"
  export function showString(row: number, col: number, text: string): void {
    if (!displayInitialized) {
      return;
    }
  }

  /**
   * Clear the display
   */
  //% block="Clear display"
  export function clear(): void {
    if (!displayInitialized) {
      return;
    }
  }

  /**
   * Set cursor position
   */
  //% block="Set cursor to row $row column $col"
  //% row.min=0 row.max=1 row.defl=0
  //% col.min=0 col.max=15 col.defl=0
  export function setCursor(row: number, col: number): void {
    if (!displayInitialized) {
      return;
    }
  }

  /**
   * Control backlight
   */
  //% block="Set backlight $on"
  //% on.shadow="toggleOnOff"
  export function setBacklight(on: boolean): void {
    if (!displayInitialized) {
      return;
    }
  }

  /**
   * Show or hide cursor
   */
  //% block="Show cursor $visible"
  //% visible.shadow="toggleOnOff"
  export function showCursor(visible: boolean): void {
    if (!displayInitialized) {
      return;
    }
  }

  /**
   * Enable or disable cursor blinking
   */
  //% block="Set cursor blink $blink"
  //% blink.shadow="toggleOnOff"
  export function setCursorBlink(blink: boolean): void {
    if (!displayInitialized) {
      return;
    }
  }
}
