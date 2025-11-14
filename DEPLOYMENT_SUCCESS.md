# 🎉 Aplikácia NASADENÁ na GitHub!

## ✅ Deployment je DOKONČENÝ!

Kód bol úspešne nahraný do repozitára: **https://github.com/idea3dsvk/merania**

### Dokončené kroky:

1. ✅ Nainštalované všetky závislosti
2. ✅ Vytvorený produkčný build
3. ✅ Git repozitár inicializovaný
4. ✅ Remote pripojený: `https://github.com/idea3dsvk/merania`
5. ✅ Base-href nastavený na `/merania/`
6. ✅ **Kód pushnutý na GitHub (main branch)**

---

## 🚀 POSLEDNÝ KROK - Povoľte GitHub Pages

Aby bola aplikácia živá, musíte povoliť GitHub Pages:

### Krok 1: Otvorte nastavenia repozitára

Prejdite na: **https://github.com/idea3dsvk/merania/settings/pages**

### Krok 2: Povoľte GitHub Pages

1. V sekcii **"Build and deployment"**:
   - **Source**: Zvoľte **GitHub Actions**
2. Kliknite **Save** (ak je tlačidlo viditeľné)

### Krok 3: Povoľte GitHub Actions (ak sú vypnuté)

1. Prejdite na: **https://github.com/idea3dsvk/merania/actions**
2. Ak vidíte banner "Workflows aren't being run", kliknite **"I understand my workflows, go ahead and enable them"**

### Krok 4: Počkajte na deployment

GitHub Actions automaticky:

- Nainštaluje závislosti
- Vytvorí produkčný build
- Nasadí na GitHub Pages

**Čas deploymenu:** 2-3 minúty

Sledujte progress na: https://github.com/idea3dsvk/merania/actions

---

## 🌐 Prístup k aplikácii

Po dokončení deploymenu bude aplikácia dostupná na:

### **https://idea3dsvk.github.io/merania/**

---

## 🔑 Prihlasovacie údaje

**Administrator** (plný prístup):

- Email: `auotns@gmail.com`
- Heslo: `na poziadanie`

**Moderátor** (obmedzený prístup):

- Email: `moderator@auo.com`
- Heslo: `na poziadanie`

---

## ✨ Funkcie aplikácie

- ✅ 8 typov meraní (teplota, vlhkosť, svietivosť, prašnosť, ESD, ...)
- ✅ Real-time dashboard s grafmi
- ✅ História s filtrovaniem (15 rokov späť)
- ✅ Štatistiky a trendy
- ✅ ISO normy a špecifikácie
- ✅ Autentifikácia (Admin/Moderátor)
- ✅ Multi-jazyk (SK, EN, DE)
- ✅ Export CSV/PDF

---

## 🔄 Aktualizácia aplikácie

Pre budúce zmeny:

```powershell
# 1. Upravte súbory
# 2. Build
npm run build:prod

# 3. Commit a push
git add .
git commit -m "Update: popis zmien"
git push

# GitHub Actions automaticky nasadí novú verziu!
```

---

## 🔥 Firebase konfigurácia (voliteľné)

Pre cloud synchronizáciu:

1. Vytvorte Firebase projekt: https://console.firebase.google.com
2. Povoľte Firestore Database
3. Skopírujte config do `src/environments/environment.prod.ts`
4. Push zmeny

**Poznámka:** Aplikácia funguje aj BEZ Firebase (localStorage)!

Detailný návod: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

## 📊 Monitoring

### GitHub Actions

- Status: https://github.com/idea3dsvk/merania/actions
- Deployment history
- Build logs

### GitHub Pages

- Status: https://github.com/idea3dsvk/merania/settings/pages
- Deployment URL
- Custom domain nastavenia

---

## 🐛 Riešenie problémov

### GitHub Pages nefunguje

- Skontrolujte, či je "Source" nastavený na "GitHub Actions"
- Overte, že Actions sú povolené
- Počkajte 2-3 minúty na DNS propagáciu

### Build zlyhá v GitHub Actions

- Skontrolujte Actions logs
- Overte že `package.json` má správne dependencies
- Skontrolujte že `angular.json` je správne nakonfigurovaný

### 404 Error na stránke

- Overte `base-href` v `package.json`: `/merania/`
- Skontrolujte že `dist/` obsahuje `index.html` a `404.html`
- Vyčistite cache prehliadača (Ctrl+F5)

---

## 📞 Dokumentácia

- [START_HERE.md](./START_HERE.md) - Quick start guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Kompletný deployment guide
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase konfigurácia
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Kontrolný zoznam

---

## 🎯 Súhrn

| Položka          | Status                | Link                                                |
| ---------------- | --------------------- | --------------------------------------------------- |
| GitHub Repozitár | ✅ Vytvorený          | https://github.com/idea3dsvk/merania                |
| Kód Push         | ✅ Dokončený          | main branch                                         |
| GitHub Actions   | ⏳ Čaká na povolenie  | https://github.com/idea3dsvk/merania/actions        |
| GitHub Pages     | ⏳ Čaká na nastavenie | https://github.com/idea3dsvk/merania/settings/pages |
| Live URL         | ⏳ Po aktivácii       | https://idea3dsvk.github.io/merania/                |

---

**Ďalší krok:** Povoľte GitHub Pages v nastaveniach repozitára! 🚀

**Vytvorené:** 2025-11-12 14:05
