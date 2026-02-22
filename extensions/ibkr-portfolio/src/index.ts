import { loadConfig, type IbkrConfig } from './config.js'
import { authStatusTool, createAuthStatusHandler } from './tools/auth-status.js'
import { tickleTool, createTickleHandler } from './tools/tickle.js'
import {
  listAccountsTool,
  createListAccountsHandler,
} from './tools/list-accounts.js'
import {
  getPositionsTool,
  createGetPositionsHandler,
} from './tools/get-positions.js'
import {
  portfolioAllocationTool,
  createPortfolioAllocationHandler,
} from './tools/portfolio-allocation.js'
import {
  portfolioPerformanceTool,
  createPortfolioPerformanceHandler,
} from './tools/portfolio-performance.js'
import {
  searchContractsTool,
  createSearchContractsHandler,
} from './tools/search-contracts.js'
import {
  marketSnapshotTool,
  createMarketSnapshotHandler,
} from './tools/market-snapshot.js'
import { getOrdersTool, createGetOrdersHandler } from './tools/get-orders.js'

export interface ToolDefinition {
  readonly name: string
  readonly description: string
  readonly input_schema: object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly handler: (config: IbkrConfig) => (input: any) => Promise<unknown>
}

export const tools: ReadonlyArray<ToolDefinition> = [
  authStatusTool,
  tickleTool,
  listAccountsTool,
  getPositionsTool,
  portfolioAllocationTool,
  portfolioPerformanceTool,
  searchContractsTool,
  marketSnapshotTool,
  getOrdersTool,
]

type ToolHandler = (input: unknown) => Promise<unknown>

export function registerTools(
  registry: {
    register: (tool: {
      name: string
      description: string
      input_schema: object
      handler: ToolHandler
    }) => void
  }
): void {
  const config = loadConfig()

  const entries: ReadonlyArray<{
    tool: ToolDefinition
    handler: ToolHandler
  }> = [
    { tool: authStatusTool, handler: createAuthStatusHandler(config) as ToolHandler },
    { tool: tickleTool, handler: createTickleHandler(config) as ToolHandler },
    { tool: listAccountsTool, handler: createListAccountsHandler(config) as ToolHandler },
    { tool: getPositionsTool, handler: createGetPositionsHandler(config) as ToolHandler },
    {
      tool: portfolioAllocationTool,
      handler: createPortfolioAllocationHandler(config) as ToolHandler,
    },
    {
      tool: portfolioPerformanceTool,
      handler: createPortfolioPerformanceHandler(config) as ToolHandler,
    },
    {
      tool: searchContractsTool,
      handler: createSearchContractsHandler(config) as ToolHandler,
    },
    {
      tool: marketSnapshotTool,
      handler: createMarketSnapshotHandler(config) as ToolHandler,
    },
    { tool: getOrdersTool, handler: createGetOrdersHandler(config) as ToolHandler },
  ]

  for (const { tool, handler } of entries) {
    registry.register({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
      handler,
    })
  }
}

export {
  authStatusTool,
  tickleTool,
  listAccountsTool,
  getPositionsTool,
  portfolioAllocationTool,
  portfolioPerformanceTool,
  searchContractsTool,
  marketSnapshotTool,
  getOrdersTool,
}
