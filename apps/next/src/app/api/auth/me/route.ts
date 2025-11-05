import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { User } from '@/lib/auth';

async function handleGet(request: NextRequest, user: User) {
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}
