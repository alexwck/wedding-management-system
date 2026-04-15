#!/usr/bin/env bash
# Seed auth users via Supabase Admin API (GoTrue)
# Direct SQL inserts into auth.users don't work reliably with GoTrue
# Usage: Run after `npx supabase db reset`

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

create_user() {
  local email="$1" password="$2" user_id="$3"

  echo "Creating auth user: $email"
  curl -sf -X POST "$SUPABASE_URL/auth/v1/admin/users" \
    -H "apikey: $API_KEY" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"email_confirm\":true,\"id\":\"$user_id\"}" > /dev/null
  echo "  -> Created ($user_id)"
}

echo "Seeding auth users..."
create_user "admin@example.com" "admin123" "a0000000-0000-0000-0000-000000000001"
create_user "couple1@example.com" "couple123" "a0000000-0000-0000-0000-000000000002"
create_user "couple2@example.com" "couple123" "a0000000-0000-0000-0000-000000000003"
echo "Done!"
