import type { MarketIntelConfig } from "./types.js"

interface PluginConfigInput {
  readonly finnhubApiKeyEnv?: string
  readonly fredApiKeyEnv?: string
  readonly blsApiKeyEnv?: string
  readonly alphaVantageApiKeyEnv?: string
  readonly secEdgarUserAgent?: string
}

export function buildConfig(pluginConfig: PluginConfigInput): MarketIntelConfig {
  const finnhubEnv = pluginConfig.finnhubApiKeyEnv ?? "FINNHUB_API_KEY"
  const fredEnv = pluginConfig.fredApiKeyEnv ?? "FRED_API_KEY"
  const blsEnv = pluginConfig.blsApiKeyEnv ?? "BLS_API_KEY"
  const alphaVantageEnv = pluginConfig.alphaVantageApiKeyEnv ?? "ALPHA_VANTAGE_API_KEY"

  return {
    finnhubApiKey: process.env[finnhubEnv] ?? null,
    finnhubBaseUrl: "https://finnhub.io/api/v1",
    fredApiKey: process.env[fredEnv] ?? null,
    fredBaseUrl: "https://api.stlouisfed.org/fred",
    blsApiKey: process.env[blsEnv] ?? null,
    blsBaseUrl: "https://api.bls.gov/publicAPI/v2",
    alphaVantageApiKey: process.env[alphaVantageEnv] ?? null,
    alphaVantageBaseUrl: "https://www.alphavantage.co/query",
    secEdgarBaseUrl: "https://efts.sec.gov/LATEST",
    secEdgarUserAgent:
      pluginConfig.secEdgarUserAgent ??
      "PersonalFinanceSkill/1.0 (contact@example.com)",
  }
}
