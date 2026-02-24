import type { SocialSentimentConfig } from "../types.js"

export async function xApiRequest<T>(
  config: SocialSentimentConfig,
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  if (!config.xApiBearerToken) {
    throw new Error("X_API_BEARER_TOKEN not configured")
  }

  const urlObj = new URL(`${config.xApiBaseUrl}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        urlObj.searchParams.set(key, value)
      }
    }
  }

  const response = await fetch(urlObj.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.xApiBearerToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage: string
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message ?? errorJson.detail ?? errorText
    } catch {
      errorMessage = errorText
    }
    throw new Error(
      `X API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}
