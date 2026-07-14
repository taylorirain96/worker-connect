import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'
import { getDatabase, type Database } from 'firebase/database'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === '1'
export const isFirebaseClientConfigured = Boolean((apiKey && projectId) || useEmulator)

const firebaseConfig = {
  // Auth Emulator accepts any non-empty API key; fall back to a placeholder
  // when running against the emulator without real Firebase credentials.
  apiKey: apiKey ?? (useEmulator ? 'emulator-api-key' : ''),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: projectId ?? (useEmulator ? 'quicktrade-e2e' : ''),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: `https://${projectId ?? 'placeholder'}-default-rtdb.firebaseio.com`,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let rtdb: Database | null = null
let storage: FirebaseStorage | null = null

if (isFirebaseClientConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    rtdb = getDatabase(app)
    storage = getStorage(app)

    if (useEmulator && typeof window !== 'undefined') {
      // Default ports match `firebase.json`; override via env vars when
      // running against a non-default emulator setup.
      const authHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL ?? 'http://127.0.0.1:9099'
      const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080'
      const [fsHostname, fsPortStr] = firestoreHost.split(':')
      // Connect once per page load. Re-connecting a live SDK is a no-op
      // wrapped in try/catch because the SDK throws when called twice.
      try {
        connectAuthEmulator(auth, authHost, { disableWarnings: true })
      } catch {
        /* already connected */
      }
      try {
        connectFirestoreEmulator(db, fsHostname, Number(fsPortStr) || 8080)
      } catch {
        /* already connected */
      }
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error)
  }
}

export { auth, db, rtdb, storage }
export default app
