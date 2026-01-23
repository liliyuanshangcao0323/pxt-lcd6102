# Test LCD 1602 Extension

A simple test extension for LCD 1602 I2C display on micro:bit.

## Usage

### Initialize LCD
```blocks
testlcd.init(0x27)
```

### Show Text
```blocks
testlcd.showString(0, 0, "Hello")
```

### Clear Display
```blocks
testlcd.clear()
```

### Set Cursor
```blocks
testlcd.setCursor(0, 5)
```

### Control Backlight
```blocks
testlcd.setBacklight(true)
```

### Show Cursor
```blocks
testlcd.showCursor(true)
```

### Cursor Blink
```blocks
testlcd.setCursorBlink(true)
```

## API Reference

### `init(address: number): void`
Initialize the LCD display at specified I2C address (0x20-0x27).

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

## License

MIT
