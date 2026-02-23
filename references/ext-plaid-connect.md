# Plaid Connect Extension Reference

| Field         | Value                                                                                  |
|---------------|----------------------------------------------------------------------------------------|
| id            | `plaid-connect`                                                                        |
| name          | Plaid Connect                                                                          |
| version       | 0.1.0                                                                                  |
| description   | Plaid API integration for banking, transactions, investments, and liabilities aggregation |
| last-updated  | 2026-02-23                                                                             |

---

## 1. Overview

The `plaid-connect` extension bridges OpenClaw to the Plaid financial data network. It handles the full lifecycle of connecting user bank accounts through Plaid Link, fetching account balances, syncing transactions incrementally via cursor-based pagination, pulling investment holdings and securities metadata, retrieving liability details (credit cards, student loans, mortgages), identifying recurring transaction streams, and ingesting Plaid webhooks for real-time event processing.

All tool outputs are strict JSON payloads. The agent reasons over structured data -- no HTML, no prose, no ambiguous formatting. Error conditions return a consistent `PlaidToolError` envelope so the agent can branch deterministically.

This extension is a data-source adapter. It feeds raw financial data into the `finance-core` canonical store via `finance.upsert_snapshot`. It does not execute trades, move money, or make financial decisions.

---

## 2. Configuration

### 2.1 Environment Variables

| Variable          | Purpose                          | Required |
|-------------------|----------------------------------|----------|
| `PLAID_CLIENT_ID` | Plaid API client identifier      | Yes      |
| `PLAID_SECRET`    | Plaid API secret key             | Yes      |

These are never stored in plugin config directly. The config schema uses env-var indirection -- you specify the *name* of the env var, not the secret itself.

### 2.2 Config Schema (`openclaw.plugin.json`)

```json
{
  "id": "plaid-connect",
  "name": "Plaid Connect",
  "version": "0.1.0",
  "description": "Plaid API integration for banking, transactions, investments, and liabilities aggregation",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "plaidClientIdEnv": {
        "type": "string",
        "description": "Name of env var holding Plaid client ID",
        "default": "PLAID_CLIENT_ID"
      },
      "plaidSecretEnv": {
        "type": "string",
        "description": "Name of env var holding Plaid secret key",
        "default": "PLAID_SECRET"
      },
      "plaidEnv": {
        "type": "string",
        "description": "Plaid environment: sandbox | development | production",
        "enum": ["sandbox", "development", "production"],
        "default": "sandbox"
      },
      "webhookUrl": {
        "type": "string",
        "description": "URL for Plaid webhook delivery"
      },
      "clientName": {
        "type": "string",
        "description": "Application name shown in Plaid Link",
        "default": "OpenClaw Finance"
      },
      "countryCodes": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Supported country codes",
        "default": ["US"]
      }
    },
    "required": ["plaidClientIdEnv", "plaidSecretEnv", "plaidEnv"]
  }
}
```

### 2.3 Environment Selection

| `plaidEnv` Value | Base URL                          | Use Case                      |
|------------------|-----------------------------------|-------------------------------|
| `sandbox`        | `https://sandbox.plaid.com`       | Development and testing       |
| `development`    | `https://development.plaid.com`   | Testing with real credentials |
| `production`     | `https://production.plaid.com`    | Live user data                |

---

## 3. Tool Catalog

| #  | Tool Name                | Description                                              | Risk Tier  |
|----|--------------------------|----------------------------------------------------------|------------|
| 1  | `plaid_create_link_token`| Initialize Plaid Link for account connection             | LOW        |
| 2  | `plaid_exchange_token`   | Exchange public token for permanent access token         | MEDIUM     |
| 3  | `plaid_get_accounts`     | List connected accounts with current balances            | READ-ONLY  |
| 4  | `plaid_get_transactions` | Fetch transactions via cursor-based sync                 | READ-ONLY  |
| 5  | `plaid_get_investments`  | Fetch investment holdings, securities, and transactions   | READ-ONLY  |
| 6  | `plaid_get_liabilities`  | Fetch credit, student loan, and mortgage liabilities     | READ-ONLY  |
| 7  | `plaid_get_recurring`    | Identify recurring transaction streams                   | READ-ONLY  |
| 8  | `plaid_webhook_handler`  | Process incoming Plaid webhooks                          | LOW        |

---

## 4. Tool Details

### 4.1 `plaid_create_link_token`

Initialize Plaid Link for account connection. Returns a `link_token` that the client-side Plaid Link UI uses to authenticate the user with their financial institution.

**Risk Tier:** LOW -- creates a temporary, short-lived token with no persistent side effects.

