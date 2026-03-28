'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/customers')
    } else {
      const data = await res.json()
      setError(data.error || '비밀번호가 올바르지 않습니다.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
      <div className="w-full max-w-sm">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xl">🏢</span>
          </div>
          <h1 className="text-xl font-bold text-[#f5f5f5] tracking-tight">매수고객 관리</h1>
          <p className="mt-1.5 text-xs text-[#555]">접근 비밀번호를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              autoFocus
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-sm text-[#f5f5f5] placeholder-[#444] outline-none focus:border-blue-500/60 transition-colors"
            />
          </div>

          {error && (
            <p className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-[#2a2a2a] disabled:text-[#555] text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? '확인 중...' : '입장'}
          </button>
        </form>
      </div>
    </main>
  )
}
