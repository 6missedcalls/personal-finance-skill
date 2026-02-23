# Interactive Brokers Client Portal Web API (CPAPI) Reference

## Quick Start
1. Run Client Portal Gateway locally and complete login (2FA required).
2. Use gateway base URL (typically localhost HTTPS from gateway).
3. Keep session alive with `/tickle` at ~1 minute cadence.
4. Validate auth status with `POST /iserver/auth/status`.
5. Select account via `/iserver/accounts` before order endpoints.

## Authentication and Session

### Session endpoints
- `GET /sso/validate` - validate SSO session.
- `POST /iserver/auth/status` - brokerage auth status.
- `POST /iserver/reauthenticate` - refresh brokerage auth.
- `POST /logout` - terminate session.
- `POST /tickle` - prevent idle timeout.

Notes:
- Session can persist up to 24h, but idle timeouts occur around 5-6 minutes without traffic.
- 2FA is mandatory for CP Gateway login.
- Daily IBKR maintenance may force disconnects.

### Auth status response (typical)
```json
{
  "authenticated": true,
  "connected": true,
  "competing": false,
  "message": "",
  "MAC": "string",
  "serverInfo": {"serverName": "string", "serverVersion": "string"}
}
```

## Account Endpoints

### GET /iserver/accounts
List tradable accounts for active session.

### GET /portfolio/accounts
Required before many `/portfolio/*` calls.

### GET /portfolio/subaccounts
List subaccounts for advisor/FA structures.

### POST /iserver/account
Set active account context.

Request:
```json
{"acctId": "U1234567"}
```

## Portfolio Endpoints

### GET /portfolio/{accountId}/positions/{pageId}
Paginated positions.

Position object fields (commonly returned):
- `acctId`, `conid`, `contractDesc`, `position`
- `mktPrice`, `mktValue`, `avgCost`, `avgPrice`
- `realizedPnl`, `unrealizedPnl`, `currency`
- instrument metadata: `assetClass`, `ticker`, `listingExchange`, `sector`, `group`, `countryCode`, `expiry`, `putOrCall`, `strike`, `multiplier`, `hasOptions`

### GET /portfolio/{accountId}/position/{conid}
Single position detail.

### GET /portfolio/{accountId}/allocation
Allocation breakdown by asset class/sector/industry.

### GET /pa/performance
Portfolio Analyst performance (NAV, cumulative returns, period returns).

Performance response families:
- `nav` time series
- `cps` cumulative performance series
- `tpps` periodized returns
- metadata: `freq`, `dates`, `baseCurrency`, included accounts

## Orders Endpoints

### GET /iserver/account/orders
Get live/open orders for selected account.

### POST /iserver/account/{accountId}/orders
Place orders.

Request payload is array-based in CPAPI and can include fields like:
- `conid`
- `secType`
- `cOID` (client order id)
- `orderType`
- `side`
- `quantity`
- `price` (for limit)
- `tif`
- `outsideRTH`
- `acctId`

Example:
```json
{
  "orders": [
    {
      "acctId": "U1234567",
      "conid": 265598,
      "secType": "265598:STK",
      "cOID": "my-order-1",
      "orderType": "LMT",
      "side": "BUY",
      "quantity": 10,
      "price": 180.5,
      "tif": "DAY"
    }
  ]
}
```

### POST /iserver/account/{accountId}/order/{orderId}
Modify open order.

### DELETE /iserver/account/{accountId}/order/{orderId}
Cancel order.

### Reply flow endpoints
Some order submissions return warning/reply ids that require confirmation via:
- `POST /iserver/reply/{replyId}`

## Market Data Endpoints

### GET /iserver/marketdata/snapshot
Query params:
- `conids` (comma-separated; max documented 100)
- `fields` (tick field ids; max documented 50)

Response includes `conid`, `conidEx`, `_updated`, requested field ids as string keys, and availability code `6509`.

Example:
```json
[
  {
    "conid": 265598,
    "conidEx": "265598",
    "31": "193.18",
    "84": "193.06",
    "86": "193.14",
    "6509": "RpB",
    "_updated": 1702334859712
  }
]
```

### GET /iserver/marketdata/history
Historical bars for conid/time period.

### GET /md/regsnapshot
Regulatory snapshot for US equities (fee-bearing in some contexts).

## Contract Search Endpoints

### GET /iserver/secdef/search
Search contracts by symbol.

Common query:
- `symbol`
- `name`
- `secType`

### GET /iserver/secdef/strikes
Get strikes and expirations for options/futures options.

### GET /iserver/secdef/info
Get detailed contract definitions.

Typical fields returned:
- `conid`, `symbol`, `secType`, `listingExchange`, `currency`, `multiplier`, `validExchanges`, `companyName`, `expiry`, `strike`, `right`.

## Scanner Endpoints

### GET /iserver/scanner/params
Return scanner filter schema and instrument/location/scan code universe.

### POST /iserver/scanner/run
Run market scanner. Max results are commonly constrained (documented around 50 contracts per request).

Example request:
```json
{
  "instrument": "STK",
  "location": "STK.US.MAJOR",
  "type": "TOP_PERC_GAIN",
  "filter": [
    {"code": "priceAbove", "value": 5},
    {"code": "usdVolumeAbove", "value": 1000000}
  ]
}
```

Response (shape):
```json
{
  "contracts": [
    {
      "conid": 265598,
      "symbol": "AAPL",
      "description": "NASDAQ",
      "scan_data": "..."
    }
  ]
}
```

## Pagination and Throughput
- Many portfolio endpoints are page-based (`{pageId}`).
- Market data and scanner responses can be truncated by hard server limits.
- Respect gateway throughput limits; bursts can cause temporary blocking.

## Error Handling

Typical patterns:
- HTTP 4xx/5xx with message objects.
- Order placement can return intermediate confirmation flows requiring `/iserver/reply/{replyId}`.
- Session loss appears as `authenticated=false` with `connected=true`; re-init brokerage auth then retry.

Generic error example:
```json
{
  "error": "string",
  "statusCode": 400
}
```

## Practical Session Loop
1. `POST /iserver/auth/status`
2. `GET /iserver/accounts`
3. `POST /iserver/account` (if needed)
4. run portfolio/orders/marketdata calls
5. call `/tickle` every minute

## Primary Sources
- https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/index
- https://www.interactivebrokers.com/campus/ibkr-api-page