**Input Schema:**

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the current user"
    },
    "products": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Plaid products to enable (e.g. [\"transactions\", \"investments\", \"liabilities\"])"
    },
    "redirectUri": {
      "type": "string",
      "description": "OAuth redirect URI for institution authentication flows"
    }
  },
  "required": ["userId", "products"]
}
```

**Output Schema:**

```json
{
  "linkToken": "link-sandbox-af1a0311-da53-4636-b754-dd15cc058176",
  "expiresAt": "2026-02-24T03:00:00Z",
  "requestId": "req-abc123"
}
```

| Output Field | Type   | Description                                      |
|--------------|--------|--------------------------------------------------|
| `linkToken`  | string | Temporary token for initializing Plaid Link UI   |
| `expiresAt`  | string | ISO 8601 timestamp when the token expires        |
| `requestId`  | string | Plaid request ID for debugging and support       |

**Notes:**
- The `link_token` expires after 4 hours.
- Valid `products` values: `transactions`, `investments`, `liabilities`, `auth`, `identity`, `assets`, `balance`.
- The `webhookUrl` from extension config is automatically attached to the link token request.
- `clientName` and `countryCodes` from extension config are used as defaults.

---

### 4.2 `plaid_exchange_token`

Exchange a Plaid Link `public_token` for a permanent access token. The public token is received from the client-side Plaid Link `onSuccess` callback. Returns an item ID and a secure token reference -- never the raw access token.

**Risk Tier:** MEDIUM -- creates a persistent credential that grants ongoing access to user financial data.

**Input Schema:**

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the current user"
    },
    "publicToken": {
      "type": "string",
      "description": "Public token from Plaid Link onSuccess callback"
    },
    "institution": {
      "type": "object",
      "properties": {
        "institutionId": { "type": "string" },
        "name": { "type": "string" }
      },
      "description": "Institution metadata from Plaid Link"
    },
    "accounts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "type": { "type": "string" },
          "subtype": { "type": "string" },
          "mask": { "type": "string" }
        }
      },
      "description": "Account metadata selected by user in Plaid Link"
    }
  },
  "required": ["userId", "publicToken"]
}
```

**Output Schema:**

```json
{
  "itemId": "item-sandbox-8f1a0311-da53-4636-b754-dd15cc058176",
  "accessTokenRef": "plaid:tok:ref:a1b2c3d4",
  "requestId": "req-def456"
}
```

| Output Field     | Type   | Description                                               |
|------------------|--------|-----------------------------------------------------------|
| `itemId`         | string | Plaid Item ID representing the connected institution      |
| `accessTokenRef` | string | Opaque reference to the stored access token (not raw)     |
| `requestId`      | string | Plaid request ID for debugging and support                |

**Notes:**
- The raw `access_token` is stored securely and never exposed to the agent or returned in output.
- The `accessTokenRef` is an internal reference used by subsequent tools to look up the stored token.
- Institution and account metadata should be passed through for storage in `finance-core`.

---

### 4.3 `plaid_get_accounts`

List connected accounts with current balances. Returns account IDs, types, names, and balance details for all accounts associated with an Item.

**Risk Tier:** READ-ONLY -- retrieves data without any side effects.

**Input Schema:**

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the current user"
    },
    "accessToken": {
      "type": "string",
      "description": "Access token reference for the Plaid Item"
    },
    "accountIds": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Filter to specific account IDs (omit for all accounts)"
    }
  },
  "required": ["userId", "accessToken"]
}
```

**Output Schema:**

```json
{
  "accounts": [
    {
      "accountId": "A3wenK5EQRfKlnxlBbVXtPw9",
      "name": "Plaid Checking",
      "officialName": "Plaid Gold Standard 0% Interest Checking",
      "type": "depository",
      "subtype": "checking",
      "mask": "0000",
      "balances": {
        "available": 100.00,
        "current": 110.00,
        "limit": null,
        "isoCurrencyCode": "USD"
      }
    }
  ],
  "itemId": "item-sandbox-8f1a0311-da53-4636-b754-dd15cc058176",
  "requestId": "req-ghi789"
}
```

**PlaidAccount Fields:**

| Field            | Type         | Description                                         |
|------------------|--------------|-----------------------------------------------------|
| `accountId`      | string       | Unique Plaid account identifier                     |
| `name`           | string       | User-facing account name                            |
| `officialName`   | string\|null | Official institution account name                   |
| `type`           | string       | Account type: depository, credit, loan, investment, other |
| `subtype`        | string\|null | Account subtype: checking, savings, credit card, mortgage, etc. |
| `mask`           | string\|null | Last 4 digits of the account number                 |
| `balances`       | object       | Current balance information                         |

**Balances Fields:**

| Field             | Type         | Description                                        |
|-------------------|--------------|----------------------------------------------------|
| `available`       | number\|null | Amount available for spending or withdrawal        |
| `current`         | number\|null | Total current balance                              |
| `limit`           | number\|null | Credit limit (credit accounts only)                |
| `isoCurrencyCode` | string\|null | ISO 4217 currency code (e.g. "USD")                |

---

### 4.4 `plaid_get_transactions`

Fetch transactions using cursor-based sync. Returns added, modified, and removed transactions since the last cursor. Supports incremental updates -- call repeatedly with the returned `nextCursor` until `hasMore` is `false`.

**Risk Tier:** READ-ONLY -- retrieves data without any side effects.

**Input Schema:**

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the current user"
    },
    "accessToken": {
      "type": "string",
      "description": "Access token reference for the Plaid Item"
    },
    "cursor": {
      "type": "string",
      "description": "Cursor from previous sync call. Omit for initial full sync."
    },
    "count": {
      "type": "number",
      "minimum": 1,
      "maximum": 500,
      "description": "Number of transactions per page (1-500, default 100)"
    }
  },
  "required": ["userId", "accessToken"]
}
```

