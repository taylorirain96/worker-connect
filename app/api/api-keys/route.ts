import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { randomBytes } from 'crypto'

function generateApiKey(): string {
  return `qt_${randomBytes(24).toString('hex')}`
}

/** GET /api/api-keys — list caller's API keys */
export async function GET(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const snap = await adminDb
      .collection('apiKeys')
      .where('uid', '==', uid)
      .where('revoked', '==', false)
      .get()

    const keys = snap.docs.map((d: QueryDocumentSnapshot) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name,
        prefix: data.prefix,
        createdAt: data.createdAt,
        lastUsedAt: data.lastUsedAt ?? null,
        scopes: data.scopes,
      }
    })

    return NextResponse.json({ keys })
  } catch (err) {
    console.error('[api-keys] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/api-keys — create a new API key */
export async function POST(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, scopes } = body as { name?: string; scopes?: string[] }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'name is required (min 2 characters)' }, { status: 400 })
    }

    // Limit to 5 active keys per user
    const existing = await adminDb
      .collection('apiKeys')
      .where('uid', '==', uid)
      .where('revoked', '==', false)
      .get()
    if (existing.size >= 5) {
      return NextResponse.json({ error: 'Maximum of 5 active API keys reached' }, { status: 429 })
    }

    const rawKey = generateApiKey()
    const prefix = rawKey.slice(0, 12) // e.g. "qt_a1b2c3d4e5"

    const validScopes = ['jobs:read', 'workers:read', 'quotes:read'] as const
    const resolvedScopes = Array.isArray(scopes)
      ? scopes.filter((s) => validScopes.includes(s as typeof validScopes[number]))
      : ['jobs:read', 'workers:read']

    const docRef = await adminDb.collection('apiKeys').add({
      uid,
      name: name.trim(),
      key: rawKey,
      prefix,
      scopes: resolvedScopes,
      revoked: false,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    })

    return NextResponse.json(
      {
        key: {
          id: docRef.id,
          name: name.trim(),
          prefix,
          rawKey, // Only returned once — store it safely
          scopes: resolvedScopes,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[api-keys] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/api-keys?id=<keyId> — revoke an API key */
export async function DELETE(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const keyId = new URL(request.url).searchParams.get('id')
  if (!keyId) return NextResponse.json({ error: 'id query parameter required' }, { status: 400 })

  try {
    const docRef = adminDb.collection('apiKeys').doc(keyId)
    const snap = await docRef.get()
    if (!snap.exists || snap.data()?.uid !== uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await docRef.update({ revoked: true, revokedAt: new Date().toISOString() })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api-keys] DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
