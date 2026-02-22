import type { IbkrApiError, ToolError } from './types.js'

export interface IbkrConfig {
  readonly baseUrl: string
  readonly defaultAccountId?: string
}

export function loadConfig(): IbkrConfig {
  const baseUrl =
    process.env.IBKR_BASE_URL ??
    process.env.IBKR_GATEWAY_URL ??
    'https://localhost:5000/v1/api'

  const defaultAccountId = process.env.IBKR_ACCOUNT_ID

  return { baseUrl: baseUrl.replace(/\/+$/, ''), defaultAccountId }
}

export async function ibkrFetch<T>(
  config: IbkrConfig,
  path: string,
  options: {
    readonly method?: string
    readonly body?: unknown
    readonly params?: Readonly<Record<string, string>>
  } = {}
): Promise<T> {
  const { method = 'GET', body, params } = options
  const url = new URL(`${config.baseUrl}${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({
      error: response.statusText,
      statusCode: response.status,
    }))) as IbkrApiError

    throw new IbkrRequestError(
      errorBody.error ?? `HTTP ${response.status}`,
      response.status
    )
  }

  return (await response.json()) as T
}

export class IbkrRequestError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'IbkrRequestError'
    this.statusCode = statusCode
  }
}

export function toToolError(error: unknown): ToolError {
  if (error instanceof IbkrRequestError) {
    return {
      success: false,
      error: error.message,
      code: `IBKR_${error.statusCode}`,
    }
  }

  const message =
    error instanceof Error ? error.message : 'Unknown error occurred'

  return {
    success: false,
    error: message,
    code: 'IBKR_UNKNOWN',
  }
}

export function freshness(): string {
  return new Date().toISOString()
}
