import type { MarketIntelConfig } from "../types.js"

export async function alphaVantageRequest<T>(
  config: MarketIntelConfig,
  params: Record<string, string>
): Promise<T> {
  if (!config.alphaVantageApiKey) {
    throw new Error("ALPHA_VANTAGE_API_KEY not configured")
  }

  const url = new URL(config.alphaVantageBaseUrl)
  url.searchParams.set("apikey", config.alphaVantageApiKey)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage: string
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.Error ?? errorJson.message ?? errorText
    } catch {
      errorMessage = errorText
    }
    throw new Error(
      `Alpha Vantage API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}
