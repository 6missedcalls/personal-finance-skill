import type { AlpacaConfig } from "./types.js"

interface RequestOptions {
  readonly method?: string
  readonly body?: unknown
  readonly params?: Record<string, string | undefined>
}

export async function alpacaRequest<T>(
  config: AlpacaConfig,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params } = options

  const url = new URL(path, config.baseUrl)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, value)
      }
    }
  }

  const headers: Record<string, string> = {
    "APCA-API-KEY-ID": config.apiKey,
    "APCA-API-SECRET-KEY": config.apiSecret,
    "Content-Type": "application/json",
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
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
      `Alpaca API error (${response.status}): ${errorMessage}`
    )
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

export async function alpacaDataRequest<T>(
  config: AlpacaConfig,
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  const url = new URL(path, config.dataBaseUrl)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, value)
      }
    }
  }

  const headers: Record<string, string> = {
    "APCA-API-KEY-ID": config.apiKey,
    "APCA-API-SECRET-KEY": config.apiSecret,
  }

  const response = await fetch(url.toString(), { headers })

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
      `Alpaca Data API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}
