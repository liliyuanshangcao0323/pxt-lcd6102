# Test LCD 1602 Extension

A simple test extension for LCD 1602 I2C display on micro:bit.

## Usage

### Initialize LCD
```blocks
testlcd.init()
```

### Show Text
```blocks
testlcd.show("Hello")
```

### Clear Display
```blocks
testlcd.clear()
```

## API Reference

### `init(): void`
Initialize the LCD display.

### `show(text: string): void`
Display text on the LCD.

### `clear(): void`
Clear the LCD display.

## License

MIT
