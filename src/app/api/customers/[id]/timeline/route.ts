import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('timeline_entries')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: '타임라인을 불러오지 못했습니다.' }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { mention, content } = await request.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 })
  }

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('timeline_entries')
    .insert([{ customer_id: id, mention: mention || null, content: content.trim() }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '타임라인 등록에 실패했습니다.' }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: customerId } = await params
  const { searchParams } = new URL(request.url)
  const entryId = searchParams.get('entryId')

  if (!entryId) {
    return NextResponse.json({ error: 'entryId가 필요합니다.' }, { status: 400 })
  }

  const supabase = createServerSupabase()
  const { error } = await supabase
    .from('timeline_entries')
    .delete()
    .eq('id', entryId)
    .eq('customer_id', customerId)

  if (error) {
    return NextResponse.json({ error: '타임라인 삭제에 실패했습니다.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
