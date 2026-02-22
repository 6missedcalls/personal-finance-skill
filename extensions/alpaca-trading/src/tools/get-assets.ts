import type { AlpacaAsset, ToolContext, ToolResult } from "../types.js"
import { alpacaRequest } from "../client.js"

interface GetAssetsInput {
  readonly status?: "active" | "inactive"
  readonly asset_class?: string
  readonly exchange?: string
}

export const getAssetsTool = {
  name: "alpaca_get_assets",
  description: "Search for tradable assets by status, asset class, or exchange",
  input_schema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["active", "inactive"],
        description: "Filter assets by trading status.",
      },
      asset_class: {
        type: "string",
        description: "Filter by asset class (e.g. 'us_equity', 'crypto').",
      },
      exchange: {
        type: "string",
        description: "Filter by exchange (e.g. 'NYSE', 'NASDAQ', 'ARCA', 'OTC').",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: GetAssetsInput,
    context: ToolContext
  ): Promise<ToolResult<ReadonlyArray<AlpacaAsset>>> {
    try {
      const params: Record<string, string | undefined> = {
        status: input.status,
        asset_class: input.asset_class,
        exchange: input.exchange,
      }

      const assets = await alpacaRequest<AlpacaAsset[]>(
        context.config,
        "/v2/assets",
        { params }
      )

      return {
        success: true,
        data: assets,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve assets: ${message}`,
      }
    }
  },
}
