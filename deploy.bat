@echo off
REM Deployment script for Workplace Condition Monitor (Windows)

echo Starting deployment process...

REM Step 1: Install dependencies
echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo Failed to install dependencies
    exit /b 1
)

REM Step 2: Build production version
echo Building production version...
call npm run build:prod

if errorlevel 1 (
    echo Build failed
    exit /b 1
)

echo Build successful!

REM Step 3: Deploy to GitHub Pages
echo Deploying to GitHub Pages...
call npm run deploy

if errorlevel 1 (
    echo Deployment failed
    echo Make sure you have angular-cli-ghpages installed and configured
    exit /b 1
)

echo Deployment successful!
echo Your app should be live on GitHub Pages soon!
pause
