import type { PlaidApi } from 'plaid'
import { buildPlaidConfig, createPlaidClient, type PlaidConfig } from './config.js'
import { createLinkToken } from './tools/create-link-token.js'
import { exchangeToken } from './tools/exchange-token.js'
import { getAccounts } from './tools/get-accounts.js'
import { getTransactions } from './tools/get-transactions.js'
import { getInvestments } from './tools/get-investments.js'
import { getLiabilities } from './tools/get-liabilities.js'
import { getRecurring } from './tools/get-recurring.js'
import { webhookHandler } from './tools/webhook-handler.js'

interface ToolDefinition {
  readonly name: string
  readonly description: string
  readonly input_schema: Record<string, unknown>
  readonly handler: (input: unknown, context: unknown) => Promise<unknown>
}

interface ExtensionContext {
  readonly config: Record<string, unknown>
  readonly registerTool: (tool: ToolDefinition) => void
}

export default function register(ctx: ExtensionContext): void {
  const plaidConfig = buildPlaidConfig(ctx.config)
  const client = createPlaidClient(plaidConfig)

  ctx.registerTool({
    name: 'plaid_create_link_token',
    description:
      'Initialize Plaid Link for account connection. Returns a link_token for the client-side Plaid Link flow.',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        userId: { type: 'string', description: 'Unique user identifier' },
        products: {
          type: 'array',
          items: { type: 'string' },
          description: 'Plaid products to enable (e.g. transactions, investments, liabilities)',
        },
        redirectUri: {
          type: 'string',
          description: 'OAuth redirect URI (optional)',
        },
      },
      required: ['userId', 'products'],
    },
    handler: async (input) => createLinkToken(client, plaidConfig, input),
  })

  ctx.registerTool({
    name: 'plaid_exchange_token',
    description:
      'Exchange a Plaid Link public_token for a permanent access token. Returns an item ID and a secure token reference (not the raw token).',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        userId: { type: 'string', description: 'Unique user identifier' },
        publicToken: {
          type: 'string',
          description: 'Public token from Plaid Link onSuccess callback',
        },
        institution: {
          type: 'object',
          properties: {
            institutionId: { type: 'string' },
            name: { type: 'string' },
          },
          description: 'Institution metadata from Link',
        },
        accounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              subtype: { type: 'string' },
              mask: { type: 'string' },
            },
          },
          description: 'Account metadata from Link',
        },
      },
      required: ['userId', 'publicToken'],
    },
    handler: async (input) => exchangeToken(client, input),
  })

  ctx.registerTool({
    name: 'plaid_get_accounts',
    description:
      'List connected accounts with current balances. Returns account IDs, types, names, and balance details.',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        userId: { type: 'string', description: 'Unique user identifier' },
        accessToken: {
          type: 'string',
          description: 'Plaid access token for the Item',
        },
        accountIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter to specific account IDs (optional)',
        },
      },
      required: ['userId', 'accessToken'],
    },
    handler: async (input) => getAccounts(client, input),
  })

  ctx.registerTool({
    name: 'plaid_get_transactions',
    description:
      'Fetch transactions using cursor-based sync. Returns added, modified, and removed transactions since last cursor. Supports incremental updates.',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        userId: { type: 'string', description: 'Unique user identifier' },
        accessToken: {
          type: 'string',
          description: 'Plaid access token for the Item',
        },
        cursor: {
          type: 'string',
          description: 'Sync cursor from previous call (omit for initial sync)',
        },
        count: {
          type: 'number',
          description: 'Max transactions per page (1-500)',
        },
      },
      required: ['userId', 'accessToken'],
    },
    handler: async (input) => getTransactions(client, input),
  })

  ctx.registerTool({
    name: 'plaid_get_investments',
    description:
      'Fetch investment holdings, securities metadata, and recent investment transactions for an account.',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        userId: { type: 'string', description: 'Unique user identifier' },
        accessToken: {
          type: 'string',
          description: 'Plaid access token for the Item',
        },
        startDate: {
          type: 'string',
          description: 'Start date for investment transactions (YYYY-MM-DD)',
        },
        endDate: {
          type: 'string',
          description: 'End date for investment transactions (YYYY-MM-DD)',
        },
      },
      required: ['userId', 'accessToken'],
    },
    handler: async (input) => getInvestments(client, input),
  })

  ctx.registerTool({
    name: 'plaid_get_liabilities',
    description:
      'Fetch liability data including credit cards, student loans, and mortgages with payment details, interest rates, and due dates.',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        userId: { type: 'string', description: 'Unique user identifier' },
        accessToken: {
          type: 'string',
          description: 'Plaid access token for the Item',
        },
        accountIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter to specific account IDs (optional)',
        },
      },
      required: ['userId', 'accessToken'],
    },
    handler: async (input) => getLiabilities(client, input),
  })

  ctx.registerTool({
    name: 'plaid_get_recurring',
    description:
      'Identify recurring transactions (subscriptions, income, bills). Returns inflow and outflow streams with frequency and amount details.',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        userId: { type: 'string', description: 'Unique user identifier' },
        accessToken: {
          type: 'string',
          description: 'Plaid access token for the Item',
        },
        accountIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter to specific account IDs (optional)',
        },
      },
      required: ['userId', 'accessToken'],
    },
    handler: async (input) => getRecurring(client, input),
  })

  ctx.registerTool({
    name: 'plaid_webhook_handler',
    description:
      'Process incoming Plaid webhooks. Validates webhook type and returns structured event data for downstream processing.',
    input_schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        headers: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'HTTP headers from the webhook request',
        },
        body: {
          type: 'object',
          description: 'Webhook payload body',
        },
      },
      required: ['headers', 'body'],
    },
    handler: async (input) => webhookHandler(input),
  })
}
