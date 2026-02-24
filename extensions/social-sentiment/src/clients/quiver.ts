import type { SocialSentimentConfig } from "../types.js"

export async function quiverRequest<T>(
  config: SocialSentimentConfig,
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  if (!config.quiverApiKey) {
    throw new Error("QUIVER_API_KEY not configured")
  }

  const urlObj = new URL(`${config.quiverBaseUrl}${path}`)
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
      Authorization: `Bearer ${config.quiverApiKey}`,
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
      `Quiver API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}
