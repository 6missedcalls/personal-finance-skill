# OpenClaw

OpenClaw is a personal AI assistant platform that runs locally on your devices and connects to messaging channels you already use—WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, Microsoft Teams, and more. It operates as a Gateway-based control plane that manages sessions, channels, tools, and events, providing a unified interface for AI-powered conversations across multiple platforms. The system supports voice interactions via Voice Wake and Talk Mode on macOS/iOS/Android, visual workspaces through Live Canvas, and extensible automation via cron jobs and webhooks.

The architecture centers around a WebSocket-based Gateway that serves as the single control plane for all client interactions. OpenClaw embeds an agent runtime derived from pi-mono, with OpenClaw-owned session management, tool wiring, and workspace bootstrap. It supports multi-agent routing for isolated workspaces, sandboxed execution for security, and a skills system for teaching the agent how to use tools. The platform is designed for single-user, local-first operation with optional remote access via Tailscale or SSH tunnels.

## Installation

Install OpenClaw globally and run the onboarding wizard.

```bash
# macOS/Linux - Install via script
curl -fsSL https://openclaw.ai/install.sh | bash

# Or install via npm/pnpm
npm install -g openclaw@latest
# pnpm add -g openclaw@latest

# Run the onboarding wizard (installs daemon service)
openclaw onboard --install-daemon

# Check gateway status
openclaw gateway status

# Open the Control UI in browser
openclaw dashboard
```

## Gateway Configuration

Configure OpenClaw via `~/.openclaw/openclaw.json` (JSON5 format) to set up models, channels, and tools.

```json5
// ~/.openclaw/openclaw.json
{
  // Agent configuration with model selection
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace",
      model: {
        primary: "anthropic/claude-sonnet-4-5",
        fallbacks: ["openai/gpt-5.2"],
      },
      models: {
        "anthropic/claude-sonnet-4-5": { alias: "Sonnet" },
        "openai/gpt-5.2": { alias: "GPT" },
      },
    },
  },

  // Channel configuration with DM policy
  channels: {
    whatsapp: {
      dmPolicy: "pairing",  // pairing | allowlist | open | disabled
      allowFrom: ["+15551234567"],
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"],
    },
    telegram: {
      enabled: true,
      botToken: "123456:ABCDEF",
      dmPolicy: "pairing",
    },
    discord: {
      token: "your-discord-bot-token",
    },
    slack: {
      botToken: "xoxb-...",
      appToken: "xapp-...",
    },
  },

  // Session management
  session: {
    dmScope: "per-channel-peer",
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 120,
    },
  },

  // Tool configuration
  tools: {
    profile: "coding",  // minimal | coding | messaging | full
    allow: ["group:fs", "browser"],
    deny: [],
  },
}
```

## Gateway Commands

Start and manage the Gateway service using CLI commands.

```bash
# Start gateway in foreground
openclaw gateway --port 18789 --verbose

# Start gateway as background service
openclaw gateway install --force
openclaw gateway start
openclaw gateway stop
openclaw gateway restart

# Check gateway health and status
openclaw gateway status
openclaw health

# Run diagnostics and fix issues
openclaw doctor
openclaw doctor --fix --yes

# View logs
openclaw logs --follow

# Interactive configuration
openclaw configure
openclaw configure --section web
openclaw configure --section channels

# Direct config manipulation
openclaw config get agents.defaults.workspace
openclaw config set agents.defaults.heartbeat.every "2h"
openclaw config unset tools.web.search.apiKey
```

## WhatsApp Channel Setup

Link WhatsApp and configure access controls for the messaging channel.

```bash
# Link WhatsApp account via QR code
openclaw channels login --channel whatsapp

# Link specific account
openclaw channels login --channel whatsapp --account work

# Check channel status
openclaw channels status

# Logout from WhatsApp
openclaw channels logout --channel whatsapp

# List and approve pairing requests
openclaw pairing list whatsapp
openclaw pairing approve whatsapp <CODE>
```

```json5
// WhatsApp channel configuration in openclaw.json
{
  channels: {
    whatsapp: {
      // DM access policy
      dmPolicy: "allowlist",
      allowFrom: ["+15551234567", "+15559876543"],

      // Group settings
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"],
      groups: { "*": { requireMention: true } },

      // Delivery settings
      textChunkLimit: 4000,
      chunkMode: "newline",
      mediaMaxMb: 50,
      sendReadReceipts: true,

      // Acknowledgment reactions
      ackReaction: {
        emoji: "👀",
        direct: true,
        group: "mentions",
      },

      // Multi-account support
      accounts: {
        work: {
          enabled: true,
          dmPolicy: "allowlist",
          allowFrom: ["+15551234567"],
        },
      },
    },
  },
}
```

