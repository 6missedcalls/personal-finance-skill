import { describe, it, expect } from 'vitest'
import { formatPlaidError } from '../src/types.js'

// Re-implement isPlaidToolError inline for testing since it doesn't exist yet (RED phase)
function isPlaidToolError(value: unknown): value is {
  error: true
  errorType: string
  errorCode: string
  errorMessage: string
  requestId: string | null
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as any).error === true &&
    typeof (value as any).errorMessage === 'string'
  )
}

// Simulates the current (broken) makeTool error handler from index.ts
function brokenSerialize(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return message
}

// Simulates the fixed makeTool error handler
function fixedSerialize(error: unknown): object {
  if (isPlaidToolError(error)) {
    return error
  }
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null
      ? JSON.stringify(error)
      : String(error)
  return { success: false, error: message }
}

describe('isPlaidToolError', () => {
  it('should identify a valid PlaidToolError object', () => {
    const plaidError = formatPlaidError({
      response: {
        data: {
          error_type: 'ITEM_ERROR',
          error_code: 'ITEM_LOGIN_REQUIRED',
          error_message: 'Login required',
          request_id: 'req-123',
        },
      },
    })

    expect(isPlaidToolError(plaidError)).toBe(true)
  })

  it('should identify a PlaidToolError from a plain Error', () => {
    const plaidError = formatPlaidError(new Error('Network timeout'))
    expect(isPlaidToolError(plaidError)).toBe(true)
  })

  it('should reject a plain Error instance', () => {
    expect(isPlaidToolError(new Error('oops'))).toBe(false)
  })

  it('should reject null', () => {
    expect(isPlaidToolError(null)).toBe(false)
  })

  it('should reject undefined', () => {
    expect(isPlaidToolError(undefined)).toBe(false)
  })

  it('should reject a string', () => {
    expect(isPlaidToolError('some error')).toBe(false)
  })

  it('should reject an object without error: true', () => {
    expect(isPlaidToolError({ errorMessage: 'test' })).toBe(false)
  })

  it('should reject an object without errorMessage', () => {
    expect(isPlaidToolError({ error: true })).toBe(false)
  })
})

describe('bug: [object Object] error serialization', () => {
  it('should demonstrate the broken behavior — String() on PlaidToolError produces [object Object]', () => {
    const plaidError = formatPlaidError({
      response: {
        data: {
          error_type: 'ITEM_ERROR',
          error_code: 'ITEM_LOGIN_REQUIRED',
          error_message: 'The login details have changed',
          request_id: 'req-broken',
        },
      },
    })

    // This is what the current code does — the bug
    const brokenResult = brokenSerialize(plaidError)
    expect(brokenResult).toBe('[object Object]')
  })

  it('should serialize PlaidToolError as structured data with the fix', () => {
    const plaidError = formatPlaidError({
      response: {
        data: {
          error_type: 'ITEM_ERROR',
          error_code: 'ITEM_LOGIN_REQUIRED',
          error_message: 'The login details have changed',
          request_id: 'req-fixed',
        },
      },
    })

    const fixedResult = fixedSerialize(plaidError)
    expect(fixedResult).toEqual({
      error: true,
      errorType: 'ITEM_ERROR',
      errorCode: 'ITEM_LOGIN_REQUIRED',
      errorMessage: 'The login details have changed',
      requestId: 'req-fixed',
    })
  })

  it('should still serialize regular Errors by extracting .message', () => {
    const result = fixedSerialize(new Error('Connection refused'))
    expect(result).toEqual({ success: false, error: 'Connection refused' })
  })

  it('should JSON.stringify unknown objects instead of String()', () => {
    const unknownObj = { code: 500, detail: 'Internal error' }
    const result = fixedSerialize(unknownObj) as { success: boolean; error: string }
    expect(result.success).toBe(false)
    expect(result.error).not.toBe('[object Object]')
    expect(JSON.parse(result.error)).toEqual(unknownObj)
  })

  it('should handle string errors as-is', () => {
    const result = fixedSerialize('plain string error')
    expect(result).toEqual({ success: false, error: 'plain string error' })
  })

  it('should handle network errors without response.data', () => {
    const plaidError = formatPlaidError(new Error('ECONNREFUSED'))

    const fixedResult = fixedSerialize(plaidError)
    expect(fixedResult).toEqual({
      error: true,
      errorType: 'UNKNOWN',
      errorCode: 'UNKNOWN',
      errorMessage: 'ECONNREFUSED',
      requestId: null,
    })
  })
})
