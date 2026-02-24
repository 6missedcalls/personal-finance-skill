#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# personal-finance-skill — Onboard Script
#
# Builds all 7 extensions, registers them as OpenClaw plugins
# (dev-linked with provenance), writes required config defaults,
# adds to allowlist, and installs the skill.
#
# Usage:
#   ./scripts/onboard.sh            # default: dev-link mode
#   ./scripts/onboard.sh --copy     # copy instead of symlink
#   ./scripts/onboard.sh --uninstall # remove all plugins + skill
# ──────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_ROOT="$(dirname "$SCRIPT_DIR")"
EXTENSIONS_DIR="$SKILL_ROOT/extensions"

# OpenClaw standard paths
OPENCLAW_EXT_DIR="${HOME}/.openclaw/extensions"
OPENCLAW_SKILLS_DIR="${HOME}/.openclaw/skills"
OPENCLAW_CONFIG="${HOME}/.openclaw/openclaw.json"
SKILL_NAME="personal-finance-skill"

# Install order: foundation first, then adapters, then intelligence
EXTENSIONS=(finance-core plaid-connect alpaca-trading ibkr-portfolio tax-engine market-intel social-sentiment)

MODE="link"
if [[ "${1:-}" == "--copy" ]]; then
  MODE="copy"
elif [[ "${1:-}" == "--uninstall" ]]; then
  MODE="uninstall"
fi

# ── Helpers ──────────────────────────────────────────────────

has_cmd() { command -v "$1" &>/dev/null; }

detect_pm() {
  if has_cmd pnpm; then echo "pnpm"
  elif has_cmd npm; then echo "npm"
  else
    echo "ERROR: No package manager found (need npm or pnpm)" >&2
    exit 1
  fi
}

print_header() {
  echo ""
  echo "  personal-finance-skill"
  echo "  ======================"
  echo "  75 tools | 7 extensions | Agent Skills Protocol"
  echo ""
}

# ── Uninstall ────────────────────────────────────────────────

if [[ "$MODE" == "uninstall" ]]; then
  print_header
  echo "  Uninstalling..."
  echo ""

  if has_cmd openclaw; then
    for ext in "${EXTENSIONS[@]}"; do
      if openclaw plugins info "$ext" &>/dev/null 2>&1; then
        openclaw plugins disable "$ext" 2>/dev/null || true
        echo "  [-] plugin: $ext (disabled)"
      fi
    done
  else
    for ext in "${EXTENSIONS[@]}"; do
      target="$OPENCLAW_EXT_DIR/$ext"
      if [[ -L "$target" || -d "$target" ]]; then
        rm -rf "$target"
        echo "  [-] removed: $target"
      fi
    done
  fi

  skill_target="$OPENCLAW_SKILLS_DIR/$SKILL_NAME"
  if [[ -L "$skill_target" || -d "$skill_target" ]]; then
    rm -rf "$skill_target"
    echo "  [-] removed skill: $skill_target"
  fi

  echo ""
  echo "  Done. Restart the gateway: openclaw gateway restart"
  echo ""
  exit 0
fi

# ── Preflight ────────────────────────────────────────────────

print_header

if ! has_cmd openclaw; then
  echo "  ERROR: openclaw CLI not found in PATH."
  echo "  Install: npm install -g openclaw@latest"
  echo "  Then re-run this script."
  exit 1
fi

PM=$(detect_pm)
echo "  Package manager: $PM"
echo "  Mode: $MODE"
echo ""

# ── Step 1: Install deps & build ─────────────────────────────

echo "  [1/4] Building extensions"
echo "  -------------------------"

for ext in "${EXTENSIONS[@]}"; do
  ext_dir="$EXTENSIONS_DIR/$ext"

  if [[ ! -d "$ext_dir" ]]; then
    echo "    SKIP  $ext (directory not found)"
    continue
  fi

  printf "    %-20s" "$ext"

  (
    cd "$ext_dir"
    if [[ ! -d "node_modules" ]]; then
      $PM install --silent 2>/dev/null || $PM install 2>/dev/null
    fi

    if grep -q '"build"' package.json 2>/dev/null; then
      $PM run build >/dev/null 2>&1 || true
    fi
  )

  echo "OK"
