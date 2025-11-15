# Firebase Configuration Security

## Important Notes

The `src/environments/environment.ts` file contains placeholder values only.

### For Local Development:
1. Copy `environment.ts` to `environment.local.ts`
2. Replace placeholder values with your real Firebase credentials from Firebase Console
3. Use `environment.local.ts` in your app (already gitignored)

### For Production:
1. Use environment variables in your CI/CD pipeline
2. Never commit real API keys to Git
3. Firebase API keys are safe to expose in client apps (protected by Firebase Security Rules)

### Getting Firebase Credentials:
Visit: https://console.firebase.google.com/project/merania/settings/general


## Setup Instructions

1. **Create local environment file:**
   ```bash
   cp src/environments/environment.ts src/environments/environment.local.ts
   ```

2. **Update with your Firebase credentials:**
   Edit `src/environments/environment.local.ts` and replace placeholders with real values from:
   https://console.firebase.google.com/project/merania/settings/general

3. **The application now uses `environment.local.ts` automatically**
   - Already configured in `firebase.service.ts`
   - File is gitignored - safe to store real credentials locally

## Note
Firebase API keys are safe to expose in client applications. Security is enforced through:
- Firebase Security Rules (firestore.rules)
- Firebase Authentication
- Domain restrictions in Firebase Console

# Security Notes - xlsx dependency

## Known Issue
The `xlsx` package has known vulnerabilities (Prototype Pollution, ReDoS).
Unfortunately, there is no fixed version available from the maintainer.

## Mitigation
- The vulnerability requires malicious Excel file input
- In production, validate and sanitize all uploaded Excel files
- Consider migrating to `exceljs` package in the future

## Current Status
- gh-pages vulnerability:  FIXED (upgraded to 5.x)
- xlsx vulnerability:  NO FIX AVAILABLE (monitoring for updates)

Last checked: November 15, 2025
