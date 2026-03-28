'use client'

import { useState } from 'react'
import { TimelineEntry as TEntry } from '@/types'

interface Props {
  entry: TEntry
  customerId: string
  onDeleted: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TimelineEntry({ entry, customerId, onDeleted }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await fetch(`/api/customers/${customerId}/timeline?entryId=${entry.id}`, { method: 'DELETE' })
    onDeleted()
  }

  return (
    <div className="relative pl-5 pb-4 last:pb-0">
      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500/60 ring-2 ring-[#0f0f0f]" />
      <div className="absolute left-0.75 top-4 bottom-0 w-px bg-[#2a2a2a] last:hidden" />

      <div className="bg-[#1a1a1a] hover:bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 transition-colors">
        {entry.mention && (
          <p className="text-xs font-semibold text-blue-400 mb-2">{entry.mention}</p>
        )}
        <p className="text-sm text-[#ccc] whitespace-pre-wrap leading-relaxed">{entry.content}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-[#444]">{formatDate(entry.created_at)}</span>
          <div className="flex items-center gap-2">
            {confirmDelete && !deleting && (
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#555] hover:text-[#888]">
                취소
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`text-xs transition-colors ${
                confirmDelete ? 'text-red-400 hover:text-red-300' : 'text-[#444] hover:text-[#666]'
              }`}
            >
              {deleting ? '삭제 중...' : confirmDelete ? '확인' : '삭제'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
