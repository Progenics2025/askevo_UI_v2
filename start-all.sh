#!/bin/bash

# Progenics AI - Start All Services Script
# This script starts the frontend, backend, Ollama, and Cloudflare tunnel

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
CLOUDFLARED_CONFIG="/home/progenics-bioinfo/.cloudflared/config.yml"

# Log file
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Progenics AI - Starting All Services              ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local service=$2
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Port $port is already in use by $service${NC}"
        echo -e "${YELLOW}   Killing existing process...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}✓ Port $port freed${NC}"
    fi
}

# Function to check if Ollama is running
check_ollama() {
    if pgrep -x "ollama" > /dev/null; then
        return 0  # Ollama is running
    else
        return 1  # Ollama is not running
    fi
}

# Function to start Ollama
start_ollama() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}[1/4] Starting Ollama Service${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if check_ollama; then
        echo -e "${GREEN}✓ Ollama is already running${NC}"
    else
        echo -e "${YELLOW}⚡ Starting Ollama...${NC}"
        nohup ollama serve > "$LOG_DIR/ollama_$TIMESTAMP.log" 2>&1 &
        sleep 3
        
        if check_ollama; then
            echo -e "${GREEN}✓ Ollama started successfully${NC}"
            echo -e "${CYAN}   Log: $LOG_DIR/ollama_$TIMESTAMP.log${NC}"
        else
            echo -e "${RED}✗ Failed to start Ollama${NC}"
            exit 1
        fi
    fi
    echo ""
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}[2/4] Starting Backend (Port 3001)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    kill_port 3001 "Backend"
    
    echo -e "${YELLOW}⚡ Starting backend server...${NC}"
    cd "$BACKEND_DIR"
    nohup npm start > "$LOG_DIR/backend_$TIMESTAMP.log" 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo -e "${CYAN}   Waiting for backend to start...${NC}"
    sleep 5
    
    if check_port 3001; then
        echo -e "${GREEN}✓ Backend started successfully on port 3001${NC}"
        echo -e "${CYAN}   PID: $BACKEND_PID${NC}"
        echo -e "${CYAN}   Log: $LOG_DIR/backend_$TIMESTAMP.log${NC}"
    else
        echo -e "${RED}✗ Failed to start backend${NC}"
        exit 1
    fi
    echo ""
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}[3/4] Starting Frontend (Port 5173)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    kill_port 5173 "Frontend"
    
    echo -e "${YELLOW}⚡ Starting frontend dev server...${NC}"
    cd "$FRONTEND_DIR"
    nohup npm run dev > "$LOG_DIR/frontend_$TIMESTAMP.log" 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    echo -e "${CYAN}   Waiting for frontend to start...${NC}"
    sleep 8
    
    if check_port 5173; then
        echo -e "${GREEN}✓ Frontend started successfully on port 5173${NC}"
        echo -e "${CYAN}   PID: $FRONTEND_PID${NC}"
        echo -e "${CYAN}   Log: $LOG_DIR/frontend_$TIMESTAMP.log${NC}"
    else
        echo -e "${RED}✗ Failed to start frontend${NC}"
        exit 1
    fi
    echo ""
}

# Function to start Cloudflare tunnel
start_cloudflared() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}[4/4] Starting Cloudflare Tunnel${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Check if cloudflared is already running
    if pgrep -x "cloudflared" > /dev/null; then
        echo -e "${YELLOW}⚠️  Cloudflare tunnel is already running${NC}"
        echo -e "${YELLOW}   Killing existing tunnel...${NC}"
        pkill -x cloudflared 2>/dev/null || true
        sleep 2
    fi
    
    if [ ! -f "$CLOUDFLARED_CONFIG" ]; then
        echo -e "${RED}✗ Cloudflare config not found: $CLOUDFLARED_CONFIG${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⚡ Starting Cloudflare tunnel...${NC}"
    nohup cloudflared tunnel --config "$CLOUDFLARED_CONFIG" run > "$LOG_DIR/cloudflared_$TIMESTAMP.log" 2>&1 &
    CLOUDFLARED_PID=$!
    
    sleep 3
    
    if pgrep -x "cloudflared" > /dev/null; then
        echo -e "${GREEN}✓ Cloudflare tunnel started successfully${NC}"
        echo -e "${CYAN}   PID: $CLOUDFLARED_PID${NC}"
        echo -e "${CYAN}   Log: $LOG_DIR/cloudflared_$TIMESTAMP.log${NC}"
        echo -e "${MAGENTA}   🌐 chat.progenicslabs.com → localhost:3001${NC}"
        echo -e "${MAGENTA}   🌐 ollama.progenicslabs.com → localhost:11434${NC}"
    else
        echo -e "${RED}✗ Failed to start Cloudflare tunnel${NC}"
        exit 1
    fi
    echo ""
}

# Main execution
echo -e "${CYAN}📂 Project Directory: $PROJECT_DIR${NC}"
echo -e "${CYAN}📝 Logs Directory: $LOG_DIR${NC}"
echo ""

# Start all services
start_ollama
start_backend
start_frontend
start_cloudflared

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 All Services Started Successfully! 🎉       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📊 Service Status:${NC}"
echo -e "${GREEN}   ✓ Ollama:           Running on localhost:11434${NC}"
echo -e "${GREEN}   ✓ Backend:          Running on localhost:3001${NC}"
echo -e "${GREEN}   ✓ Frontend:         Running on localhost:5173${NC}"
echo -e "${GREEN}   ✓ Cloudflare:       Tunneling to progenicslabs.com${NC}"
echo ""
echo -e "${MAGENTA}🌐 Access URLs:${NC}"
echo -e "${CYAN}   Local:             http://localhost:5173${NC}"
echo -e "${CYAN}   Production:        https://chat.progenicslabs.com${NC}"
echo -e "${CYAN}   Ollama API:        https://ollama.progenicslabs.com${NC}"
echo ""
echo -e "${YELLOW}📝 Logs are available in: $LOG_DIR${NC}"
echo ""
echo -e "${BLUE}ℹ️  To stop all services, run: ./stop-all.sh${NC}"
echo -e "${BLUE}ℹ️  To view logs, run: tail -f $LOG_DIR/<service>_$TIMESTAMP.log${NC}"
echo ""
