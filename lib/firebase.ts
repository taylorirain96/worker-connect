import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getDatabase, type Database } from 'firebase/database'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

if (typeof window !== 'undefined' && (!apiKey || !projectId)) {
  console.warn(
    'Firebase environment variables are not configured. Set NEXT_PUBLIC_FIREBASE_* variables to enable authentication and database features.'
  )
}

const firebaseConfig = {
  apiKey: apiKey ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: projectId ?? '',
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

if (apiKey && projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    rtdb = getDatabase(app)
    storage = getStorage(app)
  } catch (error) {
    console.error('Firebase initialization failed:', error)
  }
}

export { auth, db, rtdb, storage }
export default app
