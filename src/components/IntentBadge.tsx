const INTENT_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: '관망', color: 'bg-[#2a2a2a] text-[#666]' },
  2: { label: '검토중', color: 'bg-yellow-500/10 text-yellow-500' },
  3: { label: '관심', color: 'bg-blue-500/10 text-blue-400' },
  4: { label: '적극검토', color: 'bg-orange-500/10 text-orange-400' },
  5: { label: '계약대기', color: 'bg-green-500/10 text-green-400' },
}

export default function IntentBadge({ level }: { level: number | null }) {
  if (!level) return null
  const { label, color } = INTENT_LABELS[level] ?? { label: `Lv${level}`, color: 'bg-[#2a2a2a] text-[#666]' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
