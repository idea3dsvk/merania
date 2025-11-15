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