**Output Schema:**

```json
{
  "added": [
    {
      "transactionId": "txn-abc123",
      "accountId": "A3wenK5EQRfKlnxlBbVXtPw9",
      "amount": 25.50,
      "isoCurrencyCode": "USD",
      "date": "2026-02-20",
      "name": "WHOLE FOODS MARKET",
      "merchantName": "Whole Foods",
      "paymentChannel": "in store",
      "pending": false,
      "category": ["Food and Drink", "Groceries"],
      "personalFinanceCategory": {
        "primary": "FOOD_AND_DRINK",
        "detailed": "FOOD_AND_DRINK_GROCERIES"
      }
    }
  ],
  "modified": [],
  "removed": ["txn-old789"],
  "nextCursor": "cursor-xyz-456",
  "hasMore": false,
  "requestId": "req-jkl012"
}
```

**PlaidTransaction Fields:**

| Field                       | Type         | Description                                          |
|-----------------------------|--------------|------------------------------------------------------|
| `transactionId`             | string       | Unique Plaid transaction identifier                  |
| `accountId`                 | string       | Account this transaction belongs to                  |
| `amount`                    | number       | Transaction amount (positive = debit, negative = credit) |
| `isoCurrencyCode`           | string\|null | ISO 4217 currency code                               |
| `date`                      | string       | Transaction date (YYYY-MM-DD)                        |
| `name`                      | string       | Raw transaction description from institution         |
| `merchantName`              | string\|null | Cleaned merchant name                                |
| `paymentChannel`            | string       | Channel: "online", "in store", "other"               |
| `pending`                   | boolean      | Whether the transaction is still pending             |
| `category`                  | string[]     | Legacy Plaid category hierarchy                      |
| `personalFinanceCategory`   | object       | Plaid personal finance category (preferred)          |

**personalFinanceCategory Fields:**

| Field      | Type   | Description                                                |
|------------|--------|------------------------------------------------------------|
| `primary`  | string | Top-level category (e.g. "FOOD_AND_DRINK", "TRANSPORTATION") |
| `detailed` | string | Granular subcategory (e.g. "FOOD_AND_DRINK_GROCERIES")     |

---

### 4.5 `plaid_get_investments`

Fetch investment holdings, securities metadata, and recent investment transactions for an account. Returns the complete picture of a user's investment positions at their connected institution.

**Risk Tier:** READ-ONLY -- retrieves data without any side effects.

