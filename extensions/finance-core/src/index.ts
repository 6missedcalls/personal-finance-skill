import { homedir } from "os"
import { join } from "path"

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

// --- Extension Configuration ---

interface FinanceCoreConfig {
  readonly storageDir?: string
  readonly defaultUserId?: string
  readonly anomalyThresholds?: {
    readonly largeTransactionMultiple?: number
    readonly balanceDropPercent?: number
  }
  readonly policyRulesPath?: string
}

// --- Tool Definition Type ---

interface ToolDefinition {
  readonly name: string
  readonly description: string
  readonly input_schema: Record<string, unknown>
  readonly handler: (input: Record<string, unknown>) => Promise<unknown>
}

// --- Extension Entry Point ---

export function createFinanceCoreExtension(config: FinanceCoreConfig = {}): ReadonlyArray<ToolDefinition> {
  const storageDir = config.storageDir ?? join(homedir(), ".openclaw", "finance-data")
  const store = new FinanceStore(storageDir)

  const tools: ReadonlyArray<ToolDefinition> = [
    {
      ...upsertSnapshotTool,
      handler: upsertSnapshotTool.createHandler(store) as ToolDefinition["handler"],
    },
    {
      ...getStateTool,
      handler: getStateTool.createHandler(store) as ToolDefinition["handler"],
    },
    {
      ...getTransactionsTool,
      handler: getTransactionsTool.createHandler(store) as ToolDefinition["handler"],
    },
    {
      ...getNetWorthTool,
      handler: getNetWorthTool.createHandler(store) as ToolDefinition["handler"],
    },
    {
      ...detectAnomaliesTool,
      handler: detectAnomaliesTool.createHandler(store, config.anomalyThresholds) as ToolDefinition["handler"],
    },
    {
      ...cashFlowSummaryTool,
      handler: cashFlowSummaryTool.createHandler(store) as ToolDefinition["handler"],
    },
    {
      ...subscriptionTrackerTool,
      handler: subscriptionTrackerTool.createHandler(store) as ToolDefinition["handler"],
    },
    {
      ...generateBriefTool,
      handler: generateBriefTool.createHandler(store) as ToolDefinition["handler"],
    },
    {
      ...policyCheckTool,
      handler: policyCheckTool.createHandler(store) as ToolDefinition["handler"],
    },
  ]

  return tools
}

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