## OpenAI-Compatible HTTP API

Enable and use the OpenAI Chat Completions endpoint for tool integration.

```bash
# Non-streaming request
curl -sS http://127.0.0.1:18789/v1/chat/completions \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-openclaw-agent-id: main' \
  -d '{
    "model": "openclaw",
    "messages": [{"role":"user","content":"Hello, how are you?"}]
  }'

# Streaming request (SSE)
curl -N http://127.0.0.1:18789/v1/chat/completions \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'x-openclaw-agent-id: main' \
  -d '{
    "model": "openclaw",
    "stream": true,
    "messages": [{"role":"user","content":"Tell me a joke"}]
  }'

# Target specific agent via model field
curl -sS http://127.0.0.1:18789/v1/chat/completions \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "openclaw:beta",
    "messages": [{"role":"user","content":"Run analysis"}]
  }'
```

```json5
// Enable the endpoint in openclaw.json
{
  gateway: {
    http: {
      endpoints: {
        chatCompletions: { enabled: true },
      },
    },
  },
}
```

## Webhook Integration

Configure webhook endpoints for external system triggers.

```bash
# Wake endpoint - enqueue system event for main session
curl -X POST http://127.0.0.1:18789/hooks/wake \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"text":"New email received","mode":"now"}'

# Agent endpoint - run isolated agent turn
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Summarize inbox",
    "name": "Email",
    "agentId": "hooks",
    "wakeMode": "now",
    "deliver": true,
    "channel": "whatsapp",
    "to": "+15551234567",
    "model": "openai/gpt-5.2-mini",
    "thinking": "low",
    "timeoutSeconds": 120
  }'

# Custom mapped hook (e.g., Gmail)
curl -X POST http://127.0.0.1:18789/hooks/gmail \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"source":"gmail","messages":[{"from":"Ada","subject":"Hello","snippet":"Hi"}]}'
```

```json5
// Webhook configuration in openclaw.json
{
  hooks: {
    enabled: true,
    token: "${OPENCLAW_HOOKS_TOKEN}",
    path: "/hooks",
    defaultSessionKey: "hook:ingress",
    allowRequestSessionKey: false,
    allowedSessionKeyPrefixes: ["hook:"],
    allowedAgentIds: ["hooks", "main"],
    mappings: [
      {
        match: { path: "gmail" },
        action: "agent",
        agentId: "main",
        deliver: true,
      },
    ],
  },
}
```

## Cron Jobs and Scheduling

Create and manage scheduled jobs for automated agent runs.

```bash
# One-shot reminder (auto-deletes after success)
openclaw cron add \
  --name "Reminder" \
  --at "2026-02-01T16:00:00Z" \
  --session main \
  --system-event "Reminder: check the docs draft" \
  --wake now \
  --delete-after-run

# Recurring isolated job with delivery
openclaw cron add \
  --name "Morning brief" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Summarize overnight updates." \
  --announce \
  --channel slack \
  --to "channel:C1234567890"

# Job with model and thinking override
openclaw cron add \
  --name "Deep analysis" \
  --cron "0 6 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Weekly deep analysis of project progress." \
  --model "opus" \
  --thinking high \
  --announce \
  --channel whatsapp \
  --to "+15551234567"

# List, run, and manage jobs
openclaw cron list
openclaw cron run <job-id>
openclaw cron runs --id <job-id> --limit 50
openclaw cron edit <job-id> --message "Updated prompt" --model "opus"

# Immediate system event without creating a job
openclaw system event --mode now --text "Next heartbeat: check battery."
```

```json5
// Cron configuration in openclaw.json
{
  cron: {
    enabled: true,
    store: "~/.openclaw/cron/jobs.json",
    maxConcurrentRuns: 1,
    webhookToken: "replace-with-dedicated-webhook-token",
  },
}
```

## Agent Tools

OpenClaw exposes first-class agent tools for browser control, canvas, nodes, messaging, and automation.

