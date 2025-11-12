# Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Code Preparation

- [ ] All features tested locally (`npm run dev`)
- [ ] No console errors in browser
- [ ] All TypeScript compilation errors fixed
- [ ] Git repository initialized (`git init`)

### 2. Firebase Configuration

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Firebase config copied to `src/environments/environment.prod.ts`
- [ ] Firestore security rules configured
- [ ] Firebase packages installed (`npm install firebase @angular/fire`)

### 3. Repository Configuration

- [ ] Repository created on GitHub
- [ ] Repository name matches `base-href` in `package.json`
- [ ] `.gitignore` includes `environment.prod.ts` (if using sensitive data)
- [ ] Initial commit pushed to GitHub

### 4. GitHub Pages Setup

- [ ] GitHub Pages enabled in repository settings
- [ ] Source set to "GitHub Actions"
- [ ] No existing GitHub Pages configuration conflicts

## 🚀 Deployment Steps

### Automated Deployment (Recommended)

```bash
# 1. Update base-href in package.json
# Edit: "build:prod": "ng build --configuration=production --base-href /YOUR_REPO_NAME/"

# 2. Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# 3. Wait for GitHub Actions to complete (2-3 minutes)
# Check: GitHub repository → Actions tab

# 4. Access your app
# https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

### Manual Deployment

```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

## 🔍 Post-Deployment Verification

### 1. Application Access

- [ ] App loads at GitHub Pages URL
- [ ] No 404 errors
- [ ] All assets (CSS, JS) load correctly
- [ ] Favicon displays

### 2. Functionality Tests

- [ ] Login page displays
- [ ] Admin login works (`admin` / `admin123`)
- [ ] Moderator login works (`moderator` / `mod123`)
- [ ] Dashboard loads with measurement cards
- [ ] Language switcher works (EN, SK, DE)

### 3. Feature Tests

- [ ] Add new measurement works
- [ ] Edit measurement works
- [ ] Delete measurement works (admin only)
- [ ] Limits dialog opens and saves (admin only)
- [ ] History view displays data
- [ ] Charts render correctly
- [ ] Filters work (year, month, type, location)
- [ ] Statistics page loads
- [ ] Specifications page works

### 4. Firebase Integration

- [ ] Data saves to Firestore
- [ ] Data loads from Firestore on refresh
- [ ] Real-time sync works (if implemented)
- [ ] Check Firebase Console → Firestore → Data

### 5. Permission Tests

- [ ] Moderator cannot delete measurements
- [ ] Moderator cannot edit limits
- [ ] Admin has full access
- [ ] Logout works correctly

### 6. Export Functions

- [ ] CSV export downloads
- [ ] PDF export generates correctly

### 7. Mobile Responsiveness

- [ ] Test on mobile device or browser dev tools
- [ ] Layout adjusts correctly
- [ ] Touch interactions work

## 🐛 Common Issues & Solutions

### Issue: 404 on GitHub Pages

**Solution:**

- Check `base-href` matches repository name
- Verify GitHub Actions completed successfully
- Wait 2-3 minutes for DNS propagation

### Issue: App loads but shows blank page

**Solution:**

- Check browser console for errors
- Verify `index.html` is in output directory
- Check Angular build configuration

### Issue: Firebase errors

**Solution:**

- Verify `environment.prod.ts` has correct Firebase config
- Check Firestore security rules
- Ensure Firebase packages are installed

### Issue: GitHub Actions fails

**Solution:**

- Check Actions tab for error logs
- Verify `package.json` scripts are correct
- Ensure Node.js version compatibility (20+)

### Issue: CSS/Styles not loading

**Solution:**

- Check `base-href` in build command
- Verify Tailwind CSS configuration
- Clear browser cache

## 📊 Monitoring

### GitHub Actions

- Check: Repository → Actions tab
- Monitor build times and success rate
- Review error logs if failures occur

### Firebase Console

- Monitor: Firestore Database → Data
- Check: Usage tab for quota limits
- Review: Authentication (if enabled)

### Application Analytics

- Monitor browser console for errors
- Check Network tab for failed requests
- Use Firebase Analytics (optional)

## 🔄 Update Workflow

```bash
# 1. Make changes locally
# 2. Test thoroughly
npm run dev

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to GitHub (triggers auto-deployment)
git push origin main

# 5. Verify deployment
# Check GitHub Actions
# Test live site
```

## 📝 Documentation Updates

After successful deployment:

- [ ] Update README with live URL
- [ ] Document any custom configuration
- [ ] Add screenshots (optional)
- [ ] Update version number in `package.json`

## 🎉 Success Criteria

✅ Application is live and accessible  
✅ All features work correctly  
✅ Firebase sync operational  
✅ No console errors  
✅ Mobile responsive  
✅ All user roles function properly  
✅ Data persists across sessions

## 🔐 Security Review

Before going to production:

- [ ] Update Firestore security rules (remove `if true`)
- [ ] Don't commit `environment.prod.ts` to public repos
- [ ] Use environment variables for sensitive data
- [ ] Implement proper authentication (Firebase Auth)
- [ ] Add rate limiting
- [ ] Enable HTTPS (GitHub Pages does this automatically)

## 📞 Support

If you encounter issues:

1. Check this checklist thoroughly
2. Review documentation in `DEPLOYMENT.md` and `FIREBASE_SETUP.md`
3. Check GitHub Actions logs
4. Review Firebase Console for errors
5. Create an issue on GitHub repository

---

**Last Updated:** 2025-11-12  
**Version:** 1.0.0
