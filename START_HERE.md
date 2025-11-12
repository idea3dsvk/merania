# 🚀 Workplace Condition Monitor - Complete Deployment Guide

## 📋 Overview

This guide will help you deploy the Workplace Condition Monitor application to GitHub Pages with Firebase synchronization in **under 10 minutes**.

## 🎯 Quick Links

- **Local Development:** See [INSTALL_COMMANDS.md](./INSTALL_COMMANDS.md)
- **Firebase Setup:** See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Deployment Checklist:** See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Full Documentation:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
npm install firebase @angular/fire
npm install --save-dev angular-cli-ghpages
```

### Step 2: Configure Repository

Edit `package.json` line 9:

```json
"build:prod": "ng build --configuration=production --base-href /YOUR_REPO_NAME/"
```

### Step 3: Deploy

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

**That's it!** GitHub Actions will automatically build and deploy.

## 🔥 Firebase Setup (Optional but Recommended)

### Why Firebase?

- ☁️ Cloud data storage
- 🔄 Real-time synchronization
- 📱 Multi-device access
- 💾 Automatic backups

### Setup in 5 Minutes

1. **Create Firebase Project**

   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Click "Add project"
   - Enter name: `workplace-condition-monitor`

2. **Enable Firestore**

   - Go to Build → Firestore Database
   - Click "Create database"
   - Start in test mode

3. **Get Configuration**

   - Project Settings → Your apps → Web
   - Copy the config object

4. **Update Environment**

   - Edit `src/environments/environment.prod.ts`
   - Paste your Firebase config

5. **Test**
   ```bash
   npm run dev
   ```

**Full Firebase instructions:** [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 📦 What's Included

### Core Features

- ✅ 8 measurement types
- ✅ Real-time dashboard
- ✅ Historical data (15 years)
- ✅ Statistics & trends
- ✅ ISO specifications
- ✅ User authentication
- ✅ Multi-language (SK, EN, DE)
- ✅ CSV/PDF export

### Deployment Features

- ✅ GitHub Pages hosting
- ✅ GitHub Actions CI/CD
- ✅ Firebase cloud sync
- ✅ Automatic deployment
- ✅ Custom domain support

## 🛠️ Technical Stack

- **Frontend:** Angular 20, TypeScript, Tailwind CSS
- **Charts:** Chart.js, ng2-charts
- **Database:** Firebase Firestore
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions

## 📁 Project Structure

```
workplace-condition-monitor/
├── src/
│   ├── components/          # Angular components
│   ├── services/            # Services (Auth, Data, Firebase)
│   ├── models.ts            # TypeScript interfaces
│   ├── translations.ts      # Multi-language support
│   └── environments/        # Environment configs
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions workflow
├── deploy.sh / deploy.bat   # Deployment scripts
├── DEPLOYMENT.md            # Full deployment guide
├── FIREBASE_SETUP.md        # Firebase setup guide
├── DEPLOYMENT_CHECKLIST.md  # Deployment checklist
├── INSTALL_COMMANDS.md      # Installation commands
└── package.json             # Dependencies & scripts
```

## 🎮 Usage

### Local Development

```bash
# Start development server
npm run dev

# Access at http://localhost:3000
```

### Login Credentials

**Administrator** (Full Access)

- Username: `admin`
- Password: `admin123`
- Can: Add, edit, delete measurements, edit limits

**Moderator** (Limited Access)

- Username: `moderator`
- Password: `mod123`
- Can: Add, edit measurements, view data
- Cannot: Delete measurements, edit limits

### Adding Measurements

1. Click on any measurement card
2. Fill in the form
3. Click "Save Record"
4. Data syncs to Firebase automatically

### Viewing History

1. Go to "History & Trends"
2. Use filters: Year, Month, Type, Location
3. View charts and data table
4. Export to CSV or PDF

### Managing Limits

1. Click "Limits" button on any card (admin only)
2. Set min/max values
3. Click "Save Limits"
4. Out-of-spec measurements show alerts

## 🌐 Deployment Options

### Option 1: GitHub Pages (Recommended)

**Pros:**

- ✅ Free hosting
- ✅ Automatic deployment
- ✅ Custom domain support
- ✅ HTTPS included

**Setup:**

1. Enable GitHub Pages (Settings → Pages → GitHub Actions)
2. Push to main branch
3. Wait 2-3 minutes
4. Access at: `https://username.github.io/repo-name/`

