import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk"

import { buildConfig } from "./config.js"
import { companyNewsTool } from "./tools/company-news.js"
import { marketNewsTool } from "./tools/market-news.js"
import { stockFundamentalsTool } from "./tools/stock-fundamentals.js"
import { analystRecommendationsTool } from "./tools/analyst-recommendations.js"
import { secFilingsTool } from "./tools/sec-filings.js"
import { secSearchTool } from "./tools/sec-search.js"
import { fredSeriesTool } from "./tools/fred-series.js"
import { fredSearchTool } from "./tools/fred-search.js"
import { blsDataTool } from "./tools/bls-data.js"
import { newsSentimentTool } from "./tools/news-sentiment.js"
import type { MarketIntelConfig } from "./types.js"

// --- Tool Adapter ---

interface LegacyToolDef {
  readonly name: string
  readonly description: string
  readonly input_schema: Record<string, unknown>
  readonly handler: (input: any, context: { config: MarketIntelConfig }) => Promise<unknown>
}

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    details: payload,
  }
}

const ALL_TOOLS: ReadonlyArray<LegacyToolDef> = [
  companyNewsTool,
  marketNewsTool,
  stockFundamentalsTool,
  analystRecommendationsTool,
  secFilingsTool,
  secSearchTool,
  fredSeriesTool,
  fredSearchTool,
  blsDataTool,
  newsSentimentTool,
]

// --- Plugin Definition ---

const plugin: { id: string; name: string; description: string; configSchema: any; register: (api: OpenClawPluginApi) => void } = {
  id: "market-intel",
  name: "Market Intelligence",
  description:
    "Company news, SEC filings, economic data, analyst recommendations, and news sentiment from Finnhub, SEC EDGAR, FRED, BLS, and Alpha Vantage",
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    const cfg = (api.pluginConfig ?? {}) as Record<string, unknown>

    // Lazy config — defers env var resolution to first tool call
    let configCache: MarketIntelConfig | null = null

    const getConfig = (): MarketIntelConfig => {
      if (configCache) return configCache
      configCache = buildConfig({
        finnhubApiKeyEnv: (cfg.finnhubApiKeyEnv as string) ?? undefined,
        fredApiKeyEnv: (cfg.fredApiKeyEnv as string) ?? undefined,
        blsApiKeyEnv: (cfg.blsApiKeyEnv as string) ?? undefined,
        alphaVantageApiKeyEnv: (cfg.alphaVantageApiKeyEnv as string) ?? undefined,
        secEdgarUserAgent: (cfg.secEdgarUserAgent as string) ?? undefined,
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
export type { MarketIntelConfig } from "./types.js"
