-- Schema generated from shared/schema.ts
-- Requires PostgreSQL with the pgcrypto extension for gen_random_uuid()

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Guarded enum creation to support PostgreSQL versions without CREATE TYPE IF NOT EXISTS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('advertiser', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE ad_type AS ENUM ('banner', 'sidebar', 'inline', 'popup');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('period', 'view');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE ad_status AS ENUM ('pending', 'approved', 'rejected', 'active', 'paused', 'completed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE slot_position AS ENUM ('top', 'bottom', 'right', 'middle');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Tables ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions (expire);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_image_url VARCHAR(1024),
    role user_role NOT NULL DEFAULT 'advertiser',
    company_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_slots (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    ad_type ad_type NOT NULL,
    position slot_position NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1,
    price_per_day NUMERIC(10, 2) NOT NULL,
    price_per_view NUMERIC(10, 4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ads (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(1024),
    ad_type ad_type NOT NULL,
    payment_type payment_type NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    budget NUMERIC(12, 2) NOT NULL,
    target_views INTEGER,
    current_views INTEGER NOT NULL DEFAULT 0,
    status ad_status NOT NULL DEFAULT 'pending',
    estimated_cost NUMERIC(12, 2) NOT NULL,
    actual_cost NUMERIC(12, 2) DEFAULT 0,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_slot_bookings (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id VARCHAR(255) NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    slot_id VARCHAR(255) NOT NULL REFERENCES ad_slots(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_ad_slot UNIQUE (ad_id, slot_id)
);

CREATE INDEX IF NOT EXISTS idx_ad_slot_bookings_ad_id ON ad_slot_bookings (ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_slot_bookings_slot_id ON ad_slot_bookings (slot_id);

CREATE TABLE IF NOT EXISTS ad_views (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id VARCHAR(255) NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(255),
    user_agent VARCHAR(1024),
    referrer VARCHAR(1024)
);

CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON ad_views (ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_viewed_at ON ad_views (viewed_at);
