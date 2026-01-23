# micro:bit LCD 1602 I2C Extension

Control 16x2 character LCD displays via I2C on micro:bit.

## Features

- Initialize LCD at custom I2C address
- Display text at any position
- Clear display
- Control backlight
- Cursor control and blinking

## Quick Start

```blocks
lcd1602.init(0x27)
lcd1602.showString(0, 0, "Hello")
```

## API Reference

### `init(address: number): void`
Initialize LCD at specified I2C address (0x20-0x27).

### `showString(row: number, col: number, text: string): void`
Display text at row (0-1) and column (0-15).

### `clear(): void`
Clear all text from display.

### `setCursor(row: number, col: number): void`
Move cursor to specified position.

### `setBacklight(on: boolean): void`
Turn backlight on or off.

### `showCursor(visible: boolean): void`
Show or hide cursor.

### `setCursorBlink(blink: boolean): void`
Enable or disable cursor blinking.

## Examples

### Basic Display
```typescript
lcd1602.init(0x27)
lcd1602.showString(0, 0, "Line 1")
lcd1602.showString(1, 0, "Line 2")
```

### Control Backlight
```typescript
lcd1602.setBacklight(true)
basic.pause(1000)
lcd1602.setBacklight(false)
```

## License

MIT
