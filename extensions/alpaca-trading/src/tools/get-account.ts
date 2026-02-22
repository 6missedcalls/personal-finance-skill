import type { AlpacaAccount, ToolContext, ToolResult } from "../types.js"
import { alpacaRequest } from "../client.js"

interface GetAccountInput {
  readonly env?: "paper" | "live"
}

export const getAccountTool = {
  name: "alpaca_get_account",
  description:
    "Get Alpaca trading account details including balances, buying power, and status",
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
    input: GetAccountInput,
    context: ToolContext
  ): Promise<ToolResult<AlpacaAccount>> {
    try {
      const config = input.env
        ? { ...context.config, env: input.env }
        : context.config

      const account = await alpacaRequest<AlpacaAccount>(config, "/v2/account")

      return {
        success: true,
        data: account,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve account: ${message}`,
      }
    }
  },
}
