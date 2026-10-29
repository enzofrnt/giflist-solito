import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { withAuth } from '@/lib/middleware'
import type { User } from '@/lib/auth'

export const runtime = 'nodejs'

const MAX_BYTES = 5 * 1024 * 1024
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

async function handleUpload(request: NextRequest, user: User) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Le stockage d’images n’est pas configuré.' }, { status: 503 })
  }
  const form = (await request.formData().catch(() => null)) as unknown as { get(name: string): unknown } | null
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: 'Aucune image fournie.' }, { status: 400 })
  if (!MIME_EXT[file.type]) return NextResponse.json({ ok: false, error: 'Formats acceptés : JPG, PNG, WebP, GIF.' }, { status: 415 })
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: 'Image trop lourde (5 Mo maximum).' }, { status: 413 })

  const ext = MIME_EXT[file.type]
  const pathname = `giftlist/${user.id}/${crypto.randomUUID()}.${ext}`
  try {
    const blob = await put(pathname, file, { access: 'public', addRandomSuffix: false, contentType: file.type })
    return NextResponse.json({ ok: true, url: blob.url })
  } catch (error) {
    console.error('Erreur upload image:', error)
    return NextResponse.json({ ok: false, error: 'Envoi de l’image impossible.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, handleUpload)
}
