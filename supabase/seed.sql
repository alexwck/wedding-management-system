-- Seed data for development
-- Run with: npx supabase db seed

-- Insert admin user profile (auth user created separately via SQL)
INSERT INTO public.users (id, role, display_name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'Admin User');

-- Insert couple users
INSERT INTO public.users (id, role, display_name) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'couple', 'Alex & Sam'),
  ('a0000000-0000-0000-0000-000000000003', 'couple', 'Jordan & Taylor');

-- Insert weddings for couples
INSERT INTO public.weddings (slug, user_id, couple_name, wedding_date) VALUES
  ('alex-sam-wedding', 'a0000000-0000-0000-0000-000000000002', 'Alex & Sam', '2026-06-15T14:00:00Z'),
  ('jordan-taylor-wedding', 'a0000000-0000-0000-0000-000000000003', 'Jordan & Taylor', '2026-09-20T16:00:00Z');

-- Insert sample RSVPs for Alex & Sam's wedding
INSERT INTO public.rsvps (wedding_id, guest_name, status, dietary_notes, is_vegetarian, needs_baby_chair) VALUES
  (1, 'Emma Watson', 'attending', 'No nuts please', false, false),
  (1, 'James Smith', 'attending', NULL, true, false),
  (1, 'Olivia Brown', 'declining', NULL, false, false),
  (1, 'Liam Davis', 'attending', 'Gluten free', false, true),
  (2, 'Sophie Clark', 'attending', NULL, false, false),
  (2, 'Noah Wilson', 'attending', 'Vegetarian please', true, false);