**Input Schema:**

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the current user"
    },
    "accessToken": {
      "type": "string",
      "description": "Access token reference for the Plaid Item"
    },
    "startDate": {
      "type": "string",
      "description": "Start date for investment transactions (YYYY-MM-DD)"
    },
    "endDate": {
      "type": "string",
      "description": "End date for investment transactions (YYYY-MM-DD)"
    }
  },
  "required": ["userId", "accessToken"]
}
```

**Output Schema:**

```json
{
  "holdings": [
    {
      "accountId": "A3wenK5EQRfKlnxlBbVXtPw9",
      "securityId": "sec-abc123",
      "institutionPrice": 150.25,
      "institutionPriceAsOf": "2026-02-22",
      "institutionValue": 15025.00,
      "costBasis": 12000.00,
      "quantity": 100,
      "isoCurrencyCode": "USD"
    }
  ],
  "securities": [
    {
      "securityId": "sec-abc123",
      "name": "Vanguard Total Stock Market ETF",
      "tickerSymbol": "VTI",
      "type": "etf",
      "closePrice": 150.25,
      "closePriceAsOf": "2026-02-22",
      "isoCurrencyCode": "USD",
      "isin": "US9229087690",
      "cusip": "922908769"
    }
  ],
  "investmentTransactions": [
    {
      "investmentTransactionId": "inv-txn-abc123",
      "accountId": "A3wenK5EQRfKlnxlBbVXtPw9",
      "securityId": "sec-abc123",
      "date": "2026-02-15",
      "name": "BUY VTI",
      "type": "buy",
      "subtype": "buy",
      "quantity": 10,
      "amount": 1502.50,
      "price": 150.25,
      "fees": 0,
      "isoCurrencyCode": "USD"
    }
  ],
  "requestId": "req-mno345"
}
```

**PlaidHolding Fields:**

| Field                  | Type         | Description                                    |
|------------------------|--------------|------------------------------------------------|
| `accountId`            | string       | Account holding this position                  |
| `securityId`           | string       | Plaid security identifier                      |
| `institutionPrice`     | number       | Price per share as reported by institution      |
| `institutionPriceAsOf` | string\|null | Date of institution price                      |
| `institutionValue`     | number       | Total value of the holding                     |
| `costBasis`            | number\|null | Original cost basis                            |
| `quantity`             | number       | Number of shares/units held                    |
| `isoCurrencyCode`      | string\|null | ISO 4217 currency code                         |

**PlaidSecurity Fields:**

| Field             | Type         | Description                                      |
|-------------------|--------------|--------------------------------------------------|
| `securityId`      | string       | Plaid security identifier                        |
| `name`            | string\|null | Security display name                            |
| `tickerSymbol`    | string\|null | Ticker symbol                                    |
| `type`            | string\|null | Security type: equity, etf, mutual fund, etc.    |
| `closePrice`      | number\|null | Most recent closing price                        |
| `closePriceAsOf`  | string\|null | Date of closing price                            |
| `isoCurrencyCode` | string\|null | ISO 4217 currency code                           |
| `isin`            | string\|null | ISIN identifier                                  |
| `cusip`           | string\|null | CUSIP identifier                                 |

**PlaidInvestmentTransaction Fields:**

| Field                      | Type         | Description                                |
|----------------------------|--------------|--------------------------------------------|
| `investmentTransactionId`  | string       | Unique investment transaction identifier   |
| `accountId`                | string       | Account this transaction belongs to        |
| `securityId`               | string       | Security involved in the transaction       |
| `date`                     | string       | Transaction date (YYYY-MM-DD)              |
| `name`                     | string       | Transaction description                    |
| `type`                     | string       | Transaction type: buy, sell, dividend, etc.|
| `subtype`                  | string       | Transaction subtype                        |
| `quantity`                 | number       | Number of shares/units                     |
| `amount`                   | number       | Total transaction amount                   |
| `price`                    | number       | Price per share/unit                       |
| `fees`                     | number\|null | Transaction fees                           |
| `isoCurrencyCode`          | string\|null | ISO 4217 currency code                     |

---

### 4.6 `plaid_get_liabilities`

Fetch liability data including credit cards, student loans, and mortgages with payment details, interest rates, and due dates. Provides a comprehensive view of a user's outstanding debts across connected institutions.

**Risk Tier:** READ-ONLY -- retrieves data without any side effects.

**Input Schema:**

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the current user"
    },
    "accessToken": {
      "type": "string",
      "description": "Access token reference for the Plaid Item"
    },
    "accountIds": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Filter to specific account IDs (omit for all liability accounts)"
    }
  },
  "required": ["userId", "accessToken"]
}
```

**Output Schema:**

```json
{
  "credit": [
    {
      "accountId": "GPnpQdbD35uKdxndAwmbt6aR",
      "aprs": [
        {
          "aprPercentage": 21.99,
          "aprType": "purchase_apr",
          "balanceSubjectToApr": 1500.00
        }
      ],
      "isOverdue": false,
      "lastPaymentAmount": 150.00,
      "lastPaymentDate": "2026-02-15",
      "lastStatementBalance": 1500.00,
      "lastStatementIssueDate": "2026-02-01",
      "minimumPaymentAmount": 35.00,
      "nextPaymentDueDate": "2026-03-01"
    }
  ],
  "student": [
    {
      "accountId": "KPm7QxbL92uKjxndBwpct8bS",
      "accountNumber": "****6789",
      "disbursementDates": ["2020-08-15"],
      "expectedPayoffDate": "2030-08-15",
      "guarantor": "US Dept of Education",
      "interestRatePercentage": 4.53,
      "isOverdue": false,
      "lastPaymentAmount": 250.00,
      "lastPaymentDate": "2026-02-10",
      "loanName": "Federal Direct Unsubsidized",
      "loanStatusType": "repayment",
      "minimumPaymentAmount": 250.00,
      "nextPaymentDueDate": "2026-03-10",
      "originationDate": "2020-08-15",
      "originationPrincipalAmount": 30000.00,
      "outstandingInterestAmount": 125.50,
      "repaymentPlanType": "standard"
    }
  ],
  "mortgage": [
    {
      "accountId": "RWx9TzbN43vLmyneCqjfu5dU",
      "accountNumber": "****1234",
      "currentLateFee": null,
      "escrowBalance": 2500.00,
      "hasPmi": false,
      "hasPrepaymentPenalty": false,
      "interestRatePercentage": 6.25,
      "interestRateType": "fixed",
      "lastPaymentAmount": 2100.00,
      "lastPaymentDate": "2026-02-01",
      "loanTerm": "30 year",
      "loanTypeDescription": "conventional",
      "maturityDate": "2054-03-01",
      "nextMonthlyPayment": 2100.00,
      "nextPaymentDueDate": "2026-03-01",
      "originationDate": "2024-03-01",
      "originationPrincipalAmount": 400000.00,
      "pastDueAmount": null,
      "ytdInterestPaid": 4125.00,
      "ytdPrincipalPaid": 1875.00
    }
  ],
  "requestId": "req-pqr678"
}
```

