/**
 * Validates a private key format
 * @param privateKey - The private key to validate
 * @returns boolean indicating if the private key is valid
 */
export const validatePrivateKey = (privateKey: string): boolean => {
  // Remove '0x' prefix if present
  const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  
  // Check if it's a valid hex string
  if (!/^[0-9a-fA-F]+$/.test(key)) {
    return false;
  }
  
  // Check if it's the correct length (32 bytes = 64 hex characters)
  if (key.length !== 64) {
    return false;
  }
  
  return true;
};

/**
 * Validates an Ethereum address format
 * @param address - The address to validate
 * @returns boolean indicating if the address is valid
 */
export const validateAddress = (address: string): boolean => {
  // Remove '0x' prefix if present
  const addr = address.startsWith('0x') ? address.slice(2) : address;
  
  // Check if it's a valid hex string
  if (!/^[0-9a-fA-F]+$/.test(addr)) {
    return false;
  }
  
  // Check if it's the correct length (20 bytes = 40 hex characters)
  if (addr.length !== 40) {
    return false;
  }
  
  return true;
};

/**
 * Validates a transaction amount
 * @param amount - The amount to validate
 * @returns boolean indicating if the amount is valid
 */
export const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  
  // Check if it's a valid number
  if (isNaN(num)) {
    return false;
  }
  
  // Check if it's positive
  if (num <= 0) {
    return false;
  }
  
  // Check if it has too many decimal places (max 18 for most tokens)
  if (num.toString().includes('.') && num.toString().split('.')[1].length > 18) {
    return false;
  }
  
  return true;
}; 