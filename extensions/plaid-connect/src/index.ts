import type { PlaidApi } from "plaid"
import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk"

import { isPlaidToolError } from "./types.js"
import { buildPlaidConfig, createPlaidClient, type PlaidConfig } from "./config.js"
import { createLinkToken } from "./tools/create-link-token.js"
import { exchangeToken } from "./tools/exchange-token.js"
import { getAccounts } from "./tools/get-accounts.js"
import { getTransactions } from "./tools/get-transactions.js"
import { getInvestments } from "./tools/get-investments.js"
import { getLiabilities } from "./tools/get-liabilities.js"
import { getRecurring } from "./tools/get-recurring.js"
import { webhookHandler } from "./tools/webhook-handler.js"

// --- Tool Adapter ---

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    details: payload,
  }
}

function makeTool(
  name: string,
  description: string,
  input_schema: Record<string, unknown>,
  handler: (input: unknown) => Promise<unknown>,
) {
  return {
    name,
    label: name,
    description,
    parameters: input_schema,
    async execute(_toolCallId: string, params: unknown) {
      try {
        const result = await handler(params)
        return jsonResult(result)
      } catch (error) {
        if (isPlaidToolError(error)) {
          return jsonResult(error)
        }
        const message = error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null
            ? JSON.stringify(error)
            : String(error)
        return jsonResult({ success: false, error: message })
      }
    },
  }
}

// --- Plugin Definition ---

