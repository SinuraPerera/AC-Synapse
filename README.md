# AC Synapse

**Ananda College's digital event command center.**
Real-time event updates, an interactive calendar, student ticketing with QR passes, live championship standings, and multilingual support, all in one platform.<br>

<div style="display: flex; justify-content: center; align-items: center; padding: 15px;">
    <img src="logo.png" alt="Logo" style="max-width: 30px; height: auto;">
</div>
<br>


> Built for **BTUI'26** - the Annual ICT day of Royal College, Colombo).

**Live demo:** https://ac-synapse.vercel.app
**Repository:** https://github.com/SinuraPerera/AC-Synapse

---

## Table of Contents

1. [Project Purpose and Objectives](#1-project-purpose-and-objectives)
2. [Key Features](#2-key-features)
3. [Technologies and Frameworks Used](#3-technologies-and-frameworks-used)
4. [Step-by-Step: Run the Project Locally](#4-step-by-step-run-the-project-locally)
5. [Accessing the Project Online](#5-accessing-the-project-online)
6. [Project Structure](#6-project-structure)
7. [Security](#7-security)
8. [About Builder](#8-team)

---

## 1. Project Purpose and Objectives

### The problem
School events, from sports meets and cultural programs to inter-house championships, are usually coordinated through scattered notices, paper tickets, and word of mouth. Students miss updates, tickets get lost or duplicated, and nobody has a single place to follow results as they happen.

### The purpose
AC Synapse gives Ananda College one **digital command center** for school events: a single web platform where students, staff, and organizers can follow what is happening, get into events, and track results in real time.

### Objectives
- **Centralize** all event information in one place.
- **Keep everyone informed** with real-time event updates instead of static notices.
- **Simplify planning** with an interactive event calendar.
- **Replace paper tickets** with secure, scannable student QR passes and fast entry validation.
- **Boost engagement** with live championship standings.
- **Be inclusive** through multilingual support, so more of the school community can use it comfortably.
- **Work anywhere**: responsive on phones and installable as a Progressive Web App (PWA).

---

## 2. Key Features

| Feature | Description |
|---|---|
| Real-time event updates | Live announcements and event changes, synced through Firebase. |
| Interactive calendar | Browse upcoming events by date. |
| Student ticketing with QR passes | Students get a QR pass; organizers scan it with the device camera to validate entry. |
| Live championship standings | Scores and rankings update as results come in. |
| Multilingual support | The interface is available in multiple languages. |
| PWA | Installable, mobile-friendly experience. |
| Secure data layer | Firestore security rules with automated rule tests. |

---

## 3. Technologies and Frameworks Used

**Frontend**
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) (build tool and dev server)
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [Motion](https://motion.dev/) (animations)
- [Lucide React](https://lucide.dev/) (icons)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Progressive Web App support)

**Ticketing / QR**
- [`qrcode.react`](https://github.com/zpao/qrcode.react) (QR pass generation)
- [`html5-qrcode`](https://github.com/mebjas/html5-qrcode) (camera-based QR scanning)

**Backend / Data**
- [Firebase](https://firebase.google.com/) (Firestore real-time database)
- Firestore Security Rules (`firestore.rules`) with tests (`firestore.rules.test.ts`)
- [Express](https://expressjs.com/) (server runtime support)
- [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) (`@google/genai`, Gemini API)

**Tooling**
- ESLint (with Firebase security-rules plugin), `tsx`, `esbuild`, `dotenv`
- Package managers: npm (`package-lock.json`) or Bun (`bun.lock`)

---

## 4. Step-by-Step: Run the Project Locally

### Prerequisites
- [Node.js](https://nodejs.org/) **v20 or newer** (npm included), or [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)
- A free [Firebase](https://console.firebase.google.com/) project with **Firestore** enabled
- A [Gemini API key](https://aistudio.google.com/app/apikey) (only needed for AI-powered features)

### Step 1: Clone the repository
```bash
git clone https://github.com/SinuraPerera/AC-Synapse.git
cd AC-Synapse
```

### Step 2: Install dependencies
```bash
npm install
```
*(or `bun install`)*

### Step 3: Configure environment variables
Copy the example file and fill in your own values:
```bash
cp .env.example .env
```
Open `.env` and set:

```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"

VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
```
You can find the Firebase values in **Firebase Console → Project settings → Your apps → Web app**.

### Step 4: Start the development server
```bash
npm run dev
```

### Step 5: Open the app
Visit **http://localhost:3000** in your browser.

> Tip: to test QR scanning on a phone, open the app via your computer's local network address (the dev server is exposed on `0.0.0.0`). Browsers only allow camera access on `localhost` or HTTPS.

### Other useful commands

| Command | Purpose |
|---|---|
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Type-check the project with TypeScript |
| `npm run clean` | Remove build output |

### Deploying Firestore security rules (optional)
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

---

## 5. Accessing the Project Online

The deployed version can be opened directly in any modern browser (desktop or mobile):

https://ac-synapse.vercel.app

No installation is required. On mobile, use *"Add to Home Screen"* to install it as an app.

---

## 6. Project Structure

```
AC-Synapse/
├── public/                    # Static assets
├── src/                       # Application source (React + TypeScript)
├── dev-dist/                  # PWA dev output
├── .env.example               # Environment variable template
├── firebase-applet-config.json
├── firebase-blueprint.json    # Firestore data model blueprint
├── firestore.rules            # Firestore security rules
├── firestore.rules.test.ts    # Security rules tests
├── security_spec.md           # Security specification
├── index.html                 # App entry point
├── vite.config.ts             # Vite + PWA + Tailwind config
├── tsconfig.json
└── package.json
```

---

## 7. Security

- Firestore access is controlled by dedicated **security rules** (`firestore.rules`) and covered by tests (`firestore.rules.test.ts`).
- The full security approach is documented in [`security_spec.md`](./security_spec.md).
- Secrets live in `.env` (git-ignored). Never commit real API keys.

---

## 8. Built by M. Sinura Damsath Perera

- **Developer:** Sinura Perera ([@SinuraPerera](https://github.com/SinuraPerera))
- **School:** Ananda College, Colombo 10

*Made with effort 💪.*
