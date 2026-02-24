import type { MarketIntelConfig } from "../types.js"

const SEC_EDGAR_DATA_BASE = "https://data.sec.gov"

export async function secEdgarSearchRequest<T>(
  config: MarketIntelConfig,
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  const url = new URL(path, config.secEdgarBaseUrl)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, value)
      }
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "User-Agent": config.secEdgarUserAgent,
      Accept: "application/json",
    },
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
      `SEC EDGAR API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}

export async function secEdgarDataRequest<T>(
  config: MarketIntelConfig,
  path: string
): Promise<T> {
  const url = new URL(path, SEC_EDGAR_DATA_BASE)

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "User-Agent": config.secEdgarUserAgent,
      Accept: "application/json",
    },
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
      `SEC EDGAR Data API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}
