# 🚀 ResumeCraft — Resume Builder

A professional, full-featured resume builder web application with Firebase backend, live preview, multiple templates, and PDF export.

## ✨ Features

- **7 Pages**: Landing, Login, Signup, Dashboard, Builder, Templates, Preview
- **Firebase Auth**: Sign up, login, logout, password reset
- **Firestore Database**: Save, load, update, delete resumes
- **Firebase Storage**: Profile photo upload
- **Live Preview**: Real-time resume preview while typing
- **3 Templates**: Midnight Pro (dark), Clean White (light), Executive (teal)
- **PDF Export**: One-click download via html2pdf.js
- **Animations**: GSAP hero, AOS scroll, Typed.js hero text
- **Responsive**: Mobile-first design, collapsible sidebar

## 🛠 Setup

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Create **Firestore Database** (start in test mode)
5. Enable **Storage**
6. Get your config from Project Settings → General → Your apps

### 2. Configure Firebase

Open `js/firebase-config.js` and replace placeholder values:

```js
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /resumes/{resumeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Deploy to Vercel

### Option A: Vercel CLI
```bash
npm i -g vercel
cd resume-builder
vercel
```

### Option B: GitHub + Vercel
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repo
4. Deploy (no build step needed — static HTML)

## 📁 Project Structure

```
resume-builder/
├── index.html          # Landing page
├── login.html          # Login
├── signup.html         # Registration
├── dashboard.html      # User dashboard
├── builder.html        # Resume builder
├── templates.html      # Template gallery
├── preview.html        # Preview + PDF download
├── vercel.json         # Vercel deployment config
├── css/
│   ├── style.css       # Main styles
│   └── animations.css  # Animation styles
├── js/
│   ├── firebase-config.js  # Firebase init
│   ├── auth.js             # Auth functions
│   ├── database.js         # Firestore CRUD
│   ├── builder.js          # Builder logic
│   ├── script.js           # Shared components
│   ├── animations.js       # Animation helpers
│   └── pdf-download.js     # PDF generation
└── assets/
    └── templates/
        ├── template1.html  # Midnight Pro
        ├── template2.html  # Clean White
        └── template3.html  # Executive
```

## 🎨 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | HTML5, CSS3, ES6 JavaScript |
| UI | Bootstrap 5.3 + Custom CSS |
| Animations | GSAP 3, AOS.js, Typed.js |
| PDF | html2pdf.js |
| Backend | Firebase (Auth + Firestore + Storage) |
| Hosting | Vercel |

## 📝 License

MIT — Free to use and customize.
