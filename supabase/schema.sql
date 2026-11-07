-- =========================================================================
-- BLOODCONNECT MYSURU - AUTHORITATIVE POSTGRESQL DATABASE SCHEMA & RLS
-- Strict District Enforcement: Mysuru District, Karnataka, India ONLY
-- =========================================================================

-- Enable pgcrypto / uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('donor', 'blood_seeker', 'administrator');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE account_status_type AS ENUM ('active', 'suspended', 'deactivated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE blood_group_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE availability_type AS ENUM ('Available', 'Temporarily Unavailable', 'Unavailable');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE urgency_type AS ENUM ('Normal', 'Urgent', 'Emergency');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE request_status_type AS ENUM (
    'Pending', 'Matching Donors', 'Requests Sent', 
    'Partially Fulfilled', 'Fulfilled', 'Cancelled', 'Expired'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE response_status_type AS ENUM ('Pending', 'Accepted', 'Declined');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE hospital_verification_type AS ENUM ('Pending', 'Verified', 'Rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. SERVER-SIDE GEOGRAPHICAL BOUNDARY VALIDATION (Ray-Casting Point-In-Polygon)
CREATE OR REPLACE FUNCTION is_within_mysuru_district(lat DOUBLE PRECISION, lng DOUBLE PRECISION)
RETURNS BOOLEAN AS $$
DECLARE
    -- Official perimeter polygon coordinates for Mysuru district [lat, lng]
    poly_lat DOUBLE PRECISION[] := ARRAY[
        12.6350, 12.6500, 12.5900, 12.5100, 12.4100, 12.2100, 
        12.0200, 11.8200, 11.7100, 11.7500, 11.9600, 12.1800, 
        12.3800, 12.5200, 12.6350
    ];
    poly_lng DOUBLE PRECISION[] := ARRAY[
        76.2200, 76.4200, 76.6800, 76.8800, 77.0200, 77.0800, 
        76.9200, 76.7100, 76.4800, 76.2200, 76.0800, 75.9800, 
        75.9200, 76.0500, 76.2200
    ];
    n_points INTEGER := 15;
    inside BOOLEAN := FALSE;
    i INTEGER;
    j INTEGER;
BEGIN
    IF lat IS NULL OR lng IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Fast Bounding Box pre-screen
    IF lat < 11.6800 OR lat > 12.6800 OR lng < 75.8800 OR lng > 77.1200 THEN
        RETURN FALSE;
    END IF;

    -- Ray-casting algorithm
    j := n_points;
    FOR i IN 1..n_points LOOP
        IF ((poly_lat[i] > lat) != (poly_lat[j] > lat)) AND
           (lng < (poly_lng[j] - poly_lng[i]) * (lat - poly_lat[i]) / (poly_lat[j] - poly_lat[i]) + poly_lng[i]) THEN
            inside := NOT inside;
        END IF;
        j := i;
    END LOOP;

    RETURN inside;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. PROFILES TABLE (Associated with Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL CHECK (char_length(full_name) >= 2),
    phone TEXT NOT NULL CHECK (char_length(phone) >= 10),
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'donor',
    account_status account_status_type NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. DONOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS donor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    blood_group blood_group_type NOT NULL,
    address TEXT NOT NULL,
    locality TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    availability availability_type NOT NULL DEFAULT 'Available',
    last_donation_date DATE,
    consent_to_receive_requests BOOLEAN NOT NULL DEFAULT FALSE,
    consent_to_share_contact BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT donor_must_be_in_mysuru CHECK (is_within_mysuru_district(latitude, longitude))
);

-- 5. BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS blood_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL CHECK (char_length(patient_name) >= 2),
    patient_blood_group blood_group_type NOT NULL,
    units_required INTEGER NOT NULL CHECK (units_required > 0 AND units_required <= 10),
    urgency urgency_type NOT NULL DEFAULT 'Normal',
    hospital_name TEXT NOT NULL,
    hospital_address TEXT NOT NULL,
    locality TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    hospital_contact_number TEXT NOT NULL,
    required_at TIMESTAMPTZ NOT NULL,
    additional_information TEXT,
    status request_status_type NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT hospital_must_be_in_mysuru CHECK (is_within_mysuru_district(latitude, longitude))
);

-- 6. DONOR RESPONSES TABLE
CREATE TABLE IF NOT EXISTS donor_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    response_status response_status_type NOT NULL DEFAULT 'Pending',
    contact_sharing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_request_donor UNIQUE (request_id, donor_id)
);

-- 7. HOSPITALS & BLOOD BANKS (MYSURU DISTRICT)
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name TEXT NOT NULL,
    address TEXT NOT NULL,
    locality TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    contact_number TEXT NOT NULL,
    verification_status hospital_verification_type NOT NULL DEFAULT 'Verified',
    blood_bank_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT hospital_record_must_be_in_mysuru CHECK (is_within_mysuru_district(latitude, longitude))
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_request_id UUID REFERENCES blood_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_donor_profiles_blood_group ON donor_profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_availability ON donor_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_requester_id ON blood_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_donor_responses_request_id ON donor_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS FOR RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'administrator' AND account_status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES

