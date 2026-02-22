import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadConfig, ibkrFetch, IbkrRequestError, toToolError } from '../src/config.js'
import { installFetch, mockFetch, mockFetchError } from './helpers.js'

describe('loadConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.unstubAllGlobals()
  })

  it('returns default config when no env vars set', () => {
    delete process.env.IBKR_BASE_URL
    delete process.env.IBKR_GATEWAY_URL
    delete process.env.IBKR_ACCOUNT_ID

    const config = loadConfig()
    expect(config.baseUrl).toBe('https://localhost:5000/v1/api')
    expect(config.defaultAccountId).toBeUndefined()
  })

  it('uses IBKR_BASE_URL when set', () => {
    process.env.IBKR_BASE_URL = 'https://custom:8080/v1/api'
    const config = loadConfig()
    expect(config.baseUrl).toBe('https://custom:8080/v1/api')
  })

  it('strips trailing slashes from baseUrl', () => {
    process.env.IBKR_BASE_URL = 'https://custom:8080/v1/api///'
    const config = loadConfig()
    expect(config.baseUrl).toBe('https://custom:8080/v1/api')
  })

  it('uses IBKR_ACCOUNT_ID when set', () => {
    process.env.IBKR_ACCOUNT_ID = 'U9999999'
    const config = loadConfig()
    expect(config.defaultAccountId).toBe('U9999999')
  })
})

describe('ibkrFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('makes GET request by default', async () => {
    const mock = mockFetch({ result: 'ok' })
    installFetch(mock)

    const config = { baseUrl: 'https://localhost:5000/v1/api' }
    await ibkrFetch(config, '/test')

    expect(mock).toHaveBeenCalledWith(
      'https://localhost:5000/v1/api/test',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('makes POST request with body', async () => {
    const mock = mockFetch({ result: 'ok' })
    installFetch(mock)

    const config = { baseUrl: 'https://localhost:5000/v1/api' }
    await ibkrFetch(config, '/test', { method: 'POST', body: { key: 'val' } })

    expect(mock).toHaveBeenCalledWith(
      'https://localhost:5000/v1/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'val' }),
      })
    )
  })

  it('appends query params', async () => {
    const mock = mockFetch({ result: 'ok' })
    installFetch(mock)

    const config = { baseUrl: 'https://localhost:5000/v1/api' }
    await ibkrFetch(config, '/test', { params: { foo: 'bar', baz: '1' } })

    const calledUrl = mock.mock.calls[0][0] as string
    expect(calledUrl).toContain('foo=bar')
    expect(calledUrl).toContain('baz=1')
  })

  it('throws IbkrRequestError on non-ok response', async () => {
    installFetch(mockFetchError('Bad request', 400))

    const config = { baseUrl: 'https://localhost:5000/v1/api' }
    await expect(ibkrFetch(config, '/test')).rejects.toThrow(IbkrRequestError)
  })
})

describe('toToolError', () => {
  it('converts IbkrRequestError', () => {
    const error = new IbkrRequestError('Not found', 404)
    const result = toToolError(error)

    expect(result).toEqual({
      success: false,
      error: 'Not found',
      code: 'IBKR_404',
    })
  })

  it('converts generic Error', () => {
    const result = toToolError(new Error('Something broke'))
    expect(result).toEqual({
      success: false,
      error: 'Something broke',
      code: 'IBKR_UNKNOWN',
    })
  })

  it('converts unknown error', () => {
    const result = toToolError('string error')
    expect(result).toEqual({
      success: false,
      error: 'Unknown error occurred',
      code: 'IBKR_UNKNOWN',
    })
  })
})
