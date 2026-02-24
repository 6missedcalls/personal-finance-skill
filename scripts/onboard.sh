#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# personal-finance-skill — Onboard Script
#
# Builds all 5 extensions, registers them as OpenClaw plugins
# (dev-linked), and installs the skill into ~/.openclaw/skills/.
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

# OpenClaw standard paths (from docs.openclaw.ai)
OPENCLAW_EXT_DIR="${HOME}/.openclaw/extensions"
OPENCLAW_SKILLS_DIR="${HOME}/.openclaw/skills"
SKILL_NAME="personal-finance-skill"

EXTENSIONS=(finance-core plaid-connect alpaca-trading ibkr-portfolio tax-engine)

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
  echo "  46 tools | 5 extensions | Agent Skills Protocol"
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
    # Manual removal
    for ext in "${EXTENSIONS[@]}"; do
      target="$OPENCLAW_EXT_DIR/$ext"
      if [[ -L "$target" || -d "$target" ]]; then
        rm -rf "$target"
        echo "  [-] removed: $target"
      fi
    done
  fi

  # Remove skill symlink
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

# ── Main Install ─────────────────────────────────────────────

print_header

PM=$(detect_pm)
echo "  Package manager: $PM"
echo "  Mode: $MODE"
echo ""

# ── Step 1: Install deps & build ─────────────────────────────

echo "  [1/3] Building extensions"
echo "  -------------------------"

for ext in "${EXTENSIONS[@]}"; do
  ext_dir="$EXTENSIONS_DIR/$ext"

  if [[ ! -d "$ext_dir" ]]; then
    echo "    SKIP  $ext (directory not found)"
    continue
  fi

  printf "    %-20s" "$ext"

  # Install production dependencies
  (
    cd "$ext_dir"
    if [[ ! -d "node_modules" ]]; then
      $PM install --silent 2>/dev/null || $PM install 2>/dev/null
    fi

    # Build if script exists
    if grep -q '"build"' package.json 2>/dev/null; then
      $PM run build >/dev/null 2>&1 || true
    fi
  )

  echo "OK"
done

echo ""

# ── Step 2: Register as OpenClaw plugins ─────────────────────

echo "  [2/3] Registering plugins"
echo "  -------------------------"

if has_cmd openclaw; then
  # Use the official CLI
  for ext in "${EXTENSIONS[@]}"; do
    ext_dir="$EXTENSIONS_DIR/$ext"
    if [[ ! -f "$ext_dir/openclaw.plugin.json" ]]; then
      echo "    SKIP  $ext (no manifest)"
      continue
    fi

    printf "    %-20s" "$ext"

    if [[ "$MODE" == "link" ]]; then
      # Dev-link: symlink, no copy. Adds to plugins.load.paths
      openclaw plugins install -l "$ext_dir" 2>/dev/null && echo "linked" || {
        # Fallback if already installed
        if openclaw plugins info "$ext" &>/dev/null 2>&1; then
          echo "already registered"
        else
          echo "FAILED (try manual)"
        fi
      }
    else
      # Copy mode: copies into ~/.openclaw/extensions/<id>/
      openclaw plugins install "$ext_dir" 2>/dev/null && echo "copied" || {
        if openclaw plugins info "$ext" &>/dev/null 2>&1; then
          echo "already registered"
        else
          echo "FAILED (try manual)"
        fi
      }
    fi
  done
else
  # Fallback: manual symlink to ~/.openclaw/extensions/
  echo "    (openclaw CLI not found, using manual symlinks)"
  echo ""
  mkdir -p "$OPENCLAW_EXT_DIR"

  for ext in "${EXTENSIONS[@]}"; do
    ext_dir="$EXTENSIONS_DIR/$ext"
    target="$OPENCLAW_EXT_DIR/$ext"

    if [[ ! -f "$ext_dir/openclaw.plugin.json" ]]; then
      echo "    SKIP  $ext (no manifest)"
      continue
    fi

    printf "    %-20s" "$ext"

    if [[ -L "$target" ]]; then
      existing_src="$(readlink "$target")"
      if [[ "$existing_src" == "$ext_dir" ]]; then
        echo "already linked"
      else
        echo "linked (other: $existing_src)"
      fi
    elif [[ -e "$target" ]]; then
      echo "EXISTS (not a symlink, skipping)"
    else
      if [[ "$MODE" == "link" ]]; then
        ln -s "$ext_dir" "$target"
        echo "linked"
      else
        cp -R "$ext_dir" "$target"
        echo "copied"
      fi
    fi
  done
fi

echo ""

# ── Step 3: Write default plugin configs ─────────────────────

echo "  [3/4] Writing plugin configs"
echo "  ----------------------------"

OPENCLAW_CONFIG="${HOME}/.openclaw/openclaw.json"

if [[ -f "$OPENCLAW_CONFIG" ]]; then
  python3 - "$OPENCLAW_CONFIG" << 'PYEOF'
import json, sys, os

config_path = sys.argv[1]

