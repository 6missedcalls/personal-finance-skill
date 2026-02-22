import type { AlpacaPosition, ToolContext, ToolResult } from "../types.js"
import { alpacaRequest } from "../client.js"

interface GetPositionInput {
  readonly symbol_or_asset_id: string
  readonly env?: "paper" | "live"
}

export const getPositionTool = {
  name: "alpaca_get_position",
  description: "Get details for a single position by symbol or asset ID",
  input_schema: {
    type: "object",
    properties: {
      symbol_or_asset_id: {
        type: "string",
        description: "The ticker symbol (e.g. AAPL) or Alpaca asset UUID of the position.",
      },
      env: {
        type: "string",
        enum: ["paper", "live"],
        description: "Trading environment to use. Defaults to configured environment.",
      },
    },
    required: ["symbol_or_asset_id"],
    additionalProperties: false,
  },
  async handler(
    input: GetPositionInput,
    context: ToolContext
  ): Promise<ToolResult<AlpacaPosition>> {
    try {
      const config = input.env
        ? { ...context.config, env: input.env }
        : context.config

      const encoded = encodeURIComponent(input.symbol_or_asset_id)
      const position = await alpacaRequest<AlpacaPosition>(
        config,
        `/v2/positions/${encoded}`
      )

      return {
        success: true,
        data: position,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve position for "${input.symbol_or_asset_id}": ${message}`,
      }
    }
  },
}
