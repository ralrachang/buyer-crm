import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') ?? 10)

  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('timeline_entries')
    .select('id, customer_id, mention, content, created_at, customers(mention_name, name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: '최근 기록을 불러오지 못했습니다.' }, { status: 500 })
  }
  return NextResponse.json(data)
}
