#!/bin/bash

# Vesperion Gate Deployment Script
# This script builds and deploys ONLY the Vesperion Gate application
# It does NOT affect any other applications on this server

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/projects/vesperiongate"
PM2_APP_NAME="vesperiongate"
REQUIRED_PORT="3006"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "========================================="
    echo -e "${BLUE}$1${NC}"
    echo "========================================="
}

# Function to run PM2 commands with proper environment
run_pm2() {
    sudo -u node bash -c "source /home/node/.nvm/nvm.sh && cd $PROJECT_DIR && $1"
}

# Start deployment
print_header "Vesperion Gate Deployment"
print_info "Application: $PM2_APP_NAME"
print_info "Domain: https://www.vesperiongate.com"
print_info "Project Directory: $PROJECT_DIR"
print_info "Port: $REQUIRED_PORT"

# Verify we're in the correct directory
print_info "Verifying project directory..."
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory does not exist: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

# Verify package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in $PROJECT_DIR"
    exit 1
fi

print_success "Project directory verified"

# Fix file ownership for node user
print_info "Setting file ownership..."
chown -R node:node "$PROJECT_DIR"
print_success "File ownership set to node:node"

# Install dependencies
print_info "Installing dependencies..."
sudo -u node bash -c "source /home/node/.nvm/nvm.sh && cd $PROJECT_DIR && npm install --production=false" || {
    print_error "npm install failed"
    exit 1
}
print_success "Dependencies installed"

# Build the Next.js application
print_info "Building Next.js application..."
sudo -u node bash -c "source /home/node/.nvm/nvm.sh && cd $PROJECT_DIR && npm run build" || {
    print_error "Build failed! Deployment cancelled."
    print_info "The application was NOT restarted due to build failure"
    exit 1
}
print_success "Build completed successfully"

# Check if PM2 process exists
print_info "Checking PM2 process status..."
if run_pm2 "pm2 describe $PM2_APP_NAME" > /dev/null 2>&1; then
    print_info "PM2 process '$PM2_APP_NAME' found, reloading..."
    run_pm2 "pm2 reload $PM2_APP_NAME --update-env" || {
        print_error "PM2 reload failed"
        exit 1
    }
    print_success "PM2 process reloaded"
else
    print_warning "PM2 process '$PM2_APP_NAME' not found"
    print_info "Starting new PM2 process..."
    run_pm2 "pm2 start /projects/ecosystem.config.js --only $PM2_APP_NAME" || {
        print_error "PM2 start failed"
        exit 1
    }
    run_pm2 "pm2 save" || print_warning "Could not save PM2 configuration"
    print_success "PM2 process started"
fi

# Show PM2 status
echo ""
print_info "Current PM2 status for $PM2_APP_NAME:"
run_pm2 "pm2 status $PM2_APP_NAME"

# Final success message
print_header "Deployment Completed Successfully!"
print_success "Vesperion Gate is now running"
print_info "Access at: https://www.vesperiongate.com"
echo ""
print_info "Useful commands:"
print_info "  View logs:    sudo -u node bash -c 'source /home/node/.nvm/nvm.sh && pm2 logs $PM2_APP_NAME'"
print_info "  Restart app:  sudo -u node bash -c 'source /home/node/.nvm/nvm.sh && pm2 restart $PM2_APP_NAME'"
print_info "  Stop app:     sudo -u node bash -c 'source /home/node/.nvm/nvm.sh && pm2 stop $PM2_APP_NAME'"
print_info "  Monitor:      sudo -u node bash -c 'source /home/node/.nvm/nvm.sh && pm2 monit'"
echo ""
