# Workplace Condition Monitor

Webová aplikácia pre monitorovanie a správu meraní pracovných podmienok s Firebase synchronizáciou a GitHub Pages deployment.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- GitHub účet
- Firebase projekt (voliteľné, pre cloud sync)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo Login:**

- Admin: `admin` / `admin123`
- Moderator: `moderator` / `mod123`

## 📦 Deploy to GitHub Pages

### Quick Deploy (5 minutes)

1. **Update repository name** in `package.json`:

   ```json
   "build:prod": "ng build --configuration=production --base-href /YOUR_REPO_NAME/"
   ```

2. **Enable GitHub Pages:**

   - Go to Settings → Pages
   - Source: **GitHub Actions**

3. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **Access your app:**
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

## 🔥 Firebase Setup (Optional)

For cloud data synchronization:

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Update `src/environments/environment.prod.ts` with your Firebase config

**App works without Firebase using localStorage!**

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup guide.

## ✨ Features

- 8 measurement types (temp, humidity, luminosity, dustiness, ESD, torque, ionizer)
- Real-time dashboard with charts
- History with 15-year filtering
- Statistics and trends
- ISO standards management
- User authentication (Admin/Moderator roles)
- Multi-language (SK, EN, DE)
- CSV/PDF export
- Firebase cloud sync
