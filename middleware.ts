import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'crm_session'
const PROTECTED_PATHS = ['/customers', '/api/customers']

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const secret = getSecret()

  if (!token || !secret) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '세션이 만료되었습니다.' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete(SESSION_COOKIE)
    return response
  }
}

export const config = {
  matcher: ['/customers/:path*', '/api/customers/:path*'],
}
