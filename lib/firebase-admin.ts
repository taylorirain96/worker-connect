import { initializeApp, getApps, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'

if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }

  // When running against the Firebase emulator suite (E2E / local dev),
  // firebase-admin auto-honors FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST
  // and does NOT require real credentials. Skip applicationDefault() in that
  // case so test runs without GOOGLE_APPLICATION_CREDENTIALS don't blow up at
  // import time. A projectId is still required for the admin SDK to address
  // the emulator's project namespace.
  const usingEmulator = Boolean(
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST,
  )

  const projectId =
    serviceAccount.projectId ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    process.env.GCLOUD_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT

  if (usingEmulator) {
    initializeApp({
      projectId,
      databaseURL: `https://${projectId ?? 'placeholder'}-default-rtdb.firebaseio.com`,
    })
  } else {
    initializeApp({
      credential: serviceAccount.private_key
        ? cert(serviceAccount)
        : applicationDefault(),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    })
  }
}

export const adminDb = getFirestore()
export const adminAuth = getAuth()
export const adminRtdb = getDatabase()
