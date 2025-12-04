const fs = require('fs');
const crypto = require('crypto');

// List of NFC Serial Numbers provided by user
const nfcSerials = [
    "04:A5:84:42:9F:1B:90", "04:19:42:42:9F:1B:91", "04:D1:23:42:9F:1B:90", "04:83:26:42:9F:1B:90",
    "04:69:5C:42:9F:1B:91", "04:44:5F:42:9F:1B:91", "04:CA:5F:42:9F:1B:90", "04:7C:24:42:9F:1B:90",
    "04:E6:5E:42:9F:1B:90", "04:78:59:42:9F:1B:91", "04:FB:3C:42:9F:1B:90", "04:7A:5A:42:9F:1B:90",
    "04:50:34:42:9F:1B:90", "04:6F:64:42:9F:1B:90", "04:17:71:42:9F:1B:90", "04:B5:26:42:9F:1B:90",
    "04:0F:5A:42:9F:1B:91", "04:5D:40:42:9F:1B:90", "04:75:58:42:9F:1B:91", "04:6D:40:42:9F:1B:91",
    "04:3A:57:42:9F:1B:90", "04:7D:B0:42:9F:1B:91", "04:7D:59:42:9F:1B:91", "04:2B:5D:42:9F:1B:91",
    "04:46:74:42:9F:1B:91", "04:01:AF:42:9F:1B:91", "04:99:0F:42:9F:1B:94", "04:47:42:42:9F:1B:91",
    "04:7D:5D:42:9F:1B:91", "04:5E:2B:42:9F:1B:90", "04:3D:31:42:9F:1B:91", "04:E6:40:42:9F:1B:90",
    "04:62:1F:42:9F:1B:90", "04:ED:3B:42:9F:1B:90", "04:93:33:42:9F:1B:90", "04:E8:3B:42:9F:1B:90",
    "04:3A:33:42:9F:1B:91", "04:66:01:42:9F:1B:94", "04:A1:1D:42:9F:1B:90"
];

const BASE_URL = process.env.FRONTEND_URL || 'https://chat.progenicslabs.com';

console.log('Generating tokens for NFC cards...');

const results = [];
const csvHeader = 'Serial Number,NFC Token,Login URL\n';
let csvContent = csvHeader;

nfcSerials.forEach(serial => {
    const token = crypto.randomBytes(32).toString('hex');
    const loginUrl = `${BASE_URL}/nfc-login?token=${token}`;

    results.push({ serial, token, loginUrl });
    csvContent += `${serial},${token},${loginUrl}\n`;
});

// Write to CSV
fs.writeFileSync('nfc_tokens.csv', csvContent);

console.log(`Generated ${results.length} tokens.`);
console.log('Tokens saved to nfc_tokens.csv');

// Optional: Insert into DB if you want to pre-register tokens (but we are doing auto-registration on tap)
// For now, we just generate the URLs to be written to the cards.
