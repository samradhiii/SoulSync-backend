const CryptoJS = require('crypto-js');

class EncryptionService {
  constructor() {
    this.algorithm = 'AES-256-CBC';
    this.keySize = 256;
    this.ivSize = 16;
  }

  /**
   * Generate a random encryption key
   * @returns {string} - Base64 encoded encryption key
   */
  generateKey() {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
  }

  /**
   * Generate a random IV (Initialization Vector)
   * @returns {string} - Base64 encoded IV
   */
  generateIV() {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64);
  }

  /**
   * Derive encryption key from user password
   * @param {string} password - User password
   * @param {string} salt - Salt for key derivation
   * @returns {string} - Derived encryption key
   */
  deriveKey(password, salt) {
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: this.keySize / 32,
      iterations: 10000
    });
    return key.toString(CryptoJS.enc.Base64);
  }

  /**
   * Encrypt text using AES-256-CBC
   * @param {string} text - Text to encrypt
   * @param {string} key - Encryption key
   * @param {string} iv - Initialization vector
   * @returns {string} - Encrypted text (Base64)
   */
  encrypt(text, key, iv) {
    try {
      const keyWordArray = CryptoJS.enc.Base64.parse(key);
      const ivWordArray = CryptoJS.enc.Base64.parse(iv);
      
      const encrypted = CryptoJS.AES.encrypt(text, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt text using AES-256-CBC
   * @param {string} encryptedText - Encrypted text (Base64)
   * @param {string} key - Encryption key
   * @param {string} iv - Initialization vector
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedText, key, iv) {
    try {
      const keyWordArray = CryptoJS.enc.Base64.parse(key);
      const ivWordArray = CryptoJS.enc.Base64.parse(iv);
      
      const decrypted = CryptoJS.AES.decrypt(encryptedText, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt journal entry content
   * @param {string} content - Journal entry content
   * @param {string} userKey - User's encryption key
   * @returns {Object} - Encrypted data with IV
   */
  encryptJournalEntry(content, userKey) {
    const iv = this.generateIV();
    const encryptedContent = this.encrypt(content, userKey, iv);
    
    return {
      content: encryptedContent,
      iv: iv,
      algorithm: this.algorithm
    };
  }

  /**
   * Decrypt journal entry content
   * @param {string} encryptedContent - Encrypted content
   * @param {string} iv - Initialization vector
   * @param {string} userKey - User's encryption key
   * @returns {string} - Decrypted content
   */
  decryptJournalEntry(encryptedContent, iv, userKey) {
    return this.decrypt(encryptedContent, userKey, iv);
  }

  /**
   * Encrypt user data
   * @param {Object} userData - User data to encrypt
   * @param {string} userKey - User's encryption key
   * @returns {Object} - Encrypted user data
   */
  encryptUserData(userData, userKey) {
    const iv = this.generateIV();
    const jsonString = JSON.stringify(userData);
    const encryptedData = this.encrypt(jsonString, userKey, iv);
    
    return {
      data: encryptedData,
      iv: iv,
      algorithm: this.algorithm
    };
  }

  /**
   * Decrypt user data
   * @param {string} encryptedData - Encrypted data
   * @param {string} iv - Initialization vector
   * @param {string} userKey - User's encryption key
   * @returns {Object} - Decrypted user data
   */
  decryptUserData(encryptedData, iv, userKey) {
    const decryptedString = this.decrypt(encryptedData, userKey, iv);
    return JSON.parse(decryptedString);
  }

  /**
   * Hash sensitive data for storage
   * @param {string} data - Data to hash
   * @returns {string} - SHA-256 hash
   */
  hash(data) {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Generate secure random string
   * @param {number} length - Length of random string
   * @returns {string} - Random string
   */
  generateRandomString(length = 32) {
    return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
  }

  /**
   * Verify encryption key integrity
   * @param {string} key - Encryption key to verify
   * @returns {boolean} - Whether key is valid
   */
  verifyKey(key) {
    try {
      // Try to parse the key
      CryptoJS.enc.Base64.parse(key);
      return key.length === 44; // Base64 encoded 32-byte key
    } catch (error) {
      return false;
    }
  }

  /**
   * Create encrypted backup of user data
   * @param {Object} userData - User data to backup
   * @param {string} userKey - User's encryption key
   * @returns {Object} - Encrypted backup
   */
  createEncryptedBackup(userData, userKey) {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: userData
    };

    return this.encryptUserData(backupData, userKey);
  }

  /**
   * Restore user data from encrypted backup
   * @param {Object} encryptedBackup - Encrypted backup
   * @param {string} userKey - User's encryption key
   * @returns {Object} - Restored user data
   */
  restoreFromBackup(encryptedBackup, userKey) {
    const { data, iv } = encryptedBackup;
    return this.decryptUserData(data, iv, userKey);
  }

  /**
   * Encrypt file data
   * @param {Buffer} fileData - File data to encrypt
   * @param {string} userKey - User's encryption key
   * @returns {Object} - Encrypted file data
   */
  encryptFile(fileData, userKey) {
    const iv = this.generateIV();
    const base64Data = fileData.toString('base64');
    const encryptedData = this.encrypt(base64Data, userKey, iv);
    
    return {
      data: encryptedData,
      iv: iv,
      algorithm: this.algorithm,
      originalSize: fileData.length
    };
  }

  /**
   * Decrypt file data
   * @param {Object} encryptedFile - Encrypted file data
   * @param {string} userKey - User's encryption key
   * @returns {Buffer} - Decrypted file data
   */
  decryptFile(encryptedFile, userKey) {
    const { data, iv } = encryptedFile;
    const decryptedBase64 = this.decrypt(data, userKey, iv);
    return Buffer.from(decryptedBase64, 'base64');
  }

  /**
   * Generate key pair for asymmetric encryption (future use)
   * @returns {Object} - Key pair
   */
  generateKeyPair() {
    // This would be implemented with a library like node-forge for RSA
    // For now, return a placeholder
    return {
      publicKey: 'placeholder-public-key',
      privateKey: 'placeholder-private-key'
    };
  }

  /**
   * Encrypt data with public key (future use)
   * @param {string} data - Data to encrypt
   * @param {string} publicKey - Public key
   * @returns {string} - Encrypted data
   */
  encryptWithPublicKey(data, publicKey) {
    // Placeholder for RSA encryption
    return 'encrypted-with-public-key';
  }

  /**
   * Decrypt data with private key (future use)
   * @param {string} encryptedData - Encrypted data
   * @param {string} privateKey - Private key
   * @returns {string} - Decrypted data
   */
  decryptWithPrivateKey(encryptedData, privateKey) {
    // Placeholder for RSA decryption
    return 'decrypted-with-private-key';
  }
}

module.exports = new EncryptionService();

