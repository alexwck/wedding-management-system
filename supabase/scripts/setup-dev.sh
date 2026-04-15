#!/usr/bin/env bash
# Full development database setup
# 1. Reset database (migrations only, no seed)
# 2. Create auth users via Admin API
# 3. Insert public data via db query

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Load env vars
set -a
source "$PROJECT_ROOT/.env.local"
set +a

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-http://localhost:54321}"
API_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [ -z "$API_KEY" ]; then
  echo "ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
  exit 1
fi

echo "=== Step 1: Resetting database (migrations only) ==="
npx supabase db reset --no-seed 2>&1 | tail -3

echo ""
echo "=== Step 2: Creating auth users ==="
create_user() {
  local email="$1" password="$2" user_id="$3" app_metadata="$4"
  echo "  Creating: $email"
  curl -sf -X POST "$SUPABASE_URL/auth/v1/admin/users" \
    -H "apikey: $API_KEY" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"email_confirm\":true,\"id\":\"$user_id\",\"app_metadata\":$app_metadata}" > /dev/null
}

create_user "admin@example.com" "admin123" "a0000000-0000-0000-0000-000000000001" '{"role":"admin"}'
create_user "couple1@example.com" "couple123" "a0000000-0000-0000-0000-000000000002" '{"role":"couple"}'
create_user "couple2@example.com" "couple123" "a0000000-0000-0000-0000-000000000003" '{"role":"couple"}'
echo "  Auth users created."

echo ""
echo "=== Step 3: Seeding public data ==="
run_query() {
  npx supabase db query "$1" 2>&1 | tail -1
}

run_query "INSERT INTO public.users (id, role, display_name) VALUES ('a0000000-0000-0000-0000-000000000001', 'admin', 'Admin User'), ('a0000000-0000-0000-0000-000000000002', 'couple', 'Alex & Sam'), ('a0000000-0000-0000-0000-000000000003', 'couple', 'Jordan & Taylor') ON CONFLICT (id) DO NOTHING;"
run_query "INSERT INTO public.weddings (id, slug, user_id, couple_name, template_image_url, wedding_date) OVERRIDING SYSTEM VALUE VALUES (1, 'test-wedding-1', 'a0000000-0000-0000-0000-000000000002', 'Alex & Sam', 'https://placehold.co/800x1200/png', '2026-06-15T14:00:00Z'), (2, 'jordan-taylor-wedding', 'a0000000-0000-0000-0000-000000000003', 'Jordan & Taylor', NULL, '2026-09-20T16:00:00Z') ON CONFLICT (id) DO NOTHING;"
run_query "INSERT INTO public.rsvps (wedding_id, guest_name, status, dietary_notes, is_vegetarian, needs_baby_chair) VALUES (1, 'Emma Watson', 'attending', 'No nuts please', false, false), (1, 'James Smith', 'attending', NULL, true, false), (1, 'Olivia Brown', 'declining', NULL, false, false), (1, 'Liam Davis', 'attending', 'Gluten free', false, true), (2, 'Sophie Clark', 'attending', NULL, false, false), (2, 'Noah Wilson', 'attending', 'Vegetarian please', true, false);"

echo ""
echo "=== Setup complete! ==="
