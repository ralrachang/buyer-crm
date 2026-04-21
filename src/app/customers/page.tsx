'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Customer } from '@/types'
import IntentBadge from '@/components/IntentBadge'
import QuickTimelineForm from '@/components/QuickTimelineForm'

type SortOption = 'created_desc' | 'intent_desc' | 'updated_desc' | 'timeline_desc' | 'cash_desc'

const SORT_LABELS: Record<SortOption, string> = {
  timeline_desc: '마지막 타임라인순',
  intent_desc: '매수의지순',
  cash_desc: '보유 현금순',
  created_desc: '등록순',
  updated_desc: '최근 업데이트순',
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '기록 없음'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  const months = Math.floor(days / 30)
  return `${months}개월 전`
}

type RecentTimelineEntry = {
  id: string
  customer_id: string
  mention: string | null
  content: string
  created_at: string
  customers: { mention_name: string; name: string } | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [recentEntries, setRecentEntries] = useState<RecentTimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('timeline_desc')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const router = useRouter()

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadCustomers = useCallback(async () => {
    const params = new URLSearchParams()
    params.set('sort', sort)
    if (debouncedSearch) params.set('search', debouncedSearch)
    const res = await fetch(`/api/customers?${params}`)
    if (res.status === 401) { router.push('/'); return }
    if (res.ok) setCustomers(await res.json())
    setLoading(false)
  }, [router, sort, debouncedSearch])

  const loadRecentEntries = useCallback(async () => {
    const res = await fetch('/api/timeline/recent?limit=10')
    if (res.ok) setRecentEntries(await res.json())
  }, [])

  useEffect(() => { loadCustomers() }, [loadCustomers])
  useEffect(() => { loadRecentEntries() }, [loadRecentEntries])

  const handleAdded = useCallback(() => {
    loadCustomers()
    loadRecentEntries()
  }, [loadCustomers, loadRecentEntries])

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
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
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

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* 빠른 기록 폼 */}
        {customers.length > 0 && (
          <QuickTimelineForm customers={customers} onAdded={handleAdded} />
        )}

        {/* 최근 기록 */}
        {recentEntries.length > 0 && (
          <section className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#ccc]">📝 최근 기록</h2>
              <span className="text-xs text-[#555]">최근 10개</span>
            </div>
            <ul className="space-y-2">
              {recentEntries.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/customers/${entry.customer_id}`}
                    className="block group bg-[#1a1a1a] hover:bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-3 py-2 transition-all"
                  >
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-blue-400 text-sm font-semibold shrink-0">
                        @{entry.customers?.mention_name ?? '삭제됨'}
                      </span>
                      <span className="text-xs text-[#555] shrink-0">
                        {formatRelativeDate(entry.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[#ccc] line-clamp-2 whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 검색 + 정렬 */}
        <section className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="고객명, 지역, 컨셉 검색..."
              className="w-full pl-9 pr-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-[#f5f5f5] placeholder-[#444] outline-none focus:border-blue-500/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] text-xs"
              >✕</button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-[#ccc] outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer sm:w-44"
          >
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </section>

        {/* 고객 목록 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#555] font-medium">
              {debouncedSearch ? '검색 결과' : '전체 고객'} <span className="text-[#888]">{customers.length}명</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {customers.map((c) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="group bg-[#1a1a1a] hover:bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-3 py-2.5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {/* 의지 레벨 인디케이터 */}
                    <div className="flex flex-col gap-px">
                      {[5,4,3,2,1].map((n) => (
                        <div
                          key={n}
                          className={`w-1 h-1 rounded-full ${
                            (c.purchase_intent ?? 0) >= n ? 'bg-blue-500' : 'bg-[#2a2a2a]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-blue-400 text-base font-semibold truncate">@{c.mention_name}</span>
                    <IntentBadge level={c.purchase_intent} />
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm text-[#666] mb-1.5">
                    {c.preferred_area && <span>📍{c.preferred_area}</span>}
                    {c.purchase_purpose && <span>{c.purchase_purpose}</span>}
                    {c.available_cash && <span>{c.available_cash}억</span>}
                  </div>
                  <div className="text-sm text-[#555]">
                    {c.last_timeline_at
                      ? <span>최근 기록: {formatRelativeDate(c.last_timeline_at)}</span>
                      : <span className="text-[#333]">기록 없음</span>
                    }
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