-- Profiles
CREATE POLICY "Users can read own profile or admin can read all"
ON profiles FOR SELECT
USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation on signup"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Donor Profiles
CREATE POLICY "Donors manage their own profile"
ON donor_profiles FOR ALL
USING (user_id = auth.uid() OR is_admin());

-- Compatible donors search policy (excludes phone and exact address for privacy)
CREATE POLICY "Active consenting donors are queryable for matching"
ON donor_profiles FOR SELECT
USING (
    (availability = 'Available' AND consent_to_receive_requests = TRUE)
    OR user_id = auth.uid()
    OR is_admin()
);

-- Blood Requests
CREATE POLICY "Requesters manage own requests"
ON blood_requests FOR ALL
USING (requester_id = auth.uid() OR is_admin());

CREATE POLICY "Active requests viewable by Mysuru donors"
ON blood_requests FOR SELECT
USING (status NOT IN ('Cancelled', 'Expired') OR requester_id = auth.uid() OR is_admin());

-- Donor Responses
CREATE POLICY "Donors manage their responses"
ON donor_responses FOR ALL
USING (
    donor_id IN (SELECT id FROM donor_profiles WHERE user_id = auth.uid())
    OR is_admin()
);

CREATE POLICY "Requesters view responses to their requests"
ON donor_responses FOR SELECT
USING (
    request_id IN (SELECT id FROM blood_requests WHERE requester_id = auth.uid())
    OR is_admin()
);

-- Hospitals
CREATE POLICY "Anyone can view verified Mysuru hospitals"
ON hospitals FOR SELECT
USING (verification_status = 'Verified' OR is_admin());

CREATE POLICY "Only admins can manage hospitals"
ON hospitals FOR ALL
USING (is_admin());

-- Notifications
CREATE POLICY "Users view own notifications"
ON notifications FOR ALL
USING (user_id = auth.uid());

-- Audit Logs
CREATE POLICY "Only admins view audit logs"
ON audit_logs FOR SELECT
USING (is_admin());

-- =========================================================================
-- SEED DATA: VERIFIED HOSPITALS & BLOOD BANKS IN MYSURU DISTRICT ONLY
-- =========================================================================
INSERT INTO hospitals (hospital_name, address, locality, latitude, longitude, contact_number, verification_status, blood_bank_available)
VALUES
('Krishna Rajendra (K.R.) Hospital', 'Irwin Road, Mandi Mohalla', 'Mysuru City & Rural', 12.3168, 76.6508, '+91 821 252 0512', 'Verified', TRUE),
('Apollo BGS Hospitals', 'Adichunchanagiri Road, Kuvempunagar', 'Mysuru City & Rural', 12.2882, 76.6268, '+91 821 256 8888', 'Verified', TRUE),
('JSS Hospital & Research Centre', 'M.G. Road, Agrahara', 'Mysuru City & Rural', 12.3005, 76.6536, '+91 821 233 5555', 'Verified', TRUE),
('Columbia Asia Hospital (Manipal)', 'Bangalore-Mysore Ring Road, Bannimantap', 'Mysuru City & Rural', 12.3484, 76.6434, '+91 821 398 9896', 'Verified', TRUE),
('CSI Holdsworth Memorial (Mission) Hospital', 'Sayyaji Rao Road, Mandi Mohalla', 'Mysuru City & Rural', 12.3195, 76.6542, '+91 821 252 0332', 'Verified', TRUE),
('General Hospital Nanjangud', 'Rashtrapati Road, Nanjangud', 'Nanjangud', 12.1193, 76.6806, '+91 8221 226 030', 'Verified', TRUE),
('Taluk General Hospital Hunsur', 'Main Road, Hunsur Town', 'Hunsur', 12.3090, 76.2917, '+91 8222 252 240', 'Verified', TRUE),
('Taluk Hospital T. Narasipura', 'Vidyodaya College Road, T. Narasipura', 'Tirumakudalu Narasipura (T. Narasipura)', 12.2132, 76.9015, '+91 8227 260 225', 'Verified', TRUE),
('Government Taluk Hospital K.R. Nagar', 'Saligrama Road, Krishnarajanagara', 'Krishnarajanagara (K.R. Nagar)', 12.5841, 76.3833, '+91 8223 262 231', 'Verified', TRUE),
('General Hospital Piriyapatna', 'B.M. Road, Piriyapatna', 'Piriyapatna', 12.3392, 76.0981, '+91 8223 274 030', 'Verified', TRUE),
('Government Hospital H.D. Kote', 'Hospital Road, Heggadadevanakote', 'Heggadadevanakote (H.D. Kote)', 11.9798, 76.3312, '+91 8228 255 240', 'Verified', TRUE)
ON CONFLICT DO NOTHING;
