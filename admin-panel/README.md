# Hospaccx Admin Panel

Production-ready admin dashboard for Banerjee Diagnostic Foundation and Hospaccx.

## Stack

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- Firebase Auth, Firestore, and Storage
- React Hook Form + Zod
- Zustand
- Framer Motion
- Sonner toasts

## Features

- Secure login with Firebase Email/Password
- Protected `/admin` routes with middleware
- Signed server session cookie
- Doctors CRUD with image upload
- Diagnostic services CRUD
- Patient review moderation
- Appointment status management + CSV export
- Basic CMS for hero/about/contact content
- Activity logs
- Dark mode toggle

## Folder Structure

```text
src/
  app/
    (auth)/login
    (admin)/admin
    api/auth/session
  components/
    layout/
    providers/
    shared/
    ui/
  config/
  features/
    appointments/
    auth/
    cms/
    dashboard/
    doctors/
    reviews/
    services/
  lib/
    firebase/
    constants.ts
    session.ts
    utils.ts
  store/
  types/
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill these values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
SESSION_SECRET=
ADMIN_EMAILS=your-admin-email@example.com
```

Notes:

- `SESSION_SECRET` should be a long random string.
- `FIREBASE_PRIVATE_KEY` must keep newline characters escaped as `\n` in Vercel.
- `ADMIN_EMAILS` is a comma-separated fallback list. Real role control should still live in Firestore `users` documents.

## Firebase Setup

### 1. Create Firebase project

- Enable **Authentication > Email/Password**
- Enable **Firestore**
- Enable **Storage**

### 2. Add Firestore collections

- `users`
- `doctors`
- `services`
- `reviews`
- `appointments`
- `cms`
- `activityLogs`

### 3. Seed the first admin user

1. Create a user in Firebase Authentication.
2. Log in once.
3. Add a Firestore document:

```text
collection: users
document id: <firebase uid>
fields:
  email: admin email
  name: full name
  role: admin
```

### 4. Apply rules

- Deploy `firestore.rules`
- Deploy `storage.rules`

## Local Development

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/login`

## Production / Vercel

1. Create a new Vercel project with root directory `admin-panel`
2. Add all environment variables from `.env.example`
3. Deploy

Recommended Vercel settings:

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output: default

## Build Verification

```bash
npm run build
```

This project currently passes production build successfully.
