'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Customer } from '@/types'

interface Props {
  initial?: Partial<Customer>
  customerId?: string
}

const PURCHASE_PURPOSES = ['임대수익', '개발', '거주', '투자']

export default function CustomerForm({ initial = {}, customerId }: Props) {
  const router = useRouter()
  const isEdit = !!customerId

  const [form, setForm] = useState({
    mention_name: initial.mention_name ?? '',
    name: initial.name ?? '',
    purchase_purpose: initial.purchase_purpose ?? '',
    purchase_intent: initial.purchase_intent?.toString() ?? '',
    available_cash: initial.available_cash?.toString() ?? '',
    preferred_area: initial.preferred_area ?? '',
    customer_concept: initial.customer_concept ?? '',
    occupation: initial.occupation ?? '',
    age: initial.age?.toString() ?? '',
    has_corporation: initial.has_corporation ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      mention_name: form.mention_name.replace(/^@/, '').trim(),
      name: form.name.trim() || form.mention_name.replace(/^@/, '').trim(),
      purchase_purpose: form.purchase_purpose || null,
      purchase_intent: form.purchase_intent ? parseInt(form.purchase_intent) : null,
      available_cash: form.available_cash ? parseFloat(form.available_cash) : null,
      preferred_area: form.preferred_area || null,
      customer_concept: form.customer_concept || null,
      occupation: form.occupation || null,
      age: form.age ? parseInt(form.age) : null,
      has_corporation: form.has_corporation,
    }

    const url = isEdit ? `/api/customers/${customerId}` : '/api/customers'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/customers/${isEdit ? customerId : data.id}`)
    } else {
      const data = await res.json()
      setError(data.error || '저장에 실패했습니다.')
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-sm text-[#f5f5f5] placeholder-[#444] outline-none focus:border-blue-500/60 transition-colors"
  const labelClass = "block text-xs font-medium text-[#555] mb-1.5"
  const sectionClass = "bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 기본 정보 */}
      <section className={sectionClass}>
        <p className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-4">기본 정보</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>@이름 <span className="text-red-400">*</span></label>
              <input
                value={form.mention_name}
                onChange={(e) => set('mention_name', e.target.value)}
                placeholder="김철수"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>실명</label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="김철수"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>직업</label>
              <input value={form.occupation} onChange={(e) => set('occupation', e.target.value)} placeholder="의사" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>나이</label>
              <input type="number" value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="48" min={1} max={120} className={inputClass} />
            </div>
          </div>
        </div>
      </section>

      {/* 매수 정보 */}
      <section className={sectionClass}>
        <p className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-4">매수 정보</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>매입 목적</label>
            <div className="flex flex-wrap gap-2">
              {PURCHASE_PURPOSES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('purchase_purpose', form.purchase_purpose === p ? '' : p)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    form.purchase_purpose === p
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-[#2a2a2a] text-[#666] hover:border-[#3a3a3a] hover:text-[#888]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              매수의지 레벨 {form.purchase_intent && <span className="text-blue-400 font-medium">{form.purchase_intent}</span>}
            </label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('purchase_intent', form.purchase_intent === n.toString() ? '' : n.toString())}
                  className={`flex-1 py-2.5 text-sm rounded-xl border transition-colors font-medium ${
                    form.purchase_intent === n.toString()
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-[#2a2a2a] text-[#555] hover:border-[#3a3a3a] hover:text-[#888]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-[#444]">1 관망 · 2 검토중 · 3 관심 · 4 적극검토 · 5 계약대기</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>보유 현금 (억원)</label>
              <input type="number" value={form.available_cash} onChange={(e) => set('available_cash', e.target.value)} placeholder="30" step="0.5" min={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>선호 지역</label>
              <input value={form.preferred_area} onChange={(e) => set('preferred_area', e.target.value)} placeholder="마포구, 용산구" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>고객 컨셉</label>
            <textarea
              value={form.customer_concept}
              onChange={(e) => set('customer_concept', e.target.value)}
              placeholder="안정적 수익 선호, 리스크 회피형"
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('has_corporation', !form.has_corporation)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.has_corporation ? 'bg-blue-600' : 'bg-[#2a2a2a]'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.has_corporation ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-[#888] cursor-pointer" onClick={() => set('has_corporation', !form.has_corporation)}>
              법인 보유
            </span>
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

      <div className="flex gap-3 pb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 border border-[#2a2a2a] text-[#555] hover:text-[#888] hover:border-[#3a3a3a] text-sm font-medium rounded-xl transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-[#2a2a2a] disabled:text-[#555] text-white text-sm font-medium rounded-xl transition-colors"
        >
          {loading ? '저장 중...' : isEdit ? '수정 완료' : '고객 등록'}
        </button>
      </div>
    </form>
  )
}
