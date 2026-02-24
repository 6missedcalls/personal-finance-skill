import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk"

import { buildConfig } from "./config.js"
import { stocktwitsSentimentTool } from "./tools/stocktwits-sentiment.js"
import { stocktwitsTrendingTool } from "./tools/stocktwits-trending.js"
import { xSearchTool } from "./tools/x-search.js"
import { xUserTimelineTool } from "./tools/x-user-timeline.js"
import { xCashtagTool } from "./tools/x-cashtag.js"
import { quiverCongressTool } from "./tools/quiver-congress.js"
import type { SocialSentimentConfig } from "./types.js"

// --- Tool Adapter ---

interface LegacyToolDef {
  readonly name: string
  readonly description: string
  readonly input_schema: Record<string, unknown>
  readonly handler: (input: any, context: { config: SocialSentimentConfig }) => Promise<unknown>
}

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    details: payload,
  }
}

const ALL_TOOLS: ReadonlyArray<LegacyToolDef> = [
  stocktwitsSentimentTool,
  stocktwitsTrendingTool,
  xSearchTool,
  xUserTimelineTool,
  xCashtagTool,
  quiverCongressTool,
]

// --- Plugin Definition ---

const plugin: { id: string; name: string; description: string; configSchema: any; register: (api: OpenClawPluginApi) => void } = {
  id: "social-sentiment",
  name: "Social Sentiment",
  description:
    "Social media sentiment monitoring for financial signals via StockTwits, X/Twitter, and Quiver Quantitative",
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    const cfg = (api.pluginConfig ?? {}) as Record<string, unknown>

    // Lazy config — defers env var resolution to first tool call
    let configCache: SocialSentimentConfig | null = null

    const getConfig = (): SocialSentimentConfig => {
      if (configCache) return configCache
      configCache = buildConfig({
        xApiBearerTokenEnv: (cfg.xApiBearerTokenEnv as string) ?? "X_API_BEARER_TOKEN",
        quiverApiKeyEnv: (cfg.quiverApiKeyEnv as string) ?? "QUIVER_API_KEY",
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
export type { SocialSentimentConfig } from "./types.js"
