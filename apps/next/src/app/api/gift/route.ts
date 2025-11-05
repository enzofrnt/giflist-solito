import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Configuration du cache (peut être désactivé)
const ENABLE_CACHE = false; // Désactivé par défaut pour éviter la désynchronisation
let cache: { data: unknown; timestamp: number; version: number } | null = null;
const CACHE_DURATION = 5000; // 5 secondes seulement
let cacheVersion = 0;

// Fonction pour invalider le cache
function invalidateCache() {
  cacheVersion++;
  cache = null;
}

export async function GET() {
  // Si le cache est désactivé, requête directe optimisée
  if (!ENABLE_CACHE) {
    const gifts = await prisma.gift.findMany({
      select: {
        id: true,
        title: true,
        url: true,
        image: true,
        price: true,
        description: true,
        status: true,
        reservedByName: true,
        reservedByEmail: true,
        reservedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: 'asc' }
    });
    return NextResponse.json({ ok: true, data: gifts });
  }

  // Cache activé (logique de cache)
  const now = Date.now();
  
  if (cache && 
      (now - cache.timestamp) < CACHE_DURATION && 
      cache.version === cacheVersion) {
    return NextResponse.json({ ok: true, data: cache.data });
  }

  const gifts = await prisma.gift.findMany({
    select: {
      id: true,
      title: true,
      url: true,
      image: true,
      price: true,
      description: true,
      status: true,
      reservedByName: true,
      reservedByEmail: true,
      reservedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { id: 'asc' }
  });

  cache = { data: gifts, timestamp: now, version: cacheVersion };
  return NextResponse.json({ ok: true, data: gifts });
}

const GiftSchema = z.object({
  title: z.string().min(1).optional(),
  url: z.string().url().optional(),
  image: z.string().url().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'reserved']).optional(),
  reservedBy: z.string().nullable().optional(),
  reservedByName: z.string().nullable().optional(),
  reservedByEmail: z.string().nullable().optional(),
  reservedAt: z.string().nullable().optional(),
});

const GiftCreateSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  image: z.string().url().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
  giftListId: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = GiftCreateSchema.parse(body);
    const gift = await prisma.gift.create({ data: parsed });
    
    // Invalider le cache après création
    invalidateCache();
    
    return NextResponse.json({ ok: true, data: gift }, { status: 201 });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const parsed = GiftSchema.parse(data);
    
    // Convertir reservedAt de string à Date si fourni
    const updateData = {
      ...parsed,
      reservedAt: parsed.reservedAt ? new Date(parsed.reservedAt) : parsed.reservedAt
    };
    
    const gift = await prisma.gift.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    // Invalider le cache après modification
    invalidateCache();
    
    return NextResponse.json({ ok: true, data: gift });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID manquant' }, { status: 400 });
    }
    await prisma.gift.delete({
      where: { id: parseInt(id) }
    });
    
    // Invalider le cache après suppression
    invalidateCache();
    
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}