'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Customer, TimelineEntry } from '@/types'
import IntentBadge from '@/components/IntentBadge'
import TimelineForm from '@/components/TimelineForm'
import TimelineEntryCard from '@/components/TimelineEntry'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function loadTimeline() {
    const res = await fetch(`/api/customers/${id}/timeline`)
    if (res.ok) setTimeline(await res.json())
  }

  const load = useCallback(async () => {
    const [cRes, tRes] = await Promise.all([
      fetch(`/api/customers/${id}`),
      fetch(`/api/customers/${id}/timeline`),
    ])
    if (cRes.status === 401) { router.push('/'); return }
    if (!cRes.ok) { router.push('/customers'); return }
    setCustomer(await cRes.json())
    if (tRes.ok) setTimeline(await tRes.json())
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  async function handleDelete() {
    if (!confirm('이 고객을 삭제하시겠습니까? 타임라인도 모두 삭제됩니다.')) return
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    router.push('/customers')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="flex items-center gap-2 text-[#555]">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">불러오는 중...</span>
      </div>
    </div>
  )
  if (!customer) return null

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5]">
      <header className="bg-[#0f0f0f] border-b border-[#1e1e1e] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/customers" className="text-[#555] hover:text-[#888] transition-colors text-lg">←</Link>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-semibold">@{customer.mention_name}</span>
              <IntentBadge level={customer.purchase_intent} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/customers/${id}/edit`} className="text-xs text-[#555] hover:text-[#888] transition-colors">
              편집
            </Link>
            <button onClick={handleDelete} className="text-xs text-red-500/60 hover:text-red-400 transition-colors">
              삭제
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* 매수의지 레벨 */}
        {customer.purchase_intent && (
          <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#555] uppercase tracking-wider">매수의지</p>
              <IntentBadge level={customer.purchase_intent} />
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (customer.purchase_intent ?? 0) >= n
                const colors = [
                  'bg-[#2a2a2a]',        // inactive
                  'bg-[#555]',            // 1 - 관망
                  'bg-yellow-500',        // 2 - 검토중
                  'bg-blue-500',          // 3 - 관심
                  'bg-orange-500',        // 4 - 적극검토
                  'bg-green-500',         // 5 - 계약대기
                ]
                return (
                  <div
                    key={n}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      active ? colors[n] : 'bg-[#2a2a2a]'
                    }`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-[#444]">관망</span>
              <span className="text-[10px] text-[#444]">계약대기</span>
            </div>
          </section>
        )}

        {/* 프로필 카드 */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <p className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-4">고객 정보</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              { label: '실명', value: customer.name },
              { label: '직업', value: customer.occupation },
              { label: '나이', value: customer.age ? `${customer.age}세` : null },
              { label: '매입 목적', value: customer.purchase_purpose },
              { label: '보유 현금', value: customer.available_cash ? `${customer.available_cash}억원` : null },
              { label: '선호 지역', value: customer.preferred_area },
              { label: '법인 보유', value: customer.has_corporation != null ? (customer.has_corporation ? '있음' : '없음') : null },
            ].filter(i => i.value).map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[#555] mb-0.5">{label}</p>
                <p className="text-sm text-[#ccc]">{value}</p>
              </div>
            ))}
          </div>
          {customer.customer_concept && (
            <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
              <p className="text-xs text-[#555] mb-1">고객 컨셉</p>
              <p className="text-sm text-[#ccc]">{customer.customer_concept}</p>
            </div>
          )}
        </section>

        {/* 타임라인 */}
        <section>
          <p className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">
            상담 타임라인 <span className="text-[#888] normal-case font-normal">{timeline.length}건</span>
          </p>

          <div className="mb-5">
            <TimelineForm customerId={id} onAdded={loadTimeline} />
          </div>

          {timeline.length === 0 ? (
            <p className="text-sm text-[#444] text-center py-8">아직 기록이 없습니다</p>
          ) : (
            <div className="pl-1">
              {timeline.map((entry) => (
                <TimelineEntryCard
                  key={entry.id}
                  entry={entry}
                  customerId={id}
                  onDeleted={loadTimeline}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
