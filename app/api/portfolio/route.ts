export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const workerId = searchParams.get('workerId')

    if (!workerId) {
      return NextResponse.json({ error: 'workerId query param is required' }, { status: 400 })
    }

    // In production: fetch portfolio projects from Firestore collection
    // portfolios/{workerId}/projects
    return NextResponse.json({
      workerId,
      projects: [],
      stats: {
        totalProjects: 0,
        categories: [],
        averageRating: 0,
        featuredProjects: 0,
        totalPhotos: 0,
      },
    })
  } catch (error) {
    console.error('Get portfolio error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workerId, title, description, category } = body

    if (!workerId || !title || !category) {
      return NextResponse.json(
        { error: 'workerId, title and category are required' },
        { status: 400 }
      )
    }

    const project = {
      id: `project_${Date.now()}`,
      workerId,
      title,
      description: description ?? '',
      category,
      photos: [],
      tags: [],
      featured: false,
      completedAt: new Date().toISOString(),
    }

    // In production: save to Firestore
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Add portfolio project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