**PlaidCreditLiability Fields:**

| Field                      | Type         | Description                                  |
|----------------------------|--------------|----------------------------------------------|
| `accountId`                | string       | Account identifier                           |
| `aprs`                     | array        | APR details by type (purchase, balance transfer, cash advance) |
| `isOverdue`                | boolean      | Whether the account is past due              |
| `lastPaymentAmount`        | number\|null | Most recent payment amount                   |
| `lastPaymentDate`          | string\|null | Date of most recent payment                  |
| `lastStatementBalance`     | number\|null | Balance on last statement                    |
| `lastStatementIssueDate`   | string\|null | Date of last statement                       |
| `minimumPaymentAmount`     | number\|null | Minimum payment due                          |
| `nextPaymentDueDate`       | string\|null | Date of next payment due                     |

**PlaidStudentLoanLiability Fields:**

| Field                          | Type         | Description                              |
|--------------------------------|--------------|------------------------------------------|
| `accountId`                    | string       | Account identifier                       |
| `accountNumber`                | string\|null | Masked account number                    |
| `disbursementDates`            | string[]     | Dates loan was disbursed                 |
| `expectedPayoffDate`           | string\|null | Expected payoff date                     |
| `guarantor`                    | string\|null | Loan guarantor                           |
| `interestRatePercentage`       | number       | Current interest rate                    |
| `isOverdue`                    | boolean      | Whether the loan is past due             |
| `lastPaymentAmount`            | number\|null | Most recent payment amount               |
| `lastPaymentDate`              | string\|null | Date of most recent payment              |
| `loanName`                     | string\|null | Name or description of the loan          |
| `loanStatusType`               | string\|null | Loan status: repayment, deferment, etc.  |
| `minimumPaymentAmount`         | number\|null | Minimum payment due                      |
| `nextPaymentDueDate`           | string\|null | Date of next payment due                 |
| `originationDate`              | string\|null | Loan origination date                    |
| `originationPrincipalAmount`   | number\|null | Original principal amount                |
| `outstandingInterestAmount`    | number\|null | Accrued unpaid interest                  |
| `repaymentPlanType`            | string\|null | Repayment plan type                      |

**PlaidMortgageLiability Fields:**

| Field                          | Type         | Description                              |
|--------------------------------|--------------|------------------------------------------|
| `accountId`                    | string       | Account identifier                       |
| `accountNumber`                | string\|null | Masked account number                    |
| `currentLateFee`               | number\|null | Current late fee amount                  |
| `escrowBalance`                | number\|null | Current escrow balance                   |
| `hasPmi`                       | boolean      | Whether PMI is required                  |
| `hasPrepaymentPenalty`         | boolean      | Whether prepayment penalty applies       |
| `interestRatePercentage`       | number       | Current interest rate                    |
| `interestRateType`             | string       | Rate type: fixed, variable               |
| `lastPaymentAmount`            | number\|null | Most recent payment amount               |
| `lastPaymentDate`              | string\|null | Date of most recent payment              |
| `loanTerm`                     | string\|null | Loan term (e.g. "30 year")               |
| `loanTypeDescription`          | string\|null | Loan type: conventional, FHA, VA, etc.   |
| `maturityDate`                 | string\|null | Loan maturity date                       |
| `nextMonthlyPayment`           | number\|null | Next monthly payment amount              |
| `nextPaymentDueDate`           | string\|null | Date of next payment due                 |
| `originationDate`              | string\|null | Loan origination date                    |
| `originationPrincipalAmount`   | number\|null | Original principal amount                |
| `pastDueAmount`                | number\|null | Amount past due                          |
| `ytdInterestPaid`              | number\|null | Year-to-date interest paid               |
| `ytdPrincipalPaid`             | number\|null | Year-to-date principal paid              |

---

### 4.7 `plaid_get_recurring`

Identify recurring transactions (subscriptions, income, bills). Returns inflow and outflow streams with frequency and amount details. Useful for budgeting, subscription tracking, and income verification.

**Risk Tier:** READ-ONLY -- retrieves data without any side effects.

