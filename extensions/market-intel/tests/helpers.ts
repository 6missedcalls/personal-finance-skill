import { vi } from "vitest"
import type { MarketIntelConfig } from "../src/types.ts"

// ── Shared mock config ──────────────────────────────────────────────────────

export const mockConfig: MarketIntelConfig = {
  finnhubApiKey: "test-finnhub-key",
  finnhubBaseUrl: "https://finnhub.io/api/v1",
  fredApiKey: "test-fred-key",
  fredBaseUrl: "https://api.stlouisfed.org/fred",
  blsApiKey: "test-bls-key",
  blsBaseUrl: "https://api.bls.gov/publicAPI/v2",
  alphaVantageApiKey: "test-av-key",
  alphaVantageBaseUrl: "https://www.alphavantage.co/query",
  secEdgarBaseUrl: "https://efts.sec.gov/LATEST",
  secEdgarUserAgent: "TestAgent/1.0 (test@example.com)",
}

export const mockContext = { config: mockConfig }

// ── Config with null keys ────────────────────────────────────────────────────

export function configWithNullKey(
  key: keyof MarketIntelConfig,
): MarketIntelConfig {
  return { ...mockConfig, [key]: null }
}

// ── Fetch mock helpers ──────────────────────────────────────────────────────

export function mockFetchSuccess(body: unknown, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status,
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    })
  )
}

export function mockFetchError(status: number, message: string): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      text: () => Promise.resolve(JSON.stringify({ message })),
      json: () => Promise.resolve({ message }),
    })
  )
}

export function mockFetchSequence(
  responses: ReadonlyArray<{ readonly body: unknown; readonly ok?: boolean; readonly status?: number }>
): void {
  const mockFn = vi.fn()
  for (const resp of responses) {
    const ok = resp.ok ?? true
    const status = resp.status ?? 200
    mockFn.mockResolvedValueOnce({
      ok,
      status,
      json: () => Promise.resolve(resp.body),
      text: () => Promise.resolve(JSON.stringify(resp.body)),
    })
  }
  vi.stubGlobal("fetch", mockFn)
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getLastFetchCall(): { url: string; options: RequestInit } {
  const mockFn = vi.mocked(fetch)
  const [url, options] = mockFn.mock.calls[mockFn.mock.calls.length - 1] as [
    string,
    RequestInit
  ]
  return { url, options }
}

export function getFetchCall(index: number): { url: string; options: RequestInit } {
  const mockFn = vi.mocked(fetch)
  const [url, options] = mockFn.mock.calls[index] as [string, RequestInit]
  return { url, options }
}
