# Installation & Setup Commands

## Quick Installation (Copy-Paste)

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/workplace-condition-monitor.git
cd workplace-condition-monitor

# 2. Install all dependencies
npm install

# 3. Install Firebase packages
npm install firebase@^11.2.0 @angular/fire@^18.0.1

# 4. Install deployment tool
npm install --save-dev angular-cli-ghpages@^2.0.0

# 5. Test local development
npm run dev
```

## Individual Package Installation

If you need to install packages separately:

### Core Dependencies (Already in package.json)

```bash
npm install @angular/animations@^20.3.10
npm install @angular/common@^20.3.0
npm install @angular/core@^20.3.0
npm install @angular/forms@^20.3.10
npm install @angular/platform-browser@^20.3.0
npm install chart.js@^4.5.1
npm install ng2-charts@^8.0.0
npm install rxjs@^7.8.2
npm install tailwindcss@latest
```

### Firebase Integration

```bash
npm install firebase@^11.2.0
npm install @angular/fire@^18.0.1
```

### Deployment Tools

```bash
npm install --save-dev angular-cli-ghpages@^2.0.0
npm install --save-dev @types/node@^22.14.0
```

### Angular CLI

```bash
npm install --save-dev @angular/cli@^20.3.0
npm install --save-dev @angular/build@^20.3.0
npm install --save-dev @angular/compiler@^20.3.0
npm install --save-dev @angular/compiler-cli@^20.3.0
```

## Verify Installation

```bash
# Check installed packages
npm list --depth=0

# Check for vulnerabilities
npm audit

# Fix vulnerabilities (if any)
npm audit fix
```

## Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build:prod

# Preview production build
npm run preview
```

## Deployment Commands

```bash
# Build and deploy to GitHub Pages
npm run deploy

# Or use deployment scripts
# Windows:
deploy.bat

# Linux/Mac:
chmod +x deploy.sh
./deploy.sh
```

## Troubleshooting Commands

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
rm -rf .angular

# Clear all caches and rebuild
rm -rf node_modules package-lock.json dist .angular
npm install
npm run build:prod

# Check Node.js version (should be 20+)
node --version

# Check npm version (should be 10+)
npm --version
```

## Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages to latest compatible versions
npm update

# Update specific package
npm install package-name@latest

# Update Angular CLI globally
npm install -g @angular/cli@latest
```

## Git Commands for Deployment

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main

# Check deployment status
git log --oneline -5

# View remote URL
git remote -v
```

## Firebase CLI (Optional)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Deploy to Firebase Hosting (alternative to GitHub Pages)
firebase deploy
```

## Package.json Scripts Reference

```json
{
  "scripts": {
    "dev": "ng serve", // Start development server
    "build": "ng build", // Build for development
    "build:prod": "ng build --configuration=production --base-href /YOUR_REPO/", // Build for production
    "preview": "ng serve --configuration=production", // Preview production build
    "deploy": "npm run build:prod && npx angular-cli-ghpages --dir=dist/workplace-condition-monitor/browser" // Deploy to GitHub Pages
  }
}
```

## Environment Setup

### Windows

```powershell
# Set Node environment
$env:NODE_ENV="production"

# Set Node memory limit
$env:NODE_OPTIONS="--max_old_space_size=4096"
```

### Linux/Mac

```bash
# Set Node environment
export NODE_ENV=production

# Set Node memory limit
export NODE_OPTIONS="--max_old_space_size=4096"
```

## IDE Setup

### VS Code Extensions (Recommended)

```bash
code --install-extension angular.ng-template
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
```

## Docker Setup (Optional)

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
# Build Docker image
docker build -t workplace-monitor .

# Run container
docker run -p 3000:3000 workplace-monitor
```

## Complete Setup from Scratch

```bash
# 1. System requirements
node --version  # Should be 20+
npm --version   # Should be 10+

# 2. Clone and setup
git clone https://github.com/YOUR_USERNAME/workplace-condition-monitor.git
cd workplace-condition-monitor

# 3. Install everything
npm install

# 4. Configure Firebase
# Edit src/environments/environment.prod.ts with your Firebase config

# 5. Update repository name
# Edit package.json: "build:prod" base-href

# 6. Test locally
npm run dev

# 7. Commit and push
git add .
git commit -m "Configure for deployment"
git push origin main

# 8. Enable GitHub Pages
# Go to Settings → Pages → Source: GitHub Actions

# 9. Wait for deployment
# Check Actions tab for progress

# 10. Access app
# https://YOUR_USERNAME.github.io/YOUR_REPO/
```

## Success Verification

```bash
# After npm install, you should see:
# - node_modules/ directory created
# - package-lock.json generated
# - No error messages

# After npm run dev, you should see:
# - Angular Dev Server running
# - Local: http://localhost:3000/
# - No compilation errors

# After npm run build:prod, you should see:
# - dist/ directory created
# - Build completed successfully
# - Output bundle sizes displayed
```

## Need Help?

```bash
# Get npm help
npm help

# Get Angular CLI help
npx ng help

# Check package versions
npm list firebase
npm list @angular/core

# Clear npm cache
npm cache clean --force
```

---

**Ready to deploy?** Follow the steps in order and you'll have your app live in minutes!
