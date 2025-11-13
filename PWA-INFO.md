# PWA (Progressive Web App) - Offline Podpora

## Implementované funkcie

### ✅ Service Worker

- Automatická registrácia v production režime
- Kontrola aktualizácií každých 6 hodín
- Notifikácia používateľa pri dostupnosti novej verzie
- Offline caching statických súborov

### ✅ Web App Manifest

- Názov aplikácie: "Workplace Condition Monitor"
- Krátky názov: "WC Monitor"
- Standalone režim (aplikácia sa správa ako natívna)
- Téma farba: #4f46e5 (indigo)
- Podpora mobilných zariadení (iOS & Android)

### ✅ Caching stratégie

#### App Shell (Prefetch)

- `index.html`
- `favicon.ico`
- Všetky CSS a JS súbory
- Tieto súbory sa stiahnu ihneď pri prvej návšteve

#### Assets (Lazy Load)

- Obrázky, fonty a ostatné statické assets
- Stiahnu sa až pri použití
- Aktualizujú sa pri novej verzii

#### Firebase API (Freshness)

- Firestore API volania
- Vždy sa snaží získať čerstvé dáta
- Pri offline režime použije cache (max 6 hodín)
- Timeout: 10 sekúnd
- Maximálne 100 cachovaných odpovedí

## Ako testovať PWA

### 1. Production Build

```bash
npm run build:prod
```

### 2. Lokálne testovanie s HTTPS

Service Worker vyžaduje HTTPS. Pre lokálne testovanie použite:

```bash
# Nainštalujte http-server
npm install -g http-server

# Spustite s SSL
http-server dist -p 8080 -c-1
```

### 3. Testovanie v prehliadači

#### Chrome/Edge DevTools:

1. Otvorte DevTools (F12)
2. Prejdite na **Application** tab
3. V ľavom menu:
   - **Manifest**: Skontrolujte manifest.webmanifest
   - **Service Workers**: Skontrolujte registráciu a status
   - **Cache Storage**: Pozrite cachované súbory

#### Offline režim:

1. V DevTools → Application → Service Workers
2. Zaškrtnite "Offline"
3. Obnovte stránku (F5)
4. Aplikácia by mala fungovať aj bez internetu

### 4. Inštalácia PWA na zariadení

#### Desktop (Chrome/Edge):

- Kliknite na ikonu "+" v address bare
- Alebo menu → "Nainštalovať Workplace Condition Monitor"

#### Android:

- Chrome menu → "Pridať na plochu"
- Aplikácia sa zobrazí ako samostatná ikona

#### iOS (Safari):

- Share button (ikona šípky)
- "Add to Home Screen"

## GitHub Pages Deployment

Po pushnutí do `main` vetvy:

1. GitHub Actions automaticky spustí build
2. Service Worker sa vygeneruje
3. PWA manifest sa nasadí
4. Aplikácia je dostupná na: https://idea3dsvk.github.io/merania/

## Aktualizácie aplikácie

Keď používateľ má otvorenú starú verziu:

1. Service Worker zistí novú verziu na pozadí
2. Zobrazí sa dialóg: "New version available. Load new version?"
3. Po potvrdení sa stránka automaticky obnoví

## Offline funkcionalita

### Čo funguje offline:

- ✅ Prehliadanie už načítaných dát
- ✅ Navigácia medzi sekciami
- ✅ Zobrazenie grafov s cachovanými dátami
- ✅ UI a statické súbory

### Čo vyžaduje internet:

- ❌ Pridávanie nových meraní
- ❌ Editácia existujúcich dát
- ❌ Firebase Authentication
- ❌ Načítanie nových dát

## Technické detaily

### Súbory:

- `ngsw-config.json` - Konfigurácia service workera
- `src/manifest.webmanifest` - PWA manifest
- `index.tsx` - Registrácia service workera
- `src/app.component.ts` - Automatické aktualizácie

### Dependencies:

- `@angular/service-worker`: ^20.3.11
- Angular PWA support

## Monitorovanie

### Chrome Lighthouse:

1. DevTools → Lighthouse tab
2. Vyberte "Progressive Web App"
3. Kliknite "Generate report"
4. Skóre by malo byť > 90%

### Metriky:

- Installability ✅
- Service Worker ✅
- Offline support ✅
- HTTPS ✅
- Responsive design ✅

## Riešenie problémov

### Service Worker sa neregistruje:

- Skontrolujte, či je aplikácia v production režime
- HTTPS je povinné (okrem localhost)
- Vyčistite cache: DevTools → Application → Clear storage

### Manifest sa nenačíta:

- Skontrolujte console pre chyby
- Overte cestu v index.html: `<link rel="manifest" href="manifest.webmanifest">`

### Aplikácia sa neaktualizuje:

- Hard refresh: Ctrl+Shift+R (alebo Cmd+Shift+R)
- Unregister service worker: DevTools → Application → Service Workers → Unregister

## Budúce vylepšenia

Možné rozšírenia:

- 📱 Push notifikácie pri kritických hodnotách
- 💾 IndexedDB pre offline úpravu dát
- 📊 Background sync pre odoslanie dát po návrate online
- 🎨 Vlastné ikony (namiesto placeholder ikon)
- 📥 Offline stiahnutie všetkých historických dát
