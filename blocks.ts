//% color="#1f77d4" icon="\uf108"
namespace testlcd {
    /**
     * Initialize LCD at I2C address
     */
    //% block="LCD init at address $address"
    //% address.min=0x20 address.max=0x27 address.defl=0x27
    export function init(address: number = 0x27): void {
        // Call the actual implementation from main.ts
        // This will be implemented in the full extension
    }

    /**
     * Show text on LCD
     */
    //% block="LCD show $text at row $row col $col"
    //% row.min=0 row.max=1 row.defl=0
    //% col.min=0 col.max=15 col.defl=0
    //% text.defl="Hello"
    export function showString(row: number, col: number, text: string): void {
        // Display text at specified position
    }

    /**
     * Clear LCD
     */
    //% block="LCD clear"
    export function clear(): void {
        // Clear the display
    }

    /**
     * Set cursor position
     */
    //% block="LCD cursor row $row col $col"
    //% row.min=0 row.max=1 row.defl=0
    //% col.min=0 col.max=15 col.defl=0
    export function setCursor(row: number, col: number): void {
        // Set cursor to specified position
    }

    /**
     * Set backlight
     */
    //% block="LCD backlight $on"
    //% on.shadow="toggleOnOff"
    export function setBacklight(on: boolean): void {
        // Control backlight
    }

    /**
     * Show cursor
     */
    //% block="LCD show cursor $visible"
    //% visible.shadow="toggleOnOff"
    export function showCursor(visible: boolean): void {
        // Show or hide cursor
    }

    /**
     * Cursor blink
     */
    //% block="LCD cursor blink $blink"
    //% blink.shadow="toggleOnOff"
    export function setCursorBlink(blink: boolean): void {
        // Enable or disable cursor blinking
    }
}
