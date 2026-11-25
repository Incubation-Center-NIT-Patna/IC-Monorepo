import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Local unauthenticated upload is disabled. Use the centralized authenticated Fastify API (/api/upload).',
    },
    { status: 410 }
  );
}
