#!/bin/bash

# Test script for shadcn-ui-mcp-server
# This script validates that the package is ready for npm publishing

set -e

echo "🧪 Testing shadcn-ui-mcp-server package..."

# Test 1: Help command
echo "✅ Testing --help flag..."
./build/index.js --help > /dev/null
echo "   Help command works!"

# Test 2: Version command
echo "✅ Testing --version flag..."
VERSION=$(./build/index.js --version)
echo "   Version: $VERSION"

# Test 3: Check if shebang works
echo "✅ Testing executable permissions..."
if [[ -x "./build/index.js" ]]; then
    echo "   File is executable!"
else
    echo "   ❌ File is not executable"
    exit 1
fi

# Test 4: Check package.json structure
echo "✅ Testing package.json structure..."
if [[ -f "package.json" ]]; then
    # Check if required fields exist
    if grep -q '"name":' package.json && \
       grep -q '"version":' package.json && \
       grep -q '"bin":' package.json && \
       grep -q '"main":' package.json; then
        echo "   Package.json has required fields!"
    else
        echo "   ❌ Package.json missing required fields"
        exit 1
    fi
else
    echo "   ❌ Package.json not found"
    exit 1
fi

# Test 5: Check if build files exist
echo "✅ Testing build files..."
REQUIRED_FILES=(
    "build/index.js"
    "build/handler.js"
    "build/tools/index.js"
    "build/utils/axios.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "   ✓ $file exists"
    else
        echo "   ❌ $file missing"
        exit 1
    fi
done

# Test 6: Check LICENSE and README
echo "✅ Testing documentation files..."
if [[ -f "LICENSE" ]] && [[ -f "README.md" ]]; then
    echo "   LICENSE and README.md exist!"
else
    echo "   ❌ LICENSE or README.md missing"
    exit 1
fi

# Test 7: Simulate npm pack (dry run)
echo "✅ Testing npm pack (dry run)..."
npm pack --dry-run > /dev/null 2>&1
echo "   npm pack simulation successful!"

echo ""
echo "🎉 All tests passed! Package is ready for publishing."
echo ""
echo "To publish to npm:"
echo "  1. npm login"
echo "  2. npm publish"
echo ""
echo "To test locally with npx:"
echo "  npx ./build/index.js --help"
