#!/bin/bash
# Runs at the start of every Claude Code cloud session (registered in .claude/settings.json).
# It makes the container match the project: the Node version from .nvmrc, then npm install.
set -euo pipefail

# Only run in cloud sessions. On your PC you manage Node and npm install yourself.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# The container ships with a different Node; nvm installs the version named in .nvmrc.
export NVM_DIR="${NVM_DIR:-/opt/nvm}"
source "$NVM_DIR/nvm.sh"
nvm install >/dev/null
nvm use >/dev/null

# Put that Node first on the PATH for the rest of the session, not just this script.
node_bin_dir="$(dirname "$(nvm which current)")"
echo "export PATH=\"$node_bin_dir:\$PATH\"" >> "$CLAUDE_ENV_FILE"

# npm install (not npm ci) so the cached container can reuse node_modules.
npm install --no-audit --no-fund