const plugin: { id: string; name: string; description: string; configSchema: any; register: (api: OpenClawPluginApi) => void } = {
  id: "plaid-connect",
  name: "Plaid Connect",
  description:
    "Plaid API integration for banking, transactions, investments, and liabilities aggregation",
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    const cfg = (api.pluginConfig ?? {}) as Record<string, unknown>

    // Lazy client — defers env var resolution to first tool call
    let clientCache: { client: PlaidApi; config: PlaidConfig } | null = null

    const getClient = (): { client: PlaidApi; config: PlaidConfig } => {
      if (clientCache) return clientCache
      const plaidConfig = buildPlaidConfig(cfg)
      const client = createPlaidClient(plaidConfig)
      clientCache = { client, config: plaidConfig }
      return clientCache
    }

    api.registerTool(
      makeTool(
        "plaid_create_link_token",
        "Initialize Plaid Link for account connection. Returns a link_token for the client-side Plaid Link flow.",
        {
          type: "object",
          additionalProperties: false,
          properties: {
            userId: { type: "string", description: "Unique user identifier" },
            products: {
              type: "array",
              items: { type: "string" },
              description: "Plaid products to enable (e.g. transactions, investments, liabilities)",
            },
            redirectUri: { type: "string", description: "OAuth redirect URI (optional)" },
          },
          required: ["userId", "products"],
        },
        async (input) => {
          const { client, config } = getClient()
          return createLinkToken(client, config, input)
        },
      ) as any,
    )

    api.registerTool(
      makeTool(
        "plaid_exchange_token",
        "Exchange a Plaid Link public_token for a permanent access token. Returns an item ID and a secure token reference (not the raw token).",
        {
          type: "object",
          additionalProperties: false,
          properties: {
            userId: { type: "string", description: "Unique user identifier" },
            publicToken: {
              type: "string",
              description: "Public token from Plaid Link onSuccess callback",
            },
            institution: {
              type: "object",
              properties: {
                institutionId: { type: "string" },
                name: { type: "string" },
              },
              description: "Institution metadata from Link",
            },
            accounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  type: { type: "string" },
                  subtype: { type: "string" },
                  mask: { type: "string" },
                },
              },
              description: "Account metadata from Link",
            },
          },
          required: ["userId", "publicToken"],
        },
        async (input) => {
          const { client } = getClient()
          return exchangeToken(client, input)
        },
      ) as any,
    )

    api.registerTool(
      makeTool(
        "plaid_get_accounts",
        "List connected accounts with current balances. Returns account IDs, types, names, and balance details.",
        {
          type: "object",
          additionalProperties: false,
          properties: {
            userId: { type: "string", description: "Unique user identifier" },
            accessToken: { type: "string", description: "Plaid access token for the Item" },
            accountIds: {
              type: "array",
              items: { type: "string" },
              description: "Filter to specific account IDs (optional)",
            },
          },
          required: ["userId", "accessToken"],
        },
        async (input) => {
          const { client } = getClient()
          return getAccounts(client, input)
        },
      ) as any,
    )

    api.registerTool(
      makeTool(
        "plaid_get_transactions",
        "Fetch transactions using cursor-based sync. Returns added, modified, and removed transactions since last cursor. Supports incremental updates.",
        {
          type: "object",
          additionalProperties: false,
          properties: {
            userId: { type: "string", description: "Unique user identifier" },
            accessToken: { type: "string", description: "Plaid access token for the Item" },
            cursor: {
              type: "string",
              description: "Sync cursor from previous call (omit for initial sync)",
            },
            count: { type: "number", description: "Max transactions per page (1-500)" },
          },
          required: ["userId", "accessToken"],
        },
        async (input) => {
          const { client } = getClient()
          return getTransactions(client, input)
        },
      ) as any,
    )

    api.registerTool(
      makeTool(
        "plaid_get_investments",
        "Fetch investment holdings, securities metadata, and recent investment transactions for an account.",
        {
          type: "object",
          additionalProperties: false,
          properties: {
            userId: { type: "string", description: "Unique user identifier" },
            accessToken: { type: "string", description: "Plaid access token for the Item" },
            startDate: {
              type: "string",
              description: "Start date for investment transactions (YYYY-MM-DD)",
            },
            endDate: {
              type: "string",
              description: "End date for investment transactions (YYYY-MM-DD)",
            },
          },
          required: ["userId", "accessToken"],
        },
        async (input) => {
          const { client } = getClient()
          return getInvestments(client, input)
        },
      ) as any,
    )

    api.registerTool(
      makeTool(
        "plaid_get_liabilities",
        "Fetch liability data including credit cards, student loans, and mortgages with payment details, interest rates, and due dates.",
        {
          type: "object",
          additionalProperties: false,
          properties: {
            userId: { type: "string", description: "Unique user identifier" },
            accessToken: { type: "string", description: "Plaid access token for the Item" },
            accountIds: {
              type: "array",
              items: { type: "string" },
              description: "Filter to specific account IDs (optional)",
            },
          },
          required: ["userId", "accessToken"],
        },
        async (input) => {
          const { client } = getClient()
          return getLiabilities(client, input)
        },
      ) as any,
    )

    api.registerTool(
      makeTool(
        "plaid_get_recurring",
        "Identify recurring transactions (subscriptions, income, bills). Returns inflow and outflow streams with frequency and amount details.",
        {
          type: "object",
          additionalProperties: false,
          properties: {
            userId: { type: "string", description: "Unique user identifier" },
            accessToken: { type: "string", description: "Plaid access token for the Item" },
            accountIds: {
              type: "array",
              items: { type: "string" },
              description: "Filter to specific account IDs (optional)",
            },
          },
          required: ["userId", "accessToken"],
        },
        async (input) => {
          const { client } = getClient()
          return getRecurring(client, input)
        },
      ) as any,
    )

    api.registerTool(
      makeTool(
        "plaid_webhook_handler",
        "Process incoming Plaid webhooks. Validates webhook type and returns structured event data for downstream processing.",
        {
          type: "object",
          additionalProperties: false,
          properties: {
            headers: {
              type: "object",
              additionalProperties: { type: "string" },
              description: "HTTP headers from the webhook request",
            },
            body: { type: "object", description: "Webhook payload body" },
          },
          required: ["headers", "body"],
        },
        async (input) => webhookHandler(input),
      ) as any,
    )
  },
}

export default plugin
