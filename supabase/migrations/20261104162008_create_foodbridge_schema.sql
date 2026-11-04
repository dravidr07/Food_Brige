/*
# FoodBridge Database Schema

## Overview
Creates the core data model for the FoodBridge food-rescue platform.
This is a single-tenant (no auth) prototype app — no sign-in screen exists,
so all policies use `TO anon, authenticated` with `USING (true)` because
the data is intentionally public/shared for the demo.

## New Tables

1. **donors** — Food donors (restaurants, cafes, households)
   - id (uuid PK)
   - name (text)
   - avatar (text — initials used in UI)
   - role (text — 'restaurant' | 'cafe' | 'household' | 'grocer')
   - city (text)
   - region (text)
   - meals_donated (int — total meals donated)
   - streak_days (int — consecutive donation days)
   - badges (text[] — earned badge keys)
   - created_at (timestamptz)

2. **volunteers** — Delivery volunteers
   - id (uuid PK)
   - name (text)
   - avatar (text — initials)
   - city (text)
   - region (text)
   - meals_delivered (int — total meals delivered)
   - streak_days (int)
   - badges (text[])
   - created_at (timestamptz)

3. **donations** — Food donation listings
   - id (uuid PK)
   - donor_name (text)
   - food_type (text — 'Cooked Meals' | 'Fresh Produce' | 'Packaged Items' | 'Bakery' | 'Beverages')
   - quantity (int — portions)
   - pickup_location (text)
   - status (text — 'available' | 'matched' | 'picked_up' | 'delivered')
   - notes (text)
   - created_at (timestamptz)

4. **partners** — NGO / shelter partner organizations
   - id (uuid PK)
   - org_name (text)
   - contact_name (text)
   - email (text)
   - phone (text)
   - org_type (text — 'NGO' | 'Shelter' | 'Food Bank' | 'Community Center')
   - service_area (text)
   - daily_capacity (int — meals per day)
   - created_at (timestamptz)

5. **conversations** — Message threads between users
   - id (uuid PK)
   - participant_name (text — the other party's name)
   - participant_role (text — 'donor' | 'volunteer' | 'ngo' | 'restaurant')
   - last_message (text — preview text)
   - unread_count (int)
   - created_at (timestamptz)
   - updated_at (timestamptz)

6. **messages** — Individual messages within conversations
   - id (uuid PK)
   - conversation_id (uuid FK → conversations.id ON DELETE CASCADE)
   - from_me (boolean — whether the current user sent it)
   - text (text)
   - read (boolean)
   - created_at (timestamptz)

## Security
- RLS enabled on all tables.
- CRUD granted to `anon, authenticated` on all tables (single-tenant, no auth).
- All policies use `USING (true)` / `WITH CHECK (true)` because the prototype
  data is intentionally public and shared — no user isolation is needed.
- service_role granted on all tables for edge-function access if needed later.

## Indexes
- Index on donations.status for filtering available donations
- Index on messages.conversation_id for thread lookups
- Index on donors.region and volunteers.region for leaderboard filtering
*/

-- ===== DONORS =====
CREATE TABLE IF NOT EXISTS donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'restaurant',
  city text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  meals_donated integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  badges text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON donors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON donors TO service_role;
CREATE INDEX IF NOT EXISTS idx_donors_region ON donors(region);

DROP POLICY IF EXISTS "anon_select_donors" ON donors;
CREATE POLICY "anon_select_donors" ON donors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_donors" ON donors;
CREATE POLICY "anon_insert_donors" ON donors FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_donors" ON donors;
CREATE POLICY "anon_update_donors" ON donors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_donors" ON donors;
CREATE POLICY "anon_delete_donors" ON donors FOR DELETE TO anon, authenticated USING (true);

-- ===== VOLUNTEERS =====
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  meals_delivered integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  badges text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON volunteers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON volunteers TO service_role;
CREATE INDEX IF NOT EXISTS idx_volunteers_region ON volunteers(region);

DROP POLICY IF EXISTS "anon_select_volunteers" ON volunteers;
CREATE POLICY "anon_select_volunteers" ON volunteers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_volunteers" ON volunteers;
CREATE POLICY "anon_insert_volunteers" ON volunteers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_volunteers" ON volunteers;
CREATE POLICY "anon_update_volunteers" ON volunteers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_volunteers" ON volunteers;
CREATE POLICY "anon_delete_volunteers" ON volunteers FOR DELETE TO anon, authenticated USING (true);

-- ===== DONATIONS =====
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  food_type text NOT NULL DEFAULT 'Cooked Meals',
  quantity integer NOT NULL DEFAULT 0,
  pickup_location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'available',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON donations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON donations TO service_role;
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

DROP POLICY IF EXISTS "anon_select_donations" ON donations;
CREATE POLICY "anon_select_donations" ON donations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_donations" ON donations;
CREATE POLICY "anon_insert_donations" ON donations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_donations" ON donations;
CREATE POLICY "anon_update_donations" ON donations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_donations" ON donations;
CREATE POLICY "anon_delete_donations" ON donations FOR DELETE TO anon, authenticated USING (true);

-- ===== PARTNERS =====
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  org_type text NOT NULL DEFAULT 'NGO',
  service_area text NOT NULL DEFAULT '',
  daily_capacity integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON partners TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON partners TO service_role;

DROP POLICY IF EXISTS "anon_select_partners" ON partners;
CREATE POLICY "anon_select_partners" ON partners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_partners" ON partners;
CREATE POLICY "anon_insert_partners" ON partners FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_partners" ON partners;
CREATE POLICY "anon_update_partners" ON partners FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_partners" ON partners;
CREATE POLICY "anon_delete_partners" ON partners FOR DELETE TO anon, authenticated USING (true);

-- ===== CONVERSATIONS =====
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_name text NOT NULL,
  participant_role text NOT NULL DEFAULT 'donor',
  participant_avatar text NOT NULL DEFAULT '',
  last_message text NOT NULL DEFAULT '',
  unread_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO service_role;

DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;
CREATE POLICY "anon_delete_conversations" ON conversations FOR DELETE TO anon, authenticated USING (true);

-- ===== MESSAGES =====
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  from_me boolean NOT NULL DEFAULT false,
  text text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO service_role;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE TO anon, authenticated USING (true);
