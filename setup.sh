#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Run tests
echo "Running tests..."
npm test

echo "Setup complete! You can now use the json-key-translator library." 