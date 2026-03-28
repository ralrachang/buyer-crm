import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

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
