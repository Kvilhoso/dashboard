import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/onboarding']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite rotas públicas sempre
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Em desenvolvimento, libera tudo (auth é feita pelo Zustand no client)
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // Em produção, verifica cookie
  const token = request.cookies.get('mt5_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/onboarding'],
}