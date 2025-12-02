#!/bin/bash

# ============================================================================
# Progenics AI - Backend Status Check
# ============================================================================

echo "============================================================================"
echo "Backend Status Check"
echo "============================================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "1. Checking if Backend is Running"
echo "============================================================================"

if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on http://localhost:3001${NC}"
    
    # Get health status
    HEALTH=$(curl -s http://localhost:3001/api/health)
    echo "Health status: $HEALTH"
else
    echo -e "${RED}✗ Backend is NOT running on http://localhost:3001${NC}"
    echo ""
    echo "To start backend:"
    echo "  cd askevo/backend"
    echo "  npm run dev"
fi
echo ""

# Check if port 3001 is in use
echo "2. Checking Port 3001"
echo "============================================================================"

if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Port 3001 is in use${NC}"
    lsof -i :3001 | tail -1
else
    echo -e "${YELLOW}⚠ Port 3001 is not in use${NC}"
fi
echo ""

# Check database connection
echo "3. Checking Database Connection"
echo "============================================================================"

if mysql -u remote_user -p"Prolab#05" progenics_ai -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is connected${NC}"
    
    # Count tables
    TABLES=$(mysql -u remote_user -p"Prolab#05" progenics_ai -e "SHOW TABLES;" 2>/dev/null | wc -l)
    echo "Database tables: $TABLES"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    echo "Check MySQL is running and credentials are correct"
fi
echo ""

# Check .env file
echo "4. Checking Backend Configuration"
echo "============================================================================"

if [ -f "askevo/backend/.env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Check required variables
    if grep -q "DB_HOST" askevo/backend/.env; then
        echo -e "${GREEN}✓ DB_HOST configured${NC}"
    else
        echo -e "${RED}✗ DB_HOST not configured${NC}"
    fi
    
    if grep -q "PORT" askevo/backend/.env; then
        echo -e "${GREEN}✓ PORT configured${NC}"
    else
        echo -e "${RED}✗ PORT not configured${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    echo "Create it with: cp askevo/backend/.env.example askevo/backend/.env"
fi
echo ""

# Check dependencies
echo "5. Checking Dependencies"
echo "============================================================================"

if [ -d "askevo/backend/node_modules" ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    
    # Count packages
    PACKAGES=$(ls askevo/backend/node_modules | wc -l)
    echo "Installed packages: $PACKAGES"
else
    echo -e "${RED}✗ Dependencies not installed${NC}"
    echo "Install with: cd askevo/backend && npm install"
fi
echo ""

# Summary
echo "============================================================================"
echo "Summary"
echo "============================================================================"

if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running and healthy!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start Frontend: cd askevo && npm run dev"
    echo "2. Start Ollama: ollama serve"
    echo "3. Open: http://localhost:5173"
else
    echo -e "${YELLOW}⚠ Backend is not running${NC}"
    echo ""
    echo "To start backend:"
    echo "  cd askevo/backend"
    echo "  npm run dev"
fi

echo ""
echo "============================================================================"
