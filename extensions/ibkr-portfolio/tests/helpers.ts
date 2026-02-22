import { vi } from 'vitest'
import type { IbkrConfig } from '../src/config.js'

export const TEST_CONFIG: IbkrConfig = {
  baseUrl: 'https://localhost:5000/v1/api',
  defaultAccountId: 'U1234567',
}

export function mockFetch(response: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(response),
  })
}

export function mockFetchSequence(
  responses: ReadonlyArray<{ body: unknown; status?: number }>
) {
  const mock = vi.fn()
  for (const [i, res] of responses.entries()) {
    const status = res.status ?? 200
    mock.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(res.body),
    })
  }
  return mock
}

export function mockFetchError(error: string, statusCode = 400) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: statusCode,
    statusText: 'Error',
    json: () => Promise.resolve({ error, statusCode }),
  })
}

export function installFetch(mock: ReturnType<typeof mockFetch>) {
  vi.stubGlobal('fetch', mock)
}
