import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

const PASSWORD_TEST = 'Giftlist123!'
const PASSWORD_DEMO = 'DemoGiftlist2026!'

type SeedList = {
  shareCode: string
  title: string
  description?: string | null
  image?: string | null
  isPublic: boolean
  secret: boolean
  createdAt: string
  gifts: Array<{
    title: string
    description?: string | null
    url?: string | null
    image?: string | null
    price?: number | null
    status?: 'available' | 'reserved'
    reservedByName?: string | null
  }>
}

async function makeUser(email: string, password: string, username: string, name: string) {
  const hash = await bcrypt.hash(password, 10)
  return prisma.user.upsert({
    where: { email },
    update: { password: hash, username, name, isPublic: true },
    create: { email, password: hash, username, name, isPublic: true },
  })
}

async function seedLists(userId: number, lists: SeedList[]) {
  // The demo/test accounts are disposable: reset only their lists, never other users.
  await prisma.giftList.deleteMany({ where: { userId } })
  for (const list of lists) {
    const created = await prisma.giftList.create({
      data: {
        userId,
        shareCode: list.shareCode,
        title: list.title,
        description: list.description ?? null,
        image: list.image ?? null,
        isPublic: list.isPublic,
        secret: list.secret,
        createdAt: new Date(list.createdAt),
      },
    })
    for (const gift of list.gifts) {
      await prisma.gift.create({
        data: {
          giftListId: created.id,
          title: gift.title,
          description: gift.description ?? null,
          url: gift.url ?? null,
          image: gift.image ?? null,
          price: gift.price ?? null,
          status: gift.status ?? 'available',
          reservedByName: gift.status === 'reserved' ? gift.reservedByName ?? 'Un proche' : null,
          reservedAt: gift.status === 'reserved' ? new Date() : null,
        },
      })
    }
  }
}

