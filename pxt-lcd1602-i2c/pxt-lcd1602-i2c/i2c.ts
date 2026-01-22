/**
 * I2C Communication Layer
 * Handles low-level I2C protocol and PCF8574 backpack communication
 */

/**
 * Writes a byte to an I2C device at the specified address
 * @param address - The 7-bit I2C address (0x00-0x7F)
 * @param data - The byte to write (0-255)
 * @throws Error if address is invalid or I2C communication fails
 */
export function writeI2C(address: number, data: number): void {
  // Validate address range (0x00-0x7F for 7-bit addressing)
  if (address < 0x00 || address > 0x7F) {
    throw new Error(`Invalid I2C address: 0x${address.toString(16)}. Must be 0x00-0x7F`);
  }

  // Validate data range (0-255)
  if (data < 0 || data > 255) {
    throw new Error(`Invalid I2C data: ${data}. Must be 0-255`);
  }

  try {
    // Use micro:bit's built-in I2C support
    pins.i2cWriteNumber(address, data, NumberFormat.UInt8LE);
  } catch (e) {
    throw new Error(`I2C write failed at address 0x${address.toString(16)}: ${e}`);
  }
}

/**
 * Reads a byte from an I2C device at the specified address
 * @param address - The 7-bit I2C address (0x00-0x7F)
 * @returns The byte read from the device (0-255)
 * @throws Error if address is invalid or I2C communication fails
 */
export function readI2C(address: number): number {
  // Validate address range (0x00-0x7F for 7-bit addressing)
  if (address < 0x00 || address > 0x7F) {
    throw new Error(`Invalid I2C address: 0x${address.toString(16)}. Must be 0x00-0x7F`);
  }

  try {
    // Use micro:bit's built-in I2C support
    const data = pins.i2cReadNumber(address, NumberFormat.UInt8LE);
    return data;
  } catch (e) {
    throw new Error(`I2C read failed at address 0x${address.toString(16)}: ${e}`);
  }
}