# Read existing config (plain JSON — openclaw.json is JSON5 but
# python json.load handles the subset that openclaw config set writes)
try:
    with open(config_path, 'r') as f:
        content = f.read().strip()
        if not content:
            config = {}
        else:
            config = json.loads(content)
except (json.JSONDecodeError, FileNotFoundError):
    print("    WARN  could not parse openclaw.json, skipping config injection")
    print("    Run: openclaw config set plugins.entries.<id>.config.<key> <value>")
    sys.exit(0)

plugins = config.setdefault("plugins", {})
entries = plugins.setdefault("entries", {})
changed = False

# Default configs for plugins with required fields
defaults = {
    "alpaca-trading": {
        "enabled": True,
        "config": {
            "apiKeyEnv": "ALPACA_API_KEY",
            "apiSecretEnv": "ALPACA_API_SECRET",
            "env": "paper"
        }
    },
    "plaid-connect": {
        "enabled": True,
        "config": {
            "plaidClientIdEnv": "PLAID_CLIENT_ID",
            "plaidSecretEnv": "PLAID_SECRET",
            "plaidEnv": "sandbox"
        }
    },
    "ibkr-portfolio": {"enabled": True},
    "finance-core": {"enabled": True},
    "tax-engine": {"enabled": True}
}

for plugin_id, default_entry in defaults.items():
    entry = entries.setdefault(plugin_id, {})
    merged = False

    # Ensure enabled
    if not entry.get("enabled"):
        entry["enabled"] = True
        merged = True

    # Merge config defaults (don't overwrite existing values)
    if "config" in default_entry:
        entry_config = entry.setdefault("config", {})
        for key, value in default_entry["config"].items():
            if key not in entry_config:
                entry_config[key] = value
                merged = True

    if merged:
        changed = True
        print(f"    {plugin_id:20s} configured")
    else:
        print(f"    {plugin_id:20s} already configured")

if changed:
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
        f.write('\n')
    print("")
    print("    Config updated.")
else:
    print("")
    print("    No changes needed.")
PYEOF
else
  echo "    SKIP  openclaw.json not found at $OPENCLAW_CONFIG"
  echo "    After installing OpenClaw, re-run this script or set configs manually:"
  echo ""
  echo "      openclaw config set plugins.entries.alpaca-trading.config.apiKeyEnv ALPACA_API_KEY"
  echo "      openclaw config set plugins.entries.alpaca-trading.config.apiSecretEnv ALPACA_API_SECRET"
  echo "      openclaw config set plugins.entries.alpaca-trading.config.env paper"
  echo "      openclaw config set plugins.entries.plaid-connect.config.plaidClientIdEnv PLAID_CLIENT_ID"
  echo "      openclaw config set plugins.entries.plaid-connect.config.plaidSecretEnv PLAID_SECRET"
  echo "      openclaw config set plugins.entries.plaid-connect.config.plaidEnv sandbox"
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

# Check SKILL.md is reachable
if [[ -f "$skill_target/SKILL.md" ]]; then
  echo "    SKILL.md             OK"
else
  echo "    SKILL.md             MISSING"
  errors=$((errors + 1))
fi

# Check each plugin manifest is reachable
for ext in "${EXTENSIONS[@]}"; do
  if has_cmd openclaw; then
    check_path="$ext"
    printf "    %-20s " "$ext"
    if openclaw plugins info "$ext" &>/dev/null 2>&1; then
      echo "OK"
    else
      echo "NOT REGISTERED"
      errors=$((errors + 1))
    fi
  else
    if [[ "$MODE" == "link" ]]; then
      check_path="$OPENCLAW_EXT_DIR/$ext/openclaw.plugin.json"
    else
      check_path="$OPENCLAW_EXT_DIR/$ext/openclaw.plugin.json"
    fi
    printf "    %-20s " "$ext"
    if [[ -f "$check_path" ]]; then
      echo "OK"
    else
      echo "NOT FOUND"
      errors=$((errors + 1))
    fi
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
echo "  1. Set API credentials (env vars or openclaw config):"
echo ""
echo "     # Plaid (dashboard.plaid.com)"
echo "     export PLAID_CLIENT_ID=\"...\""
echo "     export PLAID_SECRET=\"...\""
echo "     export PLAID_ENV=\"sandbox\""
echo ""
echo "     # Alpaca (app.alpaca.markets)"
echo "     export ALPACA_API_KEY=\"...\""
echo "     export ALPACA_API_SECRET=\"...\""
echo "     export ALPACA_ENV=\"paper\""
echo ""
echo "     # IBKR (start Client Portal Gateway first)"
echo "     export IBKR_BASE_URL=\"https://localhost:5000/v1/api\""
echo ""
echo "  2. Restart the gateway:"
echo "     openclaw gateway restart"
echo ""
echo "  3. Verify tools are loaded:"
echo "     openclaw plugins list"
echo ""
echo "  4. Try it out:"
echo "     \"Show me my finance tools\""
echo ""
