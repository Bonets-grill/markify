export type Plan = 'free' | 'starter' | 'pro' | 'enterprise'
export type UserRole = 'owner' | 'admin' | 'developer' | 'viewer'
export type ContentType = 'text' | 'image' | 'audio' | 'video' | 'document'
export type WatermarkMethod = 'invisible_spectral' | 'invisible_lsb' | 'metadata_c2pa' | 'text_unicode' | 'audio_spectral' | 'combined'
export type WatermarkStrength = 'light' | 'standard' | 'strong'
export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed'
export type CertificateType = 'generation' | 'modification' | 'verification'
export type UsageAction = 'watermark' | 'detect' | 'verify' | 'certificate' | 'label'

export interface Tenant {
  id: string
  name: string
  slug: string
  domain: string | null
  plan: Plan
  api_key_hash: string | null
  api_key_prefix: string | null
  usage_quota_monthly: number
  usage_current_monthly: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  tenant_id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface ApiKey {
  id: string
  tenant_id: string
  name: string
  key_hash: string
  key_prefix: string
  permissions: {
    watermark: boolean
    detect: boolean
    verify: boolean
    certificates: boolean
  }
  last_used_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface ContentItem {
  id: string
  tenant_id: string
  content_type: ContentType
  source_provider: string | null
  source_model: string | null
  original_hash: string
  watermarked_hash: string | null
  file_url: string | null
  file_size_bytes: number | null
  watermark_method: WatermarkMethod | null
  watermark_id: string | null
  watermark_strength: WatermarkStrength
  detection_confidence: number | null
  is_ai_generated: boolean | null
  label_text: string | null
  label_position: string | null
  certificate_id: string | null
  metadata: Record<string, unknown>
  processing_status: ProcessingStatus
  processing_error: string | null
  created_at: string
  updated_at: string
}

export interface Certificate {
  id: string
  tenant_id: string
  content_item_id: string | null
  certificate_type: CertificateType
  issuer: string
  subject_description: string | null
  ai_provider: string | null
  ai_model: string | null
  generation_date: string
  content_hash: string
  watermark_id: string | null
  digital_signature: string
  verification_url: string | null
  c2pa_manifest: Record<string, unknown> | null
  is_valid: boolean
  revoked_at: string | null
  revoked_reason: string | null
  created_at: string
}

export interface DetectionResult {
  id: string
  tenant_id: string | null
  content_type: ContentType
  input_hash: string
  is_ai_generated: boolean | null
  confidence: number | null
  provider_detected: string | null
  model_detected: string | null
  watermark_found: boolean
  watermark_id: string | null
  analysis_details: Record<string, unknown> | null
  processing_time_ms: number | null
  created_at: string
}

export interface UsageLog {
  id: string
  tenant_id: string
  api_key_id: string | null
  action: UsageAction
  content_type: string | null
  file_size_bytes: number | null
  processing_time_ms: number | null
  endpoint: string | null
  status_code: number | null
  created_at: string
}

export interface WebhookSubscription {
  id: string
  tenant_id: string
  url: string
  events: string[]
  secret: string
  is_active: boolean
  last_triggered_at: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  tenant_id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}