```json5
// Tool configuration in openclaw.json
{
  tools: {
    // Base tool profile
    profile: "coding",  // minimal | coding | messaging | full

    // Allow/deny specific tools
    allow: ["group:fs", "browser", "slack", "discord"],
    deny: ["exec"],

    // Tool groups available:
    // - group:runtime: exec, bash, process
    // - group:fs: read, write, edit, apply_patch
    // - group:sessions: sessions_list, sessions_history, sessions_send, sessions_spawn, session_status
    // - group:memory: memory_search, memory_get
    // - group:web: web_search, web_fetch
    // - group:ui: browser, canvas
    // - group:automation: cron, gateway
    // - group:messaging: message
    // - group:nodes: nodes
    // - group:openclaw: all built-in OpenClaw tools

    // Provider-specific restrictions
    byProvider: {
      "google-antigravity": { profile: "minimal" },
      "openai/gpt-5.2": { allow: ["group:fs", "sessions_list"] },
    },

    // Web tools
    web: {
      search: {
        enabled: true,
        maxResults: 5,
      },
      fetch: {
        enabled: true,
        maxCharsCap: 50000,
      },
    },

    // Browser control
    exec: {
      applyPatch: { enabled: true, workspaceOnly: true },
    },

    // Loop detection
    loopDetection: {
      enabled: true,
      warningThreshold: 10,
      criticalThreshold: 20,
      globalCircuitBreakerThreshold: 30,
    },
  },
}
```

## Browser Tool

Control a dedicated OpenClaw-managed browser for web automation.

```json5
// Browser tool actions and parameters
// Tool: browser

// Start browser and check status
{ "action": "status" }
{ "action": "start", "profile": "chrome" }

// Navigation and tabs
{ "action": "open", "url": "https://example.com" }
{ "action": "tabs" }
{ "action": "focus", "tabId": 1 }
{ "action": "close", "tabId": 1 }

// Take snapshot for AI analysis
{ "action": "snapshot", "snapshotMode": "ai" }  // or "aria"

// UI actions (use ref from snapshot)
{ "action": "act", "ref": 12, "action": "click" }
{ "action": "act", "ref": 15, "action": "type", "text": "Hello" }
{ "action": "act", "ref": 20, "action": "press", "key": "Enter" }

// Screenshot and PDF
{ "action": "screenshot" }
{ "action": "pdf" }

// Profile management
{ "action": "profiles" }
{ "action": "create-profile", "name": "work" }
{ "action": "delete-profile", "name": "work" }
```

```json5
// Browser configuration in openclaw.json
{
  browser: {
    enabled: true,
    defaultProfile: "chrome",
    color: "#FF4500",
  },
}
```

## Message Tool

Send messages and perform channel actions across messaging platforms.

```json5
// Message tool actions
// Tool: message

// Send text message
{
  "action": "send",
  "channel": "whatsapp",
  "to": "+15551234567",
  "text": "Hello from OpenClaw!"
}

// Send with media
{
  "action": "send",
  "channel": "telegram",
  "to": "-1001234567890",
  "text": "Check this image",
  "media": [{ "path": "/path/to/image.png" }]
}

// Create poll (WhatsApp/Discord/MS Teams)
{
  "action": "poll",
  "channel": "discord",
  "to": "channel:123456789",
  "question": "What's for lunch?",
  "options": ["Pizza", "Sushi", "Tacos"]
}

// React to message
{
  "action": "react",
  "channel": "telegram",
  "messageId": "12345",
  "emoji": "👍"
}

// Thread operations
{ "action": "thread-create", "channel": "slack", "to": "channel:C123", "name": "Discussion" }
{ "action": "thread-reply", "channel": "slack", "threadId": "T123", "text": "Reply text" }

// Search messages
{ "action": "search", "channel": "discord", "query": "important", "limit": 10 }

// Channel info
{ "action": "channel-list", "channel": "slack" }
{ "action": "member-info", "channel": "discord", "userId": "123456789" }
```

## Sessions Tool

Manage agent sessions, inspect history, and coordinate multi-agent workflows.

```json5
// Sessions tool actions
// Tool: sessions_list, sessions_history, sessions_send, sessions_spawn, session_status

// List active sessions
{
  "tool": "sessions_list",
  "kinds": ["dm", "group"],
  "limit": 10,
  "activeMinutes": 60,
  "messageLimit": 5
}

// Get session history
{
  "tool": "sessions_history",
  "sessionKey": "main",  // or sessionId
  "limit": 50,
  "includeTools": true
}

// Send message to another session
{
  "tool": "sessions_send",
  "sessionKey": "agent:work",
  "message": "Please analyze the latest report",
  "timeoutSeconds": 120  // 0 = fire-and-forget
}

// Spawn a sub-agent
{
  "tool": "sessions_spawn",
  "task": "Research competitor pricing",
  "label": "Research",
  "agentId": "researcher",
  "model": "anthropic/claude-sonnet-4-5",
  "runTimeoutSeconds": 300,
  "cleanup": true
}

// Get/set session status
{
  "tool": "session_status",
  "sessionKey": "main",
  "model": "opus"  // or "default" to clear override
}
```

