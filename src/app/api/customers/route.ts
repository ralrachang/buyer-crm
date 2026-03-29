import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get('sort') ?? 'created_desc'
  const search = searchParams.get('search')?.trim() ?? ''

  const supabase = createServerSupabase()
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
    case 'created_desc':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: '고객 목록을 불러오지 못했습니다.' }, { status: 500 })
  }
  return NextResponse.json(data)
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
