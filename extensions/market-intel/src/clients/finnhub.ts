import type { MarketIntelConfig } from "../types.js"

export async function finnhubRequest<T>(
  config: MarketIntelConfig,
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  if (!config.finnhubApiKey) {
    throw new Error("FINNHUB_API_KEY not configured")
  }

  const url = new URL(path, config.finnhubBaseUrl)
  url.searchParams.set("token", config.finnhubApiKey)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, value)
      }
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
      errorMessage = errorJson.error ?? errorJson.message ?? errorText
    } catch {
      errorMessage = errorText
    }
    throw new Error(
      `Finnhub API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}