## Nodes Tool

Discover and interact with paired device nodes (macOS/iOS/Android).

```json5
// Nodes tool actions
// Tool: nodes

// List connected nodes
{ "action": "status" }
{ "action": "describe", "node": "office-mac" }

// Pairing management
{ "action": "pending" }
{ "action": "approve", "nodeId": "abc123" }
{ "action": "reject", "nodeId": "abc123" }

// Notifications (macOS)
{
  "action": "notify",
  "node": "office-mac",
  "title": "Reminder",
  "body": "Meeting in 5 minutes"
}

// Run command on node (macOS)
{
  "action": "run",
  "node": "office-mac",
  "command": ["echo", "Hello"],
  "env": ["FOO=bar"],
  "commandTimeoutMs": 12000,
  "invokeTimeoutMs": 45000,
  "needsScreenRecording": false
}

// Camera and screen capture
{ "action": "camera_snap", "node": "iphone" }
{ "action": "camera_clip", "node": "iphone", "durationSeconds": 5 }
{ "action": "screen_record", "node": "office-mac", "durationSeconds": 10 }

// Location
{ "action": "location_get", "node": "iphone" }
```

## Multi-Agent Routing

Configure multiple isolated agents with separate workspaces and session routing.

```json5
// Multi-agent configuration in openclaw.json
{
  agents: {
    list: [
      {
        id: "home",
        default: true,
        workspace: "~/.openclaw/workspace-home",
        groupChat: {
          mentionPatterns: ["@openclaw", "openclaw"],
        },
      },
      {
        id: "work",
        workspace: "~/.openclaw/workspace-work",
        model: {
          primary: "anthropic/claude-opus-4-6",
        },
        tools: {
          profile: "coding",
          deny: ["browser"],
        },
      },
      {
        id: "support",
        workspace: "~/.openclaw/workspace-support",
        tools: {
          profile: "messaging",
          allow: ["slack", "discord"],
        },
      },
    ],
  },

  // Route channels/accounts to specific agents
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },
    { agentId: "work", match: { channel: "slack" } },
    { agentId: "support", match: { channel: "discord" } },
  ],
}
```

## Sandboxing

Run agent sessions in isolated Docker containers for security.

```json5
// Sandbox configuration in openclaw.json
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",  // off | non-main | all
        scope: "agent",    // session | agent | shared
        docker: {
          image: "openclaw-sandbox:latest",
          setupCommand: "apt-get update && apt-get install -y python3",
        },
        // Tool allowlist for sandboxed sessions
        toolAllowlist: [
          "bash", "process", "read", "write", "edit",
          "sessions_list", "sessions_history", "sessions_send"
        ],
        // Tool denylist
        toolDenylist: ["browser", "canvas", "nodes", "cron", "gateway"],
      },
    },
  },
}
```

```bash
# Build sandbox image
scripts/sandbox-setup.sh

# Or manually build
docker build -f Dockerfile.sandbox -t openclaw-sandbox:latest .
```

## Skills System

Load and configure skills that teach the agent how to use tools.

```bash
# Install skill from ClawHub
clawhub install <skill-slug>

# Update all installed skills
clawhub update --all

# Sync workspace skills to ClawHub
clawhub sync --all
```

```json5
// Skills configuration in openclaw.json
{
  skills: {
    // Enable/disable specific skills
    entries: {
      "nano-banana-pro": {
        enabled: true,
        apiKey: "GEMINI_KEY_HERE",
        env: {
          GEMINI_API_KEY: "GEMINI_KEY_HERE",
        },
        config: {
          endpoint: "https://example.invalid",
          model: "nano-pro",
        },
      },
      peekaboo: { enabled: true },
      sag: { enabled: false },
    },

    // Allowlist for bundled skills only
    allowBundled: ["peekaboo", "summarize"],

    // Skill loading configuration
    load: {
      watch: true,
      watchDebounceMs: 250,
      extraDirs: ["~/shared-skills"],
    },

    // Installation preferences
    install: {
      nodeManager: "pnpm",  // npm | pnpm | yarn | bun
    },
  },
}
```

