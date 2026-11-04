/*
# Seed FoodBridge with sample data

## Overview
Populates all tables with the same illustrative sample data currently
shown in the frontend components (Leaderboard, MessagesInbox, FormModal).

## Data inserted
- 10 donors (matching Leaderboard DONORS array)
- 10 volunteers (matching Leaderboard VOLUNTEERS array)
- 6 conversations (matching MessagesInbox INITIAL_CONVERSATIONS)
- Messages for each conversation
- 3 sample NGO partners

## Notes
- Uses ON CONFLICT DO NOTHING so re-running is safe
- All data is clearly illustrative/prototype data
- Conversation IDs use gen_random_uuid() and messages reference them via CTE
*/

-- ===== SEED DONORS =====
INSERT INTO donors (name, avatar, role, city, region, meals_donated, streak_days, badges) VALUES
('Bella Trattoria', 'BT', 'restaurant', 'Riverside', 'North', 28600, 42, ARRAY['pioneer', 'milestone1k', 'topContributor']),
('Green Grocer Co.', 'GG', 'grocer', 'Old Town', 'Central', 19200, 31, ARRAY['streak30', 'milestone1k', 'greenChampion']),
('The Daily Bake', 'DB', 'restaurant', 'Harbor District', 'East', 14800, 18, ARRAY['milestone1k', 'communityHero']),
('Sunrise Café', 'SC', 'cafe', 'Greenfield', 'South', 11200, 30, ARRAY['streak30', 'milestone1k']),
('Harvest Kitchen', 'HK', 'restaurant', 'North Heights', 'North', 7400, 12, ARRAY['milestone1k']),
('Urban Eats', 'UE', 'restaurant', 'Sunset Vale', 'West', 4600, 8, ARRAY['pioneer']),
('Fresh Start Foods', 'FF', 'grocer', 'Riverside', 'North', 3200, 5, ARRAY[]::text[]),
('Corner Bistro', 'CB', 'restaurant', 'Old Town', 'Central', 2800, 7, ARRAY['pioneer']),
('Mama''s Kitchen', 'MK', 'restaurant', 'Greenfield', 'South', 1900, 4, ARRAY[]::text[]),
('The Grain Mill', 'GM', 'restaurant', 'Harbor District', 'East', 1500, 3, ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- ===== SEED VOLUNTEERS =====
INSERT INTO volunteers (name, avatar, city, region, meals_delivered, streak_days, badges) VALUES
('Amara Okafor', 'AO', 'Harbor District', 'East', 22400, 45, ARRAY['pioneer', 'streak30', 'topContributor', 'communityHero']),
('Diego Martinez', 'DM', 'Harbor District', 'East', 16800, 33, ARRAY['streak30', 'milestone1k', 'greenChampion']),
('Priya Sharma', 'PS', 'Old Town', 'Central', 12600, 22, ARRAY['milestone1k', 'communityHero']),
('Liam O''Brien', 'LO', 'North Heights', 'North', 9800, 30, ARRAY['streak30']),
('Yuki Tanaka', 'YT', 'Greenfield', 'South', 6400, 14, ARRAY['milestone1k']),
('Fatima Al-Rashid', 'FA', 'Sunset Vale', 'West', 3800, 9, ARRAY['pioneer']),
('James Okonkwo', 'JO', 'Riverside', 'North', 2400, 6, ARRAY[]::text[]),
('Sofia Rossi', 'SR', 'Old Town', 'Central', 2100, 8, ARRAY['pioneer']),
('Kenji Watanabe', 'KW', 'Greenfield', 'South', 1600, 5, ARRAY[]::text[]),
('Olivia Chen', 'OC', 'Sunset Vale', 'West', 1100, 3, ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- ===== SEED PARTNERS =====
INSERT INTO partners (org_name, contact_name, email, phone, org_type, service_area, daily_capacity) VALUES
('Hope Foundation', 'Amara Okafor', 'contact@hopefoundation.org', '+1 (555) 100-2000', 'NGO', 'Old Town', 200),
('Harbor Shelter', 'Diego Martinez', 'info@harborshelter.org', '+1 (555) 100-2001', 'Shelter', 'Harbor District', 150),
('Greenfield Food Bank', 'Priya Sharma', 'hello@gffoodbank.org', '+1 (555) 100-2002', 'Food Bank', 'Greenfield', 300)
ON CONFLICT DO NOTHING;

-- ===== SEED CONVERSATIONS + MESSAGES =====
-- Use a CTE to create conversations and insert messages in one pass
WITH conv1 AS (
  INSERT INTO conversations (participant_name, participant_role, participant_avatar, last_message, unread_count, created_at, updated_at)
  VALUES ('Bella Trattoria', 'restaurant', 'BT', 'Pickup window is between 6-8 PM at our Riverside location.', 2, now() - interval '2 min', now())
  RETURNING id
)
INSERT INTO messages (conversation_id, from_me, text, read, created_at)
SELECT id, false, 'Hi! We have 80 portions of fresh pasta ready for pickup tonight. Is anyone available to collect?', true, now() - interval '20 min' FROM conv1
UNION ALL
SELECT id, false, 'The food was prepared this morning and is still sealed in thermal containers.', false, now() - interval '18 min' FROM conv1
UNION ALL
SELECT id, false, 'Pickup window is between 6-8 PM at our Riverside location.', false, now() - interval '17 min' FROM conv1;

WITH conv2 AS (
  INSERT INTO conversations (participant_name, participant_role, participant_avatar, last_message, unread_count, created_at, updated_at)
  VALUES ('Hope Foundation', 'ngo', 'HF', 'Could we schedule a regular weekly pickup?', 1, now() - interval '1 hour', now())
  RETURNING id
)
INSERT INTO messages (conversation_id, from_me, text, read, created_at)
SELECT id, true, 'Just dropped off 120 meals at your Old Town shelter. Let me know if you need more this week!', true, now() - interval '1 day' FROM conv2
UNION ALL
SELECT id, false, 'Thank you for the delivery yesterday! The families were so grateful. Could we schedule a regular weekly pickup?', false, now() - interval '1 hour' FROM conv2;

WITH conv3 AS (
  INSERT INTO conversations (participant_name, participant_role, participant_avatar, last_message, unread_count, created_at, updated_at)
  VALUES ('Amara Okafor', 'volunteer', 'AO', 'Got it, I''ll be there. Thanks for organizing!', 0, now() - interval '3 hours', now())
  RETURNING id
)
INSERT INTO messages (conversation_id, from_me, text, read, created_at)
SELECT id, false, 'I can cover the Harbor District route this Saturday. What time should I start?', true, now() - interval '4 hours' FROM conv3
UNION ALL
SELECT id, true, 'That would be amazing! Pickup is at 11 AM from Green Grocer Co.', true, now() - interval '3 hours 30 min' FROM conv3
UNION ALL
SELECT id, false, 'Got it, I''ll be there. Thanks for organizing!', true, now() - interval '3 hours' FROM conv3;

WITH conv4 AS (
  INSERT INTO conversations (participant_name, participant_role, participant_avatar, last_message, unread_count, created_at, updated_at)
  VALUES ('Green Grocer Co.', 'donor', 'GG', 'That''s great news! I''ll coordinate with the volunteers.', 0, now() - interval '1 day', now())
  RETURNING id
)
INSERT INTO messages (conversation_id, from_me, text, read, created_at)
SELECT id, false, 'We''ll have fresh produce every Tuesday and Thursday from now on. Usually around 50-60 kg.', true, now() - interval '1 day 2 hours' FROM conv4
UNION ALL
SELECT id, true, 'That''s great news! I''ll coordinate with the volunteers to set up a regular pickup schedule.', true, now() - interval '1 day 1 hour' FROM conv4;

WITH conv5 AS (
  INSERT INTO conversations (participant_name, participant_role, participant_avatar, last_message, unread_count, created_at, updated_at)
  VALUES ('Sunrise Café', 'restaurant', 'SC', 'Let me know if anyone is nearby Greenfield!', 3, now() - interval '1 day', now())
  RETURNING id
)
INSERT INTO messages (conversation_id, from_me, text, read, created_at)
SELECT id, false, 'Sorry for the late notice, but we have surplus breakfast items today — about 40 servings of pastries and sandwiches.', false, now() - interval '1 day 2 hours' FROM conv5
UNION ALL
SELECT id, false, 'Best if picked up within 2 hours.', false, now() - interval '1 day 2 hours' FROM conv5
UNION ALL
SELECT id, false, 'Let me know if anyone is nearby Greenfield!', false, now() - interval '1 day 2 hours' FROM conv5;

WITH conv6 AS (
  INSERT INTO conversations (participant_name, participant_role, participant_avatar, last_message, unread_count, created_at, updated_at)
  VALUES ('Diego Martinez', 'volunteer', 'DM', 'Fantastic work, Diego! Thank you for the dedication.', 0, now() - interval '2 days', now())
  RETURNING id
)
INSERT INTO messages (conversation_id, from_me, text, read, created_at)
SELECT id, false, 'Route completed! All 15 deliveries done in the East region. Photos uploaded to the system.', true, now() - interval '2 days 1 hour' FROM conv6
UNION ALL
SELECT id, true, 'Fantastic work, Diego! Thank you for the dedication.', true, now() - interval '2 days' FROM conv6;
