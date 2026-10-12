-- HealthCard Initial Schema v1.0
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_id VARCHAR(11) UNIQUE NOT NULL, -- 10 digits 5-5 format e.g. 74839 16251
  full_name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  blood_group VARCHAR(10),
  address JSONB,
  emergency_contact JSONB,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  health_id VARCHAR(11) NOT NULL,
  serial_number VARCHAR(50) UNIQUE NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  template_id VARCHAR(50) DEFAULT 'teal_standard',
  status VARCHAR(20) DEFAULT 'Issued',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  blocked_at TIMESTAMPTZ,
  blocked_reason TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target TEXT,
  ip_address VARCHAR(45),
  status VARCHAR(20) DEFAULT 'Success'
);
