#!/usr/bin/env zsh

# Create a fake `security` executable
#
# This executable provides access to macOS Keychain for command-line
# apps like claude. Denying access to it, will force claude to save
# the credentials to config.json

TEMP_DIR="${HOME}/$(uuidgen).tmp"

mkdir -p "${TEMP_DIR}"
cat << 'EOF' > "${TEMP_DIR}/security"
#!/bin/sh
echo "Keychain access denied" >&2
exit 1
EOF
chmod +x "${TEMP_DIR}/security"

# Add the temporary directory to the top of PATH for this process

export PATH="${TEMP_DIR}":$PATH

# Load GLM token from .env.local next to this script, or parent dir if the script lives in a subfolder (e.g. bin/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GLM_ENV_FILE="${SCRIPT_DIR}/.env.local"
if [[ ! -f "${GLM_ENV_FILE}" ]]; then
    GLM_ENV_FILE="$(dirname "${SCRIPT_DIR}")/.env.local"
fi
if [[ -f "${GLM_ENV_FILE}" ]]; then
    # read returns non-zero on EOF without a trailing newline; still process the last line
    while IFS='=' read -r key value || [[ -n "${key}" ]]; do
        key="${key%%#*}"
        key="$(echo "${key}" | xargs)"
        [[ -z "${key}" ]] && continue
        [[ "${key}" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
        value="$(echo "${value}" | xargs)"
        export "${key}=${value}"
    done < "${GLM_ENV_FILE}"
fi

# Setup the custom environment variables
# Map GLM_AUTH_TOKEN from .env.local to ANTHROPIC_AUTH_TOKEN for claude
export ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic

if [[ -n "${GLM_AUTH_TOKEN}" ]]; then
    export ANTHROPIC_AUTH_TOKEN="${GLM_AUTH_TOKEN}"
elif [[ -n "${ANTHROPIC_AUTH_TOKEN}" ]]; then
    # Support direct ANTHROPIC_AUTH_TOKEN for backward compatibility
    :
else
    echo "Error: GLM_AUTH_TOKEN is not set." >&2
    echo "Create: ${SCRIPT_DIR}/.env.local with GLM_AUTH_TOKEN=... (from https://z.ai)" >&2
    echo "Or export GLM_AUTH_TOKEN in your shell before running this script." >&2
    exit 1
fi

export ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-4.5-air
export ANTHROPIC_DEFAULT_SONNET_MODEL=glm-5.1
export ANTHROPIC_DEFAULT_OPUS_MODEL=glm-5.1

# Setup the custom config dir, creating it if it doesn't exists

# Use default config dir (~/.claude) for skill support
# export CLAUDE_CONFIG_DIR="${HOME}/.glm"
# mkdir -p "${CLAUDE_CONFIG_DIR}"

# Run claude

claude "$@"

# Clean up the temporary files created
rm -rf "${TEMP_DIR}"