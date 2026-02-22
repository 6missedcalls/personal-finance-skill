import {
  WebhookHandlerInput,
  type WebhookHandlerOutput,
} from '../types.js'

const SUPPORTED_WEBHOOK_TYPES = new Set([
  'TRANSACTIONS',
  'ITEM',
  'HOLDINGS',
  'INVESTMENTS_TRANSACTIONS',
  'LIABILITIES',
  'AUTH',
])

export async function webhookHandler(
  rawInput: unknown
): Promise<WebhookHandlerOutput> {
  const input = WebhookHandlerInput.parse(rawInput)
  const { body } = input

  const webhookType = (body.webhook_type as string) ?? 'UNKNOWN'
  const webhookCode = (body.webhook_code as string) ?? 'UNKNOWN'
  const itemId = (body.item_id as string) ?? null
  const error = body.error
    ? (body.error as { error_message?: string }).error_message ?? 'Unknown webhook error'
    : null

  if (!SUPPORTED_WEBHOOK_TYPES.has(webhookType)) {
    return {
      accepted: false,
      webhookType,
      webhookCode,
      itemId,
      error: `Unsupported webhook type: ${webhookType}`,
    }
  }

  return {
    accepted: true,
    webhookType,
    webhookCode,
    itemId,
    error,
  }
}
