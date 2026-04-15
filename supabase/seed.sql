-- Seed data for development
-- Run with: npx supabase db seed
-- NOTE: Auth users are created by supabase/scripts/seed-auth.sh after this SQL runs

-- Insert user profiles (auth users must be created first via seed-auth.sh)
INSERT INTO public.users (id, role, display_name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'Admin User'),
  ('a0000000-0000-0000-0000-000000000002', 'couple', 'Alex & Sam'),
  ('a0000000-0000-0000-0000-000000000003', 'couple', 'Jordan & Taylor')
ON CONFLICT (id) DO NOTHING;

-- Insert weddings for couples
-- test-wedding-1 has a placeholder template image for E2E landing page tests
INSERT INTO public.weddings (id, slug, user_id, couple_name, template_image_url, wedding_date) OVERRIDING SYSTEM VALUE VALUES
  (1, 'test-wedding-1', 'a0000000-0000-0000-0000-000000000002', 'Alex & Sam', 'https://placehold.co/800x1200/png', '2026-06-15T14:00:00Z'),
  (2, 'jordan-taylor-wedding', 'a0000000-0000-0000-0000-000000000003', 'Jordan & Taylor', NULL, '2026-09-20T16:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert sample RSVPs for test-wedding-1
INSERT INTO public.rsvps (wedding_id, guest_name, status, dietary_notes, is_vegetarian, needs_baby_chair) VALUES
  (1, 'Emma Watson', 'attending', 'No nuts please', false, false),
  (1, 'James Smith', 'attending', NULL, true, false),
  (1, 'Olivia Brown', 'declining', NULL, false, false),
  (1, 'Liam Davis', 'attending', 'Gluten free', false, true),
  (2, 'Sophie Clark', 'attending', NULL, false, false),
  (2, 'Noah Wilson', 'attending', 'Vegetarian please', true, false);
