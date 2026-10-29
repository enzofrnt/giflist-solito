import { ImageResponse } from 'next/og'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { prisma } from '@/lib/prisma'
import { SITE_NAME } from '@/lib/seo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Giftlist — liste de cadeaux partagée'

function logoDataUri(): string | undefined {
  try {
    const buffer = readFileSync(join(process.cwd(), 'public', 'logo-og.png'))
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return undefined
  }
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value
}

export default async function Image({ params }: { params: Promise<{ shareCode: string }> }) {
  const { shareCode } = await params
  let list:
    | { title: string; description: string | null; user: { username: string } | null; _count: { gifts: number } }
    | null = null

  try {
    list = await prisma.giftList.findUnique({
      where: { shareCode },
      select: {
        title: true,
        description: true,
        user: { select: { username: true } },
        _count: { select: { gifts: true } },
      },
    })
  } catch {
    list = null
  }

  const title = truncate(list?.title || 'Liste de cadeaux', 64)
  const description = truncate(
    list?.description?.trim() || 'Une liste de cadeaux à découvrir et à réserver sur Giftlist.',
    120,
  )
  const owner = list?.user?.username?.trim() ? `@${list.user.username}` : 'Un proche'
  const giftCount = list?._count.gifts ?? 0
  const logo = logoDataUri()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#faf9f7',
          color: '#1b1917',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: 999,
            background: '#fde7de',
            right: -130,
            top: -190,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: 999,
            background: '#dbe6ff',
            left: -100,
            bottom: -130,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
          {logo ? <img src={logo} width={210} height={112} alt="" /> : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#8b857d' }}>
              LISTE PARTAGÉE
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1b1917' }}>{SITE_NAME}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, position: 'relative', maxWidth: 950 }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>{title}</div>
          <div style={{ fontSize: 28, lineHeight: 1.35, color: '#6b655e' }}>{description}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 600, color: '#6b655e' }}>
            <span style={{ color: '#f4673f' }}>●</span>
            <span>{owner}</span>
            <span style={{ color: '#d8d1c7' }}>·</span>
            <span>{giftCount} cadeau{giftCount > 1 ? 'x' : ''}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 22px',
              borderRadius: 12,
              background: '#2563eb',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            giftlist.fr
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
