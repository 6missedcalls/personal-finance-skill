import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildConfig } from "../src/config.ts"

describe("buildConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns null keys when env vars are not set", () => {
    const config = buildConfig({})

    expect(config.finnhubApiKey).toBeNull()
    expect(config.fredApiKey).toBeNull()
    expect(config.blsApiKey).toBeNull()
    expect(config.alphaVantageApiKey).toBeNull()
  })

  it("reads API keys from default env var names", () => {
    vi.stubEnv("FINNHUB_API_KEY", "fh-key")
    vi.stubEnv("FRED_API_KEY", "fred-key")
    vi.stubEnv("BLS_API_KEY", "bls-key")
    vi.stubEnv("ALPHA_VANTAGE_API_KEY", "av-key")

    const config = buildConfig({})

    expect(config.finnhubApiKey).toBe("fh-key")
    expect(config.fredApiKey).toBe("fred-key")
    expect(config.blsApiKey).toBe("bls-key")
    expect(config.alphaVantageApiKey).toBe("av-key")
  })

  it("reads API keys from custom env var names", () => {
    vi.stubEnv("MY_FH_KEY", "custom-fh")
    vi.stubEnv("MY_FRED_KEY", "custom-fred")
    vi.stubEnv("MY_BLS_KEY", "custom-bls")
    vi.stubEnv("MY_AV_KEY", "custom-av")

    const config = buildConfig({
      finnhubApiKeyEnv: "MY_FH_KEY",
      fredApiKeyEnv: "MY_FRED_KEY",
      blsApiKeyEnv: "MY_BLS_KEY",
      alphaVantageApiKeyEnv: "MY_AV_KEY",
    })

    expect(config.finnhubApiKey).toBe("custom-fh")
    expect(config.fredApiKey).toBe("custom-fred")
    expect(config.blsApiKey).toBe("custom-bls")
    expect(config.alphaVantageApiKey).toBe("custom-av")
  })

  it("sets correct default base URLs", () => {
    const config = buildConfig({})

    expect(config.finnhubBaseUrl).toBe("https://finnhub.io/api/v1")
    expect(config.fredBaseUrl).toBe("https://api.stlouisfed.org/fred")
    expect(config.blsBaseUrl).toBe("https://api.bls.gov/publicAPI/v2")
    expect(config.alphaVantageBaseUrl).toBe("https://www.alphavantage.co/query")
    expect(config.secEdgarBaseUrl).toBe("https://efts.sec.gov/LATEST")
  })

  it("uses default SEC EDGAR user agent when not provided", () => {
    const config = buildConfig({})

    expect(config.secEdgarUserAgent).toBe(
      "PersonalFinanceSkill/1.0 (contact@example.com)"
    )
  })

  it("uses custom SEC EDGAR user agent when provided", () => {
    const config = buildConfig({
      secEdgarUserAgent: "MyApp/2.0 (me@company.com)",
    })

    expect(config.secEdgarUserAgent).toBe("MyApp/2.0 (me@company.com)")
  })

  it("supports partial env var configuration", () => {
    vi.stubEnv("FINNHUB_API_KEY", "fh-only")

    const config = buildConfig({})

    expect(config.finnhubApiKey).toBe("fh-only")
    expect(config.fredApiKey).toBeNull()
    expect(config.blsApiKey).toBeNull()
    expect(config.alphaVantageApiKey).toBeNull()
  })
})
