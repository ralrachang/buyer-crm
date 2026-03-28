import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '고객을 찾을 수 없습니다.' }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('customers')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '고객 정보 수정에 실패했습니다.' }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerSupabase()

  const { error } = await supabase.from('customers').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: '고객 삭제에 실패했습니다.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
