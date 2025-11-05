#!/bin/bash

# Auth0 Backend Setup Script
# This script installs dependencies and sets up environment variables

set -e

echo "🔧 Setting up Auth0 for Havn Backend..."
echo ""

# Check if we're in the backend directory
if [ ! -f "go.mod" ]; then
    echo "❌ Error: go.mod not found. Please run this script from the backend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing Go dependencies..."
go get github.com/lestrrat-go/jwx/v2@latest
go mod tidy
echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Auth0 Configuration
AUTH0_DOMAIN=dev-rlqpb3p7hzb1ldkr.us.auth0.com
AUTH0_AUDIENCE=https://havn-api

# Database Configuration
# DATABASE_URL=your_database_url_here

# Environment
ENV=development
PORT=8080
EOF
    echo "✅ .env file created"
    echo "⚠️  Don't forget to add your DATABASE_URL!"
else
    echo "📝 .env file already exists"
    echo "ℹ️  Add these lines if not present:"
    echo "   AUTH0_DOMAIN=dev-rlqpb3p7hzb1ldkr.us.auth0.com"
    echo "   AUTH0_AUDIENCE=https://havn-api"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your DATABASE_URL (if needed)"
echo "2. Test locally: go run cmd/api/main.go"
echo "3. Add AUTH0_* variables to Railway dashboard"
echo "4. Deploy: git push origin main"
echo ""
echo "📚 For more details, see BACKEND_AUTH0_SETUP.md"

