#!/bin/bash

# NFC Token Generator Script
# Usage: ./generate_nfc_token.sh <serial_number>
# Example: ./generate_nfc_token.sh 04:93:8E:8A:3A:59:80

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if serial number is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: $0 <serial_number>${NC}"
    echo -e "${YELLOW}Example: $0 04:93:8E:8A:3A:59:80${NC}"
    exit 1
fi

SERIAL="$1"
CSV_FILE="nfc_tokens.csv"

# Check if CSV file exists, if not create it with header
if [ ! -f "$CSV_FILE" ]; then
    echo "Serial Number,NFC Token,Login URL" > "$CSV_FILE"
    echo -e "${GREEN}Created $CSV_FILE${NC}"
fi

# Check if serial already exists
if grep -q "^$SERIAL," "$CSV_FILE" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Serial number already exists in $CSV_FILE${NC}"
    echo -e "${BLUE}Existing entry:${NC}"
    grep "^$SERIAL," "$CSV_FILE"
    exit 0
fi

# Generate secure token using Node.js
TOKEN=$(node -e "
const crypto = require('crypto');
const serial = '$SERIAL';
const token = crypto.createHash('sha256').update(serial + Date.now() + Math.random()).digest('hex');
console.log(token);
")

# Check if token generation was successful
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to generate token${NC}"
    exit 1
fi

# Create URL
URL="https://chat.progenicslabs.com/nfc-login?token=$TOKEN"

# Create CSV entry
ENTRY="$SERIAL,$TOKEN,$URL"

# Append to CSV file
echo "$ENTRY" >> "$CSV_FILE"

# Display results
echo -e "${GREEN}✅ NFC Token Generated Successfully!${NC}"
echo ""
echo -e "${BLUE}Serial Number:${NC} $SERIAL"
echo -e "${BLUE}Token:${NC} $TOKEN"
echo -e "${BLUE}Login URL:${NC}"
echo "$URL"
echo ""
echo -e "${GREEN}Entry added to $CSV_FILE${NC}"

# Optional: Generate QR code if qrencode is installed
if command -v qrencode &> /dev/null; then
    QR_FILE="nfc_qr_${SERIAL//:/}.png"
    qrencode -o "$QR_FILE" "$URL"
    echo -e "${GREEN}📱 QR Code saved to: $QR_FILE${NC}"
fi
