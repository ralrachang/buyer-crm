import { createClient } from '@supabase/supabase-js'

// 서버 전용 클라이언트 (서비스 롤 키 사용)
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

// 클라이언트 전용 (public anon key)
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anonKey)
}
