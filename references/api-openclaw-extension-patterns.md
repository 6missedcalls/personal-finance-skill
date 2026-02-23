# OpenClaw Extensions and Plugins Reference

## Quick Start
1. Create plugin directory with manifest `openclaw.plugin.json`.
2. Define `id` and `configSchema` in manifest.
3. Export extension entrypoint(s) from package and register them.
4. Register tools/hooks so agents can call them.
5. Configure secrets via plugin config/env indirection.
6. (Optional) add cron jobs for scheduled agent execution.

## Extension and Plugin Packaging

## Manifest file
Every plugin ships `openclaw.plugin.json` at plugin root.

Minimal example:
```json
{
  "id": "voice-call",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

Common manifest keys:
- `id` (required)
- `configSchema` (required)
- `kind`
- `channels`
- `providers`
- `skills`
- `name`
- `description`
- `uiHints`
- `version`

## package.json extension entry points
```json
{
  "name": "my-pack",
  "openclaw": {
    "extensions": ["./src/safety.ts", "./src/tools.ts"]
  }
}
```

If multiple extensions are exported, IDs are resolved from package + entrypoint basename.

## Tool Registration Patterns

Extensions register callable tools into agent runtime. Common pattern:
1. Define tool metadata (name, description, input schema).
2. Bind handler implementation.
3. Ensure tool is attached to session/tool registry at startup hook.

Typical tool contract elements:
- `name`
- `description`
- `input_schema` (JSON schema)
- async `handler(input, context)` returning structured output

Guidelines:
- keep input schema strict (`additionalProperties: false` where possible)
- return deterministic JSON outputs
- map runtime errors to actionable error payloads for agents

## Configuration and Secrets Management

## Config validation
- `configSchema` is validated before plugin code runs.
- Invalid/missing manifest blocks plugin config validation.

## Secrets patterns
- avoid hardcoding credentials in plugin code
- use environment variables and inject into plugin config
- keep secret fields separate from non-secret runtime options
- rotate tokens and fail closed when secret missing

Example schema with secrets indirection:
```json
{
  "id": "my-tool-plugin",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "apiBaseUrl": {"type": "string"},
      "apiKeyEnv": {"type": "string", "description": "Name of env var holding API key"}
    },
    "required": ["apiBaseUrl", "apiKeyEnv"]
  }
}
```

## Extension Lifecycle

## Plugin hooks in agent/gateway lifecycle
Hook points include:
- `before_model_resolve`
- `before_prompt_build`
- `before_agent_start` (legacy)
- `before_tool_call`
- `after_tool_call`
- `tool_result_persist`
- `before_compaction`
- `after_compaction`
- `agent_end`
- `message_received`
- `message_sending`
- `message_sent`
- `session_start`
- `session_end`
- `gateway_start`
- `gateway_stop`

Use cases:
- tool governance/policy checks (`before_tool_call`)
- prompt augmentation (`before_prompt_build`)
- telemetry and auditing (`after_tool_call`, `agent_end`)
- transport/channel side effects (`message_sent`)

## Hook handler example
```typescript
import type { HookHandler } from "../../src/hooks/hooks.js";

const myHandler: HookHandler = async (event) => {
  if (event.type !== "command" || event.action !== "new") return;
  event.messages.push("Hook executed");
};

export default myHandler;
```

## How Tools Are Exposed to Agents

Tools become available when:
1. extension/plugin loads successfully,
2. tool registry receives tool definition,
3. current session policy allows tool usage.

Agent loop can intercept and transform tool inputs/results with hook chain above.

Persistence step (`tool_result_persist`) allows synchronous shaping/redaction before memory/storage.

## Cron Job Configuration

## Global config (`openclaw.json`)
```json5
{
  cron: {
    enabled: true,
    store: "~/.openclaw/cron/jobs.json",
    maxConcurrentRuns: 1,
    webhook: "https://example.invalid/legacy", // deprecated fallback
    webhookToken: "replace-with-dedicated-webhook-token"
  }
}
```

Disable cron:
- config: `cron.enabled: false`
- env: `OPENCLAW_SKIP_CRON=1`

## Cron CLI

Add one-shot:
```bash
openclaw cron add \
  --name "Reminder" \
  --at "2026-02-01T16:00:00Z" \
  --session main \
  --system-event "Reminder: check docs" \
  --wake now \
  --delete-after-run
```

Add recurring:
```bash
openclaw cron add \
  --name "Morning brief" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Summarize overnight updates." \
  --announce \
  --channel slack \
  --to "channel:C1234567890"
```

Manage jobs:
- `openclaw cron list`
- `openclaw cron run <job-id>`
- `openclaw cron runs --id <job-id> --limit 50`
- `openclaw cron edit <job-id> --message "..." --model "opus"`

## Webhook delivery for cron runs
- Prefer per-job `delivery.mode: "webhook"` and `delivery.to` URL.
- If `cron.webhookToken` is set, sent as `Authorization: Bearer <token>`.
- Legacy stored jobs with `notify: true` may use `cron.webhook` fallback.

## Memory Integration Patterns

Recommended patterns:
- write concise structured tool results for future retrieval
- redact secrets/PII before persistence (`tool_result_persist`)
- use deterministic IDs (session/message/tool-call IDs) to link events
- compact long histories via compaction hooks and preserve critical facts

Useful hook points:
- `before_compaction` / `after_compaction` for summarization quality controls
- `tool_result_persist` for normalization and redaction
- `session_start` / `session_end` for boundary markers and checkpoints

## Examples from Existing Extension Docs

### Multi-extension package
`package.json` with `openclaw.extensions` array for separate concerns (`safety.ts`, `tools.ts`).

### Lifecycle interception
Use `before_tool_call` for policy enforcement, `after_tool_call` for telemetry, and `message_sent` for external audit sinks.

### Command hook
Simple command-driven hook handler appending messages to outbound stream.

## Primary Sources
- https://github.com/openclaw/openclaw/blob/main/docs/tools/plugin.md
- https://github.com/openclaw/openclaw/blob/main/docs/plugins/manifest.md
- https://github.com/openclaw/openclaw/blob/main/docs/concepts/agent-loop.md
- https://github.com/openclaw/openclaw/blob/main/docs/automation/cron-jobs.md
- https://github.com/openclaw/openclaw/blob/main/docs/automation/hooks.md
