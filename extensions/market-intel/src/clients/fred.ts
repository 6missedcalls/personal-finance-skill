import type { MarketIntelConfig } from "../types.js"

export async function fredRequest<T>(
  config: MarketIntelConfig,
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  if (!config.fredApiKey) {
    throw new Error("FRED_API_KEY not configured")
  }

  const url = new URL(path, config.fredBaseUrl)
  url.searchParams.set("api_key", config.fredApiKey)
  url.searchParams.set("file_type", "json")

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
      errorMessage = errorJson.error_message ?? errorJson.message ?? errorText
    } catch {
      errorMessage = errorText
    }
    throw new Error(
      `FRED API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}
