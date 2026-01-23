//% color="#1f77d4" icon="\uf108"
namespace testlcd {
    /**
     * Initialize LCD
     */
    //% block="LCD init"
    export function init(): void {
        basic.showString("OK");
    }

    /**
     * Show text on LCD
     */
    //% block="LCD show $text"
    //% text.defl="Hello"
    export function show(text: string): void {
        basic.showString(text);
    }

    /**
     * Clear LCD
     */
    //% block="LCD clear"
    export function clear(): void {
        basic.clearScreen();
    }
}
