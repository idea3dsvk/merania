# 🎉 Aplikácia je NASADENÁ na GitHub!

## ✅ Dokončené kroky:

1. ✅ Nainštalované všetky závislosti (Firebase, deployment tools)
2. ✅ Vytvorený produkčný build (`dist/` adresár)
3. ✅ Inicializovaný Git repozitár
4. ✅ Vytvorený prvý commit
5. ✅ Pripojený remote repozitár: https://github.com/idea3dsvk/merania
6. ✅ Kód úspešne pushnutý na GitHub (main branch)

## 🚀 Nasledujúce kroky na deployment:

### 1. Vytvorte GitHub repozitár

Prejdite na [github.com/new](https://github.com/new) a vytvorte nový repozitár:

- Názov: `workplace-condition-monitor` (alebo vlastný názov)
- Viditeľnosť: Public
- **NEVYBERAJTE** "Initialize with README" (už máte lokálny repozitár)

### 2. Pripojte lokálny repozitár k GitHub

V PowerShell vykonajte:

```powershell
cd "c:\Users\cmelk\Downloads\PoRast WEB apky ZALOHY\workplace-condition-monitor"

# Nastavte svoj GitHub používateľské meno a názov repozitára
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Zmeňte vetvu na 'main' (ak je 'master')
git branch -M main

# Push do GitHub
git push -u origin main
```

**Príklad:**

```powershell
git remote add origin https://github.com/johndoe/workplace-condition-monitor.git
git branch -M main
git push -u origin main
```

### 3. Aktualizujte base-href v package.json

Ak ste použili iný názov repozitára, upravte riadok 9 v `package.json`:

```json
"build:prod": "ng build --configuration=production --base-href /VÁŠ_NÁZOV_REPOZITÁRA/"
```

Potom znova build a push:

```powershell
npm run build:prod
git add .
git commit -m "Update base-href for GitHub Pages"
git push
```

### 4. Povoľte GitHub Pages

1. Prejdite na váš GitHub repozitár
2. Kliknite na **Settings** (nastavenia)
3. V ľavom menu kliknite na **Pages**
4. V sekcii "Build and deployment":
   - Source: Zvoľte **GitHub Actions**
5. Prejdite na **Actions** tab
6. Povoľte workflows (ak sú vypnuté)

### 5. Automatický deployment

GitHub Actions automaticky:

- Nainštaluje závislosti
- Vytvorí produkčný build
- Nasadí na GitHub Pages

Deployment trvá 2-3 minúty. Sledujte progress v Actions tab.

### 6. Prístup k aplikácii

Po úspešnom deploymenti bude aplikácia dostupná na:

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

**Príklad:**

```
https://johndoe.github.io/workplace-condition-monitor/
```

## 🔑 Prihlasovacie údaje

Po otvorení aplikácie použite:

**Administrator:**

- Používateľské meno: `admin`
- Heslo: `admin123`

**Moderátor:**

- Používateľské meno: `moderator`
- Heslo: `mod123`

## 🔥 Firebase konfigurácia (voliteľné)

Pre cloud synchronizáciu dát:

1. Vytvorte Firebase projekt na [console.firebase.google.com](https://console.firebase.google.com)
2. Povoľte Firestore Database
3. Skopírujte Firebase config
4. Upravte `src/environments/environment.prod.ts`
5. Push zmeny do GitHub

**Poznámka:** Aplikácia funguje aj bez Firebase pomocou localStorage!

Podrobný návod: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 📋 Kontrolný zoznam

Pre kompletný deployment checklist pozrite: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🆘 Riešenie problémov

### GitHub push vyžaduje autentifikáciu

Použite Personal Access Token namiesto hesla:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Označte `repo` scope
4. Použite token ako heslo pri push

### Build zlyhá

```powershell
# Vyčistite a znova buildnite
Remove-Item -Recurse -Force node_modules, dist, .angular
npm install
npm run build:prod
```

### 404 chyba na GitHub Pages

- Počkajte 2-3 minúty na DNS propagáciu
- Skontrolujte `base-href` v `package.json`
- Overte že GitHub Actions úspešne dokončil

## 📞 Podpora

Pre viac informácií:

- **Quick Start:** [START_HERE.md](./START_HERE.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Install Commands:** [INSTALL_COMMANDS.md](./INSTALL_COMMANDS.md)

---

**Status:** ✅ Lokálny build dokončený, pripravené na GitHub deployment

**Vytvorené:** 2025-11-12

**Ďalší krok:** Vytvorte GitHub repozitár a vykonajte kroky 2-6 vyššie
