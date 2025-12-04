const pool = require('../config/database');

async function updateSchema() {
    try {
        console.log('Updating schema for NFC and OTP...');

        // Check/Add nfc_token
        const [nfcCols] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'progenics_bioinfo' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'nfc_token'
    `);
        if (nfcCols.length === 0) {
            await pool.query(`ALTER TABLE users ADD COLUMN nfc_token VARCHAR(255) UNIQUE DEFAULT NULL`);
            console.log('Added nfc_token column.');
        }

        // Check/Add otp_code
        const [otpCols] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'progenics_bioinfo' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'otp_code'
    `);
        if (otpCols.length === 0) {
            await pool.query(`ALTER TABLE users ADD COLUMN otp_code VARCHAR(6) DEFAULT NULL`);
            console.log('Added otp_code column.');
        }

        // Check/Add otp_expires_at
        const [otpExpCols] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'progenics_bioinfo' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'otp_expires_at'
    `);
        if (otpExpCols.length === 0) {
            await pool.query(`ALTER TABLE users ADD COLUMN otp_expires_at DATETIME DEFAULT NULL`);
            console.log('Added otp_expires_at column.');
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
