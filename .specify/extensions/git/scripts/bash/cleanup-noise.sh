#!/usr/bin/env bash
# Cleanup script: Remove speckit-generated noise after implementation completes
# Run this after /speckit-implement to keep the repo clean

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

_find_project_root() {
    local dir="$1"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.specify" ] || [ -d "$dir/.git" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

REPO_ROOT=$(_find_project_root "$SCRIPT_DIR") || REPO_ROOT="$(pwd)"
cd "$REPO_ROOT"

echo "[cleanup] Removing speckit-generated noise..."

# Delete generated documentation noise (won't affect future speckit runs)
find "$REPO_ROOT/specs" -name "quickstart.md" -delete 2>/dev/null || true
find "$REPO_ROOT/specs" -path "*/checklists/requirements.md" -delete 2>/dev/null || true

# Delete config snapshots
rm -f "$REPO_ROOT/.specify/feature.json" 2>/dev/null || true
rm -f "$REPO_ROOT/.specify/init-options.json" 2>/dev/null || true
rm -f "$REPO_ROOT/.specify/integration.json" 2>/dev/null || true
rm -f "$REPO_ROOT/.specify/workflows/workflow-registry.json" 2>/dev/null || true

# Delete empty directories
rmdir "$REPO_ROOT/.specify/extensions/git" 2>/dev/null || true
rmdir "$REPO_ROOT/.specify/integrations/claude/scripts" 2>/dev/null || true

echo "[cleanup] Noise cleanup complete"