```markdown
<!-- Example SKILL.md format -->
---
name: nano-banana-pro
description: Generate or edit images via Gemini 3 Pro Image
metadata: {"openclaw": {"requires": {"bins": ["uv"], "env": ["GEMINI_API_KEY"]}, "primaryEnv": "GEMINI_API_KEY", "emoji": "🍌"}}
---

# Nano Banana Pro

Use this skill to generate and edit images using Gemini 3 Pro Image model.

## Usage

Run the command in `{baseDir}`:
```bash
uv run generate-image.py --prompt "A banana on Mars"
```
```

## Agent Workspace Bootstrap

Configure the agent workspace with bootstrap files for persona and instructions.

```bash
# Initialize workspace with default templates
openclaw setup

# Workspace structure at ~/.openclaw/workspace/
# ├── AGENTS.md      # Operating instructions + memory
# ├── SOUL.md        # Persona, boundaries, tone
# ├── TOOLS.md       # User tool notes and conventions
# ├── BOOTSTRAP.md   # One-time first-run ritual (deleted after)
# ├── IDENTITY.md    # Agent name/vibe/emoji
# ├── USER.md        # User profile + preferred address
# └── skills/        # Workspace-specific skills
```

```markdown
<!-- Example AGENTS.md -->
# Operating Instructions

You are a helpful AI assistant running on OpenClaw.

## Memory
- User prefers concise responses
- Primary work context: software development
- Timezone: America/Los_Angeles

## Conventions
- Always confirm before making file changes
- Use markdown formatting for code blocks
- Summarize long outputs
```

## Heartbeat Configuration

Configure periodic check-ins for proactive agent behavior.

```json5
// Heartbeat configuration in openclaw.json
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",        // Duration string (e.g., "30m", "2h", "0m" to disable)
        target: "last",      // last | whatsapp | telegram | discord | none
        prompt: "Check for pending tasks and updates.",
      },
    },
  },
}
```

```bash
# Trigger immediate heartbeat
openclaw system event --mode now --text "Manual heartbeat trigger"

# Check heartbeat status
openclaw status
```

## Environment Variables

Configure OpenClaw behavior via environment variables.

```bash
# Core paths
export OPENCLAW_HOME="$HOME"                    # Home directory for path resolution
export OPENCLAW_STATE_DIR="$HOME/.openclaw"     # State directory
export OPENCLAW_CONFIG_PATH="$HOME/.openclaw/openclaw.json"  # Config file path

# Gateway configuration
export OPENCLAW_GATEWAY_TOKEN="your-token"      # Gateway auth token
export OPENCLAW_GATEWAY_PASSWORD="your-pass"    # Gateway password (if password auth)

# Channel tokens
export TELEGRAM_BOT_TOKEN="123456:ABCDEF"
export DISCORD_BOT_TOKEN="your-discord-token"
export SLACK_BOT_TOKEN="xoxb-..."
export SLACK_APP_TOKEN="xapp-..."

# API keys for tools
export BRAVE_API_KEY="your-brave-api-key"       # Web search
export GEMINI_API_KEY="your-gemini-key"         # Gemini skills

# Skip features
export OPENCLAW_SKIP_CHANNELS=1                 # Skip channel initialization
export OPENCLAW_SKIP_CRON=1                     # Disable cron scheduler

# Development
export OPENCLAW_LIVE_TEST=1                     # Enable live tests
export OPENCLAW_PROFILE=dev                     # Use dev profile
```

## Summary

OpenClaw provides a comprehensive platform for running personal AI assistants across multiple messaging channels with a unified Gateway architecture. The primary use cases include: personal productivity assistance via WhatsApp/Telegram/Discord, automated workflows through cron jobs and webhooks, browser automation for web tasks, and multi-device coordination via connected nodes. The system excels at scenarios requiring persistent conversation context, scheduled reminders, cross-platform message routing, and tool-augmented AI interactions.

Integration patterns typically involve: (1) setting up the Gateway with desired channels and authentication, (2) configuring the agent workspace with custom prompts and skills, (3) using the OpenAI-compatible HTTP API for programmatic access from external tools, (4) setting up webhooks for event-driven automation from services like Gmail or GitHub, and (5) scheduling recurring tasks via cron jobs for proactive agent behavior. The platform's modular architecture allows for customization at every level—from model selection and tool policies to sandboxed execution and multi-agent routing—making it suitable for both simple personal assistant setups and complex multi-channel automation workflows.
