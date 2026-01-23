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
//% shim=pins::i2cWriteNumber
export function writeI2C(address: number, data: number): void {
  // Validate address range (0x00-0x7F for 7-bit addressing)
  if (address < 0x00 || address > 0x7F) {
    throw new Error(`Invalid I2C address: 0x${address.toString(16)}. Must be 0x00-0x7F`);
  }

  // Validate data range (0-255)
  if (data < 0 || data > 255) {
    throw new Error(`Invalid I2C data: ${data}. Must be 0-255`);
  }
}

/**
 * Reads a byte from an I2C device at the specified address
 * @param address - The 7-bit I2C address (0x00-0x7F)
 * @returns The byte read from the device (0-255)
 * @throws Error if address is invalid or I2C communication fails
 */
//% shim=pins::i2cReadNumber
export function readI2C(address: number): number {
  // Validate address range (0x00-0x7F for 7-bit addressing)
  if (address < 0x00 || address > 0x7F) {
    throw new Error(`Invalid I2C address: 0x${address.toString(16)}. Must be 0x00-0x7F`);
  }
  return 0;
}
