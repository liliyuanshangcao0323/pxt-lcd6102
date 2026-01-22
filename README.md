# micro:bit LCD 1602 I2C Extension

A micro:bit extension for controlling 16x2 character LCD displays connected via I2C protocol. This extension provides both block-based and TypeScript/JavaScript interfaces for displaying text, managing cursor position, and controlling display features.

## Features

- **I2C Communication**: Direct control of LCD 1602 displays via I2C protocol
- **Text Display**: Show text at any position on the 16x2 display
- **Cursor Control**: Move cursor to specific positions and control visibility
- **Display Control**: Clear display, control backlight, and cursor blinking
- **Block Interface**: Visual programming blocks for micro:bit editor
- **TypeScript API**: Full programmatic control via TypeScript/JavaScript

## Hardware Requirements

- micro:bit v1 or v2
- 16x2 LCD display with PCF8574 I2C backpack
- I2C address range: 0x20-0x27 (default: 0x27)
- Connection: SDA (pin 20) and SCL (pin 19) on micro:bit

## Installation

1. Open [micro:bit MakeCode editor](https://makecode.microbit.org)
2. Click "Extensions" in the project menu
3. Search for "lcd1602-i2c"
4. Click the extension to add it to your project

## Quick Start

### Block-Based Programming

```blocks
lcd1602.initLCD(0x27)
lcd1602.showStringBlock(0, 0, "Hello World")
```

### TypeScript/JavaScript

```typescript
lcd1602.init()
lcd1602.showString(0, 0, "Hello World")
lcd1602.showString(1, 0, "micro:bit")
```

## API Reference

### `init(address?: number): void`
Initialize the LCD display at the specified I2C address.

### `showString(row: number, col: number, text: string): void`
Display text at the specified position.

### `clear(): void`
Clear all characters from the display.

### `setCursor(row: number, col: number): void`
Move cursor to the specified position.

### `setBacklight(on: boolean): void`
Control the LCD backlight.

### `showCursor(visible: boolean): void`
Show or hide the cursor.

### `setCursorBlink(blink: boolean): void`
Enable or disable cursor blinking.

## License

MIT License
