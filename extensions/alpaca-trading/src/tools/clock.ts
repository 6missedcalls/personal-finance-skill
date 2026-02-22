import type { AlpacaClock, ToolContext, ToolResult } from "../types.js"
import { alpacaRequest } from "../client.js"

type ClockInput = Record<string, never>

export const clockTool = {
  name: "alpaca_clock",
  description:
    "Get current market clock showing if the market is open, and next open/close times",
  input_schema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  async handler(
    _input: ClockInput,
    context: ToolContext
  ): Promise<ToolResult<AlpacaClock>> {
    try {
      const clock = await alpacaRequest<AlpacaClock>(
        context.config,
        "/v2/clock"
      )

      return {
        success: true,
        data: clock,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve market clock: ${message}`,
      }
    }
  },
}
