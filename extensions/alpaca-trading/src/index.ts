import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk"

import { buildConfig } from "./config.js"
import { getAccountTool } from "./tools/get-account.js"
import { listPositionsTool } from "./tools/list-positions.js"
import { getPositionTool } from "./tools/get-position.js"
import { listOrdersTool } from "./tools/list-orders.js"
import { createOrderTool } from "./tools/create-order.js"
import { cancelOrderTool } from "./tools/cancel-order.js"
import { portfolioHistoryTool } from "./tools/portfolio-history.js"
import { getAssetsTool } from "./tools/get-assets.js"
import { marketDataTool } from "./tools/market-data.js"
import { clockTool } from "./tools/clock.js"
import type { AlpacaConfig, AlpacaEnv } from "./types.js"

// --- Tool Adapter ---

interface LegacyToolDef {
  readonly name: string
  readonly description: string
  readonly input_schema: Record<string, unknown>
  readonly handler: (input: any, context: { config: AlpacaConfig }) => Promise<unknown>
}

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    details: payload,
  }
}

const ALL_TOOLS: ReadonlyArray<LegacyToolDef> = [
  getAccountTool,
  listPositionsTool,
  getPositionTool,
  listOrdersTool,
  createOrderTool,
  cancelOrderTool,
  portfolioHistoryTool,
  getAssetsTool,
  marketDataTool,
  clockTool,
]

// --- Plugin Definition ---

const plugin: { id: string; name: string; description: string; configSchema: any; register: (api: OpenClawPluginApi) => void } = {
  id: "alpaca-trading",
  name: "Alpaca Trading",
  description:
    "Alpaca brokerage integration for account management, trading, positions, and market data",
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    const cfg = (api.pluginConfig ?? {}) as Record<string, unknown>

    // Lazy config — defers env var resolution to first tool call
    let configCache: AlpacaConfig | null = null

    const getConfig = (): AlpacaConfig => {
      if (configCache) return configCache
      configCache = buildConfig({
        apiKeyEnv: (cfg.apiKeyEnv as string) ?? "ALPACA_API_KEY",
        apiSecretEnv: (cfg.apiSecretEnv as string) ?? "ALPACA_API_SECRET",
        env: (cfg.env as AlpacaEnv) ?? "paper",
        maxOrderQty: cfg.maxOrderQty as number | undefined,
        maxOrderNotional: cfg.maxOrderNotional as number | undefined,
      })
      return configCache
    }

    for (const tool of ALL_TOOLS) {
      api.registerTool(
        {
          name: tool.name,
          label: tool.name,
          description: tool.description,
          parameters: tool.input_schema,
          async execute(_toolCallId: string, params: unknown) {
            try {
              const config = getConfig()
              const result = await tool.handler(params as Record<string, unknown>, { config })
              return jsonResult(result)
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error)
              return jsonResult({ success: false, error: message })
            }
          },
        } as any,
      )
    }
  },
}

export default plugin

export { buildConfig } from "./config.js"
export type { AlpacaConfig, AlpacaEnv } from "./types.js"