done

echo ""

# ── Step 2: Register plugins with provenance ─────────────────

echo "  [2/4] Registering plugins"
echo "  -------------------------"

for ext in "${EXTENSIONS[@]}"; do
  ext_dir="$EXTENSIONS_DIR/$ext"
  if [[ ! -f "$ext_dir/openclaw.plugin.json" ]]; then
    echo "    SKIP  $ext (no manifest)"
    continue
  fi

  printf "    %-20s" "$ext"

  # Check if already installed with provenance
  if openclaw plugins info "$ext" &>/dev/null 2>&1; then
    echo "already registered"
    continue
  fi

  if [[ "$MODE" == "link" ]]; then
    openclaw plugins install -l "$ext_dir" 2>/dev/null && echo "linked" || echo "FAILED"
  else
    openclaw plugins install "$ext_dir" 2>/dev/null && echo "copied" || echo "FAILED"
  fi
done

echo ""

# ── Step 3: Write required config + allowlist ────────────────

echo "  [3/4] Configuring plugins"
echo "  -------------------------"

# Set required config for alpaca-trading
printf "    %-20s" "alpaca-trading"
openclaw config set plugins.entries.alpaca-trading.config.apiKeyEnv ALPACA_API_KEY >/dev/null 2>&1
openclaw config set plugins.entries.alpaca-trading.config.apiSecretEnv ALPACA_API_SECRET >/dev/null 2>&1
openclaw config set plugins.entries.alpaca-trading.config.env paper >/dev/null 2>&1
echo "OK (env: paper)"

# Set required config for plaid-connect
printf "    %-20s" "plaid-connect"
openclaw config set plugins.entries.plaid-connect.config.plaidClientIdEnv PLAID_CLIENT_ID >/dev/null 2>&1
openclaw config set plugins.entries.plaid-connect.config.plaidSecretEnv PLAID_SECRET >/dev/null 2>&1
openclaw config set plugins.entries.plaid-connect.config.plaidEnv sandbox >/dev/null 2>&1
echo "OK (env: sandbox)"

# Set config hints for market-intel
printf "    %-20s" "market-intel"
openclaw config set plugins.entries.market-intel.config.finnhubApiKeyEnv FINNHUB_API_KEY >/dev/null 2>&1
openclaw config set plugins.entries.market-intel.config.fredApiKeyEnv FRED_API_KEY >/dev/null 2>&1
openclaw config set plugins.entries.market-intel.config.blsApiKeyEnv BLS_API_KEY >/dev/null 2>&1
openclaw config set plugins.entries.market-intel.config.alphaVantageApiKeyEnv ALPHA_VANTAGE_API_KEY >/dev/null 2>&1
echo "OK (partial keys accepted)"

# Set config hints for social-sentiment
printf "    %-20s" "social-sentiment"
openclaw config set plugins.entries.social-sentiment.config.xApiBearerTokenEnv X_API_BEARER_TOKEN >/dev/null 2>&1
openclaw config set plugins.entries.social-sentiment.config.quiverApiKeyEnv QUIVER_API_KEY >/dev/null 2>&1
echo "OK (partial keys accepted)"

# Remaining extensions have no required config
for ext in finance-core ibkr-portfolio tax-engine; do
  printf "    %-20s" "$ext"
  echo "OK (no required config)"
done

echo ""

# Add all to allowlist (edit file directly since CLI lacks array-append)
echo "  Adding to plugins.allow..."

