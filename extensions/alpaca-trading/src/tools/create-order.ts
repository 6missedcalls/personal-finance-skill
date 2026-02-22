import type {
  AlpacaOrder,
  CreateOrderInput,
  ToolContext,
  ToolResult,
} from "../types.js"
import { alpacaRequest } from "../client.js"

interface CreateOrderToolInput extends CreateOrderInput {
  readonly confirm: boolean
}

export const createOrderTool = {
  name: "alpaca_create_order",
  description:
    "Submit a buy or sell order with safety checks. Supports market, limit, stop, stop_limit, and trailing_stop order types",
  input_schema: {
    type: "object",
    required: ["symbol", "side", "type", "time_in_force", "confirm"],
    properties: {
      symbol: {
        type: "string",
        description: "The ticker symbol to trade (e.g. 'AAPL').",
      },
      side: {
        type: "string",
        enum: ["buy", "sell"],
        description: "Order side: buy or sell.",
      },
      type: {
        type: "string",
        enum: ["market", "limit", "stop", "stop_limit", "trailing_stop"],
        description: "Order type.",
      },
      time_in_force: {
        type: "string",
        enum: ["day", "gtc", "opg", "cls", "ioc", "fok"],
        description: "Time in force for the order.",
      },
      qty: {
        type: "string",
        description:
          "Number of shares to trade. Mutually exclusive with notional.",
      },
      notional: {
        type: "string",
        description:
          "Dollar amount to trade. Mutually exclusive with qty. Only for market orders.",
      },
      limit_price: {
        type: "string",
        description:
          "Required for limit and stop_limit order types. The limit price.",
      },
      stop_price: {
        type: "string",
        description:
          "Required for stop and stop_limit order types. The stop price.",
      },
      trail_price: {
        type: "string",
        description:
          "For trailing_stop orders. Dollar amount to trail. Mutually exclusive with trail_percent.",
      },
      trail_percent: {
        type: "string",
        description:
          "For trailing_stop orders. Percentage to trail. Mutually exclusive with trail_price.",
      },
      extended_hours: {
        type: "boolean",
        description:
          "If true, order is eligible to execute in pre/post market. Only for limit day orders.",
      },
      client_order_id: {
        type: "string",
        description: "Optional client-assigned order ID (max 48 chars).",
      },
      order_class: {
        type: "string",
        enum: ["simple", "bracket", "oco", "oto"],
        description: "Order class for advanced order types.",
      },
      take_profit: {
        type: "object",
        description: "Take-profit leg for bracket orders.",
        properties: {
          limit_price: {
            type: "string",
            description: "Limit price for the take-profit leg.",
          },
        },
        required: ["limit_price"],
        additionalProperties: false,
      },
      stop_loss: {
        type: "object",
        description: "Stop-loss leg for bracket orders.",
        properties: {
          stop_price: {
            type: "string",
            description: "Stop price for the stop-loss leg.",
          },
          limit_price: {
            type: "string",
            description:
              "Optional limit price to make stop-loss a stop-limit order.",
          },
        },
        required: ["stop_price"],
        additionalProperties: false,
      },
      confirm: {
        type: "boolean",
        description:
          "Safety gate — must be explicitly set to true to submit the order.",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: CreateOrderToolInput,
    context: ToolContext
  ): Promise<ToolResult<AlpacaOrder>> {
    try {
      if (input.confirm !== true) {
        return {
          success: false,
          error: "Order must be explicitly confirmed",
        }
      }

      const hasQty = input.qty !== undefined
      const hasNotional = input.notional !== undefined

      if (!hasQty && !hasNotional) {
        return {
          success: false,
          error: "Either qty or notional must be provided",
        }
      }

      if (hasQty && hasNotional) {
        return {
          success: false,
          error: "qty and notional are mutually exclusive — provide only one",
        }
      }

      const { config } = context

      if (hasQty && config.maxOrderQty !== undefined) {
        const qtyNum = parseFloat(input.qty as string)
        if (!isNaN(qtyNum) && qtyNum > config.maxOrderQty) {
          return {
            success: false,
            error: `Order qty ${input.qty} exceeds configured maximum of ${config.maxOrderQty}`,
          }
        }
      }

      if (hasNotional && config.maxOrderNotional !== undefined) {
        const notionalNum = parseFloat(input.notional as string)
        if (!isNaN(notionalNum) && notionalNum > config.maxOrderNotional) {
          return {
            success: false,
            error: `Order notional ${input.notional} exceeds configured maximum of ${config.maxOrderNotional}`,
          }
        }
      }

      const { confirm: _confirm, ...orderPayload } = input

      const order = await alpacaRequest<AlpacaOrder>(config, "/v2/orders", {
        method: "POST",
        body: orderPayload,
      })

      return {
        success: true,
        data: order,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to create order: ${message}`,
      }
    }
  },
}
