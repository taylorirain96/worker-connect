import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }

  admin.initializeApp({
    credential: serviceAccount.private_key
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  })
}

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export const adminRtdb = admin.database()
export default admin
