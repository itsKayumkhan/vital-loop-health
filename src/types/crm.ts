export type MembershipTier = 'free' | 'essential' | 'premium' | 'elite';
export type MembershipStatus = 'active' | 'paused' | 'cancelled' | 'expired';
export type PurchaseType = 'subscription' | 'one_time' | 'supplement' | 'service' | 'lab_testing';
export type DocumentType = 'contract' | 'lab_results' | 'health_record' | 'invoice' | 'other';
export type MarketingStatus = 'lead' | 'prospect' | 'customer' | 'churned' | 'vip';

// New program-specific types
export type ProgramType = 'wellness' | 'sleep' | 'mental_performance' | 'bundle';
export type SleepMembershipTier = 'foundational' | 'enhanced' | 'premium';
export type MentalPerformanceMembershipTier = 'cognitive_foundations' | 'performance_optimization' | 'elite_cognition';
export type BundleMembershipTier = 'essential_recovery' | 'performance_recovery' | 'elite_recovery';

export interface CRMClient {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  health_goals: string | null;
  notes: string | null;
  tags: string[];
  marketing_status: MarketingStatus;
  lead_source: string | null;
  referral_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMMembership {
  id: string;
  client_id: string;
  tier: MembershipTier;
  status: MembershipStatus;
  start_date: string;
  end_date: string | null;
  renewal_date: string | null;
  monthly_price: number | null;
  stripe_subscription_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // New program-specific fields
  program_type: ProgramType;
  sleep_tier: SleepMembershipTier | null;
  mental_performance_tier: MentalPerformanceMembershipTier | null;
  bundle_tier: BundleMembershipTier | null;
}

export interface CRMPurchase {
  id: string;
  client_id: string;
  purchase_type: PurchaseType;
  product_name: string;
  description: string | null;
  amount: number;
  currency: string;
  status: string;
  stripe_payment_id: string | null;
  stripe_invoice_id: string | null;
  purchased_at: string;
  created_at: string;
}

export interface CRMDocument {
  id: string;
  client_id: string;
  document_type: DocumentType;
  name: string;
  description: string | null;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  shared_with_client: boolean;
  created_at: string;
  updated_at: string;
}

export interface CRMClientNote {
  id: string;
  client_id: string;
  author_id: string | null;
  note_type: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CRMMarketingCampaign {
  id: string;
  name: string;
  description: string | null;
  campaign_type: string;
  status: string;
  target_segment: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMCampaignEnrollment {
  id: string;
  campaign_id: string;
  client_id: string;
  enrolled_at: string;
  status: string;
  last_interaction: string | null;
  conversion_date: string | null;
  notes: string | null;
}
