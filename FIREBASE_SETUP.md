# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `workplace-condition-monitor`
4. Disable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Select location (closest to your users)
4. Start in **test mode** (we'll update rules later)
5. Click "Enable"

## 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click **Web** icon (</>)
4. Register app name: `workplace-condition-monitor`
5. Copy the `firebaseConfig` object

## 4. Update Environment Files

### For Development (`src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIza...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123",
  },
};
```

### For Production (`src/environments/environment.prod.ts`):

```typescript
export const environment = {
  production: true,
  firebase: {
    apiKey: "AIza...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123",
  },
};
```

## 5. Configure Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes (for demo/testing)
    // ⚠️ Update these rules for production!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Production Security Rules (Recommended):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Measurements collection
    match /measurements/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Limits collection
    match /limits/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Specifications collection
    match /specifications/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 6. Install Firebase Packages

```bash
npm install firebase @angular/fire
```

## 7. Test Firebase Connection

Run the app locally:

```bash
npm run dev
```

Check browser console for Firebase connection messages.

## 8. Deploy with Firebase Config

### Option A: Environment Variables (GitHub Actions)

Add Firebase config as repository secrets:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add secrets:

   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

3. Update `.github/workflows/deploy.yml` to use secrets

### Option B: Commit Config (Not Recommended for Public Repos)

Update `environment.prod.ts` with real values and commit.

**⚠️ Warning:** Don't commit production credentials to public repositories!

## 9. Verify Deployment

After deployment:

1. Open your GitHub Pages URL
2. Login with admin credentials
3. Add a test measurement
4. Check Firebase Console → Firestore → Data
5. Verify data appears in Firestore

## Troubleshooting

### Firebase not initialized

- Check `environment.prod.ts` has correct values
- Verify Firebase SDK is installed: `npm list firebase`

### Permission denied

- Update Firestore security rules
- Check if rules allow read/write

### Data not syncing

- Open browser console for errors
- Check Firebase project is active
- Verify internet connection

## Data Structure in Firestore

```
/measurements (collection)
  /data (document)
    - content: [array of measurements]
    - updatedAt: timestamp

/limits (collection)
  /data (document)
    - content: {limits object}
    - updatedAt: timestamp

/specifications (collection)
  /data (document)
    - content: [array of specifications]
    - updatedAt: timestamp
```

## Cost Estimation

Firebase Free Tier includes:

- 1 GB storage
- 10 GB/month bandwidth
- 50k reads/day
- 20k writes/day

This is sufficient for small-medium deployments (100-1000 users).

## Next Steps

- [ ] Setup Firebase Authentication (optional)
- [ ] Configure custom domain
- [ ] Setup Firebase Hosting (alternative to GitHub Pages)
- [ ] Add data backup strategy
- [ ] Monitor usage in Firebase Console
