'use client'

import { useState } from 'react'

interface Props {
  customerId: string
  onAdded: () => void
}

export default function TimelineForm({ customerId, onAdded }: Props) {
  const [content, setContent] = useState('')
  const [mention, setMention] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch(`/api/customers/${customerId}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mention: mention.trim() || null, content: content.trim() }),
    })

    if (res.ok) {
      setContent('')
      setMention('')
      onAdded()
    } else {
      const data = await res.json()
      setError(data.error || '등록에 실패했습니다.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
      <div className="mb-3">
        <input
          value={mention}
          onChange={(e) => setMention(e.target.value)}
          placeholder="@멘션 (매물명, 위치 등 — 선택)"
          className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f5f5] placeholder-[#444] outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>
      <div className="mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="상담 내용을 입력하세요..."
          required
          rows={3}
          className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f5f5] placeholder-[#444] outline-none focus:border-blue-500/50 transition-colors resize-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e) }}
        />
      </div>
      {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#444]">Cmd+Enter로 빠른 저장</p>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-[#2a2a2a] disabled:text-[#555] text-white text-xs font-medium rounded-lg transition-colors"
        >
          {loading ? '저장 중...' : '기록 추가'}
        </button>
      </div>
    </form>
  )
}