**Input Schema:**

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the current user"
    },
    "accessToken": {
      "type": "string",
      "description": "Access token reference for the Plaid Item"
    },
    "accountIds": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Filter to specific account IDs (omit for all accounts)"
    }
  },
  "required": ["userId", "accessToken"]
}
```

**Output Schema:**

```json
{
  "inflowStreams": [
    {
      "streamId": "stream-inflow-abc123",
      "accountId": "A3wenK5EQRfKlnxlBbVXtPw9",
      "description": "ACME CORP PAYROLL",
      "merchantName": "Acme Corp",
      "averageAmount": 3500.00,
      "lastAmount": 3500.00,
      "lastDate": "2026-02-15",
      "frequency": "BIWEEKLY",
      "isActive": true,
      "category": ["INCOME", "INCOME_WAGES"],
      "transactionIds": ["txn-pay-001", "txn-pay-002"]
    }
  ],
  "outflowStreams": [
    {
      "streamId": "stream-outflow-def456",
      "accountId": "A3wenK5EQRfKlnxlBbVXtPw9",
      "description": "NETFLIX",
      "merchantName": "Netflix",
      "averageAmount": 15.99,
      "lastAmount": 15.99,
      "lastDate": "2026-02-10",
      "frequency": "MONTHLY",
      "isActive": true,
      "category": ["ENTERTAINMENT", "ENTERTAINMENT_TV_AND_MOVIES"],
      "transactionIds": ["txn-nflx-001", "txn-nflx-002"]
    }
  ],
  "requestId": "req-stu901"
}
```

**PlaidRecurringTransaction Fields:**

| Field              | Type     | Description                                         |
|--------------------|----------|-----------------------------------------------------|
| `streamId`         | string   | Unique identifier for the recurring stream          |
| `accountId`        | string   | Account this stream belongs to                      |
| `description`      | string   | Raw transaction description                         |
| `merchantName`     | string\|null | Cleaned merchant name                            |
| `averageAmount`    | number   | Average transaction amount in the stream            |
| `lastAmount`       | number   | Most recent transaction amount                      |
| `lastDate`         | string   | Date of most recent occurrence (YYYY-MM-DD)         |
| `frequency`        | string   | Detected frequency: WEEKLY, BIWEEKLY, SEMI_MONTHLY, MONTHLY, ANNUALLY |
| `isActive`         | boolean  | Whether the stream is still active                  |
| `category`         | string[] | Personal finance category                           |
| `transactionIds`   | string[] | IDs of transactions in this stream                  |

---

### 4.8 `plaid_webhook_handler`

Process incoming Plaid webhooks. Validates the webhook type and code, extracts relevant fields, and returns structured event data for downstream processing by the agent or cron pipeline.

**Risk Tier:** LOW -- event processing with no external side effects.

**Input Schema:**

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "headers": {
      "type": "object",
      "additionalProperties": { "type": "string" },
      "description": "HTTP request headers from the webhook delivery"
    },
    "body": {
      "type": "object",
      "additionalProperties": true,
      "description": "Parsed JSON body of the webhook request"
    }
  },
  "required": ["headers", "body"]
}
```

**Output Schema:**

```json
{
  "accepted": true,
  "webhookType": "TRANSACTIONS",
  "webhookCode": "SYNC_UPDATES_AVAILABLE",
  "itemId": "item-sandbox-8f1a0311-da53-4636-b754-dd15cc058176",
  "error": null
}
```

| Output Field    | Type         | Description                                        |
|-----------------|--------------|----------------------------------------------------|
| `accepted`      | boolean      | Whether the webhook was recognized and processed   |
| `webhookType`   | string       | Plaid webhook type category                        |
| `webhookCode`   | string       | Specific webhook event code                        |
| `itemId`        | string\|null | Associated Item ID (if applicable)                 |
| `error`         | string\|null | Error description if webhook was rejected          |

---

## 5. Plaid Link Flow

The Plaid Link flow is the user-facing account connection sequence. It involves both client-side (browser/mobile) and server-side (extension tool) steps.

```text
Step 1: Agent calls plaid_create_link_token
        Input: userId, desired products (e.g. ["transactions", "investments"])
        Output: linkToken, expiresAt

Step 2: Client opens Plaid Link UI with the linkToken
        The user sees the Plaid interface in a modal/webview

Step 3: User selects their financial institution
        User searches for and selects their bank

Step 4: User authenticates with their institution
        User enters credentials directly with Plaid (not with the app)
        OAuth institutions redirect through the redirectUri

Step 5: Plaid Link returns public_token to client on success
        The onSuccess callback receives publicToken + metadata

Step 6: Agent calls plaid_exchange_token
        Input: userId, publicToken, institution metadata, account metadata
        Output: itemId, accessTokenRef

Step 7: Access token is stored securely
        Subsequent data fetches use the accessTokenRef

Step 8: Agent calls plaid_get_accounts to verify connection
        Then normalizes and stores via finance.upsert_snapshot
```

**Token lifecycle:**

| Token           | Lifespan       | Scope                               |
|-----------------|----------------|--------------------------------------|
| `link_token`    | 4 hours        | Single Plaid Link session            |
| `public_token`  | 30 minutes     | Single token exchange                |
| `access_token`  | Indefinite     | Ongoing data access for the Item     |

---

## 6. Webhook Handling

### 6.1 Supported Webhook Types

The `plaid_webhook_handler` tool processes the following webhook categories:

