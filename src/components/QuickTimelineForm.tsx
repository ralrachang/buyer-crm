'use client'

import { useState, useRef, useEffect } from 'react'
import { Customer } from '@/types'

interface Props {
  customers: Customer[]
  onAdded: () => void
}

export default function QuickTimelineForm({ customers, onAdded }: Props) {
  const [query, setQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [content, setContent] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? customers.filter(
        (c) =>
          c.mention_name.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase())
      )
    : customers

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c)
    setQuery(c.mention_name)
    setOpen(false)
    setError('')
  }

  function handleQueryChange(val: string) {
    setQuery(val)
    setSelectedCustomer(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomer) { setError('고객을 목록에서 선택해주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return }
    setLoading(true)
    setError('')

    const res = await fetch(`/api/customers/${selectedCustomer.id}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mention: `@${selectedCustomer.mention_name}`, content: content.trim() }),
    })

    if (res.ok) {
      setContent('')
      setQuery('')
      setSelectedCustomer(null)
      setSuccess(`@${selectedCustomer.mention_name} 타임라인에 기록됐습니다`)
      setTimeout(() => setSuccess(''), 3000)
      onAdded()
    } else {
      const data = await res.json()
      setError(data.error || '등록에 실패했습니다.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
      <p className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-4">빠른 기록</p>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* 고객 선택 */}
        <div className="relative sm:w-52" ref={dropdownRef}>
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
            selectedCustomer
              ? 'border-blue-500/50 bg-blue-500/10'
              : 'border-[#2a2a2a] bg-[#0f0f0f]'
          }`}>
            <span className="text-blue-400 text-sm font-medium">@</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder="고객 검색..."
              className="flex-1 bg-transparent text-sm text-[#f5f5f5] placeholder-[#444] outline-none min-w-0"
            />
            {selectedCustomer && (
              <button
                type="button"
                onClick={() => { setSelectedCustomer(null); setQuery(''); inputRef.current?.focus() }}
                className="text-[#444] hover:text-[#888] text-xs"
              >✕</button>
            )}
          </div>

          {open && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCustomer(c)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#252525] transition-colors text-left"
                >
                  <span className="text-blue-400 text-sm font-medium">@{c.mention_name}</span>
                  {c.preferred_area && (
                    <span className="text-xs text-[#555] truncate">{c.preferred_area}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {open && query && filtered.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-20 px-4 py-3">
              <p className="text-xs text-[#555]">검색 결과 없음</p>
            </div>
          )}
        </div>

        {/* 내용 입력 */}
        <div className="flex-1 flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상담 내용..."
            className="flex-1 px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-sm text-[#f5f5f5] placeholder-[#444] outline-none focus:border-blue-500/50 transition-colors"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }}
          />
          <button
            type="submit"
            disabled={loading || !content.trim() || !selectedCustomer}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-[#2a2a2a] disabled:text-[#555] text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
          >
            {loading ? '...' : '기록'}
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      {success && <p className="mt-3 text-xs text-green-400">✓ {success}</p>}
    </form>
  )
}
