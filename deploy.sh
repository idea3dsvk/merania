#!/bin/bash

# Deployment script for Workplace Condition Monitor

echo "🚀 Starting deployment process..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Step 2: Build production version
echo "🔨 Building production version..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful!"

# Step 3: Deploy to GitHub Pages (if angular-cli-ghpages is installed)
echo "🌐 Deploying to GitHub Pages..."
npm run deploy

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    echo "💡 Make sure you have angular-cli-ghpages installed and configured"
    exit 1
fi

echo "✅ Deployment successful!"
echo "🎉 Your app should be live on GitHub Pages soon!"