| Webhook Type          | Code                          | Description                                           | Action                                      |
|-----------------------|-------------------------------|-------------------------------------------------------|---------------------------------------------|
| `TRANSACTIONS`        | `SYNC_UPDATES_AVAILABLE`      | New transaction data available for sync               | Trigger `plaid_get_transactions` with cursor |
| `TRANSACTIONS`        | `RECURRING_TRANSACTIONS_UPDATE` | Recurring stream detection updated                  | Trigger `plaid_get_recurring`               |
| `HOLDINGS`            | `DEFAULT_UPDATE`              | Investment holdings data updated                      | Trigger `plaid_get_investments`              |
| `INVESTMENTS_TRANSACTIONS` | `DEFAULT_UPDATE`         | New investment transactions available                 | Trigger `plaid_get_investments`              |
| `LIABILITIES`         | `DEFAULT_UPDATE`              | Liability data updated                                | Trigger `plaid_get_liabilities`              |
| `ITEM`                | `ERROR`                       | Item-level error (e.g. credentials expired)           | Alert user, prompt re-authentication         |
| `ITEM`                | `PENDING_EXPIRATION`          | Access consent expiring soon                          | Alert user, prompt consent renewal           |
| `ITEM`                | `USER_PERMISSION_REVOKED`     | User revoked access at their institution              | Mark item as disconnected                    |
| `ITEM`                | `WEBHOOK_UPDATE_ACKNOWLEDGED` | Webhook URL successfully updated                      | No action required                           |

### 6.2 Webhook Processing Flow

```text
1. Webhook arrives at configured webhookUrl
2. plaid_webhook_handler receives headers + body
3. Handler validates webhook structure and extracts type/code
4. Handler returns structured event data
5. Agent decides next action based on webhookType and webhookCode:
   - TRANSACTIONS sync: call plaid_get_transactions with stored cursor
   - ITEM error: alert user and log to decision packet
   - Holdings/liabilities update: trigger appropriate sync tool
```

### 6.3 Webhook Verification

Plaid signs webhook payloads using JWT in the `Plaid-Verification` header. The handler should:
1. Extract the JWT from the `Plaid-Verification` header.
2. Decode the JWT header to get the `kid` (key ID).
3. Fetch the verification key from Plaid using the `kid`.
4. Verify the JWT signature and claims.
5. Verify the request body hash matches the `request_body_sha256` claim.

If verification fails, the handler returns `{ accepted: false, error: "webhook_verification_failed" }`.

---

## 7. Error Handling

### 7.1 Error Envelope

All tools return a `PlaidToolError` on failure:

```json
{
  "error": true,
  "errorType": "INVALID_REQUEST",
  "errorCode": "MISSING_FIELDS",
  "errorMessage": "The following required fields are missing: access_token",
  "requestId": "req-xyz789"
}
```

| Field          | Type         | Description                                       |
|----------------|--------------|---------------------------------------------------|
| `error`        | boolean      | Always `true` for error responses                 |
| `errorType`    | string       | Plaid error type category                         |
| `errorCode`    | string       | Specific Plaid error code                         |
| `errorMessage` | string       | Human-readable error description                  |
| `requestId`    | string\|null | Plaid request ID (null if error occurred pre-request) |

### 7.2 Error Type Categories

| Error Type            | Description                                          | Retryable |
|-----------------------|------------------------------------------------------|-----------|
| `INVALID_REQUEST`     | Malformed request or missing fields                  | No        |
| `INVALID_RESULT`      | Plaid could not retrieve data from the institution   | Sometimes |
| `INVALID_INPUT`       | Input value is invalid (e.g. bad access token format)| No        |
| `INSTITUTION_ERROR`   | Institution is unavailable or experiencing issues    | Yes       |
| `RATE_LIMIT_EXCEEDED` | Too many requests in a short period                  | Yes       |
| `API_ERROR`           | Internal Plaid server error                          | Yes       |
| `ITEM_ERROR`          | Problem with the Item (e.g. credentials changed)     | No        |

### 7.3 Common Error Codes

| Error Code                        | Error Type         | Description                                       | Resolution                              |
|-----------------------------------|--------------------|---------------------------------------------------|-----------------------------------------|
| `MISSING_FIELDS`                  | INVALID_REQUEST    | Required fields not provided                      | Fix input and retry                     |
| `INVALID_ACCESS_TOKEN`            | INVALID_INPUT      | Access token is malformed or expired              | Re-authenticate via Link                |
| `ITEM_LOGIN_REQUIRED`             | ITEM_ERROR         | User credentials changed at institution           | Prompt user to re-authenticate          |
| `ITEM_NOT_FOUND`                  | INVALID_INPUT      | Item ID does not exist                            | Verify item ID                          |
| `PRODUCTS_NOT_SUPPORTED`          | INVALID_REQUEST    | Requested product not available for institution   | Check supported products                |
| `NO_ACCOUNTS`                     | INVALID_RESULT     | No accounts found for the Item                    | Verify Link completed successfully      |
| `INSTITUTION_NOT_RESPONDING`      | INSTITUTION_ERROR  | Institution is temporarily unavailable            | Retry with exponential backoff          |
| `INSTITUTION_DOWN`                | INSTITUTION_ERROR  | Institution is experiencing a known outage        | Retry later                             |
| `PLANNED_MAINTENANCE`             | INSTITUTION_ERROR  | Plaid or institution undergoing maintenance       | Retry later                             |
| `TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION` | INVALID_RESULT | Data changed during cursor pagination | Restart sync from beginning             |

