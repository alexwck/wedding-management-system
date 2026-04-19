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
INSERT INTO public.weddings (id, slug, user_id, couple_name, template_image_url, wedding_date) OVERRIDING SYSTEM VALUE VALUES
  (1, 'test-wedding-1', 'a0000000-0000-0000-0000-000000000002', 'Alex & Sam', 'https://placehold.co/800x1200/png', '2026-06-15T14:00:00Z'),
  (2, 'jordan-taylor-wedding', 'a0000000-0000-0000-0000-000000000003', 'Jordan & Taylor', NULL, '2026-09-20T16:00:00Z')
ON CONFLICT (id) DO NOTHING;

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

-- Insert sample floor plan for test-wedding-1
INSERT INTO public.floor_plans (wedding_id, width, height, items) VALUES (
  1,
  60,
  40,
  '[
    {"id":"fp-rt-1","type":"round_table","label":"Round Table 1","x":10,"y":8,"width":5,"height":5,"rotation":0,"parentItemId":null,"metadata":{"diameter":5,"chairCount":7}},
    {"id":"fp-ch-1-1","type":"chair","label":"Chair 1","x":9.5,"y":4.5,"width":2,"height":2,"rotation":0,"parentItemId":"fp-rt-1","metadata":{"chairIndex":0}},
    {"id":"fp-ch-1-2","type":"chair","label":"Chair 2","x":12.5,"y":5.5,"width":2,"height":2,"rotation":0,"parentItemId":"fp-rt-1","metadata":{"chairIndex":1}},
    {"id":"fp-ch-1-3","type":"chair","label":"Chair 3","x":14,"y":8,"width":2,"height":2,"rotation":0,"parentItemId":"fp-rt-1","metadata":{"chairIndex":2}},
    {"id":"fp-ch-1-4","type":"chair","label":"Chair 4","x":12.5,"y":11,"width":2,"height":2,"rotation":0,"parentItemId":"fp-rt-1","metadata":{"chairIndex":3}},
    {"id":"fp-ch-1-5","type":"chair","label":"Chair 5","x":9.5,"y":12,"width":2,"height":2,"rotation":0,"parentItemId":"fp-rt-1","metadata":{"chairIndex":4}},
    {"id":"fp-ch-1-6","type":"chair","label":"Chair 6","x":7,"y":11,"width":2,"height":2,"rotation":0,"parentItemId":"fp-rt-1","metadata":{"chairIndex":5}},
    {"id":"fp-ch-1-7","type":"chair","label":"Chair 7","x":6.5,"y":5.5,"width":2,"height":2,"rotation":0,"parentItemId":"fp-rt-1","metadata":{"chairIndex":6}},
    {"id":"fp-lt-1","type":"long_table","label":"Long Table 1","x":25,"y":8,"width":6,"height":2.5,"rotation":0,"parentItemId":null,"metadata":{"length":6,"chairCount":7}},
    {"id":"fp-ch-2-1","type":"chair","label":"Chair 8","x":25.2,"y":5.5,"width":2,"height":2,"rotation":0,"parentItemId":"fp-lt-1","metadata":{"chairIndex":0}},
    {"id":"fp-ch-2-2","type":"chair","label":"Chair 9","x":27.7,"y":5.5,"width":2,"height":2,"rotation":0,"parentItemId":"fp-lt-1","metadata":{"chairIndex":1}},
    {"id":"fp-ch-2-3","type":"chair","label":"Chair 10","x":30.2,"y":5.5,"width":2,"height":2,"rotation":0,"parentItemId":"fp-lt-1","metadata":{"chairIndex":2}},
    {"id":"fp-ch-2-4","type":"chair","label":"Chair 11","x":25.2,"y":11,"width":2,"height":2,"rotation":0,"parentItemId":"fp-lt-1","metadata":{"chairIndex":3}},
    {"id":"fp-ch-2-5","type":"chair","label":"Chair 12","x":27.7,"y":11,"width":2,"height":2,"rotation":0,"parentItemId":"fp-lt-1","metadata":{"chairIndex":4}},
    {"id":"fp-ch-2-6","type":"chair","label":"Chair 13","x":30.2,"y":11,"width":2,"height":2,"rotation":0,"parentItemId":"fp-lt-1","metadata":{"chairIndex":5}},
    {"id":"fp-st-1","type":"stage","label":"Stage","x":22,"y":1,"width":12,"height":4,"rotation":0,"parentItemId":null,"metadata":{}},
    {"id":"fp-wk-1","type":"walkway","label":"Walkway","x":18,"y":15,"width":3,"height":24,"rotation":0,"parentItemId":null,"metadata":{}}
  ]'::jsonb
);
