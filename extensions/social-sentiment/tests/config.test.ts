import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildConfig } from "../src/config.ts"

describe("buildConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns null tokens when env vars are not set", () => {
    const config = buildConfig({})

    expect(config.xApiBearerToken).toBeNull()
    expect(config.quiverApiKey).toBeNull()
    expect(config.stocktwitsBaseUrl).toBe("https://api.stocktwits.com/api/2")
    expect(config.xApiBaseUrl).toBe("https://api.twitter.com/2")
    expect(config.quiverBaseUrl).toBe("https://api.quiverquant.com/beta/live")
  })

  it("reads X bearer token from default env var", () => {
    vi.stubEnv("X_API_BEARER_TOKEN", "my-x-token")

    const config = buildConfig({})

    expect(config.xApiBearerToken).toBe("my-x-token")
  })

  it("reads X bearer token from custom env var", () => {
    vi.stubEnv("CUSTOM_X_TOKEN", "custom-x-token")

    const config = buildConfig({ xApiBearerTokenEnv: "CUSTOM_X_TOKEN" })

    expect(config.xApiBearerToken).toBe("custom-x-token")
  })

  it("reads Quiver API key from default env var", () => {
    vi.stubEnv("QUIVER_API_KEY", "my-quiver-key")

    const config = buildConfig({})

    expect(config.quiverApiKey).toBe("my-quiver-key")
  })

  it("reads Quiver API key from custom env var", () => {
    vi.stubEnv("CUSTOM_QUIVER_KEY", "custom-quiver-key")

    const config = buildConfig({ quiverApiKeyEnv: "CUSTOM_QUIVER_KEY" })

    expect(config.quiverApiKey).toBe("custom-quiver-key")
  })

  it("returns null when custom env var names point to unset vars", () => {
    const config = buildConfig({
      xApiBearerTokenEnv: "NONEXISTENT_X_VAR",
      quiverApiKeyEnv: "NONEXISTENT_QUIVER_VAR",
    })

    expect(config.xApiBearerToken).toBeNull()
    expect(config.quiverApiKey).toBeNull()
  })

  it("sets all base URLs correctly regardless of env vars", () => {
    const config = buildConfig({})

    expect(config.stocktwitsBaseUrl).toBe("https://api.stocktwits.com/api/2")
    expect(config.xApiBaseUrl).toBe("https://api.twitter.com/2")
    expect(config.quiverBaseUrl).toBe("https://api.quiverquant.com/beta/live")
  })
})
