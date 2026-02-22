import type { AlpacaConfig, AlpacaEnv } from "./types.js"

const BASE_URLS: Record<AlpacaEnv, string> = {
  paper: "https://paper-api.alpaca.markets",
  live: "https://api.alpaca.markets",
}

const DATA_BASE_URL = "https://data.alpaca.markets"

export function buildConfig(pluginConfig: {
  readonly apiKeyEnv: string
  readonly apiSecretEnv: string
  readonly env: AlpacaEnv
  readonly maxOrderQty?: number
  readonly maxOrderNotional?: number
}): AlpacaConfig {
  const apiKey = process.env[pluginConfig.apiKeyEnv]
  if (!apiKey) {
    throw new Error(
      `Alpaca API key not found in env var: ${pluginConfig.apiKeyEnv}`
    )
  }

  const apiSecret = process.env[pluginConfig.apiSecretEnv]
  if (!apiSecret) {
    throw new Error(
      `Alpaca API secret not found in env var: ${pluginConfig.apiSecretEnv}`
    )
  }

  return {
    apiKey,
    apiSecret,
    env: pluginConfig.env,
    baseUrl: BASE_URLS[pluginConfig.env],
    dataBaseUrl: DATA_BASE_URL,
    maxOrderQty: pluginConfig.maxOrderQty,
    maxOrderNotional: pluginConfig.maxOrderNotional,
  }
}
