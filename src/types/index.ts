export interface Customer {
  id: string
  mention_name: string
  name: string
  purchase_purpose: string | null
  purchase_intent: number | null
  available_cash: number | null
  preferred_area: string | null
  customer_concept: string | null
  occupation: string | null
  age: number | null
  has_corporation: boolean | null
  created_at: string
  updated_at: string
}

export interface TimelineEntry {
  id: string
  customer_id: string
  mention: string | null
  content: string
  created_at: string
}

export type CustomerFormData = Omit<Customer, 'id' | 'created_at' | 'updated_at'>
