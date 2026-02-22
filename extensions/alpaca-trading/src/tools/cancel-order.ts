import type { ToolContext, ToolResult } from "../types.js"
import { alpacaRequest } from "../client.js"

interface CancelOrderInput {
  readonly order_id: string
}

interface CancelOrderResult {
  readonly canceled: true
  readonly order_id: string
}

export const cancelOrderTool = {
  name: "alpaca_cancel_order",
  description: "Cancel a pending order by order ID",
  input_schema: {
    type: "object",
    required: ["order_id"],
    properties: {
      order_id: {
        type: "string",
        description: "The UUID of the order to cancel.",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: CancelOrderInput,
    context: ToolContext
  ): Promise<ToolResult<CancelOrderResult>> {
    try {
      await alpacaRequest<void>(
        context.config,
        `/v2/orders/${input.order_id}`,
        { method: "DELETE" }
      )

      return {
        success: true,
        data: {
          canceled: true,
          order_id: input.order_id,
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to cancel order ${input.order_id}: ${message}`,
      }
    }
  },
}
