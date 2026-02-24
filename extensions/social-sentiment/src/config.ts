import type { SocialSentimentConfig } from "./types.js"

export function buildConfig(pluginConfig: {
  readonly xApiBearerTokenEnv?: string
  readonly quiverApiKeyEnv?: string
}): SocialSentimentConfig {
  const xEnvVar = pluginConfig.xApiBearerTokenEnv ?? "X_API_BEARER_TOKEN"
  const quiverEnvVar = pluginConfig.quiverApiKeyEnv ?? "QUIVER_API_KEY"

  return {
    stocktwitsBaseUrl: "https://api.stocktwits.com/api/2",
    xApiBearerToken: process.env[xEnvVar] ?? null,
    xApiBaseUrl: "https://api.twitter.com/2",
    quiverApiKey: process.env[quiverEnvVar] ?? null,
    quiverBaseUrl: "https://api.quiverquant.com/beta/live",
  }
}