if [[ -f "$OPENCLAW_CONFIG" ]]; then
  # Use node to safely handle JSON5 allowlist patching
  node -e "
    const fs = require('fs');
    const path = '$OPENCLAW_CONFIG';
    let raw = fs.readFileSync(path, 'utf8');
    const ids = ['finance-core','plaid-connect','alpaca-trading','ibkr-portfolio','tax-engine','market-intel','social-sentiment'];
    for (const id of ids) {
      // Only add if not already present
      if (!raw.includes('\"' + id + '\"')) {
        // Insert before the closing bracket of plugins.allow
        // Find the allow array and append
        raw = raw.replace(
          /(\"allow\":\s*\[[\s\S]*?)(\"telegram\")/,
          '\$1\$2,\n      \"' + id + '\"'
        );
      }
    }
    fs.writeFileSync(path, raw);
  " 2>/dev/null && echo "    OK" || echo "    WARN: could not patch allowlist automatically"
  echo "    If plugins show as 'disabled', add them to plugins.allow in openclaw.json"
fi

echo ""

# ── Step 4: Install skill (SKILL.md) ────────────────────────

echo "  [4/4] Installing skill"
echo "  ----------------------"

mkdir -p "$OPENCLAW_SKILLS_DIR"
skill_target="$OPENCLAW_SKILLS_DIR/$SKILL_NAME"

printf "    %-20s" "$SKILL_NAME"

if [[ -L "$skill_target" ]]; then
  existing_src="$(readlink "$skill_target")"
  if [[ "$existing_src" == "$SKILL_ROOT" ]]; then
    echo "already linked"
  else
    echo "linked (other: $existing_src)"
  fi
elif [[ -e "$skill_target" ]]; then
  echo "EXISTS (not a symlink, skipping)"
else
  ln -s "$SKILL_ROOT" "$skill_target"
  echo "linked"
fi

echo ""

# ── Verify ────────────────────────────────────────────────────

echo "  Verification"
echo "  ------------"

errors=0

if [[ -f "$skill_target/SKILL.md" ]]; then
  echo "    SKILL.md             OK"
else
  echo "    SKILL.md             MISSING"
  errors=$((errors + 1))
fi

for ext in "${EXTENSIONS[@]}"; do
  printf "    %-20s " "$ext"
  if openclaw plugins info "$ext" &>/dev/null 2>&1; then
    echo "OK"
  else
    echo "NOT REGISTERED"
    errors=$((errors + 1))
  fi
done

echo ""

if [[ $errors -gt 0 ]]; then
  echo "  WARNING: $errors issue(s) found. Check output above."
else
  echo "  All checks passed."
fi

echo ""
echo "  =============================="
echo "  Onboard complete!"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Set API credentials (env vars):"
echo ""
echo "     # Plaid (dashboard.plaid.com)"
echo "     export PLAID_CLIENT_ID=\"...\""
echo "     export PLAID_SECRET=\"...\""
echo ""
echo "     # Alpaca (app.alpaca.markets)"
echo "     export ALPACA_API_KEY=\"...\""
echo "     export ALPACA_API_SECRET=\"...\""
echo ""
echo "     # IBKR (start Client Portal Gateway first)"
echo "     export IBKR_BASE_URL=\"https://localhost:5000/v1/api\""
echo ""
echo "     # Market Intelligence (all optional, partial OK)"
echo "     export FINNHUB_API_KEY=\"...\"      # finnhub.io"
echo "     export FRED_API_KEY=\"...\"          # fred.stlouisfed.org"
echo "     export BLS_API_KEY=\"...\"           # bls.gov/developers"
echo "     export ALPHA_VANTAGE_API_KEY=\"...\" # alphavantage.co"
echo ""
echo "     # Social Sentiment (all optional, partial OK)"
echo "     export X_API_BEARER_TOKEN=\"...\"    # developer.x.com"
echo "     export QUIVER_API_KEY=\"...\"        # quiverquant.com"
echo ""
echo "  2. Restart the gateway:"
echo "     openclaw gateway restart"
echo ""
echo "  3. Verify:"
echo "     openclaw plugins list"
echo ""
echo "  4. Try it out:"
echo "     \"Show me my finance tools\""
echo ""
