import Link from 'next/link'
import CustomerForm from '@/components/CustomerForm'

export default function NewCustomerPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5]">
      <header className="bg-[#0f0f0f] border-b border-[#1e1e1e] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/customers" className="text-[#555] hover:text-[#888] transition-colors text-lg">←</Link>
          <h1 className="text-sm font-semibold text-[#f5f5f5]">고객 등록</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-5">
        <CustomerForm />
      </main>
    </div>
  )
}
