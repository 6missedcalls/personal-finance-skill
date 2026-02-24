import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk"

import type { IbkrConfig } from "./config.js"
import { authStatusTool, createAuthStatusHandler } from "./tools/auth-status.js"
import { tickleTool, createTickleHandler } from "./tools/tickle.js"
import { listAccountsTool, createListAccountsHandler } from "./tools/list-accounts.js"
import { getPositionsTool, createGetPositionsHandler } from "./tools/get-positions.js"
import {
  portfolioAllocationTool,
  createPortfolioAllocationHandler,
} from "./tools/portfolio-allocation.js"
import {
  portfolioPerformanceTool,
  createPortfolioPerformanceHandler,
} from "./tools/portfolio-performance.js"
import { searchContractsTool, createSearchContractsHandler } from "./tools/search-contracts.js"
import { marketSnapshotTool, createMarketSnapshotHandler } from "./tools/market-snapshot.js"
import { getOrdersTool, createGetOrdersHandler } from "./tools/get-orders.js"

// --- Tool Adapter ---

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    details: payload,
  }
}

type ToolMeta = {
  readonly name: string
  readonly description: string
  readonly input_schema: object
}

type ToolHandler = (input: unknown) => Promise<unknown>

function makeTool(meta: ToolMeta, handler: ToolHandler) {
  return {
    name: meta.name,
    label: meta.name,
    description: meta.description,
    parameters: meta.input_schema,
    async execute(_toolCallId: string, params: unknown) {
      try {
        const result = await handler(params)
        return jsonResult(result)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return jsonResult({ success: false, error: message })
      }
    },
  }
}

// --- Plugin Definition ---

const plugin: { id: string; name: string; description: string; configSchema: any; register: (api: OpenClawPluginApi) => void } = {
  id: "ibkr-portfolio",
  name: "IBKR Portfolio",
  description:
    "Interactive Brokers Client Portal API integration for portfolio positions, allocation, performance, market data, and order monitoring",
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    const cfg = (api.pluginConfig ?? {}) as Record<string, unknown>

    // Build config — gracefully defaults to localhost
    const config: IbkrConfig = {
      baseUrl: ((cfg.baseUrl as string | undefined) ??
        (cfg.baseUrlEnv ? process.env[cfg.baseUrlEnv as string] : undefined) ??
        process.env.IBKR_BASE_URL ??
        process.env.IBKR_GATEWAY_URL ??
        "https://localhost:5000/v1/api"
      ).replace(/\/+$/, ""),
      defaultAccountId:
        (cfg.defaultAccountId as string | undefined) ?? process.env.IBKR_ACCOUNT_ID,
    }

    const entries: ReadonlyArray<{ meta: ToolMeta; handler: ToolHandler }> = [
      { meta: authStatusTool, handler: createAuthStatusHandler(config) as ToolHandler },
      { meta: tickleTool, handler: createTickleHandler(config) as ToolHandler },
      { meta: listAccountsTool, handler: createListAccountsHandler(config) as ToolHandler },
      { meta: getPositionsTool, handler: createGetPositionsHandler(config) as ToolHandler },
      {
        meta: portfolioAllocationTool,
        handler: createPortfolioAllocationHandler(config) as ToolHandler,
      },
      {
        meta: portfolioPerformanceTool,
        handler: createPortfolioPerformanceHandler(config) as ToolHandler,
      },
      { meta: searchContractsTool, handler: createSearchContractsHandler(config) as ToolHandler },
      { meta: marketSnapshotTool, handler: createMarketSnapshotHandler(config) as ToolHandler },
      { meta: getOrdersTool, handler: createGetOrdersHandler(config) as ToolHandler },
    ]

    for (const { meta, handler } of entries) {
      api.registerTool(makeTool(meta, handler) as any)
    }
  },
}

export default plugin

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
