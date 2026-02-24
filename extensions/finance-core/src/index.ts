import { homedir } from "os"
import { join } from "path"

import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk"

import { FinanceStore } from "./storage/store.js"
import {
  upsertSnapshotTool,
  getStateTool,
  getTransactionsTool,
  getNetWorthTool,
  detectAnomaliesTool,
  cashFlowSummaryTool,
  subscriptionTrackerTool,
  generateBriefTool,
  policyCheckTool,
} from "./tools/index.js"

// --- Tool Adapter ---

interface LegacyToolMeta {
  readonly name: string
  readonly description: string
  readonly input_schema: Record<string, unknown>
}

function wrapTool(
  meta: LegacyToolMeta,
  handler: (input: any) => Promise<unknown>,
) {
  return {
    name: meta.name,
    label: meta.name,
    description: meta.description,
    parameters: meta.input_schema,
    async execute(_toolCallId: string, params: unknown) {
      const result = await handler(params)
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        details: result,
      }
    },
  }
}

// --- Plugin Definition ---

const plugin: { id: string; name: string; description: string; configSchema: any; register: (api: OpenClawPluginApi) => void } = {
  id: "finance-core",
  name: "Finance Core",
  description:
    "Canonical financial data layer — normalized models, storage, policy checks, anomaly detection, and briefing generation",
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    const cfg = (api.pluginConfig ?? {}) as Record<string, unknown>
    const storageDir =
      (cfg.storageDir as string | undefined) ?? join(homedir(), ".openclaw", "finance-data")
    const anomalyThresholds = cfg.anomalyThresholds as
      | { readonly largeTransactionMultiple?: number; readonly balanceDropPercent?: number }
      | undefined

    const store = new FinanceStore(storageDir)

    const toolMetas: ReadonlyArray<LegacyToolMeta> = [
      upsertSnapshotTool, getStateTool, getTransactionsTool, getNetWorthTool,
      detectAnomaliesTool, cashFlowSummaryTool, subscriptionTrackerTool,
      generateBriefTool, policyCheckTool,
    ]

    const handlers: ReadonlyArray<(input: any) => Promise<unknown>> = [
      upsertSnapshotTool.createHandler(store),
      getStateTool.createHandler(store),
      getTransactionsTool.createHandler(store),
      getNetWorthTool.createHandler(store),
      detectAnomaliesTool.createHandler(store, anomalyThresholds),
      cashFlowSummaryTool.createHandler(store),
      subscriptionTrackerTool.createHandler(store),
      generateBriefTool.createHandler(store),
      policyCheckTool.createHandler(store),
    ]

    const tools = toolMetas.map((meta, i) => wrapTool(meta, handlers[i]))

    for (const tool of tools) {
      api.registerTool(tool as any)
    }
  },
}

export default plugin

// --- Re-exports for consumer extensions ---

export type * from "./types.js"
export { FinanceStore } from "./storage/store.js"
export {
  normalizePlaidAccount,
  normalizePlaidTransaction,
  normalizePlaidHolding,
  normalizePlaidLiability,
  normalizeAlpacaAccount,
  normalizeAlpacaPosition,
  normalizeIbkrAccount,
  normalizeIbkrPosition,
} from "./normalization/index.js"
