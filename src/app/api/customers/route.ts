import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get('sort') ?? 'created_desc'
  const search = searchParams.get('search')?.trim() ?? ''

  const supabase = createServerSupabase()

  // 고객 목록 조회
  let query = supabase.from('customers').select('*')

  if (search) {
    query = query.or(
      `mention_name.ilike.%${search}%,name.ilike.%${search}%,preferred_area.ilike.%${search}%,customer_concept.ilike.%${search}%`
    )
  }

  switch (sort) {
    case 'intent_desc':
      query = query.order('purchase_intent', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false })
      break
    case 'updated_desc':
      query = query.order('updated_at', { ascending: false })
      break
    case 'timeline_desc':
      // last_timeline_at은 조인 후 클라이언트에서 정렬하지 않고, 아래에서 수동 정렬
      query = query.order('created_at', { ascending: false })
      break
    case 'cash_desc':
      query = query.order('available_cash', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
      break
    case 'created_desc':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: customers, error } = await query

  if (error) {
    return NextResponse.json({ error: '고객 목록을 불러오지 못했습니다.' }, { status: 500 })
  }

  // 각 고객의 마지막 타임라인 날짜 조회
  const customerIds = (customers ?? []).map((c) => c.id)
  let timelineMap: Record<string, string> = {}

  if (customerIds.length > 0) {
    const { data: timelineData } = await supabase
      .from('timeline_entries')
      .select('customer_id, created_at')
      .in('customer_id', customerIds)
      .order('created_at', { ascending: false })

    if (timelineData) {
      for (const entry of timelineData) {
        if (!timelineMap[entry.customer_id]) {
          timelineMap[entry.customer_id] = entry.created_at
        }
      }
    }
  }

  const result = (customers ?? []).map((c) => ({
    ...c,
    last_timeline_at: timelineMap[c.id] ?? null,
  }))

  // 마지막 타임라인순 정렬 (DB에서 직접 정렬 불가)
  if (sort === 'timeline_desc') {
    result.sort((a, b) => {
      if (!a.last_timeline_at && !b.last_timeline_at) return 0
      if (!a.last_timeline_at) return 1
      if (!b.last_timeline_at) return -1
      return new Date(b.last_timeline_at).getTime() - new Date(a.last_timeline_at).getTime()
    })
  }

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = createServerSupabase()

  // mention_name 중복 확인
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('mention_name', body.mention_name)
    .single()

  if (existing) {
    return NextResponse.json({ error: '이미 같은 @이름의 고객이 있습니다.' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([body])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '고객 등록에 실패했습니다.' }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
