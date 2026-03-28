-- 매수고객관리 CRM 스키마
-- Supabase Dashboard > SQL Editor 에서 실행하세요

-- 고객 테이블
CREATE TABLE IF NOT EXISTS customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mention_name text NOT NULL UNIQUE,
  name text NOT NULL,
  purchase_purpose text,
  purchase_intent smallint CHECK (purchase_intent BETWEEN 1 AND 5),
  available_cash numeric(10, 2),
  preferred_area text,
  customer_concept text,
  occupation text,
  age smallint CHECK (age > 0 AND age < 150),
  has_corporation boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 타임라인 항목 테이블
CREATE TABLE IF NOT EXISTS timeline_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  mention text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_timeline_customer_id ON timeline_entries(customer_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON timeline_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: service_role 키로만 접근 (미들웨어에서 인증 처리하므로 RLS 비활성화)
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries DISABLE ROW LEVEL SECURITY;
