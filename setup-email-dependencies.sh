#!/bin/bash

# Script to install all required dependencies for Daily Grind Connect

echo "=== Installing Dependencies for Daily Grind Connect ==="
echo "This script will install nodemailer, canvas and required type definitions"

# Install main dependencies
pnpm add nodemailer canvas

# Install type definitions
pnpm add -D @types/nodemailer

echo ""
echo "=== Dependencies Installation Complete ==="
echo ""
echo "Next Steps:"
echo "1. Configure your email settings in .env.local (see EMAIL_SETUP.md)"
echo "2. Make sure to add EMAIL_USER and EMAIL_APP_PASSWORD to your .env.local file"
echo "3. Run 'pnpm dev' to start the development server"
echo ""
echo "For more information, see EMAIL_SETUP.md"
