#!/bin/bash

# Create a temporary directory for packaging
TEMP_DIR="nibiru-temp"
ZIP_NAME="nibiru.zip"

# Clean up any existing temporary directory or zip
rm -rf "$TEMP_DIR" "$ZIP_NAME"

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Copy project files
echo "Copying project files..."
cp -r app "$TEMP_DIR/"
cp -r scripts "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp docker-compose.yml "$TEMP_DIR/"

# Create zip file
echo "Creating zip file..."
zip -r "$ZIP_NAME" "$TEMP_DIR"

# Clean up
rm -rf "$TEMP_DIR"

echo "Package created successfully!"
echo "You can find the zip file at: $ZIP_NAME"
echo ""
echo "To use the package:"
echo "1. Extract the zip file"
echo "2. Navigate to the extracted directory"
echo "3. Run the appropriate development script:"
echo "   - On Windows: scripts\\dev.bat"
echo "   - On Unix: ./scripts/dev.sh" 