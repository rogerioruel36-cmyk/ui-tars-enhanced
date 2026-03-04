#!/bin/bash

# UI-TARS Enhancement Project Initialization Script
# 检查环境依赖和项目可启动性

set -e

echo "========================================"
echo "UI-TARS Enhancement - Environment Check"
echo "========================================"

# Check Node.js version
echo ""
echo "[1/4] Checking Node.js..."
NODE_VERSION=$(node -v 2>/dev/null || echo "NOT_INSTALLED")
echo "  Node.js: $NODE_VERSION"

if [ "$NODE_VERSION" = "NOT_INSTALLED" ]; then
    echo "  ERROR: Node.js is not installed"
    exit 1
fi

# Check npm version
echo ""
echo "[2/4] Checking npm..."
NPM_VERSION=$(npm -v 2>/dev/null || echo "NOT_INSTALLED")
echo "  npm: $NPM_VERSION"

if [ "$NPM_VERSION" = "NOT_INSTALLED" ]; then
    echo "  ERROR: npm is not installed"
    exit 1
fi

# Check required files exist
echo ""
echo "[3/4] Checking project files..."
REQUIRED_FILES=("package.json" "agent.config.json" "UITARS_ENHANCEMENT_PLAN.md")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (missing)"
        exit 1
    fi
done

# Verify dependencies can be installed
echo ""
echo "[4/4] Verifying npm install..."
if npm install --silent 2>/dev/null; then
    echo "  ✓ Dependencies installed successfully"
else
    echo "  ✗ Failed to install dependencies"
    exit 1
fi

echo ""
echo "========================================"
echo "Environment check PASSED"
echo "Project is ready for development"
echo "========================================"
