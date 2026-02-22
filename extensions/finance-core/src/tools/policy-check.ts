import type { FinanceStore } from "../storage/store.js"
import type {
  ApprovalLevel,
  PolicyCheckInput,
  PolicyCheckResult,
  PolicyCondition,
  PolicyRule,
} from "../types.js"

export const policyCheckTool = {
  name: "finance_policy_check",
  description:
    "Validate a proposed action against user-defined policy rules. Checks trades, transfers, tax moves, and notifications against configured limits, restrictions, and approval requirements. Returns whether the action is allowed and what approvals are needed.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      userId: { type: "string", description: "User identifier" },
      actionType: {
        type: "string",
        enum: ["trade", "transfer", "tax_move", "notification", "rebalance"],
        description: "Type of proposed action",
      },
      candidateAction: {
        type: "object",
        description:
          "The proposed action details — structure varies by actionType. For trades: symbol, side, qty, notional. For transfers: fromAccount, toAccount, amount. For tax_move: type, amount, account.",
      },
    },
    required: ["userId", "actionType", "candidateAction"],
  },

  createHandler(store: FinanceStore) {
    return async (input: PolicyCheckInput): Promise<PolicyCheckResult> => {
      const rules = store.getPolicyRules()
      const applicableRules = rules.filter(
        (rule) => rule.isActive && rule.actionType === input.actionType
      )

      if (applicableRules.length === 0) {
        return {
          allowed: true,
          reasonCodes: ["no_rules_configured"],
          matchedRules: [],
          requiredApprovals: ["none"],
        }
      }

      const matchedRules: string[] = []
      const reasonCodes: string[] = []
      const requiredApprovals = new Set<ApprovalLevel>()
      let blocked = false

      for (const rule of applicableRules) {
        const ruleMatches = evaluateRule(rule, input.candidateAction)
        if (ruleMatches) {
          matchedRules.push(rule.id)
          reasonCodes.push(`rule:${rule.name}`)
          requiredApprovals.add(rule.requiredApproval)

          if (rule.requiredApproval === "advisor") {
            blocked = true
            reasonCodes.push("requires_advisor_approval")
          }
        }
      }

      const approvalList = Array.from(requiredApprovals)
      const needsUserApproval = approvalList.includes("user") || approvalList.includes("advisor")

      return {
        allowed: !blocked && (!needsUserApproval || approvalList.includes("none")),
        reasonCodes,
        matchedRules,
        requiredApprovals: approvalList.length > 0 ? approvalList : ["none"],
      }
    }
  },
}

function evaluateRule(
  rule: PolicyRule,
  candidateAction: Record<string, unknown>
): boolean {
  return rule.conditions.every((condition) =>
    evaluateCondition(condition, candidateAction)
  )
}

function evaluateCondition(
  condition: PolicyCondition,
  action: Record<string, unknown>
): boolean {
  const fieldValue = getNestedValue(action, condition.field)
  if (fieldValue === undefined) return false

  switch (condition.operator) {
    case "gt":
      return typeof fieldValue === "number" && fieldValue > (condition.value as number)
    case "lt":
      return typeof fieldValue === "number" && fieldValue < (condition.value as number)
    case "gte":
      return typeof fieldValue === "number" && fieldValue >= (condition.value as number)
    case "lte":
      return typeof fieldValue === "number" && fieldValue <= (condition.value as number)
    case "eq":
      return fieldValue === condition.value
    case "neq":
      return fieldValue !== condition.value
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(fieldValue)
    case "not_in":
      return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
    default:
      return false
  }
}

function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  const parts = path.split(".")
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return current
}
