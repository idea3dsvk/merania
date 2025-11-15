// Development environment configuration
// DO NOT commit real API keys to version control!
// For local development, create a environment.local.ts file with your keys
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY", // Get from Firebase Console
    authDomain: "merania.firebaseapp.com",
    projectId: "merania",
    storageBucket: "merania.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
  }
};
