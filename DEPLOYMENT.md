# Workplace Condition Monitor

Workplace Condition Monitor je webová aplikácia pre monitorovanie a správu meraní pracovných podmienok (teplota, vlhkosť, svietivosť, prašnosť, ESD, a ďalšie).

## 🚀 Funkcie

- **8 typov meraní**: Teplota & vlhkosť, svietivosť, prašnosť (ISO 5/6), momentový skrutkovač, povrchový odpor, uzemnenie, ionizér
- **Real-time Dashboard** s vizualizáciou stavu
- **História a trendy** s grafmi a filtrovaniem (15 rokov späť)
- **Štatistiky** s trendami a reportami
- **ISO normy a špecifikácie** pre každý typ merania
- **Autentifikácia** - Admin a Moderátor roly
- **Firebase synchronizácia** - Dáta v cloude
- **Multilingual** - Slovenčina, Angličtina, Nemčina
- **Export** - CSV a PDF

## 📋 Predpoklady

- Node.js 20+
- npm 10+
- Firebase projekt (pre cloud synchronizáciu)
- GitHub účet (pre deployment)

## 🔧 Inštalácia

### 1. Klonovanie repozitára

```bash
git clone https://github.com/YOUR_USERNAME/workplace-condition-monitor.git
cd workplace-condition-monitor
```

### 2. Inštalácia závislostí

```bash
npm install
```

### 3. Firebase konfigurácia

1. Vytvorte Firebase projekt na [console.firebase.google.com](https://console.firebase.google.com)
2. Povoľte Firestore Database
3. Skopírujte Firebase konfiguráciu
4. Vytvorte súbor `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
  },
};
```

5. Nastavte Firestore pravidlá:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if true; // Pre demo, zmeňte na security rules
    }
  }
}
```

### 4. Lokálny vývoj

```bash
npm run dev
```

Aplikácia beží na `http://localhost:3000`

**Demo prihlasovacie údaje:**

- Admin: `admin` / `admin123`
- Moderátor: `moderator` / `mod123`

## 🌐 Deployment na GitHub Pages

### Automatický deployment (odporúčané)

1. **Povoľte GitHub Pages v nastaveniach repozitára:**

   - Settings → Pages
   - Source: GitHub Actions

2. **Aktualizujte `base-href` v `package.json`:**

   ```json
   "build:prod": "ng build --configuration=production --base-href /YOUR_REPO_NAME/"
   ```

3. **Push do main vetvy:**

   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **GitHub Actions automaticky:**

   - Nainštaluje závislosti
   - Zostaví produkčnú verziu
   - Nasadí na GitHub Pages

5. **Aplikácia bude dostupná na:**
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

### Manuálny deployment

```bash
# Build produkčnej verzie
npm run build:prod

# Deploy pomocou angular-cli-ghpages
npm run deploy
```

## 🔐 Používateľské roly

### Administrator

- ✅ Pridávať/editovať/mazať merania
- ✅ Nastavovať limity
- ✅ Spravovať ISO špecifikácie
- ✅ Exportovať dáta

### Moderátor

- ✅ Pridávať/editovať merania
- ✅ Prezerať históriu a štatistiky
- ❌ **Nemôže** mazať merania
- ❌ **Nemôže** editovať limity

## 📊 Architektúra

```
workplace-condition-monitor/
├── src/
│   ├── components/           # Angular komponenty
│   │   ├── dashboard/
│   │   ├── history-view/
│   │   ├── statistics/
│   │   ├── login/
│   │   └── ...
│   ├── services/             # Služby (Data, Auth, Firebase, ...)
│   ├── models.ts             # TypeScript rozhrania
│   ├── translations.ts       # Jazykové mutácie
│   └── environments/         # Environment konfigurácie
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions workflow
└── package.json
```

## 🛠️ Technológie

- **Angular 20** - Framework
- **TypeScript** - Jazyk
- **Tailwind CSS** - Styling
- **Chart.js + ng2-charts** - Grafy
- **Firebase/Firestore** - Cloud databáza
- **GitHub Pages** - Hosting
- **GitHub Actions** - CI/CD

## 📝 Vývoj

### Pridanie nového typu merania

1. Pridajte typ do `models.ts`
2. Aktualizujte `MEASUREMENT_TYPES`
3. Pridajte preklady do `translations.ts`
4. Aktualizujte `DataService` a `MeasurementFormComponent`

### Zmena jazykov

Upravte `translations.ts` - podporované jazyky: `en`, `sk`, `de`

## 🐛 Riešenie problémov

### Firebase sa nenačítava

- Skontrolujte `environment.prod.ts` konfiguráciu
- Overte Firestore pravidlá v Firebase Console

### GitHub Pages nefunguje

- Overte GitHub Actions v repozitári (Actions tab)
- Skontrolujte `base-href` v `package.json`
- Povoľte GitHub Pages v Settings → Pages

### Build zlyhá

```bash
# Vyčistite cache
rm -rf node_modules dist .angular
npm install
npm run build:prod
```

## 📄 Licencia

MIT License

## 🤝 Autor

Vyvinuté pre monitorovanie pracovných podmienok v priemyselnom prostredí.

## 📞 Podpora

Pre otázky a problémy vytvorte Issue na GitHub.

---

**Poznámka:** Po prvom nasadení nahraďte placeholder hodnoty vo `environment.prod.ts` skutočnými Firebase credentials. Nikdy necommitujte production credentials do verejného repozitára!
