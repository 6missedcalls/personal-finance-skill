import { vi } from "vitest"
import type { SocialSentimentConfig } from "../src/types.ts"

// ── Shared mock config ──────────────────────────────────────────────────────

export const mockConfig: SocialSentimentConfig = {
  stocktwitsBaseUrl: "https://api.stocktwits.com/api/2",
  xApiBearerToken: "test-bearer-token",
  xApiBaseUrl: "https://api.twitter.com/2",
  quiverApiKey: "test-quiver-key",
  quiverBaseUrl: "https://api.quiverquant.com/beta/live",
}

export const mockContext = { config: mockConfig }

export const mockConfigNoX: SocialSentimentConfig = {
  ...mockConfig,
  xApiBearerToken: null,
}

export const mockConfigNoQuiver: SocialSentimentConfig = {
  ...mockConfig,
  quiverApiKey: null,
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

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getLastFetchCall(): { url: string; options: RequestInit } {
  const mockFn = vi.mocked(fetch)
  const [url, options] = mockFn.mock.calls[mockFn.mock.calls.length - 1] as [
    string,
    RequestInit,
  ]
  return { url, options }
}
