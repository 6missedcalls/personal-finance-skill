import { buildConfig } from "./config.js"
import { getAccountTool } from "./tools/get-account.js"
import { listPositionsTool } from "./tools/list-positions.js"
import { getPositionTool } from "./tools/get-position.js"
import { listOrdersTool } from "./tools/list-orders.js"
import { createOrderTool } from "./tools/create-order.js"
import { cancelOrderTool } from "./tools/cancel-order.js"
import { portfolioHistoryTool } from "./tools/portfolio-history.js"
import { getAssetsTool } from "./tools/get-assets.js"
import { marketDataTool } from "./tools/market-data.js"
import { clockTool } from "./tools/clock.js"
import type { AlpacaConfig } from "./types.js"

interface ToolDefinition {
  readonly name: string
  readonly description: string
  readonly input_schema: Record<string, unknown>
  readonly handler: (input: Record<string, unknown>, context: { config: AlpacaConfig }) => Promise<unknown>
}

const ALL_TOOLS: ReadonlyArray<ToolDefinition> = [
  getAccountTool,
  listPositionsTool,
  getPositionTool,
  listOrdersTool,
  createOrderTool,
  cancelOrderTool,
  portfolioHistoryTool,
  getAssetsTool,
  marketDataTool,
  clockTool,
]

export function register(registry: {
  registerTool: (tool: ToolDefinition) => void
}, pluginConfig: {
  readonly apiKeyEnv: string
  readonly apiSecretEnv: string
  readonly env: "paper" | "live"
  readonly maxOrderQty?: number
  readonly maxOrderNotional?: number
}) {
  const config = buildConfig(pluginConfig)

  for (const tool of ALL_TOOLS) {
    registry.registerTool({
      ...tool,
      handler: (input: Record<string, unknown>) => tool.handler(input, { config }),
    })
  }
}

export { buildConfig } from "./config.js"
export type { AlpacaConfig, AlpacaEnv } from "./types.js"
