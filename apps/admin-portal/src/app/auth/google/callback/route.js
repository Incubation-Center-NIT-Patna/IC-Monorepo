import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    return NextResponse.json(
      { error: 'Server configuration error: NEXT_PUBLIC_API_URL is not configured.' },
      { status: 500 }
    );
  }

  const targetUrl = new URL(`${apiBase.replace(/\/+$/, '')}/auth/callback/google`);
  if (code) targetUrl.searchParams.set('code', code);
  if (state) targetUrl.searchParams.set('state', state);

  return NextResponse.redirect(targetUrl);
}
