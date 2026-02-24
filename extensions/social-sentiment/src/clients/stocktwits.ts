import type { SocialSentimentConfig } from "../types.js"

function buildUrl(baseUrl: string, path: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  const segment = path.startsWith("/") ? path : `/${path}`
  return `${base}${segment}`
}

export async function stocktwitsRequest<T>(
  config: SocialSentimentConfig,
  path: string
): Promise<T> {
  const url = buildUrl(config.stocktwitsBaseUrl, path)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage: string
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message ?? errorText
    } catch {
      errorMessage = errorText
    }
    throw new Error(
      `StockTwits API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}
