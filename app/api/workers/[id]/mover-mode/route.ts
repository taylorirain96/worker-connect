import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const doc = await adminDb.collection('mover_modes').doc(userId).get();
    
    if (!doc.exists) {
      return NextResponse.json({ enabled: false });
    }

    return NextResponse.json(doc.data());
  } catch (error) {
    console.error('Error fetching mover mode:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    
    await adminDb.collection('mover_modes').doc(userId).set({
      ...body,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating mover mode:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
