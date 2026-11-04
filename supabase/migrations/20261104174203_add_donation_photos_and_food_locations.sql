/*
# Add Donation Photos, Food Locations, and Storage Bucket

## Overview
Adds photo support to donations and creates a food_locations table for the
interactive map showing nearby food banks, partner pantries, and drop-off points.
Also creates a public storage bucket for donation photos and seeds locations.

## Changes to Existing Tables
1. **donations** — Added `photo_url` (text, nullable) column to store the
   Supabase Storage public URL of an attached food photo.

## New Tables
2. **food_locations** — Map locations for the interactive map
   - id (uuid PK)
   - name (text — location name, e.g. "Hope Food Bank")
   - type (text — 'food_bank' | 'pantry' | 'drop_off' | 'shelter')
   - address (text)
   - neighborhood (text — for map positioning)
   - city (text)
   - lat (numeric — latitude, nullable for prototype)
   - lng (numeric — longitude, nullable for prototype)
   - map_x (numeric — x position on stylized map 0-100)
   - map_y (numeric — y position on stylized map 0-100)
   - hours (text — operating hours)
   - phone (text)
   - capacity (int — meals per day capacity)
   - active (boolean — whether currently accepting donations)
   - created_at (timestamptz)

## Security
- RLS enabled on food_locations (single-tenant, public data).
- CRUD granted to anon, authenticated on food_locations.
- All policies use USING(true) / WITH CHECK(true) — data is intentionally public.
- Storage: public bucket 'donation-photos' — anyone can read, authenticated can upload.

## Seed Data
- 8 food_locations entries covering food banks, pantries, shelters, and drop-off
  points across the 6 neighborhoods used in the LiveMap.
*/

-- ===== ADD PHOTO_URL TO DONATIONS =====
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations' AND column_name = 'photo_url') THEN
    ALTER TABLE donations ADD COLUMN photo_url text;
  END IF;
END $$;

-- ===== FOOD LOCATIONS TABLE =====
CREATE TABLE IF NOT EXISTS food_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'food_bank',
  address text NOT NULL DEFAULT '',
  neighborhood text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  lat numeric,
  lng numeric,
  map_x numeric NOT NULL DEFAULT 50,
  map_y numeric NOT NULL DEFAULT 50,
  hours text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  capacity integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE food_locations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON food_locations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON food_locations TO service_role;

DROP POLICY IF EXISTS "anon_select_food_locations" ON food_locations;
CREATE POLICY "anon_select_food_locations" ON food_locations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_food_locations" ON food_locations;
CREATE POLICY "anon_insert_food_locations" ON food_locations FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_food_locations" ON food_locations;
CREATE POLICY "anon_update_food_locations" ON food_locations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_food_locations" ON food_locations;
CREATE POLICY "anon_delete_food_locations" ON food_locations FOR DELETE
  TO anon, authenticated USING (true);

-- ===== SEED FOOD LOCATIONS =====
INSERT INTO food_locations (name, type, address, neighborhood, city, map_x, map_y, hours, phone, capacity, active) VALUES
  ('Hope Food Bank', 'food_bank', '123 Riverside Dr', 'Riverside', 'FoodBridge City', 22, 24, 'Mon-Sat 8AM-6PM', '(555) 100-2000', 500, true),
  ('Riverside Community Pantry', 'pantry', '45 River Rd', 'Riverside', 'FoodBridge City', 28, 32, 'Tue-Sun 9AM-5PM', '(555) 100-2001', 150, true),
  ('Old Town Mission Shelter', 'shelter', '88 Heritage St', 'Old Town', 'FoodBridge City', 58, 18, '24/7', '(555) 100-2002', 300, true),
  ('Sunset Food Bank', 'food_bank', '200 Sunset Blvd', 'Sunset Vale', 'FoodBridge City', 82, 56, 'Mon-Fri 7AM-7PM', '(555) 100-2003', 400, true),
  ('Greenfield Collective Drop-Off', 'drop_off', '12 Green Way', 'Greenfield', 'FoodBridge City', 20, 60, 'Daily 6AM-10PM', '(555) 100-2004', 200, true),
  ('Harbor Relief Center', 'shelter', '300 Dock Ave', 'Harbor District', 'FoodBridge City', 56, 52, '24/7', '(555) 100-2005', 350, true),
  ('North Heights Aid Pantry', 'pantry', '77 Cliff Rd', 'North Heights', 'FoodBridge City', 80, 20, 'Wed-Sun 10AM-6PM', '(555) 100-2006', 120, true),
  ('Harvest Kitchen Drop-Off', 'drop_off', '9 Orchard Ln', 'Old Town', 'FoodBridge City', 62, 28, 'Daily 5PM-9PM', '(555) 100-2007', 100, true)
ON CONFLICT DO NOTHING;

-- ===== STORAGE BUCKET FOR DONATION PHOTOS =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('donation-photos', 'donation-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, anyone can upload
DROP POLICY IF EXISTS "public_read_donation_photos" ON storage.objects;
CREATE POLICY "public_read_donation_photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'donation-photos');

DROP POLICY IF EXISTS "public_upload_donation_photos" ON storage.objects;
CREATE POLICY "public_upload_donation_photos" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'donation-photos');

DROP POLICY IF EXISTS "public_update_donation_photos" ON storage.objects;
CREATE POLICY "public_update_donation_photos" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'donation-photos');

DROP POLICY IF EXISTS "public_delete_donation_photos" ON storage.objects;
CREATE POLICY "public_delete_donation_photos" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'donation-photos');