### Option 2: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 3: Netlify

1. Connect GitHub repository
2. Build command: `npm run build:prod`
3. Publish directory: `dist/workplace-condition-monitor/browser`

### Option 4: Vercel

```bash
npx vercel --prod
```

## 📊 Monitoring

### GitHub Actions

- Check build status: Repository → Actions tab
- View logs for troubleshooting
- See deployment history

### Firebase Console

- Monitor data: Firestore → Data
- Check usage: Usage tab
- View security rules: Rules tab

### Application Health

- Test login functionality
- Verify data persistence
- Check all features work
- Monitor browser console for errors

## 🔧 Configuration

### Update Repository Name

Edit `package.json`:

```json
"build:prod": "ng build --configuration=production --base-href /NEW_REPO_NAME/"
```

### Update Firebase Config

Edit `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  firebase: {
    apiKey: "YOUR_NEW_API_KEY",
    // ... other config
  },
};
```

### Add Custom Domain

1. Add `CNAME` file to `dist/` after build
2. Update GitHub Pages settings
3. Update `base-href` to `/`

## 🐛 Troubleshooting

### Build Fails

```bash
rm -rf node_modules package-lock.json dist .angular
npm install
npm run build:prod
```

### Firebase Not Working

- Check `environment.prod.ts` has correct config
- Verify Firestore security rules
- Check Firebase Console for errors

### GitHub Pages Shows 404

- Wait 2-3 minutes for deployment
- Check `base-href` matches repository name
- Verify GitHub Actions completed successfully

### CSS Not Loading

- Clear browser cache
- Check `base-href` in build command
- Verify Tailwind configuration

## 📈 Performance

### Initial Load Time

- ~2-3 seconds on fast connection
- Cached: <1 second

### Build Size

- JavaScript: ~500KB (gzipped)
- CSS: ~50KB (gzipped)
- Total: ~550KB

### Optimization Tips

- Enable lazy loading for routes
- Use production mode (`npm run build:prod`)
- Enable gzip on server
- Use CDN for assets

## 🔐 Security

### Best Practices

- ✅ Don't commit `environment.prod.ts` to public repos
- ✅ Use Firestore security rules
- ✅ Enable HTTPS (GitHub Pages does this)
- ✅ Regularly update dependencies
- ✅ Use environment variables for secrets

### Firestore Security Rules

**Development (Permissive):**

```javascript
allow read, write: if true;
```

**Production (Secure):**

```javascript
allow read: if true;
allow write: if request.auth != null;
```

## 📞 Support & Resources

### Documentation

- [Angular Documentation](https://angular.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Getting Help

1. Check documentation files in this repository
2. Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
3. Check GitHub Actions logs
4. Review Firebase Console errors
5. Create issue on GitHub repository

## 🎯 Next Steps

After successful deployment:

1. **Update README** with your live URL
2. **Test all features** thoroughly
3. **Configure Firebase security rules** for production
4. **Set up monitoring** (Firebase Analytics, Google Analytics)
5. **Add custom domain** (optional)
6. **Share with users** and gather feedback

## 📝 Changelog

### Version 1.0.0 (2025-11-12)

- ✨ Initial release
- ✅ 8 measurement types
- ✅ Firebase integration
- ✅ GitHub Pages deployment
- ✅ User authentication
- ✅ Multi-language support

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with ❤️ for workplace condition monitoring

---

**Ready to deploy?** Start with [INSTALL_COMMANDS.md](./INSTALL_COMMANDS.md) → [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) → [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

**Questions?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed information.

**Last Updated:** 2025-11-12 | **Version:** 1.0.0
