import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import CustomerForm from '@/components/CustomerForm'

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerSupabase()

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !customer) notFound()

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5]">
      <header className="bg-[#0f0f0f] border-b border-[#1e1e1e] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/customers/${id}`} className="text-[#555] hover:text-[#888] transition-colors text-lg">←</Link>
          <h1 className="text-sm font-semibold text-[#f5f5f5]">고객 편집</h1>
          <span className="text-xs text-[#555]">@{customer.mention_name}</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-5">
        <CustomerForm initial={customer} customerId={id} />
      </main>
    </div>
  )
}
