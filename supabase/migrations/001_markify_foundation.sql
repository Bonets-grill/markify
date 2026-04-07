-- Markify Foundation Schema
-- Multi-tenant AI Content Watermarking & Compliance Platform

-- Tenants
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  domain text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','enterprise')),
  api_key_hash text,
  api_key_prefix text,
  usage_quota_monthly int NOT NULL DEFAULT 100,
  usage_current_monthly int NOT NULL DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','admin','developer','viewer')),
  created_at timestamptz DEFAULT now()
);

-- API Keys
CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{"watermark": true, "detect": true, "verify": true, "certificates": true}',
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Content Items
CREATE TABLE content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('text','image','audio','video','document')),
  source_provider text,
  source_model text,
  original_hash text NOT NULL,
  watermarked_hash text,
  file_url text,
  file_size_bytes bigint,
  watermark_method text CHECK (watermark_method IN ('invisible_spectral','invisible_lsb','metadata_c2pa','text_unicode','audio_spectral','combined')),
  watermark_id text UNIQUE,
  watermark_strength text DEFAULT 'standard' CHECK (watermark_strength IN ('light','standard','strong')),
  detection_confidence decimal,
  is_ai_generated boolean,
  label_text text,
  label_position text,
  certificate_id uuid,
  metadata jsonb DEFAULT '{}',
  processing_status text NOT NULL DEFAULT 'queued' CHECK (processing_status IN ('queued','processing','completed','failed')),
  processing_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Certificates
CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  content_item_id uuid REFERENCES content_items(id) ON DELETE SET NULL,
  certificate_type text NOT NULL CHECK (certificate_type IN ('generation','modification','verification')),
  issuer text NOT NULL DEFAULT 'Markify',
  subject_description text,
  ai_provider text,
  ai_model text,
  generation_date timestamptz NOT NULL DEFAULT now(),
  content_hash text NOT NULL,
  watermark_id text,
  digital_signature text NOT NULL,
  verification_url text,
  c2pa_manifest jsonb,
  is_valid boolean DEFAULT true,
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz DEFAULT now()
);

-- Detection Results
CREATE TABLE detection_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('text','image','audio','video')),
  input_hash text NOT NULL,
  is_ai_generated boolean,
  confidence decimal,
  provider_detected text,
  model_detected text,
  watermark_found boolean DEFAULT false,
  watermark_id text,
  analysis_details jsonb,
  processing_time_ms int,
  created_at timestamptz DEFAULT now()
);

-- Usage Logs
CREATE TABLE usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('watermark','detect','verify','certificate','label')),
  content_type text,
  file_size_bytes bigint,
  processing_time_ms int,
  endpoint text,
  status_code int,
  created_at timestamptz DEFAULT now()
);

-- Webhook Subscriptions
CREATE TABLE webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text NOT NULL,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_content_items_tenant ON content_items(tenant_id);
CREATE INDEX idx_content_items_watermark ON content_items(watermark_id);
CREATE INDEX idx_content_items_status ON content_items(processing_status);
CREATE INDEX idx_certificates_tenant ON certificates(tenant_id);
CREATE INDEX idx_certificates_content ON certificates(content_item_id);
CREATE INDEX idx_detection_results_tenant ON detection_results(tenant_id);
CREATE INDEX idx_usage_logs_tenant ON usage_logs(tenant_id);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: scope by tenant
CREATE POLICY "Users see own tenant" ON tenants
  FOR ALL USING (id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users see own profile" ON profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Users see own tenant profiles" ON profiles
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant scoped api_keys" ON api_keys
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant scoped content_items" ON content_items
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant scoped certificates" ON certificates
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant scoped detection_results" ON detection_results
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant scoped usage_logs" ON usage_logs
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant scoped webhook_subscriptions" ON webhook_subscriptions
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant scoped audit_logs" ON audit_logs
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Function: auto-create tenant + profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_tenant_id uuid;
  company text;
  user_name text;
  tenant_slug text;
BEGIN
  company := COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  tenant_slug := LOWER(REGEXP_REPLACE(company, '[^a-zA-Z0-9]', '-', 'g')) || '-' || SUBSTR(NEW.id::text, 1, 8);

  INSERT INTO tenants (name, slug)
  VALUES (company, tenant_slug)
  RETURNING id INTO new_tenant_id;

  INSERT INTO profiles (id, tenant_id, email, full_name, role)
  VALUES (NEW.id, new_tenant_id, NEW.email, user_name, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function: update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