### 7.4 Retry Strategy

For retryable errors, use exponential backoff:

| Attempt | Delay    |
|---------|----------|
| 1       | 1 second |
| 2       | 2 seconds|
| 3       | 4 seconds|
| 4       | 8 seconds|
| 5       | 16 seconds|

Maximum retry attempts: 5. After exhausting retries, log the error via `finance.log_decision_packet` and alert the user via `finance.send_alert`.

---

## 8. Usage Notes

### 8.1 Cursor-Based Transaction Sync Strategy

Transaction sync uses a cursor to track the last-known state. This is the recommended approach over date-based fetching because it:
- Detects modified and removed transactions (not just new ones).
- Is idempotent -- replaying from the same cursor produces the same result.
- Reduces data transfer -- only delta changes are returned.

**Initial sync flow:**

```text
1. Call plaid_get_transactions with NO cursor (initial full sync)
2. Process all added transactions
3. Store nextCursor in sync_cursors table
4. If hasMore is true, call again with the returned nextCursor
5. Repeat until hasMore is false
```

**Incremental sync flow (subsequent calls):**

```text
1. Load last stored cursor from sync_cursors table
2. Call plaid_get_transactions with stored cursor
3. Process added (new), modified (updated), and removed (deleted) transactions
4. Update stored cursor to nextCursor
5. If hasMore is true, repeat from step 2
6. After sync completes, call finance.upsert_snapshot to normalize data
```

**Cursor storage:**

| Field         | Type   | Description                               |
|---------------|--------|-------------------------------------------|
| `userId`      | string | User identifier                           |
| `itemId`      | string | Plaid Item ID                             |
| `cursor`      | string | Current sync cursor value                 |
| `lastSyncAt`  | string | ISO timestamp of last successful sync     |

### 8.2 Incremental Update Semantics

| Array     | Meaning                                                         |
|-----------|-----------------------------------------------------------------|
| `added`   | New transactions since the last cursor position                 |
| `modified`| Existing transactions that changed (e.g. pending cleared, category updated) |
| `removed` | Transaction IDs that were deleted or reversed at the institution |

When processing:
- `added`: Insert into local store.
- `modified`: Upsert (update if exists, insert if not).
- `removed`: Soft-delete by transaction ID.

### 8.3 Data Freshness

Plaid data freshness varies by product and institution:

| Product        | Typical Freshness                    | Notes                                       |
|----------------|--------------------------------------|---------------------------------------------|
| Accounts       | Real-time to 1 hour                  | Balance may lag for some institutions        |
| Transactions   | Same-day for most institutions       | Pending transactions update more frequently  |
| Investments    | End-of-day                           | Holdings prices reflect prior close          |
| Liabilities    | Daily to weekly                      | Depends on institution reporting frequency   |
| Recurring      | Re-analyzed on each call             | Based on available transaction history       |

Always include a `dataFreshness` or `asOf` field when passing data to `finance.upsert_snapshot` so downstream consumers can assess staleness.

### 8.4 Product Dependencies

Some Plaid products require other products to function:

| Product        | Requires                              |
|----------------|---------------------------------------|
| `transactions` | None (standalone)                     |
| `investments`  | None (standalone)                     |
| `liabilities`  | None (standalone)                     |
| `recurring`    | `transactions` (must be enabled)      |

When creating a link token, request all needed products upfront. Adding products after initial Link requires a new Link session with the `access_token` in update mode.

### 8.5 Rate Limits

Plaid applies rate limits per client ID. General guidance:
- Transaction sync: no more than 1 request per Item per 30 seconds.
- Account balance: no more than 1 request per Item per 30 seconds.
- Investments and liabilities: no more than 1 request per Item per minute.
- Link token creation: generous limits (hundreds per minute).

If `RATE_LIMIT_EXCEEDED` is returned, apply the retry strategy from section 7.4.

---

## 9. Cross-References

| Document                            | Relevance                                                    |
|-------------------------------------|--------------------------------------------------------------|
| `api-plaid.md`                      | Full Plaid API reference -- endpoint details, request/response schemas, authentication |
| `data-models-and-schemas.md`        | Canonical data models that Plaid data is normalized into via `finance-core` |
| `api-openclaw-extension-patterns.md`| OpenClaw plugin manifest, tool registration, secrets management patterns |
| `api-openclaw-framework.md`         | OpenClaw agent loop, hooks, cron, and memory integration patterns |
| `skill-architecture-design.md`      | Overall skill architecture showing how `plaid-connect` fits with other extensions |