export async function seedDemo() {
  const test = await makeUser('test@giftlist.fr', PASSWORD_TEST, 'test_local', 'Compte test')
  const camille = await makeUser('demo@giftlist.fr', PASSWORD_DEMO, 'camille_demo', 'Camille Martin')
  const lucas = await makeUser('lucas.demo@giftlist.fr', PASSWORD_DEMO, 'lucas_demo', 'Lucas Bernard')

  await seedLists(test.id, [
    {
      shareCode: 'TESTA1', title: 'Anniversaire test', description: 'Ma liste d’anniversaire pour tester les cartes et les cadeaux.', image: '/demo/birthday.jpg', isPublic: true, secret: false, createdAt: '2026-09-07T10:00:00.000Z',
      gifts: [
        { title: 'Livre de cuisine', description: 'Celui avec les pâtes fraîches.', price: 24.9, image: '/demo/books.jpg', url: 'https://example.com/livre' },
        { title: 'Casque audio', description: 'Pour écouter de la musique sans déranger.', price: 149, image: '/demo/headphones.jpg', status: 'reserved', reservedByName: 'Camille' },
      ],
    },
    {
      shareCode: 'TESTB2', title: 'Noël test', description: 'Quelques idées sans image pour vérifier le placeholder.', image: null, isPublic: false, secret: true, createdAt: '2025-11-02T10:00:00.000Z',
      gifts: [{ title: 'Bougie parfumée', price: 29, image: '/demo/candle.jpg', description: 'Une odeur douce pour la maison.' }],
    },
    {
      shareCode: 'TESTC3', title: 'Voyage test', description: null, image: '/demo/lisbon.jpg', isPublic: true, secret: false, createdAt: '2026-01-15T10:00:00.000Z',
      gifts: [{ title: 'Guide de Lisbonne', price: 18.9, image: '/demo/books.jpg' }],
    },
  ])

  await seedLists(camille.id, [
    {
      shareCode: 'CAMI2026', title: 'Anniversaire de Camille', description: 'Mes envies pour souffler mes 30 bougies 🎂', image: '/demo/birthday.jpg', isPublic: true, secret: false, createdAt: '2026-10-12T09:30:00.000Z',
      gifts: [
        { title: 'Appareil photo instantané', description: 'Pour garder les souvenirs de cette année.', price: 119, image: '/demo/headphones.jpg', url: 'https://example.com/appareil-photo' },
        { title: 'Coffret de thés', description: 'Découverte de thés verts et noirs.', price: 34.9, image: '/demo/books.jpg' },
        { title: 'Bougie « Forêt »', description: 'Une bougie en cire végétale.', price: 29, image: '/demo/candle.jpg', status: 'reserved', reservedByName: 'Lucas' },
        { title: 'Week-end surprise', description: 'Deux jours quelque part en France.', price: 250, image: '/demo/lisbon.jpg' },
      ],
    },
    {
      shareCode: 'NOEL2026', title: 'Noël en famille', description: 'Les idées que je glisse au Père Noël cette année.', image: '/demo/christmas.jpg', isPublic: true, secret: true, createdAt: '2026-10-02T18:15:00.000Z',
      gifts: [
        { title: 'Plaid en laine', price: 59, image: '/demo/home.jpg' },
        { title: 'Livre de photographie', price: 39.9, image: '/demo/books.jpg', status: 'reserved', reservedByName: 'Maman' },
        { title: 'Coffret de bougies', price: 24.9, image: '/demo/candle.jpg' },
      ],
    },
    {
      shareCode: 'LISBONNE', title: 'Week-end à Lisbonne', description: 'Les bonnes adresses et les petites envies du voyage.', image: '/demo/lisbon.jpg', isPublic: false, secret: false, createdAt: '2026-08-21T11:00:00.000Z',
      gifts: [
        { title: 'Guide de voyage', price: 17.9, image: '/demo/books.jpg' },
        { title: 'Appareil photo', price: 119, image: '/demo/headphones.jpg' },
      ],
    },
    {
      shareCode: 'HOME2026', title: 'Crémaillère', description: 'Pour rendre le nouvel appartement encore plus doux.', image: '/demo/home.jpg', isPublic: true, secret: false, createdAt: '2026-06-18T14:20:00.000Z',
      gifts: [
        { title: 'Plaid en laine', price: 59, image: '/demo/home.jpg' },
        { title: 'Bougie parfumée', price: 29, image: '/demo/candle.jpg' },
      ],
    },
  ])

  await seedLists(lucas.id, [
    {
      shareCode: 'LUCAS30', title: 'Mes 30 ans', description: 'Quelques idées simples pour fêter ça.', image: '/demo/birthday.jpg', isPublic: true, secret: false, createdAt: '2026-09-25T16:00:00.000Z',
      gifts: [
        { title: 'Casque audio', price: 149, image: '/demo/headphones.jpg' },
        { title: 'Coffret de thés', price: 34.9, image: '/demo/books.jpg', status: 'reserved', reservedByName: 'Camille' },
      ],
    },
    {
      shareCode: 'SKI2027', title: 'Ski à la montagne', description: 'Pour ne pas avoir froid sur les pistes.', image: '/demo/christmas.jpg', isPublic: true, secret: false, createdAt: '2026-10-20T09:00:00.000Z',
      gifts: [
        { title: 'Bonnet en laine', price: 25 },
        { title: 'Bougie « Chalet »', price: 29, image: '/demo/candle.jpg' },
      ],
    },
  ])

  // Favorites are demo-only; clear them on both demo accounts first.
  await prisma.favoriteList.deleteMany({ where: { userId: { in: [camille.id, lucas.id, test.id] } } })
  const lucasList = await prisma.giftList.findUnique({ where: { shareCode: 'LUCAS30' } })
  const camilleList = await prisma.giftList.findUnique({ where: { shareCode: 'CAMI2026' } })
  if (lucasList) await prisma.favoriteList.create({ data: { userId: camille.id, giftListId: lucasList.id } })
  if (camilleList) await prisma.favoriteList.create({ data: { userId: lucas.id, giftListId: camilleList.id } })

  return {
    test: { email: 'test@giftlist.fr', password: PASSWORD_TEST, username: 'test_local' },
    demo: { email: 'demo@giftlist.fr', password: PASSWORD_DEMO, username: 'camille_demo' },
    otherDemo: { email: 'lucas.demo@giftlist.fr', password: PASSWORD_DEMO, username: 'lucas_demo' },
  }
}

if (import.meta.main) {
  const credentials = await seedDemo()
  console.log('Demo database ready:')
  console.table(credentials)
  await prisma.$disconnect()
}
