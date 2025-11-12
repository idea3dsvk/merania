# 🔐 Firebase Authentication Setup

## Kroky na dokončenie bezpečnej autentifikácie

### 1. Povoľ Firebase Authentication (HOTOVO? ✓)

1. Choď na: https://console.firebase.google.com/project/merania/authentication
2. Klikni **"Get started"**
3. V záložke **"Sign-in method"** povoľ **"Email/Password"**
4. Klikni **"Save"**

---

### 2. Vytvor používateľské účty

V Firebase Console → Authentication → Users:

#### Vytvor Admin účet:
1. Klikni **"Add user"**
2. Email: `auotns@gmail.com`
3. Password: `11238558`
4. Klikni **"Add user"**

#### Vytvor Moderátor účet:
1. Klikni **"Add user"**
2. Email: `moderator@auo.com`
3. Password: `AUOmoderator`
4. Klikni **"Add user"**

---

### 3. Vytvor kolekciu pre používateľské role

V Firebase Console → Firestore Database → Data:

#### Pre Admin účet:
1. Klikni **"Start collection"**
2. Collection ID: `users`
3. Klikni **"Next"**
4. Document ID: [skopíruj UID admina z Authentication → Users]
5. Pridaj field:
   - Field: `role`
   - Type: `string`
   - Value: `admin`
6. Pridaj field:
   - Field: `email`
   - Type: `string`
   - Value: `auotns@gmail.com`
7. Klikni **"Save"**

#### Pre Moderátor účet:
1. V kolekcii `users` klikni **"Add document"**
2. Document ID: [skopíruj UID moderátora z Authentication → Users]
3. Pridaj field:
   - Field: `role`
   - Type: `string`
   - Value: `moderator`
4. Pridaj field:
   - Field: `email`
   - Type: `string`
   - Value: `moderator@auo.com`
5. Klikni **"Save"**

---

### 4. Aktualizuj Firestore Security Rules

V Firebase Console → Firestore Database → Rules:

**Skopíruj a vlož tieto pravidlá:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    // Helper function to check if user can edit
    function canEdit() {
      return isAuthenticated() && (getUserRole() == 'admin' || getUserRole() == 'moderator');
    }
    
    // Users collection - store user roles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only create via admin console
    }
    
    // Measurements collection
    match /measurements/{measurementId} {
      allow read: if isAuthenticated();
      allow create, update: if canEdit();
      allow delete: if isAdmin();
    }
    
    // Limits collection
    match /limits/{limitId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Specifications collection
    match /specifications/{specId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

Klikni **"Publish"**

---

### 5. Test Authentication

Po nasadení aplikácie:

1. Otvor: https://idea3dsvk.github.io/merania/
2. Prihlás sa s admin účtom:
   - Email: `auotns@gmail.com`
   - Password: `11238558`
3. Otestuj funkcie (pridaj meranie, uprav limit, zmaž meranie)
4. Odhlás sa a prihlás ako moderátor:
   - Email: `moderator@auo.com`
   - Password: `AUOmoderator`
5. Over, že moderátor NEMÔŽE mazať merania ani upravovať limity

---

## ✅ Čo je teraz zabezpečené?

✅ **Firebase Authentication** - Len registrovaní používatelia môžu pristupovať k dátam
✅ **Role-based permissions** - Admin má viac práv ako moderátor
✅ **Firestore Security Rules** - Backend overuje každú operáciu
✅ **Bezpečné heslá** - Firebase spravuje autentifikáciu bezpečne
✅ **Token-based auth** - Automatické obnovenie sessions

---

## 🔒 Čo to znamená?

- **Nikto** bez prihlasovacie údajov nemôže vidieť dáta
- **Nikto** nemôže pristupovať k Firestore priamo (aj keby poznal API kľúč)
- **Len admin** môže mazať merania a upravovať limity
- **Admin aj moderátor** môžu pridávať a upravovať merania
- **Všetky operácie** sú overené na Firebase backend serveri

---

## 📝 Poznámky

**DÔLEŽITÉ:** Po vytvorení účtov vo Firebase Authentication a nastavení rolí v Firestore, všetky dáta budú plne zabezpečené!

**Návod vytvorený:** 2025-11-12
