'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Customer } from '@/types'
import IntentBadge from '@/components/IntentBadge'
import QuickTimelineForm from '@/components/QuickTimelineForm'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadCustomers = useCallback(async () => {
    const res = await fetch('/api/customers')
    if (res.status === 401) { router.push('/'); return }
    if (res.ok) setCustomers(await res.json())
    setLoading(false)
  }, [router])

  useEffect(() => { loadCustomers() }, [loadCustomers])

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="flex items-center gap-2 text-[#555]">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">불러오는 중...</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5]">
      {/* 헤더 */}
      <header className="bg-[#0f0f0f] border-b border-[#1e1e1e] sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h1 className="text-sm font-semibold text-[#f5f5f5] tracking-wide">매수고객 관리</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/customers/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <span>+</span> 고객 추가
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-[#555] hover:text-[#888] transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* 빠른 기록 폼 */}
        {customers.length > 0 && (
          <QuickTimelineForm customers={customers} onAdded={loadCustomers} />
        )}

        {/* 고객 목록 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#555] font-medium">
              전체 고객 <span className="text-[#888]">{customers.length}명</span>
            </p>
          </div>

          {customers.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-2xl">📋</div>
              <div>
                <p className="text-[#555] text-sm mb-1">등록된 고객이 없습니다</p>
                <p className="text-[#333] text-xs">첫 번째 매수 고객을 등록해보세요</p>
              </div>
              <Link
                href="/customers/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                + 고객 등록하기
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {customers.map((c) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="group flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl px-4 py-3.5 transition-all"
                >
                  {/* 의지 레벨 인디케이터 */}
                  <div className="flex flex-col gap-0.5">
                    {[5,4,3,2,1].map((n) => (
                      <div
                        key={n}
                        className={`w-1 h-1 rounded-full transition-colors ${
                          (c.purchase_intent ?? 0) >= n ? 'bg-blue-500' : 'bg-[#2a2a2a]'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 text-sm font-semibold">@{c.mention_name}</span>
                      <IntentBadge level={c.purchase_intent} />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {c.preferred_area && (
                        <span className="text-xs text-[#666]">📍 {c.preferred_area}</span>
                      )}
                      {c.purchase_purpose && (
                        <span className="text-xs text-[#666]">{c.purchase_purpose}</span>
                      )}
                      {c.available_cash && (
                        <span className="text-xs text-[#666]">{c.available_cash}억</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[#333] group-hover:text-[#555] transition-colors text-sm">›</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
