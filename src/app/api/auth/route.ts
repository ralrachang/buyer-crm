import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, SESSION_COOKIE, SESSION_DURATION } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  const sitePassword = process.env.SITE_PASSWORD
  if (!sitePassword) {
    return NextResponse.json({ error: '서버 설정 오류입니다.' }, { status: 500 })
  }

  if (password !== sitePassword) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  const token = await createSessionToken()

  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
