import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getDatabase, type Database } from 'firebase/database'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:placeholder',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project'}-default-rtdb.firebaseio.com`,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let rtdb: Database
let storage: FirebaseStorage

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  rtdb = getDatabase(app)
  storage = getStorage(app)
} catch (error) {
  console.warn('Firebase initialization error (expected during build/SSR without credentials):', error)
  // These will be undefined during build if Firebase credentials are missing
  // The app will work correctly at runtime when proper env vars are set
  app = getApps()[0] || ({} as FirebaseApp)
  auth = {} as Auth
  db = {} as Firestore
  rtdb = {} as Database
  storage = {} as FirebaseStorage
}

export { auth, db, rtdb, storage }
export default app
