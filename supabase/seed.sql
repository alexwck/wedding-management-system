-- Seed data for development
-- Run with: npx supabase db seed

-- 1. Create auth users first (required by public.users FK)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.com', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"admin"}', '{"role":"admin","display_name":"Admin User"}', now(), now(), '', '', '', ''),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alex@example.com', crypt('couple123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"couple"}', '{"role":"couple","display_name":"Alex & Sam"}', now(), now(), '', '', '', ''),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jordan@example.com', crypt('couple123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"couple"}', '{"role":"couple","display_name":"Jordan & Taylor"}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert user profiles (links to auth.users)
INSERT INTO public.users (id, role, display_name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'Admin User'),
  ('a0000000-0000-0000-0000-000000000002', 'couple', 'Alex & Sam'),
  ('a0000000-0000-0000-0000-000000000003', 'couple', 'Jordan & Taylor')
ON CONFLICT (id) DO NOTHING;

-- Insert weddings for couples
-- test-wedding-1 has a placeholder template image for E2E landing page tests
INSERT INTO public.weddings (id, slug, user_id, couple_name, template_image_url, wedding_date, timezone) OVERRIDING SYSTEM VALUE VALUES
  (1, 'test-wedding-1', 'a0000000-0000-0000-0000-000000000002', 'Alex & Sam', 'https://placehold.co/800x1200/png', '2026-06-15T14:00:00Z', 'Asia/Kuala_Lumpur'),
  (2, 'jordan-taylor-wedding', 'a0000000-0000-0000-0000-000000000003', 'Jordan & Taylor', NULL, '2026-09-20T16:00:00Z', 'Asia/Kuala_Lumpur')
ON CONFLICT (id) DO NOTHING;

-- Add venue data to test-wedding-1 for E2E venue feature tests
UPDATE public.weddings SET
  venue = 'The Grand Ballroom',
  venue_address = '123 Main St, Springfield, IL, USA',
  venue_lat = 39.7817,
  venue_lng = -89.6501,
  welcome_message = 'We can''t wait to celebrate with you!'
WHERE id = 1;

-- Reset identity sequences after seeding with explicit IDs
SELECT setval('public.weddings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.weddings));
SELECT setval('public.rsvps_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.rsvps));

-- Insert sample RSVPs for test-wedding-1
INSERT INTO public.rsvps (wedding_id, guest_name, status, dietary_notes, is_vegetarian, needs_baby_chair) VALUES
  (1, 'Emma Watson', 'attending', 'No nuts please', false, false),
  (1, 'James Smith', 'attending', NULL, true, false),
  (1, 'Olivia Brown', 'declining', NULL, false, false),
  (1, 'Liam Davis', 'attending', 'Gluten free', false, true),
  (2, 'Sophie Clark', 'attending', NULL, false, false),
  (2, 'Noah Wilson', 'attending', 'Vegetarian please', true, false);

-- Floor plans cleared for 003-ux-polish-floorplan-fixes (chair dimensions changed from 2x2 to 1x1)
