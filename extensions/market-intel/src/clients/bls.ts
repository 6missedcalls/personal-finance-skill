import type { MarketIntelConfig, BlsRequestBody } from "../types.js"

export async function blsRequest<T>(
  config: MarketIntelConfig,
  body: BlsRequestBody
): Promise<T> {
  const url = new URL("/publicAPI/v2/timeseries/data/", config.blsBaseUrl)

  const requestBody: BlsRequestBody = config.blsApiKey
    ? { ...body, registrationkey: config.blsApiKey }
    : body

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
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
      `BLS API error (${response.status}): ${errorMessage}`
    )
  }

  return response.json() as Promise<T>
}
