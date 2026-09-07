CREATE SCHEMA IF NOT EXISTS mymatchiq;

CREATE OR REPLACE FUNCTION mymatchiq.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS mymatchiq.profiles (
  user_id uuid PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free','premier','elite')),
  locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en','es','fr')),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','pending','verified','rejected','expired')),
  onboarding_complete boolean NOT NULL DEFAULT false,
  privacy_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mymatchiq.compatibility_passports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  assessment_version text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','complete','archived')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, assessment_version),
  CHECK ((status = 'complete' AND completed_at IS NOT NULL) OR status <> 'complete')
);

CREATE TABLE IF NOT EXISTS mymatchiq.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_version text NOT NULL,
  question_key text NOT NULL,
  tier_scope text NOT NULL CHECK (tier_scope IN ('free','premier','elite')),
  position integer NOT NULL CHECK (position > 0),
  prompt_i18n jsonb NOT NULL,
  answer_options jsonb NOT NULL,
  scoring_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_version, question_key),
  UNIQUE (assessment_version, tier_scope, position)
);

CREATE TABLE IF NOT EXISTS mymatchiq.assessment_answers (
  passport_id uuid NOT NULL REFERENCES mymatchiq.compatibility_passports(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES mymatchiq.assessment_questions(id) ON DELETE RESTRICT,
  answer_value jsonb NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (passport_id, question_id)
);

CREATE TABLE IF NOT EXISTS mymatchiq.scan_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type text NOT NULL CHECK (scan_type IN ('single','dual')),
  requester_user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  counterpart_user_id uuid REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','waiting_consent','ready','computed','declined','expired','cancelled','blocked_incomplete')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (counterpart_user_id IS NULL OR counterpart_user_id <> requester_user_id)
);

CREATE TABLE IF NOT EXISTS mymatchiq.dual_scan_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL UNIQUE REFERENCES mymatchiq.scan_requests(id) ON DELETE CASCADE,
  inviter_user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  invitee_user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired','revoked')),
  expires_at timestamptz NOT NULL,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (invitee_user_id <> inviter_user_id)
);

CREATE TABLE IF NOT EXISTS mymatchiq.consent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES mymatchiq.scan_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  consent_scope text NOT NULL CHECK (consent_scope IN ('dual_scan','compatibility_share','connection')),
  action text NOT NULL CHECK (action IN ('granted','declined','revoked')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mymatchiq.compatibility_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL UNIQUE REFERENCES mymatchiq.scan_requests(id) ON DELETE CASCADE,
  score numeric(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  algorithm_version text NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mymatchiq.verification_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending','verified','rejected','expired')),
  provider_reference text,
  verified_at timestamptz,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mymatchiq.compatibility_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  viewer_user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (owner_user_id <> viewer_user_id),
  UNIQUE (owner_user_id, viewer_user_id)
);

CREATE TABLE IF NOT EXISTS mymatchiq.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiated_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  user_a uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  scan_id uuid REFERENCES mymatchiq.scan_requests(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','cancelled')),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_a <> user_b),
  CHECK (initiated_by IN (user_a, user_b))
);

CREATE TABLE IF NOT EXISTS mymatchiq.o2ol_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_request_id uuid NOT NULL UNIQUE REFERENCES mymatchiq.connection_requests(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ready' CHECK (status IN ('ready','issued','completed','expired')),
  handoff_reference text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mymatchiq.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mymatchiq.legal_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('terms','privacy','safety')),
  document_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, document_type, document_version)
);

CREATE TABLE IF NOT EXISTS mymatchiq.audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_passports_user_status ON mymatchiq.compatibility_passports(user_id, status);
CREATE INDEX IF NOT EXISTS idx_answers_passport ON mymatchiq.assessment_answers(passport_id);
CREATE INDEX IF NOT EXISTS idx_scans_requester ON mymatchiq.scan_requests(requester_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_counterpart ON mymatchiq.scan_requests(counterpart_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dual_invite_invitee_status ON mymatchiq.dual_scan_invitations(invitee_user_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_consent_scan ON mymatchiq.consent_events(scan_id, created_at);
CREATE INDEX IF NOT EXISTS idx_verification_user ON mymatchiq.verification_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connections_users ON mymatchiq.connection_requests(user_a, user_b, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_created ON mymatchiq.audit_events(user_id, created_at DESC);

DROP TRIGGER IF EXISTS profiles_set_updated_at ON mymatchiq.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON mymatchiq.profiles FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();
DROP TRIGGER IF EXISTS passports_set_updated_at ON mymatchiq.compatibility_passports;
CREATE TRIGGER passports_set_updated_at BEFORE UPDATE ON mymatchiq.compatibility_passports FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();
DROP TRIGGER IF EXISTS questions_set_updated_at ON mymatchiq.assessment_questions;
CREATE TRIGGER questions_set_updated_at BEFORE UPDATE ON mymatchiq.assessment_questions FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();
DROP TRIGGER IF EXISTS answers_set_updated_at ON mymatchiq.assessment_answers;
CREATE TRIGGER answers_set_updated_at BEFORE UPDATE ON mymatchiq.assessment_answers FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();
DROP TRIGGER IF EXISTS scans_set_updated_at ON mymatchiq.scan_requests;
CREATE TRIGGER scans_set_updated_at BEFORE UPDATE ON mymatchiq.scan_requests FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();
DROP TRIGGER IF EXISTS dual_invites_set_updated_at ON mymatchiq.dual_scan_invitations;
CREATE TRIGGER dual_invites_set_updated_at BEFORE UPDATE ON mymatchiq.dual_scan_invitations FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();
DROP TRIGGER IF EXISTS verification_set_updated_at ON mymatchiq.verification_records;
CREATE TRIGGER verification_set_updated_at BEFORE UPDATE ON mymatchiq.verification_records FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();
DROP TRIGGER IF EXISTS shares_set_updated_at ON mymatchiq.compatibility_shares;
CREATE TRIGGER shares_set_updated_at BEFORE UPDATE ON mymatchiq.compatibility_shares FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();
DROP TRIGGER IF EXISTS connections_set_updated_at ON mymatchiq.connection_requests;
CREATE TRIGGER connections_set_updated_at BEFORE UPDATE ON mymatchiq.connection_requests FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();
DROP TRIGGER IF EXISTS handoffs_set_updated_at ON mymatchiq.o2ol_handoffs;
CREATE TRIGGER handoffs_set_updated_at BEFORE UPDATE ON mymatchiq.o2ol_handoffs FOR EACH ROW EXECUTE FUNCTION mymatchiq.set_updated_at();

CREATE OR REPLACE FUNCTION mymatchiq.user_has_complete_passport(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM mymatchiq.compatibility_passports p
    WHERE p.user_id = p_user_id
      AND p.status = 'complete'
  );
$$;

CREATE OR REPLACE FUNCTION mymatchiq.dual_scan_is_ready(p_scan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM mymatchiq.scan_requests s
    JOIN mymatchiq.dual_scan_invitations i ON i.scan_id = s.id
    WHERE s.id = p_scan_id
      AND s.scan_type = 'dual'
      AND i.status = 'accepted'
      AND i.expires_at > now()
      AND mymatchiq.user_has_complete_passport(s.requester_user_id)
      AND mymatchiq.user_has_complete_passport(s.counterpart_user_id)
  );
$$;
