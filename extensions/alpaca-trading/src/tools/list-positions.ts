import type { AlpacaPosition, ToolContext, ToolResult } from "../types.js"
import { alpacaRequest } from "../client.js"

interface ListPositionsInput {
  readonly env?: "paper" | "live"
}

export const listPositionsTool = {
  name: "alpaca_list_positions",
  description:
    "List all open positions in the Alpaca trading account with market values and P/L",
  input_schema: {
    type: "object",
    properties: {
      env: {
        type: "string",
        enum: ["paper", "live"],
        description: "Trading environment to use. Defaults to configured environment.",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: ListPositionsInput,
    context: ToolContext
  ): Promise<ToolResult<ReadonlyArray<AlpacaPosition>>> {
    try {
      const config = input.env
        ? { ...context.config, env: input.env }
        : context.config

      const positions = await alpacaRequest<AlpacaPosition[]>(config, "/v2/positions")

      return {
        success: true,
        data: positions,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve positions: ${message}`,
      }
    }
  },
}
