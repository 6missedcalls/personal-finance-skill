import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { tools, registerTools } from '../src/index.js'

describe('extension entry point', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('exports all 9 tools', () => {
    expect(tools).toHaveLength(9)
  })

  it('exports tools with correct names', () => {
    const names = tools.map((t) => t.name)
    expect(names).toContain('ibkr_auth_status')
    expect(names).toContain('ibkr_tickle')
    expect(names).toContain('ibkr_list_accounts')
    expect(names).toContain('ibkr_get_positions')
    expect(names).toContain('ibkr_portfolio_allocation')
    expect(names).toContain('ibkr_portfolio_performance')
    expect(names).toContain('ibkr_search_contracts')
    expect(names).toContain('ibkr_market_snapshot')
    expect(names).toContain('ibkr_get_orders')
  })

  it('each tool has required fields', () => {
    for (const tool of tools) {
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(tool.input_schema).toBeDefined()
      expect(tool.handler).toBeTypeOf('function')
    }
  })

  it('registerTools registers all tools to registry', () => {
    const registered: Array<{ name: string }> = []
    const mockRegistry = {
      register: (tool: { name: string }) => {
        registered.push(tool)
      },
    }

    registerTools(mockRegistry)
    expect(registered).toHaveLength(9)

    const names = registered.map((t) => t.name)
    expect(names).toContain('ibkr_auth_status')
    expect(names).toContain('ibkr_get_orders')
  })

  it('all input schemas have additionalProperties false', () => {
    for (const tool of tools) {
      const schema = tool.input_schema as Record<string, unknown>
      expect(schema.additionalProperties).toBe(false)
    }
  })

  it('all input schemas require userId', () => {
    for (const tool of tools) {
      const schema = tool.input_schema as { required: string[] }
      expect(schema.required).toContain('userId')
    }
  })
})
