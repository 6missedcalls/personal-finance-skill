### Install Alpaca Client SDKs

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Installs Alpaca's client SDKs for various programming languages. Choose the command corresponding to your development environment.

```python
pip install alpaca-py
```

```go
go get -u github.com/alpacahq/alpaca-trade-api-go/v3/alpaca
```

```javascript
npm install --save @alpacahq/alpaca-trade-api
```

```csharp
dotnet add package Alpaca.Markets
```

--------------------------------

### Example Asset Response (JSON)

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

An example of the JSON response received when calling the `GET /v1/assets` endpoint. This response lists available assets on Alpaca, including their details.

```json
{
	"id": "7595a8d2-68a6-46d7-910c-6b1958491f5c",
	"class": "us_equity",
	"exchange": "NYSE",
	"symbol": "A",
	"name": "Agilent Technologies Inc.",
	"status": "active",
	"tradable": true,
	"marginable": true,
	"shortable": true,
	"easy_to_borrow": true,
	"fractionable": true
}
```

--------------------------------

### Fetch and Display Crypto Bars in JavaScript

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Asynchronously fetches cryptocurrency bar data for BTC/USD using the Alpaca JavaScript SDK. The retrieved data is then displayed in a tabular format using `console.table`. This example requires the Alpaca SDK and assumes an asynchronous environment.

```javascript
import Alpaca from '@alpacahq/alpaca-sdk';

// Assuming alpaca client is initialized and options are configured
// const alpaca = new Alpaca({...});
// const options = {...};

(async () => {
  try {
    const bars = await alpaca.getCryptoBars(["BTC/USD"], options);
    console.table(bars.get("BTC/USD"));
  } catch (e) {
    console.error(e);
  }
})();
```

--------------------------------

### Order Examples

Source: https://docs.alpaca.markets/docs/options-trading-overview

Provides example request bodies for placing various types of options orders, including buying calls, buying puts, selling covered calls, and selling cash-secured puts.

```APIDOC
## Order Examples

### Description
This section provides example request bodies for common options trading scenarios.

### Buying a Call
```json
{
  "symbol": "PTON240126C00000500",
  "qty": "1",
  "side": "buy",
  "type": "market",
  "time_in_force": "day"
}
```

### Buying a Put
```json
{
  "symbol": "TSLA240126P00210000",
  "qty": "1",
  "side": "buy",
  "type": "market",
  "time_in_force": "day"
}
```

### Selling a Covered Call
```json
{
  "symbol": "AAPL240126C00050000",
  "qty": "1",
  "side": "sell",
  "type": "market",
  "time_in_force": "day"
}
```

### Selling a Cash Secured Put
```json
{
  "symbol": "QS240126P00006500",
  "qty": "1",
  "side": "sell",
  "type": "market",
  "time_in_force": "day"
}
```
```

--------------------------------

### Get Portfolio Positions - C#

Source: https://docs.alpaca.markets/docs/working-with-positions

Retrieves all open positions for a given Alpaca trading account using the C# SDK. This example demonstrates how to initialize the client, fetch positions, and print the quantity and symbol for each. Requires the 'Alpaca.Markets' NuGet package.

```csharp
using Alpaca.Markets;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CodeExamples
{
    internal static class Example
    {
        private static string API_KEY = "your_api_key";

        private static string API_SECRET = "your_secret_key";

        public static async Task Main(string[] args)
        {
            // First, open the API connection
            var client = Alpaca.Markets.Environments.Paper
                .GetAlpacaTradingClient(new SecretKey(API_KEY, API_SECRET));

            // Get our position in AAPL.
            var aaplPosition = await client.GetPositionAsync("AAPL");

            // Get a list of all of our positions.
            var positions = await client.ListPositionsAsync();

            // Print the quantity of shares for each position.
            foreach (var position in positions)
            {
                Console.WriteLine($"{position.Quantity} shares of {position.Symbol}.");
            }

            Console.Read();
        }
    }
}
```

--------------------------------

### FIX Message Examples

Source: https://docs.alpaca.markets/docs/fix-messages

Provides examples of FIX messages representing different order execution statuses. These examples illustrate the structure and content of messages for Pending New, New, Partial Fill, Fill, Pending Replace, Replaced, Pending Cancel, Canceled, and Rejected states.

```text
Pending New:
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=A|40=1|49=ALPACA|52=20230615-18:14:29.702|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:14:29.702|150=A|151=10|10=088|
```

```text
New:
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=0|40=1|49=ALPACA|52=20230615-18:14:45.263|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:14:45.263|150=0|151=10|10=054|
```

```text
Partial Fill:
|8=FIX.4.2|9=251|1=TEST_ACCOUNT|6=350.78|14=5|15=USD|17=694bc450-3ca6-461e-8566-f977dcec9e2d|31=350.78|32=5|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=1|40=1|49=ALPACA|52=20230615-18:15:00.622|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:15:00.622|150=1|151=5|10=185|
```

```text
Fill:
|8=FIX.4.2|9=253|1=TEST_ACCOUNT|6=350.78|14=10|15=USD|17=694bc450-3ca6-461e-8566-f977dcec9e2d|31=350.78|32=10|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=2|40=1|49=ALPACA|52=20230615-18:15:21.920|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:15:21.920|150=2|151=0|10=024|
```

```text
Pending Replace:
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=E|40=1|49=ALPACA|52=20230615-18:26:53.971|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:26:53.971|150=E|151=10|10=112|
```

```text
Replaced:
|8=FIX.4.2|9=256|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=5|40=1|41=56fcd203-7a97-430d-b14c-b0d9a7f59f2f|49=ALPACA|52=20230615-18:15:38.108|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:15:38.108|150=5|151=10|10=144|
```

```text
Pending Cancel:
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=6|40=1|49=ALPACA|52=20230615-18:24:50.191|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:24:50.191|150=6|151=10|10=060|
```

```text
Canceled:
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=4|40=1|49=ALPACA|52=20230615-18:17:45.813|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:17:45.813|150=4|151=10|10=070|
```

```text
Rejected:
|8=FIX.4.2|9=XXX|1=TEST_ACCOUNT|17=...|34=...|35=8|37=...|39=...|40=...|49=ALPACA|52=...|54=...|55=SPY|56=SENDER|58=Reject reason|59=0|60=...|150=8|10=...|
```

--------------------------------

### Example cURL Request with X-Request-ID

Source: https://docs.alpaca.markets/docs/getting-started-with-trading-api

This example demonstrates a cURL request to the Alpaca trading API and highlights the 'X-Request-ID' in the response header. This ID is essential for tracking API calls and is provided in all support requests.

```shell
$ curl -v https://paper-api.alpaca.markets/v2/account
... 
> GET /v2/account HTTP/1.1
> Host: paper-api.alpaca.markets
> User-Agent: curl/7.88.1
> Accept: */*
> 
< HTTP/1.1 403 Forbidden
< Date: Fri, 25 Aug 2023 09:34:40 GMT
< Content-Type: application/json
< Content-Length: 26
< Connection: keep-alive
< X-Request-ID: 649c5a79da1ab9cb20742ffdada0a7bb
< 
...
```

--------------------------------

### GET /v1/instant_funding

Source: https://docs.alpaca.markets/docs/instant-funding

Lists all instant funding transfers associated with the account, with options to sort.

```APIDOC
## GET /v1/instant_funding

### Description
Lists all instant funding transfers for the account. This endpoint supports sorting by creation date in descending order.

### Method
GET

### Endpoint
/v1/instant_funding

### Parameters
#### Query Parameters
- **sort_by** (string) - Optional - Field to sort the results by. Example: `created_at`.
- **sort_order** (string) - Optional - Order of sorting. Example: `DESC` for descending, `ASC` for ascending.

### Request Example
`GET /v1/instant_funding?sort_by=created_at&sort_order=DESC`

### Response
#### Success Response (200)
- **account_no** (string) - The account number that was credited.
- **amount** (string) - The amount transferred.
- **created_at** (string) - The timestamp when the transfer was created.
- **deadline** (string) - The settlement deadline for the transfer.
- **fees** (array) - An array of associated fees.
- **id** (string) - The unique identifier for the instant funding transfer.
- **interests** (array) - An array of associated interest details.
- **remaining_payable** (string) - The amount still payable for the transfer.
- **source_account_no** (string) - The source account number from which funds were borrowed.
- **status** (string) - The current status of the transfer.
- **system_date** (string) - The system date at the time of the request.
- **total_interest** (string) - The total interest accrued.

#### Response Example
```json
{
    "account_no": "{ACCOUNT_NO}",
    "amount": "20",
    "created_at": "2024-09-10T09:12:36.88272Z",
    "deadline": "2024-09-11",
    "fees": [],
    "id": "d96bdc91-6d1c-49b5-a3c3-03f16c70321b",
    "interests": [],
    "remaining_payable": "20",
    "source_account_no": "{ACCOUNT_NO}",
    "status": "EXECUTED",
    "system_date": "2024-09-10",
    "total_interest": "0"
}
```
```

--------------------------------

### Create Account

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

This endpoint allows you to create a new brokerage account for an end user. The specific requirements may vary based on your setup (Fully-Disclosed, Omnibus, or RIA).

```APIDOC
## POST /v1/accounts

### Description
Creates a new brokerage account for an end user. This is a prerequisite for many other actions within the Alpaca API.

### Method
POST

### Endpoint
/v1/accounts

### Parameters
#### Request Body
- **contact** (object) - Required - Contact information for the account holder.
  - **email_address** (string) - Required - The email address of the account holder.
  - **phone_number** (string) - Required - The phone number of the account holder.
  - **street_address** (array of strings) - Required - The street address lines.
  - **city** (string) - Required - The city of the address.
  - **postal_code** (string) - Required - The postal code of the address.
  - **state** (string) - Required - The state or province of the address.
- **identity** (object) - Required - Identity and financial information of the account holder.
  - **given_name** (string) - Required - The first name of the account holder.
  - **family_name** (string) - Required - The last name of the account holder.
  - **date_of_birth** (string) - Required - The date of birth in YYYY-MM-DD format.
  - **tax_id_type** (string) - Required - The type of tax identification (e.g., USA_SSN).
  - **tax_id** (string) - Required - The tax identification number.
  - **country_of_citizenship** (string) - Required - The country of citizenship.
  - **country_of_birth** (string) - Required - The country of birth.
  - **country_of_tax_residence** (string) - Required - The country of tax residence.
  - **funding_source** (array of strings) - Required - Source(s) of funds (e.g., employment_income).
  - **annual_income_min** (string) - Required - Minimum annual income.
  - **annual_income_max** (string) - Required - Maximum annual income.
  - **total_net_worth_min** (string) - Required - Minimum total net worth.
  - **total_net_worth_max** (string) - Required - Maximum total net worth.
  - **liquid_net_worth_min** (string) - Required - Minimum liquid net worth.
  - **liquid_net_worth_max** (string) - Required - Maximum liquid net worth.
  - **liquidity_needs** (string) - Required - Description of liquidity needs.
  - **investment_experience_with_stocks** (string) - Required - Investment experience with stocks.
  - **investment_experience_with_options** (string) - Required - Investment experience with options.
  - **risk_tolerance** (string) - Required - Risk tolerance level.
  - **investment_objective** (string) - Required - Investment objective.
  - **investment_time_horizon** (string) - Required - Investment time horizon.
  - **marital_status** (string) - Required - Marital status.
  - **number_of_dependents** (integer) - Optional - Number of dependents.
- **disclosures** (object) - Required - Disclosure information.
  - **is_control_person** (boolean) - Required - Whether the user is a control person.
  - **is_affiliated_exchange_or_finra** (boolean) - Required - Whether the user is affiliated with an exchange or FINRA.
  - **is_affiliated_exchange_or_iiroc** (boolean) - Required - Whether the user is affiliated with an exchange or IIROC.
  - **is_politically_exposed** (boolean) - Required - Whether the user is politically exposed.
  - **immediate_family_exposed** (boolean) - Required - Whether the user's immediate family is politically exposed.
- **agreements** (array of objects) - Required - List of agreements signed by the user.
  - **agreement** (string) - Required - The type of agreement (e.g., customer_agreement).
  - **signed_at** (string) - Required - Timestamp when the agreement was signed.
  - **ip_address** (string) - Required - IP address from which the agreement was signed.
- **documents** (array of objects) - Optional - Documents submitted by the user.
  - **document_type** (string) - Required - The type of document (e.g., identity_verification).
  - **document_sub_type** (string) - Required - The subtype of the document (e.g., passport).
  - **content** (string) - Required - The content of the document, likely base64 encoded.
  - **mime_type** (string) - Required - The MIME type of the document.
- **trusted_contact** (object) - Optional - Information about a trusted contact.
  - **given_name** (string) - Required - First name of the trusted contact.
  - **family_name** (string) - Required - Last name of the trusted contact.
  - **email_address** (string) - Required - Email address of the trusted contact.
- **additional_information** (string) - Optional - Any additional relevant information.
- **account_type** (string) - Optional - The type of account to be created.

### Request Example
```json
{
    "contact": {
        "email_address": "test1@gmail.com",
        "phone_number": "7065912538",
        "street_address": [
            "NG"
        ],
        "city": "San Mateo",
        "postal_code":"33345",
        "state":"CA"
    },
    "identity":      {
        "given_name": "John",
        "family_name": "Doe",
        "date_of_birth": "1990-01-01",
        "tax_id_type": "USA_SSN",
        "tax_id": "661-010-666",
        "country_of_citizenship": "USA",
        "country_of_birth": "USA",
        "country_of_tax_residence": "USA",
        "funding_source": [
            "employment_income"
        ],
        "annual_income_min": "10000",
        "annual_income_max": "10000",
        "total_net_worth_min": "10000",
        "total_net_worth_max": "10000",
        "liquid_net_worth_min": "10000",
        "liquid_net_worth_max": "10000",
        "liquidity_needs": "does_not_matter",
        "investment_experience_with_stocks": "over_5_years",
        "investment_experience_with_options": "over_5_years",
        "risk_tolerance": "conservative",
        "investment_objective": "market_speculation",
        "investment_time_horizon": "more_than_10_years",
        "marital_status":"MARRIED",
        "number_of_dependents":5
        },
    "disclosures": {
        "is_control_person": false,
        "is_affiliated_exchange_or_finra": false,
        "is_affiliated_exchange_or_iiroc": false,
        "is_politically_exposed": false,
        "immediate_family_exposed": false
    },
    "agreements": [
        {
            "agreement": "customer_agreement",
            "signed_at": "2024-08-27T10:39:34+01:00",
            "ip_address": "185.11.11.11"
        },
            {
            "agreement": "options_agreement",
            "signed_at": "2024-08-27T10:39:34+01:00",
            "ip_address": "185.11.11.11"
        },
        {
      "agreement": "margin_agreement",
      "signed_at": "2020-09-11T18:09:33Z",
      "ip_address": "185.13.21.99"
    }
    ],
    "documents": [
        {
            "document_type": "identity_verification",
            "document_sub_type": "passport",
            "content": "/9j/Cg==",
            "mime_type": "image/jpeg"
        }
    ],
    "trusted_contact": {
        "given_name": "xyz",
        "family_name": "wyz",
        "email_address": ""
    },
    "additional_information": "",
    "account_type": ""
}
```

### Response
#### Success Response (200)
- **id** (string) - The unique identifier for the created account.
- **account_number** (string) - The brokerage account number.
- **status** (string) - The status of the account (e.g., APPROVED).
- **currency** (string) - The currency of the account.
- **last_equity** (string) - The last known equity value of the account.
- **created_at** (string) - Timestamp when the account was created.

#### Response Example
```json
{
  "id": "b9b19618-22dd-4e80-8432-fc9e1ba0b27d",
  "account_number": "935142145",
  "status": "APPROVED",
  "currency": "USD",
  "last_equity": "0",
  "created_at": "2021-05-17T09:53:17.588248Z"
}
```
```

--------------------------------

### Trade Updates Stream - Multileg Options Fill Example

Source: https://docs.alpaca.markets/docs/websocket-streaming

This section provides an example of a fill event for a multi-leg options order within the trade_updates stream.

```APIDOC
## GET /v1/stream/trade_updates

### Description
This endpoint provides real-time trade updates. The example below details a fill event for a multi-leg options order, showcasing its nested 'legs' structure.

### Method
GET

### Endpoint
/v1/stream/trade_updates

### Parameters
None

### Request Example
```json
{
    "stream": "trade_updates",
    "data": {
        "at": "2025-01-21T07:32:40.70095Z",
        "event_id": "01JJ3WE73W5PG672TC4XACXH5R",
        "event": "fill",
        "timestamp": "2025-01-21T07:32:40.695569506Z",
        "order": {
            "id": "31cd620f-3bd5-41b7-8bb2-6834524679d0",
            "client_order_id": "fe999618-6435-497b-9fdd-a63d3da3615f",
            "created_at": "2025-01-21T07:32:40.678963102Z",
            "updated_at": "2025-01-21T07:32:40.699359002Z",
            "submitted_at": "2025-01-21T07:32:40.691562346Z",
            "filled_at": "2025-01-21T07:32:40.695569506Z",
            "expired_at": null,
            "cancel_requested_at": null,
            "canceled_at": null,
            "failed_at": null,
            "replaced_at": null,
            "replaced_by": null,
            "replaces": null,
            "asset_id": "00000000-0000-0000-0000-000000000000",
            "symbol": "",
            "asset_class": "",
            "notional": null,
            "qty": "1",
            "filled_qty": "1",
            "filled_avg_price": "1.62",
            "order_class": "mleg",
            "order_type": "limit",
            "type": "limit",
            "side": "buy",
            "time_in_force": "day",
            "limit_price": "2",
            "stop_price": null,
            "status": "filled",
            "extended_hours": false,
            "legs": [
                {
                    "id": "3cbe69ef-241c-43ba-9d8c-09361930a1af",
                    "client_order_id": "e868fb88-ce92-442b-91be-4b16defbc883",
                    "created_at": "2025-01-21T07:32:40.678963102Z",
                    "updated_at": "2025-01-21T07:32:40.697474882Z",
                    "submitted_at": "2025-01-21T07:32:40.687356797Z",
                    "filled_at": "2025-01-21T07:32:40.695564076Z",
                    "expired_at": null,
                    "cancel_requested_at": null,
                    "canceled_at": null,
                    "failed_at": null,
                    "replaced_at": null,
                    "replaced_by": null,
                    "replaces": null,
                    "asset_id": "925af3ed-5c00-4ef1-b89b-e4bd05f04486",
                    "symbol": "AAPL250321P00200000",
                    "asset_class": "us_option",
                    "notional": null,
                    "qty": "1",
                    "filled_qty": "1",
                    "filled_avg_price": "1.6",
                    "order_class": "mleg",
                    "order_type": "",
                    "type": "",
                    "side": "buy",
                    "time_in_force": "day",
                    "limit_price": null,
                    "stop_price": null,
                    "status": "filled",
                    "extended_hours": false,
                    "legs": null,
                    "trail_percent": null,
                    "trail_price": null,
                    "hwm": null,
                    "ratio_qty": "1"
                },
                {
                    "id": "ec694de5-5028-4347-8f89-d8ea00c9341f",
                    "client_order_id": "0a1bf1e1-6992-4c23-85a6-9469bbe05f1a",
                    "created_at": "2025-01-21T07:32:40.678963102Z",
                    "updated_at": "2025-01-21T07:32:40.699294952Z",
                    "submitted_at": "2025-01-21T07:32:40.691562346Z"
                }
            ]
        }
    }
}
```

### Response
#### Success Response (200)
- **stream** (string) - The name of the stream.
- **data** (object) - Contains the details of the trade update.
  - **at** (string) - Timestamp of the event.
  - **event_id** (string) - Unique identifier for the event.
  - **event** (string) - Type of event, e.g., 'fill'.
  - **timestamp** (string) - Timestamp of the trade.
  - **order** (object) - Details of the multi-leg options order.
    - **id** (string) - Unique identifier for the order.
    - **order_class** (string) - Class of the order, e.g., 'mleg'.
    - **asset_class** (string) - Asset class, e.g., 'us_option'.
    - **side** (string) - Order side ('buy' or 'sell').
    - **status** (string) - Order status.
    - **legs** (array) - An array of leg objects, each detailing a component of the multi-leg order.
      - **symbol** (string) - Trading symbol for the leg.
      - **filled_qty** (string) - Quantity filled for this leg.
      - **filled_avg_price** (string) - Average price for this leg.

#### Response Example
```json
{
    "stream": "trade_updates",
    "data": {
        "event": "fill",
        "timestamp": "2025-01-21T07:32:40.695569506Z",
        "order": {
            "id": "31cd620f-3bd5-41b7-8bb2-6834524679d0",
            "order_class": "mleg",
            "side": "buy",
            "status": "filled",
            "legs": [
                {
                    "symbol": "AAPL250321P00200000",
                    "filled_qty": "1",
                    "filled_avg_price": "1.6"
                },
                {
                    "symbol": "some_other_symbol",
                    "filled_qty": "1",
                    "filled_avg_price": "0.02"
                }
            ]
        }
    }
}
```
```

--------------------------------

### GET v1/instant_funding/limits

Source: https://docs.alpaca.markets/docs/instant-funding

Retrieves the total instant funding limit available for the correspondent, showing the amount currently in use and the total limit.

```APIDOC
## GET v1/instant_funding/limits

### Description
Fetches the overall instant funding limit set at the correspondent level. This endpoint helps you monitor how much of your total available instant funding you have allocated across all your end users.

### Method
GET

### Endpoint
`/v1/instant_funding/limits`

### Parameters
None

### Request Example
```bash
GET v1/instant_funding/limits
```

### Response
#### Success Response (200)
- **amount_available** (string) - The remaining instant funding amount that can be allocated.
- **amount_in_use** (string) - The amount of instant funding currently being used.
- **amount_limit** (string) - The total correspondent-level instant funding limit.

#### Response Example
```json
{
    "amount_available": "99900",
    "amount_in_use": "100",
    "amount_limit": "100000"
}
```
```

--------------------------------

### Options Order Placement Examples

Source: https://docs.alpaca.markets/docs/options-trading-overview

These JSON objects demonstrate the structure for placing various options orders. They include parameters such as symbol, quantity, side (buy/sell), order type (market), and time in force.

```json
{
  "symbol": "PTON240126C00000500",
  "qty": "1",
  "side":"buy",
  "type": "market",
  "time_in_force": "day"
}
```

```json
{
  "symbol": "TSLA240126P00210000",
  "qty": "1",
  "side": "buy",
  "type": "market",
  "time_in_force": "day"
}
```

```json
{
  "symbol": "AAPL240126C00050000",
  "qty": "1",
  "side": "sell",
  "type": "market",
  "time_in_force": "day"
}
```

```json
{
  "symbol": "QS240126P00006500",
  "qty": "1",
  "side": "sell",
  "type": "market",
  "time_in_force": "day"
}
```

--------------------------------

### Submit OTO Order (JSON)

Source: https://docs.alpaca.markets/docs/orders-at-alpaca

Example of submitting a One-Triggers-Other (OTO) buy order. This order includes a market entry order and a stop-loss with both stop and limit prices. The `order_class` is set to 'oto'.

```json
{
  "side": "buy",
  "symbol": "SPY",
  "type": "market",
  "qty": "100",
  "time_in_force": "gtc",
  "order_class": "oto",
  "stop_loss": {
    "stop_price": "299",
    "limit_price": "298.5"
  }
}
```

--------------------------------

### Create Bracket, OTO, and OCO Orders (C#)

Source: https://docs.alpaca.markets/docs/working-with-orders

Illustrates creating bracket, OTO (One-Triggers-Other), and OCO (One-Cancels-Other) orders using the Alpaca Markets .NET SDK. This example shows how to set stop-loss and take-profit prices for various order types.

```csharp
using Alpaca.Markets;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ShortingExample
{
    internal class ShortProgram
    {
        private static string API_KEY = "your_api_key";

        private static string API_SECRET = "your_secret_key";

        private static string symbol = "APPL";

        public static async Task Main(string[] args)
        {
            // First, open the API connection
            var tradingClient = Alpaca.Markets.Environments.Paper
                .GetAlpacaTradingClient(new SecretKey(API_KEY, API_SECRET));

            var dataClient = Alpaca.Markets.Environments.Paper
                .GetAlpacaDataClient(new SecretKey(API_KEY, API_SECRET));

            var snapshot = await dataClient.GetSnapshotAsync(symbol);
            var price = snapshot.MinuteBar.Close;

            // We could buy a position and add a stop-loss and a take-profit of 5 %
            await tradingClient.PostOrderAsync(
                MarketOrder.Buy(symbol, 1)
                .WithDuration(TimeInForce.Gtc)
                .Bracket(
                    stopLossStopPrice: price * 0.95M,
                    takeProfitLimitPrice: price * 0.94M,
                    stopLossLimitPrice: price * 1.05M));

            // We could buy a position and just add a stop loss of 5 % (OTO Orders)
            await tradingClient.PostOrderAsync(
                MarketOrder.Buy(symbol, 1)
                .WithDuration(TimeInForce.Gtc)
                .StopLoss(
                    stopLossStopPrice: price * 0.95M));

            // We could split it to 2 orders. first buy a stock,
            // and then add the stop/profit prices (OCO Orders)
            await tradingClient.PostOrderAsync(
                LimitOrder.Buy(symbol, 1, price));

            await tradingClient.PostOrderAsync(
                LimitOrder.Sell(symbol, 1, price)
                .WithDuration(TimeInForce.Gtc)
                .OneCancelsOther(
                    stopLossStopPrice: price * 0.95M,
                    stopLossLimitPrice: price * 1.05M));
        }
    }
}
```

--------------------------------

### Define Crypto Bars Request Parameters (Python, Go, JavaScript)

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Defines the parameters for requesting historical cryptocurrency bar data, including symbols, timeframe, and date range. The Python example uses `datetime` objects, Go uses `time.Date`, and JavaScript uses string dates.

```python
from alpaca.data.requests import CryptoBarsRequest
from alpaca.data.timeframe import TimeFrame
from datetime import datetime

# Creating request object
request_params = CryptoBarsRequest(
  symbol_or_symbols=["BTC/USD"],
  timeframe=TimeFrame.Day,
  start=datetime(2022, 9, 1),
  end=datetime(2022, 9, 7)
)
```

```go
package main

import (
	"github.com/alpacahq/alpaca-trade-api-go/v3/marketdata"
	"time"
)

request := marketdata.GetCryptoBarsRequest{
  TimeFrame: marketdata.OneDay,
  Start:     time.Date(2022, 9, 1, 0, 0, 0, 0, time.UTC),
  End:       time.Date(2022, 9, 7, 0, 0, 0, 0, time.UTC),
}
```

```javascript
let options = {
  start: "2022-09-01",
  end: "2022-09-07",
  timeframe: alpaca.newTimeframe(1, alpaca.timeframeUnit.DAY),
};
```

--------------------------------

### View Account Information using Alpaca API (Python, JavaScript, C#, Go)

Source: https://docs.alpaca.markets/docs/working-with-account

Retrieve account information such as buying power and trading restrictions by sending a GET request to the /v2/account endpoint. This example demonstrates the implementation in Python, JavaScript, C#, and Go, utilizing the respective Alpaca SDKs.

```python
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import GetAssetsRequest

trading_client = TradingClient('api-key', 'secret-key')

# Get our account information.
account = trading_client.get_account()

# Check if our account is restricted from trading.
if account.trading_blocked:
    print('Account is currently restricted from trading.')

# Check how much money we can use to open new positions.
print('${} is available as buying power.'.format(account.buying_power))
```

```javascript
const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca();

// Get our account information.
alpaca.getAccount().then((account) => {
  // Check if our account is restricted from trading.
  if (account.trading_blocked) {
    console.log("Account is currently restricted from trading.");
  }

  // Check how much money we can use to open new positions.
  console.log(`$${account.buying_power} is available as buying power.`);
});
```

```csharp
using Alpaca.Markets;
using System;
using System.Threading.Tasks;

namespace CodeExamples
{
    internal static class Example
    {
        private static string API_KEY = "your_api_key";

        private static string API_SECRET = "your_secret_key";

        public static async Task Main(string[] args)
        {
            // First, open the API connection
            var client = Alpaca.Markets.Environments.Paper
                .GetAlpacaTradingClient(new SecretKey(API_KEY, API_SECRET));

            // Get our account information.
            var account = await client.GetAccountAsync();

            // Check if our account is restricted from trading.
            if (account.IsTradingBlocked)
            {
                Console.WriteLine("Account is currently restricted from trading.");
            }

            Console.WriteLine(account.BuyingPower + " is available as buying power.");

            Console.Read();
        }
    }
}
```

```go
package main

import (
	"fmt"

	"github.com/alpacahq/alpaca-trade-api-go/alpaca"
)

func init() {
	alpaca.SetBaseUrl("https://paper-api.alpaca.markets")
}

func main() {
	// Get our account information.
	account, err := alpaca.GetAccount()
	if err != nil {
		panic(err)
	}

	// Check if our account is restricted from trading.
	if account.TradingBlocked {
		fmt.Println("Account is currently restricted from trading.")
	}

	// Check how much money we can use to open new positions.
	fmt.Printf("%v is available as buying power.\n", account.BuyingPower)
}
```

--------------------------------

### Initialize Crypto Historical Data Client (Python, Go, JavaScript)

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Initializes the client for requesting historical cryptocurrency data. Python and Go clients do not require API keys for crypto data, while JavaScript requires them.

```python
from alpaca.data.historical import CryptoHistoricalDataClient

# No keys required for crypto data
client = CryptoHistoricalDataClient()
```

```go
package main

import "github.com/alpacahq/alpaca-trade-api-go/v3/marketdata"

func main() {
	// No keys required for crypto data
	client := marketdata.NewClient(marketdata.ClientOpts{})
}
```

```javascript
import Alpaca from "@alpacahq/alpaca-trade-api";

// Alpaca() requires the API key and sectret to be set, even for crypto
const alpaca = new Alpaca({
  keyId: "YOUR_API_KEY",
  secretKey: "YOUR_API_SECRET",
});
```

--------------------------------

### Alpaca Trading API v2 - General Usage

Source: https://docs.alpaca.markets/docs/using-oauth2-and-trading-api

Examples of how to make authenticated requests to the Alpaca Trading API v2 using an access token.

```APIDOC
## Alpaca Trading API v2 - General Usage

### Description
Once you have a valid access token, you can make authenticated requests to the Alpaca Trading API v2 endpoints.

### Request Example (Get Account)
```curl
curl https://api.alpaca.markets/v2/account \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### Request Example (Get Orders)
```curl
curl https://paper-api.alpaca.markets/v2/orders \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### WebSocket Authentication (Trade Updates)
To authenticate for the trade updates websocket stream, send the following JSON payload:

```json
{
  "action": "authenticate",
  "data": {
    "oauth_token": "<YOUR_ACCESS_TOKEN>"
  }
}
```

### WebSocket Authentication (Market Data)
To authenticate for the Market Data Stream, send the following JSON payload:

```json
{
  "action": "auth",
  "key": "oauth",
  "secret": "<YOUR_ACCESS_TOKEN>"
}
```

**Note:** Most users can only have one active stream connection. If the connection is used by another application, you may receive a `406` error with the message "connection limit exceeded".
```

--------------------------------

### Fetch Crypto Bars in Go

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Fetches cryptocurrency bar data for a specified symbol and time range using the Alpaca client. The function iterates through the returned bars and prints each one. It requires the Alpaca client library and handles potential errors.

```go
import (
	"fmt"
	"github.com/alpacahq/alpaca-sdk-go/v2/alpaca"
)

func main() {
	// Assuming client is already initialized and request is configured
	// var client alpaca.Client
	// var request alpaca.GetCryptoBarsRequest

	bars, err := client.GetCryptoBars("BTC/USD", request)
	if err != nil {
		panic(err)
	}
	for _, bar := range bars {
		fmt.Printf("%+v\n", bar)
	}
}
```

--------------------------------

### Access Token Response Example (JSON)

Source: https://docs.alpaca.markets/docs/using-oauth2-and-trading-api

This JSON object represents a successful response after exchanging an authorization code for an access token. It contains the access token, token type, and the granted scope.

```json
{
    "access_token": "79500537-5796-4230-9661-7f7108877c60",
    "token_type": "bearer",
    "scope": "account:write trading"
}
```

--------------------------------

### Submit OCO Buy Order (JSON)

Source: https://docs.alpaca.markets/docs/orders-at-alpaca

Example of submitting a One-Cancels-Other (OCO) buy order. This order includes a limit price for the take-profit and a stop-loss with both stop and limit prices. The `order_class` is set to 'oco'.

```json
{
  "side": "buy",
  "symbol": "SPY",
  "type": "limit",
  "qty": "100",
  "time_in_force": "gtc",
  "order_class": "oco",
  "take_profit":{
    "limit_price": "298"
  },
  "stop_loss": {
    "stop_price": "299",
    "limit_price": "300"
  }
}
```

--------------------------------

### GET v1/instant_funding/limits/accounts

Source: https://docs.alpaca.markets/docs/instant-funding

Retrieves the instant funding limit available for specific accounts, showing the amount allocated, in use, and the limit per account.

```APIDOC
## GET v1/instant_funding/limits/accounts

### Description
Retrieves the instant funding limits for one or more specific end-user accounts. This allows you to track the buying power extended to individual accounts and ensures compliance with per-account limits.

### Method
GET

### Endpoint
`/v1/instant_funding/limits/accounts`

### Parameters
#### Query Parameters
- **account_numbers** (string) - Required - A comma-separated list of account numbers to query.

### Request Example
```bash
GET v1/instant_funding/limits/accounts?account_numbers={ACCOUNT_NO}
```

### Response
#### Success Response (200)
- **account_no** (string) - The account number.
- **amount_available** (string) - The remaining instant funding amount available for this specific account.
- **amount_in_use** (string) - The amount of instant funding currently allocated to this account.
- **amount_limit** (string) - The maximum instant funding limit set for this specific account.

#### Response Example
```json
[
    {
        "account_no": "{ACCOUNT_NO}",
        "amount_available": "900",
        "amount_in_use": "100",
        "amount_limit": "1000"
    }
]
```
```

--------------------------------

### Open Short Position (C#)

Source: https://docs.alpaca.markets/docs/working-with-orders

Demonstrates how to open a short position by submitting a sell order for a security without an existing long position. This example uses Alpaca's Paper trading environment and includes submitting both market and limit sell orders.

```csharp
using Alpaca.Markets;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// With the Alpaca API, you can open a short position by submitting a sell
// order for a security that you have no open long position with.

namespace ShortingExample
{
    internal class ShortProgram
    {
        private static string API_KEY = "your_api_key";

        private static string API_SECRET = "your_secret_key";

        // The security we'll be shorting
        private static string symbol = "TSLA";

        public static async Task Main(string[] args)
        {
            // First, open the API connection
            var tradingClient = Alpaca.Markets.Environments.Paper
                .GetAlpacaTradingClient(new SecretKey(API_KEY, API_SECRET));

            var dataClient = Alpaca.Markets.Environments.Paper
                .GetAlpacaDataClient(new SecretKey(API_KEY, API_SECRET));

            // Submit a market order to open a short position of one share
            var order = await tradingClient.PostOrderAsync(MarketOrder.Sell(symbol, 1));
            Console.WriteLine("Market order submitted.");

            // Submit a limit order to attempt to grow our short position
            // First, get an up-to-date price for our security
            var snapshot = await dataClient.GetSnapshotAsync(symbol);
            var price = snapshot.MinuteBar.Close;

            // Submit another order for one share at that price
            order = await tradingClient.PostOrderAsync(LimitOrder.Sell(symbol, 1, price));
            Console.WriteLine($"Limit order submitted. Limit price = {order.LimitPrice}");

            // Wait a few seconds for our orders to fill...
            Thread.Sleep(2000);

            // Check on our position
            var position = await tradingClient.GetPositionAsync(symbol);
            if (position.Quantity < 0)
            {
                Console.WriteLine($"Short position open for {symbol}");
            }
        }
    }
}
```

--------------------------------

### Create Alpaca Broker Account (JSON)

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

This JSON payload demonstrates the necessary information to create a new brokerage account for a fully-disclosed setup. It includes contact details, identity verification, disclosures, agreements, and optional trusted contact information. The response will contain the new account's ID and other essential details.

```JSON
{
    "contact": {
        "email_address": "test1@gmail.com",
        "phone_number": "7065912538",
        "street_address": [
            "NG"
        ],
        "city": "San Mateo",
        "postal_code":"33345",
        "state":"CA"
    },
    "identity":      {
        "given_name": "John",
        "family_name": "Doe",
        "date_of_birth": "1990-01-01",
        "tax_id_type": "USA_SSN",
        "tax_id": "661-010-666",
        "country_of_citizenship": "USA",
        "country_of_birth": "USA",
        "country_of_tax_residence": "USA",
        "funding_source": [
            "employment_income"
        ],
        "annual_income_min": "10000",
        "annual_income_max": "10000",
        "total_net_worth_min": "10000",
        "total_net_worth_max": "10000",
        "liquid_net_worth_min": "10000",
        "liquid_net_worth_max": "10000",
        "liquidity_needs": "does_not_matter",
        "investment_experience_with_stocks": "over_5_years",
        "investment_experience_with_options": "over_5_years",
        "risk_tolerance": "conservative",
        "investment_objective": "market_speculation",
        "investment_time_horizon": "more_than_10_years",
        "marital_status":"MARRIED",
        "number_of_dependents":5
        },
    "disclosures": {
        "is_control_person": false,
        "is_affiliated_exchange_or_finra": false,
        "is_affiliated_exchange_or_iiroc": false,
        "is_politically_exposed": false,
        "immediate_family_exposed": false
    },
    "agreements": [
        {
            "agreement": "customer_agreement",
            "signed_at": "2024-08-27T10:39:34+01:00",
            "ip_address": "185.11.11.11"
        },
            {
            "agreement": "options_agreement",
            "signed_at": "2024-08-27T10:39:34+01:00",
            "ip_address": "185.11.11.11"
        },
        {
      "agreement": "margin_agreement",
      "signed_at": "2020-09-11T18:09:33Z",
      "ip_address": "185.13.21.99"
    }
    ],
    "documents": [
        {
            "document_type": "identity_verification",
            "document_sub_type": "passport",
            "content": "/9j/Cg==",
            "mime_type": "image/jpeg"
        }
    ],
    "trusted_contact": {
        "given_name": "xyz",
        "family_name": "wyz",
        "email_address": ""
    },
    "additional_information": "",
    "account_type": ""
}
```

```JSON
{
  "id": "b9b19618-22dd-4e80-8432-fc9e1ba0b27d",
  "account_number": "935142145",
  "status": "APPROVED",
  "currency": "USD",
  "last_equity": "0",
  "created_at": "2021-05-17T09:53:17.588248Z"
}
```

--------------------------------

### GET /v1/events/journal/updates

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Subscribes to Server-Sent Events (SSE) for real-time updates on journal transfer statuses.

```APIDOC
## GET /v1/events/journal/updates

### Description
Listens to Server-Sent Events (SSE) for real-time updates on the status of journal transfers. This allows tracking the lifecycle of a journal entry from initiation to execution.

### Method
GET

### Endpoint
/v1/events/journal/updates

### Parameters
#### Path Parameters
None

#### Query Parameters
None (This is an SSE endpoint, typically accessed directly).

#### Request Body
None

### Request Example
`GET /v1/events/journal/updates`

### Response
#### Success Response (200)
Server-Sent Events stream with data objects for each journal status change.

#### Response Example
```
data: {"at":"2021-05-07T10:28:23.163857Z","entry_type":"JNLC","event_id":1406,"journal_id":"2f144d2a-91e6-46ff-8e37-959a701cc58d","status_from":"","status_to":"queued"}

data: {"at":"2021-05-07T10:28:23.468461Z","entry_type":"JNLC","event_id":1407,"journal_id":"2f144d2a-91e6-46ff-8e37-959a701cc58d","status_from":"queued","status_to":"pending"}

data: {"at":"2021-05-07T10:28:23.522047Z","entry_type":"JNLC","event_id":1408,"journal_id":"2f144d2a-91e6-46ff-8e37-959a701cc58d","status_from":"pending","status_to":"executed"}
```
```

--------------------------------

### Logon (A) FIX Message Example

Source: https://docs.alpaca.markets/docs/fix-messages

Represents a FIX Logon message (MsgType=A) used to initiate a FIX session. It includes mandatory fields like EncryptMethod (98) and HeartBtInt (108), and an optional ResetSeqNumFlag (141).

```text
|8=FIX.4.2|9=73|35=A|34=1|49=SENDER|52=20240524-16:02:42.003|56=ALPACA|98=0|108=30|141=Y|10=131|
```

--------------------------------

### Compressed FIFO Cost Basis Calculation Example 1

Source: https://docs.alpaca.markets/docs/trading-api-faqs

Demonstrates the Compressed FIFO method where intraday positions are compressed using a weighted average before applying FIFO. This example shows a sell transaction after multiple buys.

```pseudocode
# Day 1:
# Buy 100 shares at $10 per share (Cost basis = $1,000)
# Buy 50 shares at $12 per share (Cost basis = $600)
# Day 2:
# Buy 30 shares at $15 per share (Cost basis = $450)
# Day 3:
# Sell 120 shares
# Total initial cost basis = 1000 + 600 + 450 = 2050
# Weighted average price of all shares = (100*10 + 50*12 + 30*15) / (100 + 50 + 30) = 2050 / 180
# Cost Basis: 2050 - 120 * (2050 / 180) = $770
# Average entry price: cost_basis/qty_left = 770 / (180 - 120) = 770 / 60 = $12.83
```

--------------------------------

### Positions Endpoint Example

Source: https://docs.alpaca.markets/docs/position-average-entry-price-calculation

An example response from the positions endpoint showing 'avg_entry_price' and 'cost_basis' fields.

```APIDOC
## GET /v1/positions

### Description
Retrieves a list of current positions, including calculated average entry price and cost basis.

### Method
GET

### Endpoint
/v1/positions

### Parameters
#### Query Parameters
- **asset_id** (string) - Optional - Filter positions by asset ID.
- **symbols** (string) - Optional - Filter positions by symbol (comma-separated).

### Request Example
```json
{
  "asset_id": "904837e3-3b76-47ec-b432-046db621571b",
  "symbol": "AAPL",
  "exchange": "NASDAQ",
  "asset_class": "us_equity",
  "avg_entry_price": "100.0",
  "qty": "5",
  "qty_available": "4",
  "side": "long",
  "market_value": "600.0",
  "cost_basis": "500.0",
  "unrealized_pl": "100.0",
  "unrealized_plpc": "0.20",
  "unrealized_intraday_pl": "5.0",
  "unrealized_intraday_plpc": "0.0084",
  "current_price": "120.0",
  "lastday_price": "119.0",
  "change_today": "0.0084"
}
```

### Response
#### Success Response (200)
- **asset_id** (string) - The unique identifier for the asset.
- **symbol** (string) - The trading symbol of the asset.
- **exchange** (string) - The exchange where the asset is traded.
- **asset_class** (string) - The asset class (e.g., 'us_equity').
- **avg_entry_price** (string) - The average entry price for the position.
- **qty** (string) - The total quantity of the asset held.
- **qty_available** (string) - The quantity available for trading.
- **side** (string) - The direction of the position ('long' or 'short').
- **market_value** (string) - The current market value of the position.
- **cost_basis** (string) - The cost basis of the position.
- **unrealized_pl** (string) - The unrealized profit or loss.
- **unrealized_plpc** (string) - The unrealized profit or loss percentage.
- **unrealized_intraday_pl** (string) - The intraday unrealized profit or loss.
- **unrealized_intraday_plpc** (string) - The intraday unrealized profit or loss percentage.
- **current_price** (string) - The current market price of the asset.
- **lastday_price** (string) - The closing price from the previous trading day.
- **change_today** (string) - The percentage change in price today.

#### Response Example
```json
[
  {
    "asset_id": "904837e3-3b76-47ec-b432-046db621571b",
    "symbol": "AAPL",
    "exchange": "NASDAQ",
    "asset_class": "us_equity",
    "avg_entry_price": "100.0",
    "qty": "5",
    "qty_available": "4",
    "side": "long",
    "market_value": "600.0",
    "cost_basis": "500.0",
    "unrealized_pl": "100.0",
    "unrealized_plpc": "0.20",
    "unrealized_intraday_pl": "5.0",
    "unrealized_intraday_plpc": "0.0084",
    "current_price": "120.0",
    "lastday_price": "119.0",
    "change_today": "0.0084"
  }
]
```
```

--------------------------------

### Broker API Authentication Header (Base64)

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Demonstrates how to construct the Base64 encoded authentication header required for Broker API requests. This is essential for authenticating your API key and secret.

```bash
echo -n "YOUR_API_KEY:YOUR_API_SECRET" | base64
```

--------------------------------

### GET v1/accounts/activities/CSD

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Retrieves cash deposit activities (CSD) for an account, reflecting recent transfers.

```APIDOC
## GET /v1/accounts/activities/CSD

### Description
Retrieves cash deposit activities (CSD) for a specific account, which includes completed ACH transfers.

### Method
GET

### Endpoint
/v1/accounts/activities/CSD

### Parameters
#### Path Parameters
None

#### Query Parameters
- **account_id** (string) - Required - The ID of the account to retrieve activities for.

#### Request Body
None

### Request Example
`GET /v1/accounts/activities/CSD?account_id={account_id}`

### Response
#### Success Response (200)
Details of cash deposit activities for the specified account.

#### Response Example
(Response structure depends on the specific activity, not provided in the source text.)
```

--------------------------------

### ACH Funding API

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

This section details how to establish an ACH relationship to virtually fund an account and how to check the status of these relationships.

```APIDOC
## POST /v1/accounts/{account_id}/ach_relationships

### Description
Establishes an ACH relationship for an account, enabling virtual funding.

### Method
POST

### Endpoint
/v1/accounts/{account_id}/ach_relationships

### Parameters
#### Path Parameters
- **account_id** (string) - Required - The unique identifier of the account.

#### Request Body
- **account_owner_name** (string) - Required - The name of the account owner.
- **bank_account_type** (string) - Required - The type of bank account (e.g., CHECKING, SAVINGS).
- **bank_account_number** (string) - Required - The bank account number.
- **bank_routing_number** (string) - Required - The bank routing number.
- **nickname** (string) - Optional - A nickname for the ACH relationship.

### Request Example
```json
{
  "account_owner_name": "Awesome Alpaca",
  "bank_account_type": "CHECKING",
  "bank_account_number": "32131231abc",
  "bank_routing_number": "121000358",
  "nickname": "Bank of America Checking"
}
```

### Response
#### Success Response (200)
- **id** (string) - The unique identifier for the ACH relationship.
- **account_id** (string) - The ID of the associated account.
- **created_at** (string) - Timestamp when the relationship was created.
- **updated_at** (string) - Timestamp when the relationship was last updated.
- **status** (string) - The status of the ACH relationship (e.g., QUEUED, APPROVED).
- **account_owner_name** (string) - The name of the account owner.
- **bank_account_type** (string) - The type of bank account.
- **bank_account_number** (string) - The bank account number.
- **bank_routing_number** (string) - The bank routing number.
- **nickname** (string) - The nickname for the ACH relationship.

#### Response Example
```json
{
  "id": "c9b420e0-ae4e-4f39-bcbf-649b407c2129",
  "account_id": "b9b19618-22dd-4e80-8432-fc9e1ba0b27d",
  "created_at": "2021-05-17T09:54:58.114433723Z",
  "updated_at": "2021-05-17T09:54:58.114433723Z",
  "status": "QUEUED",
  "account_owner_name": "Awesome Alpaca",
  "bank_account_type": "CHECKING",
  "bank_account_number": "32131231abc",
  "bank_routing_number": "121000358",
  "nickname": "Bank of America Checking"
}
```

## GET /v1/accounts/{account_id}/ach_relationships

### Description
Retrieves a list of ACH relationships for a given account. This is useful for checking the status of an ACH relationship after it has been established.

### Method
GET

### Endpoint
/v1/accounts/{account_id}/ach_relationships

### Parameters
#### Path Parameters
- **account_id** (string) - Required - The unique identifier of the account.

### Response
#### Success Response (200)
Returns an array of ACH relationship objects. Each object contains details similar to the POST response, including the status.

#### Response Example
(See the example response for POST /v1/accounts/{account_id}/ach_relationships, which represents a single ACH relationship object. This endpoint returns an array of these objects.)
```

--------------------------------

### Request ID Header

Source: https://docs.alpaca.markets/docs/getting-started-with-trading-api

Explanation of the `X-Request-ID` header, a unique identifier for API calls used for support and debugging.

```APIDOC
## Request ID (X-Request-ID)

### Description
All Alpaca Trading API endpoints include a unique identifier for each API call in the response header, keyed as `X-Request-ID`. This ID is crucial for troubleshooting and support, as it helps Alpaca identify specific API calls within their system.

### Usage
- **Persistence**: It is recommended to persist recent Request IDs, as they cannot be queried through other endpoints.
- **Support**: When contacting Alpaca support, providing the relevant `X-Request-ID` can significantly expedite issue resolution.

### Example in Response Header
```
...
< X-Request-ID: 649c5a79da1ab9cb20742ffdada0a7bb
...
```

### Importance
The Request ID is essential for debugging and tracking API interactions. It allows Alpaca support to trace the exact API call chain, ensuring faster and more accurate assistance.
```

--------------------------------

### Request Options Trading Approval with Fixtures (JSON)

Source: https://docs.alpaca.markets/docs/options-trading-overview

This snippet shows how to use fixtures in the Sandbox environment to simulate different options trading approval scenarios. It includes examples for requesting an 'APPROVED', 'REJECTED', and 'LOWER_LEVEL_APPROVED' status for specific trading levels.

```json
{
  "level": 1,
  "fixtures": {
    "status":"APPROVED"
  }
}
```

```json
{
  "level": 2,
  "fixtures": {
    "status":"REJECTED"
  }
}
```

```json
{
  "level": 2,
  "fixtures": {
    "status":"LOWER_LEVEL_APPROVED",
    "level":1
  }
}
```

--------------------------------

### POST /v1/trading/accounts/{account_id}/orders

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Places a trading order for a specified symbol on behalf of a user's account.

```APIDOC
## POST /v1/trading/accounts/{account_id}/orders

### Description
Places a trading order for a specified symbol on behalf of a user's account. This endpoint is used for executing trades in the stock market.

### Method
POST

### Endpoint
/v1/trading/accounts/{account_id}/orders

### Parameters
#### Path Parameters
- **account_id** (string) - Required - The ID of the trading account where the order will be placed.

#### Query Parameters
None

#### Request Body
- **symbol** (string) - Required - The stock symbol to trade (e.g., 'AAPL').
- **qty** (number) - Required - The quantity of shares to trade.
- **side** (string) - Required - The direction of the trade ('buy' or 'sell').
- **type** (string) - Required - The order type (e.g., 'market', 'limit').
- **time_in_force** (string) - Required - The duration the order is valid (e.g., 'day', 'gtc').

### Request Example
```json
{
  "symbol": "AAPL",
  "qty": 0.42,
  "side": "buy",
  "type": "market",
  "time_in_force": "day"
}
```

### Response
#### Success Response (200)
- **id** (string) - The unique identifier for the order.
- **client_order_id** (string) - A client-generated order ID.
- **created_at** (string) - Timestamp of order creation.
- **updated_at** (string) - Timestamp of the last order update.
- **submitted_at** (string) - Timestamp when the order was submitted.
- **filled_at** (string or null) - Timestamp when the order was filled.
- **expired_at** (string or null) - Timestamp when the order expired.
- **canceled_at** (string or null) - Timestamp when the order was canceled.
- **failed_at** (string or null) - Timestamp when the order failed.
- **replaced_at** (string or null) - Timestamp when the order was replaced.
- **replaced_by** (string or null) - The ID of the order that replaced this one.
- **replaces** (string or null) - The ID of the order this one replaced.
- **asset_id** (string) - The unique identifier for the asset.
- **symbol** (string) - The trading symbol.
- **asset_class** (string) - The class of the asset (e.g., 'us_equity').
- **notional** (string or null) - The notional value of the order.
- **qty** (string) - The quantity of the order.
- **filled_qty** (string) - The quantity that has been filled.
- **filled_avg_price** (string or null) - The average price at which the order was filled.
- **order_class** (string) - The class of the order.
- **order_type** (string) - The type of order.
- **type** (string) - The order type.
- **side** (string) - The side of the order ('buy' or 'sell').
- **time_in_force** (string) - The time in force for the order.
- **limit_price** (string or null) - The limit price for limit orders.
- **stop_price** (string or null) - The stop price for stop orders.
- **status** (string) - The current status of the order (e.g., 'accepted').
- **extended_hours** (boolean) - Indicates if the order is for extended hours trading.
- **legs** (array or null) - For multi-leg orders.
- **trail_percent** (string or null) - Trailing stop percentage.
- **trail_price** (string or null) - Trailing stop price.
- **hwm** (string or null) - High Water Mark for trailing stops.
- **commission** (string) - The commission charged for the order.

#### Response Example
```json
{
  "id": "4c6cbac4-e17a-4373-b012-d446b20f9982",
  "client_order_id": "5a5e2660-88a7-410c-92c9-ab0c942df70b",
  "created_at": "2021-05-17T11:27:18.499336Z",
  "updated_at": "2021-05-17T11:27:18.499336Z",
  "submitted_at": "2021-05-17T11:27:18.488546Z",
  "filled_at": null,
  "expired_at": null,
  "canceled_at": null,
  "failed_at": null,
  "replaced_at": null,
  "replaced_by": null,
  "replaces": null,
  "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
  "symbol": "AAPL",
  "asset_class": "us_equity",
  "notional": null,
  "qty": "0.42",
  "filled_qty": "0",
  "filled_avg_price": null,
  "order_class": "",
  "order_type": "market",
  "type": "market",
  "side": "buy",
  "time_in_force": "day",
  "limit_price": null,
  "stop_price": null,
  "status": "accepted",
  "extended_hours": false,
  "legs": null,
  "trail_percent": null,
  "trail_price": null,
  "hwm": null,
  "commission": "0"
}
```
```

--------------------------------

### Submit OCO Sell Order (JSON)

Source: https://docs.alpaca.markets/docs/orders-at-alpaca

Example of submitting a One-Cancels-Other (OCO) sell order. This order includes a limit price for the take-profit and a stop-loss with both stop and limit prices. The `order_class` is set to 'oco'.

```json
{
  "side": "sell",
  "symbol": "SPY",
  "type": "limit",
  "qty": "100",
  "time_in_force": "gtc",
  "order_class": "oco",
  "take_profit": {
    "limit_price": "301"
  },
  "stop_loss": {
    "stop_price": "299",
    "limit_price": "298.5"
  }
}
```

--------------------------------

### Broker API - Get Assets

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

This endpoint retrieves a list of all assets available at Alpaca. It does not require a request body and is useful for making your first API call.

```APIDOC
## GET /v1/assets

### Description
Retrieves a list of all assets available at Alpaca.

### Method
GET

### Endpoint
/v1/assets

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Request Example
None

### Response
#### Success Response (200)
- **id** (string) - The unique identifier for the asset.
- **class** (string) - The asset class (e.g., 'us_equity').
- **exchange** (string) - The exchange where the asset is traded (e.g., 'NYSE').
- **symbol** (string) - The trading symbol for the asset (e.g., 'A').
- **name** (string) - The full name of the asset (e.g., 'Agilent Technologies Inc.').
- **status** (string) - The current status of the asset (e.g., 'active').
- **tradable** (boolean) - Indicates if the asset is currently tradable.
- **marginable** (boolean) - Indicates if the asset is marginable.
- **shortable** (boolean) - Indicates if the asset can be shorted.
- **easy_to_borrow** (boolean) - Indicates if the asset is easy to borrow for shorting.
- **fractionable** (boolean) - Indicates if the asset can be traded fractionally.

#### Response Example
```json
[
  {
    "id": "7595a8d2-68a6-46d7-910c-6b1958491f5c",
    "class": "us_equity",
    "exchange": "NYSE",
    "symbol": "A",
    "name": "Agilent Technologies Inc.",
    "status": "active",
    "tradable": true,
    "marginable": true,
    "shortable": true,
    "easy_to_borrow": true,
    "fractionable": true
  }
]
```
```

--------------------------------

### FIX Order Cancel Reject Message Example

Source: https://docs.alpaca.markets/docs/fix-messages

An example of a FIX Protocol message indicating an order cancellation was rejected. This message is sent by the server when an order cancel request cannot be honored, detailing the reason and relevant order identifiers.

```fix
|8=FIX.4.2|9=220|35=9|34=18|49=ALPACA|52=20240524-16:02:46.215|56=SENDER|1=account1|11=a7860828-4dc5-4f8f-bfb1-8fbca8855c88|37=f50af678-bba4-44ea-9b23-0fc452ed4921|39=6|41=2c017b79-a843-4146-a2b7-3bf83af89482|58=TOO_LATE_TO_CANCEL|434=1|10=116|
```

--------------------------------

### FIX Order Cancel/Replace Reject Message Example

Source: https://docs.alpaca.markets/docs/fix-messages

An example of a FIX Protocol message indicating an order cancel/replace request was rejected. This message is used when a request to modify or cancel an existing order cannot be processed, often due to the order's current state.

```fix
|8=FIX.4.2|9=198|35=9|34=45|49=ALPACA|52=20240524-16:16:59.085|56=SENDER|1=account1|11=5cdf9082-067b-4497-a90c-f5e8c666409b|37=UNKNOWN|39=8|41=c7feaf5a-54d2-458d-8ab2-9b2f337a28ec|58=replace pending for order|434=2|10=179|
```

--------------------------------

### Handle OAuth Callback with Authorization Code

Source: https://docs.alpaca.markets/docs/using-oauth2-and-trading-api

This example demonstrates how your application receives the authorization code and state parameter after a user approves access on Alpaca. The state parameter is used to verify the request's integrity.

```http
GET https://example.com/oauth/callback?code=67f74f5a-a2cc-4ebd-88b4-22453fe07994&state=8e02c9c6a3484fadaaf841fb1df290e1
```

--------------------------------

### Display Crypto Bars Dataframe in Python

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Represents cryptocurrency bar data (Open, High, Low, Close, Volume, Trade Count, VWAP) for BTC/USD as a Pandas DataFrame. This output format is commonly used for data analysis in Python. The example shows a sample of the data.

```text
                                       open      high       low     close        volume  trade_count          vwap
symbol  timestamp
BTC/USD 2022-09-01 05:00:00+00:00  20055.79  20292.00  19564.86  20156.76   7141.975485     110122.0  19934.167845
        2022-09-02 05:00:00+00:00  20156.76  20444.00  19757.72  19919.47   7165.911879      96231.0  20075.200868
        2022-09-03 05:00:00+00:00  19924.83  19968.20  19658.04  19806.11   2677.652012      51551.0  19800.185480
        2022-09-04 05:00:00+00:00  19805.39  20058.00  19587.86  19888.67   4325.678790      62082.0  19834.451414
        2022-09-05 05:00:00+00:00  19888.67  20180.50  19635.96  19760.56   6274.552824      84784.0  19812.095982
        2022-09-06 05:00:00+00:00  19761.39  20026.91  18534.06  18724.59  11217.789784     128106.0  19266.835520
```

--------------------------------

### Submit Trailing Stop Orders (Python, JavaScript, C#, Go)

Source: https://docs.alpaca.markets/docs/working-with-orders

This snippet demonstrates how to submit trailing stop orders using the Alpaca trading API. It covers both trailing by price and by percentage, with examples for Python, JavaScript, C#, and Go. Ensure you have the respective Alpaca SDKs installed.

```python
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import TrailingStopOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

trading_client = TradingClient('api-key', 'secret-key', paper=True)


trailing_percent_data = TrailingStopOrderRequest(
                    symbol="SPY",
                    qty=1,
                    side=OrderSide.SELL,
                    time_in_force=TimeInForce.GTC,
                    trail_percent=1.00 # hwm * 0.99
                    )

trailing_percent_order = trading_client.submit_order(
                order_data=trailing_percent_data
               )


trailing_price_data = TrailingStopOrderRequest(
                    symbol="SPY",
                    qty=1,
                    side=OrderSide.SELL,
                    time_in_force=TimeInForce.GTC,
                    trail_price=1.00 # hwm - $1.00
                    )

trailing_price_order = trading_client.submit_order(
                order_data=trailing_price_data
               )
```

```javascript
const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca();

// Submit a market order to buy 1 share of Apple at market price
alpaca.createOrder({
  symbol: "AAPL",
  qty: 1,
  side: "buy",
  type: "market",
  time_in_force: "day",
});

// Submit a trailing stop order to sell 1 share of Apple at a
// trailing stop of
alpaca.createOrder({
  symbol: "AAPL",
  qty: 1,
  side: "sell",
  type: "trailing_stop",
  trail_price: 1.0, // stop price will be hwm - 1.00$
  time_in_force: "day",
});

// Alternatively, you could use trail_percent:
alpaca.createOrder({
  symbol: "AAPL",
  qty: 1,
  side: "sell",
  type: "trailing_stop",
  trail_percent: 1.0, // stop price will be hwm*0.99
  time_in_force: "day",
});
```

```csharp
using Alpaca.Markets;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CodeExamples
{
    internal static class Example
    {
        private static string API_KEY = "your_api_key";

        private static string API_SECRET = "your_secret_key";

        public static async Task Main(string[] args)
        {
            // First, open the API connection
            var client = Alpaca.Markets.Environments.Paper
                .GetAlpacaTradingClient(new SecretKey(API_KEY, API_SECRET));

            // Submit a market order to buy 1 share of Apple at market price
            var order = await client.PostOrderAsync(
                new NewOrderRequest("AAPL", 1, OrderSide.Buy, OrderType.Market, TimeInForce.Day));

            // Submit a trailing stop order to sell 1 share of Apple at a
            // trailing stop of
            order = await client.PostOrderAsync(
                TrailingStopOrder.Sell("AAPL", 1, TrailOffset.InDollars(1.00M))); // stop price will be hwm - 1.00$

            /**
            // Alternatively, you could use trail_percent:
            order = await client.PostOrderAsync(
                TrailingStopOrder.Sell("AAPL", 1, TrailOffset.InPercent(0.99M))); // stop price will be hwm * 0.99
            */

            Console.Read();
        }
    }
}
```

```go
package main

import (
	"github.com/alpacahq/alpaca-trade-api-go/alpaca"
	"github.com/shopspring/decimal"
)

func init() {
	alpaca.SetBaseUrl("https://paper-api.alpaca.markets")
}

func main() {
	// Submit a market order to buy 1 share of Apple at market price
	symbol := "AAPL"
alpaca.PlaceOrder(alpaca.PlaceOrderRequest{
		AssetKey: &symbol,
		Qty: decimal.NewFromFloat(1),
		Side: alpaca.Buy,
		Type: alpaca.Market,
		TimeInForce: alpaca.Day,
	})

	// Submit a trailing stop order to sell 1 share of Apple at a
    // trailing stop of
	symbol = "AAPL"
alpaca.PlaceOrder(alpaca.PlaceOrderRequest{
		AssetKey: &symbol,
		Qty: decimal.NewFromFloat(1),
		Side: alpaca.Sell,
		Type: alpaca.TrailingStop,
		StopPrice: decimal.NewFromFloat(1.00),  // stop price will be hwm - 1.00$
		TimeInForce: alpaca.Day,
	})

	// Alternatively, you could use trail_percent:
	symbol = "AAPL"
alpaca.PlaceOrder(alpaca.PlaceOrderRequest{
		AssetKey: &symbol,
		Qty: decimal.NewFromFloat(1),
		Side: alpaca.Sell,
		Type: alpaca.TrailingStop,
		TrailPercent: decimal.NewFromFloat(1.0),  // stop price will be hwm*0.99
		TimeInForce: alpaca.Day,
	})
}
```

--------------------------------

### Journaling Funds Between Accounts

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Enables direct funding of Firm Accounts and journaling funds to user accounts for near-instantaneous transfers.

```APIDOC
## Journaling Funds Between Accounts

### Description
This process allows for direct funding of a user's brokerage account by journaling cash from a pre-funded Firm Account. This simulates instant funding, ideal for signup rewards or immediate transfers.

### Method
Not specified, but implies a POST request to a journaling endpoint.

### Endpoint
Not explicitly provided, but likely involves a specific journaling or transfer endpoint.

### Parameters
- **entry_type** (string) - Required - Must be 'JNLC' for journaling.
- **amount** (string) - Required - The amount of cash to journal.
- **destination_account_id** (string) - Required - The ID of the user's brokerage account.
- **source_account_id** (string) - Required - The ID of the Firm Account from which to journal funds.

### Request Example
(Specific request body format not fully detailed, but would include the parameters above.)

### Response
(Response details for journaling not provided in the source text.)
```

--------------------------------

### Options Contract Asset Master Example

Source: https://docs.alpaca.markets/docs/options-trading-overview

This JSON object is a sample response from the options contract endpoint, detailing an individual options contract. It includes information such as symbol, name, status, expiration date, strike price, and more.

```json
{
  "id": "1fb904df-961a-4a07-a924-53a437626db2",
  "symbol": "AAPL240223C00095000",
  "name": "AAPL Feb 23 2024 95 Call",
  "status": "active",
  "tradable": true,
  "expiration_date": "2024-02-23",
  "root_symbol": "AAPL",
  "underlying_symbol": "AAPL",
  "underlying_asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
  "type": "call",
  "style": "american",
  "strike_price": "95",
  "size": "100",
  "open_interest": "12",
  "open_interest_date": "2024-02-22",
  "close_price": "89.35",
  "close_price_date": "2024-02-22"
 }
```

--------------------------------

### Get Firm Account Details - JSON

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Displays the details of a pre-funded firm account, which can be used for simulating near-instantaneous funding to user accounts or for rewards programs. Includes account number, status, currency, and current equity.

```json
{
  "id": "8f8c8cee-2591-4f83-be12-82c659b5e748",
  "account_number": "927721227",
  "status": "ACTIVE",
  "currency": "USD",
  "last_equity": "45064.36",
  "created_at": "2021-03-03T17:50:06.568149Z"
}
```

--------------------------------

### GET v1/accounts/{account_id}/wallets/whitelists

Source: https://docs.alpaca.markets/docs/crypto-wallets-api

Retrieves a list of all whitelisted cryptocurrency addresses for a given account. This is used to check the approval status of previously whitelisted addresses.

```APIDOC
## GET v1/accounts/{account_id}/wallets/whitelists

### Description
Retrieves a list of all whitelisted cryptocurrency addresses for a given account. This is used to check the approval status of previously whitelisted addresses.

### Method
GET

### Endpoint
v1/accounts/{account_id}/wallets/whitelists

#### Path Parameters
- **account_id** (string) - Required - The ID of the account whose whitelisted addresses are to be retrieved.

### Response
#### Success Response (200)
- **Array of whitelisted addresses** (array)
    - **id** (string) - The unique identifier for the whitelisted address entry.
    - **chain** (string) - The blockchain network (e.g., "ETH").
    - **asset** (string) - The cryptocurrency asset.
    - **address** (string) - The whitelisted address.
    - **created_at** (string) - The timestamp when the address was whitelisted.
    - **status** (string) - The current status of the whitelist request (e.g., "PENDING", "APPROVED").

#### Response Example
```json
[
    {
        "id": "45efdedd-28cd-4665-98b4-601d5f34ae0a",
        "chain": "ETH",
        "asset": "USDC",
        "address": "0xf38Ecf5764fD2dEcB0dd9C1E7513a0b6eC0dD08a",
        "created_at": "2025-08-07T13:16:46.49111Z",
        "status": "APPROVED"
    }
]
```
```

--------------------------------

### Get Account Activities - CSD - Query Parameters

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Retrieves cash deposit activities for a specific account. This endpoint is used to verify the reflection of completed ACH transfers on the user's balance after a simulated delay.

```http
GET v1/accounts/activities/CSD?account_id={account_id}
```

--------------------------------

### Submit Short Orders using Alpaca API

Source: https://docs.alpaca.markets/docs/working-with-orders

Shows how to place a short order for a security you do not currently hold a long position in. This example uses a market order with a 'Good 'Til Cancelled' (GTC) time in force. Ensure the Alpaca trading client library is set up.

```python
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

trading_client = TradingClient('api-key', 'secret-key', paper=True)

# preparing orders
market_order_data = MarketOrderRequest(
                    symbol="SPY",
                    qty=1,
                    side=OrderSide.SELL,
                    time_in_force=TimeInForce.GTC
                    )

```

--------------------------------

### Example Successful Rebalancing Run Payload (JSON)

Source: https://docs.alpaca.markets/docs/portfolio-rebalancing

This is an example of the JSON payload returned when a rebalancing run completes successfully. It details the run's ID, type, status, associated account and portfolio IDs, and the resulting asset weights and orders.

```json
{
    "runs": [
        {
            "id": "36699e7f-56a0-4b87-8e03-968363f4b6df",
            "type": "full_rebalance",
            "amount": null,
            "initiated_from": "system",
            "status": "COMPLETED_SUCCESS",
            "reason": null,
            "account_id": "b3130eeb-1219-46f3-8bfb-7715f00d736b",
            "portfolio_id": "4ad7d634-a60d-4e6e-955f-3c68ee24d285",
            "weights": [
                {
                    "type": "cash",
                    "symbol": null,
                    "percent": "5"
                },
                {
                    "type": "asset",
                    "symbol": "SPY",
                    "percent": "60"
                },
                {
                    "type": "asset",
                    "symbol": "TLT",
                    "percent": "35"
                }
            ],
            "orders": [
                {
                    "id": "c29dd94b-eaaf-4681-9d1f-4fd47571804b",
                    "client_order_id": "cb2d1ff5-8355-4c92-84d7-dfff43f44cb2",
                    "created_at": "2022-03-08T16:51:07.442125Z",
                    "updated_at": "2022-03-08T16:51:07.525039Z",
                    "submitted_at": "2022-03-08T16:51:07.438495Z",
                    "filled_at": "2022-03-08T16:51:07.520169Z",
                    "expired_at": null,
                    "canceled_at": null,
                    "failed_at": null,
                    "replaced_at": null,
                    "replaced_by": null,
                    "replaces": null,
                    "asset_id": "3b64361a-1960-421a-9464-a484544193df",
                    "symbol": "SPY",
                    "asset_class": "us_equity",
                    "notional": "30443.177578017",
                    "qty": null,
                    "filled_qty": "72.865432211",
                    "filled_avg_price": "417.8",
                    "order_class": "",
                    "order_type": "market",
                    "type": "market",
                    "side": "buy",
                    "time_in_force": "day",
                    "limit_price": null,
                    "stop_price": null,
                    "status": "filled",
                    "extended_hours": false,
                    "legs": null,
                    "trail_percent": null,
                    "trail_price": null,
                    "hwm": null,
                    "subtag": null,
                    "source": null
                },
                {
                    "id": "ab772dcb-b67c-4173-a5b5-e31b9ad236b5",
                    "client_order_id": "d6278f6c-3010-45ce-aaee-6e64136deec0",
                    "created_at": "2022-03-08T16:51:07.883352Z",
                    "updated_at": "2022-03-08T16:51:07.934602Z",
                    "submitted_at": "2022-03-08T16:51:07.877726Z",
                    "filled_at": "2022-03-08T16:51:07.928907Z",
                    "expired_at": null,
                    "canceled_at": null,
                    "failed_at": null,
                    "replaced_at": null,
                    "replaced_by": null,
                    "replaces": null,
                    "asset_id": "a106d0ef-e6f2-4736-8750-5dee1cadf75b",
                    "symbol": "TLT",
                    "asset_class": "us_equity",
                    "notional": "17121.076868834",
                    "qty": null,
                    "filled_qty": "124.408348124",
                    "filled_avg_price": "137.62",
                    "order_class": "",
                    "order_type": "market",
                    "type": "market",
                    "side": "buy",
                    "time_in_force": "day",
                    "limit_price": null,
                    "stop_price": null,
                    "status": "filled",
                    "extended_hours": false,
                    "legs": null,
                    "trail_percent": null,
                    "trail_price": null,
                    "hwm": null,
                    "subtag": null,
                    "source": null
                }
            ],
            "completed_at": null,
            "canceled_at": null,
            "created_at": "2022-03-08T16:36:07.053482Z",
            "updated_at": "2022-03-08T16:51:08.53806Z"
        },
        ...
    ],
    "next_page_token": 100
}
```

--------------------------------

### Get Portfolio Positions - Go

Source: https://docs.alpaca.markets/docs/working-with-positions

Fetches all open positions in an Alpaca trading account using the Go SDK. The code prints the quantity and symbol for each position. Requires the 'github.com/alpacahq/alpaca-trade-api-go' package.

```go
package main

import (
	"fmt"
	"github.com/alpacahq/alpaca-trade-api-go/alpaca"
)

func init() {
	alpaca.SetBaseUrl("https://paper-api.alpaca.markets")
}

func main() {
	// Get our position in AAPL.
	aapl_position, err := alpaca.GetPosition("AAPL")
	if err != nil {
		fmt.Println("No AAPL position.")
	} else {
		fmt.Printf("AAPL position: %v shares.\n", aapl_position.Qty)
	}

	// Get a list of all of our positions.
	positions, err := alpaca.ListPositions()
	if err != nil {
		fmt.Println("No positions found.")
	} else {
		// Print the quantity of shares for each position.
		for _, position := range positions {
			fmt.Printf("%v shares in %s", position.Qty, position.Symbol)
		}
	}
}
```

--------------------------------

### Display Crypto Bars Table in JavaScript

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Presents cryptocurrency bar data for BTC/USD in a formatted table using `console.table`. This output provides a clear, row-and-column view of the Open, High, Low, Close, Volume, Trade Count, and VWAP for each timestamp. Requires a JavaScript environment supporting `console.table`.

```javascript
┌─────────┬──────────┬──────────┬──────────┬────────────┬──────────┬────────────────────────┬──────────────┬──────────────────┐
│ (index) │ Close    │ High     │ Low      │ TradeCount │ Open     │ Timestamp              │ Volume       │ VWAP             │
├─────────┼──────────┼──────────┼──────────┼────────────┼──────────┼────────────────────────┼──────────────┼──────────────────┤
│ 0       │ 20156.76 │ 20292    │ 19564.86 │ 110122     │ 20055.79 │ '2022-09-01T05:00:00Z' │ 7141.975485  │ 19934.1678446199 │
│ 1       │ 19919.47 │ 20444    │ 19757.72 │ 96231      │ 20156.76 │ '2022-09-02T05:00:00Z' │ 7165.911879  │ 20075.2008677126 │
│ 2       │ 19806.11 │ 19968.2  │ 19658.04 │ 51551      │ 19924.83 │ '2022-09-03T05:00:00Z' │ 2677.652012  │ 19800.1854803241 │
│ 3       │ 19888.67 │ 20058    │ 19587.86 │ 62082      │ 19805.39 │ '2022-09-04T05:00:00Z' │ 4325.67879   │ 19834.4514137038 │
│ 4       │ 19760.56 │ 20180.5  │ 19635.96 │ 84784      │ 19888.67 │ '2022-09-05T05:00:00Z' │ 6274.552824  │ 19812.0959815687 │
│ 5       │ 18724.59 │ 20026.91 │ 18534.06 │ 128106     │ 19761.39 │ '2022-09-06T05:00:00Z' │ 11217.789784 │ 19266.8355201911 │
└─────────┴──────────┴──────────┴──────────┴────────────┴──────────┴────────────────────────┴──────────────┴──────────────────┘
```

--------------------------------

### Connect to Alpaca News WebSocket Stream (Example)

Source: https://docs.alpaca.markets/docs/streaming-real-time-news

This example demonstrates how to connect to the Alpaca Markets real-time news WebSocket stream. It requires a WebSocket client library and the stream URL. The connection establishes a data feed for incoming news articles.

```websocket
wss://stream.data.alpaca.markets/v1beta1/news
```

--------------------------------

### Subscription and Unsubscription

Source: https://docs.alpaca.markets/docs/streaming-market-data

Demonstrates how to subscribe to and unsubscribe from market data channels using the WebSocket API. Includes examples for specific symbols and wildcard subscriptions.

```APIDOC
## Subscription and Unsubscription

### Description
This section describes how to manage your real-time data subscriptions via the WebSocket API. You can subscribe to or unsubscribe from various market data channels for specific symbols or all symbols using the `*` wildcard.

### Method
POST (WebSocket Message)

### Endpoint
WebSocket Endpoint

### Request Body
#### Subscribe Message
```json
{
  "action": "subscribe",
  "<channel1>": ["<SYMBOL1>"],
  "<channel2>": ["<SYMBOL2>", "<SYMBOL3>"],
  "<channel3>": ["*"]
}
```

#### Unsubscribe Message
```json
{
  "action": "unsubscribe",
  "quotes": ["FAKEPACA"]
}
```

### Request Example
**Subscribe Example:**
```json
{
  "action": "subscribe",
  "trades": ["AAPL"],
  "quotes": ["AMD", "CLDR"],
  "bars": ["*"]
}
```

**Unsubscribe Example:**
```json
{
  "action": "unsubscribe",
  "bars": ["*"]
}
```

### Response
#### Success Response (Subscription Update)
After subscribing or unsubscribing, the server returns a message detailing your current subscriptions.

- **T** (string) - Message type, will be "subscription".
- **trades** (array) - List of symbols subscribed to for trade data.
- **quotes** (array) - List of symbols subscribed to for quote data.
- **bars** (array) - List of symbols subscribed to for bar data.
- **updatedBars** (array) - List of symbols subscribed to for updated bar data.
- **dailyBars** (array) - List of symbols subscribed to for daily bar data.
- **statuses** (array) - List of symbols subscribed to for status updates.
- **lulds** (array) - List of symbols subscribed to for LULD data.
- **corrections** (array) - List of symbols subscribed to for correction data.
- **cancelErrors** (array) - List of symbols subscribed to for cancel error data.

#### Response Example
```json
[
  {
    "T": "subscription",
    "trades": ["AAPL"],
    "quotes": ["AMD", "CLDR"],
    "bars": ["*"]
  }
]
```
```

--------------------------------

### Compressed FIFO Cost Basis Calculation Example 2

Source: https://docs.alpaca.markets/docs/trading-api-faqs

Provides a second scenario for Compressed FIFO, including a sell transaction followed by a buy transaction within the same day to illustrate the compression logic.

```pseudocode
# Day 1:
# Buy 100 shares at $10 per share (Cost basis = $1,000)
# Buy 50 shares at $9 per share (Cost basis = $450)
# Sell 50 shares
# Buy 50 shares at $11 per share (Cost basis = $550)
# Total cost basis before sell = 1000 + 450 = 1450
# Average price of first 150 shares = (100*10 + 50*9) / 150 = 1450 / 150
# Cost basis after sell: 1450 - 50 * (1450 / 150) = 1291.67
# Add cost of subsequent buy: 1291.67 + 550 = 1841.67
# Total quantity = 100 - 50 + 50 + 50 = 150
# Cost Basis at end of Day 1: 1841.67
# Average Entry Price: 1841.67 / 150 = $12.28
# Note: The provided text calculates 'Cost Basis: 2000 - 50*(100*10 + 50*9 + 50*11)/200 = $1,500' which seems to be a different interpretation or a typo, as the sum of initial buys is 1450, not 2000. The calculation below follows the logic described.
# Let's re-evaluate based on the provided example's calculation method for clarity:
# Initial buys: 100@$10 (1000), 50@$9 (450). Total shares = 150, Total cost = 1450
# Sell 50 shares. Using average price of current holdings: (1000+450)/150 = $9.67 per share.
# Cost basis reduction: 50 * 9.67 = 483.5. New cost basis = 1450 - 483.5 = 966.5. Remaining shares = 100.
# Buy 50 shares at $11 (550). New cost basis = 966.5 + 550 = 1516.5. Total shares = 100 + 50 = 150.
# Average Entry Price = 1516.5 / 150 = $10.11
# The example's calculation is distinct: '2000 - 50*(100*10 + 50*9 + 50*11)/200 = $1,500'. This implies a different initial state or formula application. Assuming the formula is applied as written:
# Initial total cost = 100*10 + 50*9 + 50*11 = 1000 + 450 + 550 = 2000
# Initial total quantity = 100 + 50 + 50 = 200
# Average price = 2000 / 200 = $10
# Cost Basis after sell: 2000 - 50 * 10 = $1500
# Average Entry Price: 1500 / (200 - 50) = 1500 / 150 = $10
```

--------------------------------

### Alpaca Markets Test Stream Interaction with wscat

Source: https://docs.alpaca.markets/docs/streaming-market-data

Example of how to connect to and interact with the Alpaca Markets test stream using the wscat command-line tool. This demonstrates authentication and subscription to data feeds.

```shell
$ wscat -c wss://stream.data.alpaca.markets/v2/test
Connected (press CTRL+C to quit)
< [{\"T\":\"success\",\"msg\":\"connected\"}]
> {\"action\":\"auth\",\"key\":\"<YOUR API KEY>\",\"secret\":\"<YOUR API SECRET>\"}
< [{\"T\":\"success\",\"msg\":\"authenticated\"}]
> {\"action\":\"subscribe\",\"bars\":[\"FAKEPACA\"],\"quotes\":[\"FAKEPACA\" $(\")\"}] ($(\")\"}
< [{\"T\":\"subscription\",\"trades\":[],\"quotes\":[\"FAKEPACA\"],\"bars\":[\"FAKEPACA\"}]
< [{\"T\":\"q\",\"S\":\"FAKEPACA\",\"bx\":\"O\",\"bp\":133.85,\"bs\":4,\"ax\":\"R\",\"ap\":135.77,\"as\":5,\"c\":[\"R\"],\"z\":\"A\",\"t\":\"2024-07-24T07:56:53.639713735Z\"}]
< [{\"T\":\"q\",\"S\":\"FAKEPACA\",\"bx\":\"O\",\"bp\":133.85,\"bs\":4,\"ax\":\"R\",\"ap\":135.77,\"as\":5,\"c\":[\"R\"],\"z\":\"A\",\"t\":\"2024-07-24T07:56:58.641207127Z\"}]
< [{\"T\":\"b\",\"S\":\"FAKEPACA\",\"o\":132.65,\"h\":136,\"l\":132.12,\"c\":134.65,\"v\":205,\"t\":\"2024-07-24T07:56:00Z\",\"n\":16,\"vw\":133.7}]
```

--------------------------------

### Place Simple Order with Alpaca API

Source: https://docs.alpaca.markets/docs/working-with-orders

Places a simple order, which can be a precursor to other conditional orders. This example shows placing a buy order with a limit price. The order class is set to alpaca.Simple.

```go
limit := decimal.NewFromFloat(318.)
req := alpaca.PlaceOrderRequest{
	AccountID:   common.Credentials().ID,
	AssetKey:    &symbol,
	Qty:         decimal.New(1, 0),
	Side:        alpaca.Buy,
	LimitPrice:  &limit,
	TimeInForce: alpaca.GTC,
	Type:        alpaca.Limit,
	OrderClass:  alpaca.Simple,
}
order, err := client.PlaceOrder(req)
fmt.Println(order)
fmt.Println(err)
```

--------------------------------

### Retrieve X-Request-ID from Alpaca Broker API Response (cURL)

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

This snippet demonstrates how to make a request to the Alpaca Broker API using cURL and inspect the response headers to find the `X-Request-ID`. The `X-Request-ID` is a unique identifier for the API call, useful for debugging and support. The example shows a request to the `/v1/accounts` endpoint on the sandbox environment.

```shell
$ curl -v https://broker-api.sandbox.alpaca.markets/v1/accounts
...
> GET /v1/accounts HTTP/1.1
> Host: broker-api.sandbox.alpaca.markets
> User-Agent: curl/7.88.1
> Accept: */*
>
< HTTP/1.1 403 Forbidden
< Date: Fri, 25 Aug 2023 09:10:03 GMT
< Content-Type: application/json
< Content-Length: 26
< Connection: keep-alive
< X-Request-ID: 65ddd35ed1b3433dbf29d11f6d932c88
<
...
```

--------------------------------

### Extract Request ID from API Response Header

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Demonstrates how to retrieve the `X-Request-ID` from the response headers of an Alpaca API call using `curl`. This unique identifier is crucial for support requests, helping to trace specific API interactions within Alpaca's systems. The example shows a `curl` command and the relevant parts of the response.

```shell
$ curl -v https://data.alpaca.markets/v2/stocks/bars \
... 
< HTTP/1.1 403 Forbidden
< Date: Fri, 25 Aug 2023 09:37:03 GMT
< Content-Type: application/json
< Content-Length: 26
< Connection: keep-alive
< X-Request-ID: 0d29ba8d9a51ee0eb4e7bbaa9acff223
< 
...
```

--------------------------------

### Retrieve Crypto Bars Data (Python)

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Retrieves historical daily bar data for Bitcoin using the `get_crypto_bars` method and accesses the response as a pandas DataFrame.

```python
# Retrieve daily bars for Bitcoin in a DataFrame and printing it
btc_bars = client.get_crypto_bars(request_params)
```

--------------------------------

### Connect and Subscribe to Alpaca Data Stream (Shell)

Source: https://docs.alpaca.markets/docs/real-time-crypto-pricing-data

Example of using the 'wscat' command-line tool to connect to the Alpaca Markets data stream, authenticate, and subscribe to bar data for a specific symbol.

```shell
$ wscat -c wss://stream.data.alpaca.markets/v1beta3/crypto/us
connected (press CTRL+C to quit)
< [{"T":"success","msg":"connected"}]
> {"action": "auth", "key": "***", "secret": "***"}
< [{"T":"success","msg":"authenticated"}]
> {"action": "subscribe", "bars": ["BTC/USD"]}
< [{"T":"subscription","trades":[],"quotes":[],"orderbooks":[],"bars":["BTC/USD"],"updatedBars":[],"dailyBars":[]}]
< [{"T":"b","S":"BTC/USD","o":26675.04,"h":26695.36,"l":26668.79,"c":26688.7,"v":3.227759152,"t":"2023-03-17T12:28:00Z","n":93,"vw":26679.5912436798}]
< [{"T":"b","S":"BTC/USD","o":26687.9,"h":26692.91,"l":26628.55,"c":26651.39,"v":11.568622108,"t":"2023-03-17T12:29:00Z","n":197,"vw":26651.7679765663}]
```

--------------------------------

### POST /v1/accounts/{account_id}/transfers

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Initiates a virtual ACH transfer to fund an account. Requires an existing ACH relationship.

```APIDOC
## POST /v1/accounts/{account_id}/transfers

### Description
Initiates a virtual ACH transfer to fund an account using an existing ACH relationship.

### Method
POST

### Endpoint
/v1/accounts/{account_id}/transfers

### Parameters
#### Path Parameters
- **account_id** (string) - Required - The ID of the account to fund.

#### Query Parameters
None

#### Request Body
- **transfer_type** (string) - Required - Must be 'ach'.
- **relationship_id** (string) - Required - The ID of the existing ACH relationship.
- **amount** (string) - Required - The amount to transfer.
- **direction** (string) - Required - Must be 'INCOMING'.

### Request Example
```json
{
  "transfer_type": "ach",
  "relationship_id": "c9b420e0-ae4e-4f39-bcbf-649b407c2129",
  "amount": "1234.567",
  "direction": "INCOMING"
}
```

### Response
#### Success Response (200)
- **id** (string) - The unique identifier for the transfer.
- **relationship_id** (string) - The ID of the ACH relationship used.
- **account_id** (string) - The ID of the account that was funded.
- **type** (string) - The type of transfer ('ach').
- **status** (string) - The current status of the transfer (e.g., 'QUEUED').
- **amount** (string) - The transferred amount.
- **direction** (string) - The direction of the transfer ('INCOMING').
- **created_at** (string) - The timestamp when the transfer was created.
- **updated_at** (string) - The timestamp when the transfer was last updated.
- **expires_at** (string) - The timestamp when the transfer expires.

#### Response Example
```json
{
  "id": "750d8323-19f6-47d5-8e9a-a34ed4a6f2d2",
  "relationship_id": "c9b420e0-ae4e-4f39-bcbf-649b407c2129",
  "account_id": "b9b19618-22dd-4e80-8432-fc9e1ba0b27d",
  "type": "ach",
  "status": "QUEUED",
  "amount": "1234.567",
  "direction": "INCOMING",
  "created_at": "2021-05-17T09:56:05.445592162Z",
  "updated_at": "2021-05-17T09:56:05.445592162Z",
  "expires_at": "2021-05-24T09:56:05.445531104Z"
}
```
```

--------------------------------

### Simulate Deposit (Sandbox Only)

Source: https://docs.alpaca.markets/docs/funding-wallets

Simulates a deposit into a funding wallet. This endpoint is only available in the sandbox environment.

```APIDOC
## POST /v1/funding/deposits/simulate

### Description
Simulates a deposit transaction into a specified funding wallet. This is useful for testing deposit flows in the sandbox environment.

### Method
POST

### Endpoint
/v1/funding/deposits/simulate

### Parameters
#### Request Body
- **wallet_id** (string) - Required - The unique identifier for the funding wallet to deposit into.
- **amount** (number) - Required - The amount to deposit.
- **currency** (string) - Required - The currency of the deposit (e.g., "USD").

### Request Example
```json
{
  "wallet_id": "wallet_abc",
  "amount": 100.00,
  "currency": "USD"
}
```

### Response
#### Success Response (200)
- **transfer_id** (string) - The unique identifier for the simulated transfer.
- **status** (string) - The status of the simulated deposit (e.g., "complete").

#### Response Example
```json
{
  "transfer_id": "transfer_xyz",
  "status": "complete"
}
```
```

--------------------------------

### Display Crypto Bars Raw Structs in Go

Source: https://docs.alpaca.markets/docs/getting-started-with-alpaca-market-data

Displays raw cryptocurrency bar data structures as returned by the Alpaca Go SDK. Each bar includes Timestamp, Open, High, Low, Close, Volume, TradeCount, and VWAP. This format is useful for direct inspection or custom processing in Go.

```go
{Timestamp:2022-09-01 05:00:00 +0000 UTC Open:20055.79 High:20292 Low:19564.86 Close:20156.76 Volume:7141.975485 TradeCount:110122 VWAP:19934.1678446199}
{Timestamp:2022-09-02 05:00:00 +0000 UTC Open:20156.76 High:20444 Low:19757.72 Close:19919.47 Volume:7165.911879 TradeCount:96231 VWAP:20075.2008677126}
{Timestamp:2022-09-03 05:00:00 +0000 UTC Open:19924.83 High:19968.2 Low:19658.04 Close:19806.11 Volume:2677.652012 TradeCount:51551 VWAP:19800.1854803241}
{Timestamp:2022-09-04 05:00:00 +0000 UTC Open:19805.39 High:20058 Low:19587.86 Close:19888.67 Volume:4325.67879 TradeCount:62082 VWAP:19834.4514137038}
{Timestamp:2022-09-05 05:00:00 +0000 UTC Open:19888.67 High:20180.5 Low:19635.96 Close:19760.56 Volume:6274.552824 TradeCount:84784 VWAP:19812.0959815687}
{Timestamp:2022-09-06 05:00:00 +0000 UTC Open:19761.39 High:20026.91 Low:18534.06 Close:18724.59 Volume:11217.789784 TradeCount:128106 VWAP:19266.8355201911}
```

--------------------------------

### POST /v1/instant_funding

Source: https://docs.alpaca.markets/docs/instant-funding

Creates an instant funding transfer. You must specify the account to credit, the source account for borrowing, and the amount.

```APIDOC
## POST /v1/instant_funding

### Description
Creates an instant funding transfer, specifying the account to credit, the source account for borrowing buying power, and the transfer amount.

### Method
POST

### Endpoint
/v1/instant_funding

### Parameters
#### Request Body
- **account_no** (string) - Required - The account number to be credited.
- **source_account_no** (string) - Required - The firm account number from which buying power will be borrowed.
- **amount** (string) - Required - The amount to be credited.

### Request Example
```json
{
 "account_no": "{ACCOUNT_NO}",
 "source_account_no": "{ACCOUNT_NO}",
 "amount": "20"
}
```

### Response
#### Success Response (200)
- **account_no** (string) - The account number that was credited.
- **amount** (string) - The amount transferred.
- **created_at** (string) - The timestamp when the transfer was created.
- **deadline** (string) - The settlement deadline for the transfer.
- **fees** (array) - An array of associated fees (usually empty).
- **id** (string) - The unique identifier for the instant funding transfer.
- **interests** (array) - An array of associated interest details (usually empty).
- **remaining_payable** (string) - The amount still payable for the transfer.
- **source_account_no** (string) - The source account number from which funds were borrowed.
- **status** (string) - The current status of the transfer (e.g., PENDING).
- **system_date** (string) - The system date at the time of the request.
- **total_interest** (string) - The total interest accrued (usually "0").

#### Response Example
```json
{
  "account_no": "{ACCOUNT_NO}",
  "amount": "20",
  "created_at": "2024-11-11T08:20:10.726356556-05:00",
  "deadline": "2024-11-13",
  "fees": [],
  "id": "fcc6d9fc-ce36-484a-bd86-a27b98c2d1ab",
  "interests": [],
  "remaining_payable": "20",
  "source_account_no": "{ACCOUNT_NO}",
  "status": "PENDING",
  "system_date": "2024-11-12",
  "total_interest": "0"
}
```

#### Related Responses
Instant funding transfer executed (before settlement):
```json
{
  "id": "20241111000000000::6b784928-f314-47bc-905f-0a49ebc9e413",
  "account_id": "{ACCOUNT_ID}",
  "activity_type": "MEM",
  "date": "2024-11-11",
  "net_amount": "0",
  "description": "type: instant_funding_memopost, transfer_id: fcc6d9fc-ce36-484a-bd86-a27b98c2d1ab",
  "symbol": "INSTANTUSD",
  "qty": "20",
  "status": "executed"
}
```
Instant funding transfer canceled (after settlement or after failed reconciliation):
```json
{
  "id": "20241111000000000::6b784928-f314-47bc-905f-0a49ebc9e413",
  "account_id": "{ACCOUNT_ID}",
  "activity_type": "MEM",
  "date": "2024-11-11",
  "net_amount": "0",
  "description": "type: instant_funding_memopost, transfer_id: fcc6d9fc-ce36-484a-bd86-a27b98c2d1ab",
  "symbol": "INSTANTUSD",
  "qty": "20",
  "status": "canceled"
}
```
CSD executed (after settlement):
```json
{
  "id": "20241111000000000::daa5e4e9-7974-4273-a926-7ab0647d8850",
  "account_id": "{ACCOUNT_ID}",
  "activity_type": "CSD",
  "date": "2024-11-11",
  "net_amount": "20",
  "description": "type: instant_funding_deposit, transfer_id: fcc6d9fc-ce36-484a-bd86-a27b98c2d1ab, settlement_id: 28f27c76-ea14-4d4c-8a04-8f666b14a224",
  "status": "executed"
}
```
```

--------------------------------

### GET /v1/instant_funding/:instant_funding_id

Source: https://docs.alpaca.markets/docs/instant-funding

Fetches a specific instant funding transfer by its ID to check its current status.

```APIDOC
## GET /v1/instant_funding/:instant_funding_id

### Description
Fetches a specific instant funding transfer using its unique identifier to check the current status of the transfer.

### Method
GET

### Endpoint
/v1/instant_funding/:instant_funding_id

### Parameters
#### Path Parameters
- **instant_funding_id** (string) - Required - The unique identifier of the instant funding transfer.

### Response
#### Success Response (200)
- **account_no** (string) - The account number that was credited.
- **amount** (string) - The amount transferred.
- **created_at** (string) - The timestamp when the transfer was created.
- **deadline** (string) - The settlement deadline for the transfer.
- **fees** (array) - An array of associated fees.
- **id** (string) - The unique identifier for the instant funding transfer.
- **interests** (array) - An array of associated interest details.
- **remaining_payable** (string) - The amount still payable for the transfer.
- **source_account_no** (string) - The source account number from which funds were borrowed.
- **status** (string) - The current status of the transfer (e.g., EXECUTED).
- **system_date** (string) - The system date at the time of the request.
- **total_interest** (string) - The total interest accrued.

#### Response Example
```json
{
    "account_no": "{ACCOUNT_NO}",
    "amount": "20",
    "created_at": "2024-09-10T09:12:36.88272Z",
    "deadline": "2024-09-11",
    "fees": [],
    "id": "d96bdc91-6d1c-49b5-a3c3-03f16c70321b",
    "interests": [],
    "remaining_payable": "20",
    "source_account_no": "{ACCOUNT_NO}",
    "status": "EXECUTED",
    "system_date": "2024-09-10",
    "total_interest": "0"
}
```
```

--------------------------------

### Submit Trailing Stop Order JSON Example

Source: https://docs.alpaca.markets/docs/orders-at-alpaca

This JSON object demonstrates the parameters required to submit a trailing stop order. It includes the order side, symbol, quantity, time in force, and either `trail_price` or `trail_percent` to define the trailing stop mechanism.

```json
{
  "side": "sell",
  "symbol": "SPY",
  "type": "trailing_stop",
  "qty": "100",
  "time_in_force": "day",
  "trail_price": "6.15"
}
```

--------------------------------

### Place Trade Order - JSON

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Submits a trade order for a user's account on the stock market. Requires specifying the symbol, quantity, side (buy/sell), type (market/limit), and time in force. The response contains the order details and its status.

```json
{
  "symbol": "AAPL",
  "qty": 0.42,
  "side": "buy",
  "type": "market",
  "time_in_force": "day"
}
```

--------------------------------

### Example FIX Messages

Source: https://docs.alpaca.markets/docs/fix-messages

Illustrative FIX messages for various order execution types, demonstrating the structure and field usage.

```APIDOC
## Example FIX Messages

### Description
This section provides example FIX messages for different order execution states, showcasing the typical format and populated fields.

### Pending New
```text
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=A|40=1|49=ALPACA|52=20230615-18:14:29.702|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:14:29.702|150=A|151=10|10=088|
```

### New
```text
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=0|40=1|49=ALPACA|52=20230615-18:14:45.263|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:14:45.263|150=0|151=10|10=054|
```

### Partial Fill
```text
|8=FIX.4.2|9=251|1=TEST_ACCOUNT|6=350.78|14=5|15=USD|17=694bc450-3ca6-461e-8566-f977dcec9e2d|31=350.78|32=5|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=1|40=1|49=ALPACA|52=20230615-18:15:00.622|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:15:00.622|150=1|151=5|10=185|
```

### Fill
```text
|8=FIX.4.2|9=253|1=TEST_ACCOUNT|6=350.78|14=10|15=USD|17=694bc450-3ca6-461e-8566-f977dcec9e2d|31=350.78|32=10|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=2|40=1|49=ALPACA|52=20230615-18:15:21.920|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:15:21.920|150=2|151=0|10=024|
```

### Pending Replace
```text
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=E|40=1|49=ALPACA|52=20230615-18:26:53.971|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:26:53.971|150=E|151=10|10=112|
```

### Replaced
```text
|8=FIX.4.2|9=256|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=5|40=1|41=56fcd203-7a97-430d-b14c-b0d9a7f59f2f|49=ALPACA|52=20230615-18:15:38.108|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:15:38.108|150=5|151=10|10=144|
```

### Pending Cancel
```text
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=6|40=1|49=ALPACA|52=20230615-18:24:50.191|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:24:50.191|150=6|151=10|10=060|
```

### Canceled
```text
|8=FIX.4.2|9=216|1=TEST_ACCOUNT|17=694bc450-3ca6-461e-8566-f977dcec9e2d|34=12|35=8|37=c5bfc5f6-163d-450e-bb4a-fb25188cde8e|39=4|40=1|49=ALPACA|52=20230615-18:17:45.813|54=1|55=SPY|56=SENDER|59=0|60=20230615-18:17:45.813|150=4|151=10|10=070|
```

### Rejected
```text
(No example provided for Rejected state in the input text.)
```

```

--------------------------------

### Orderbook Data Structure Example (JSON)

Source: https://docs.alpaca.markets/docs/real-time-crypto-pricing-data

An example JSON payload for an initial full orderbook. It includes the message type, symbol, timestamp, bids, asks, and a reset flag. If the reset flag is true, the message contains the entire server-side orderbook.

```json
{
  "T": "o",
  "S": "BTC/USD",
  "t": "2024-03-12T10:38:50.79613221Z",
  "b": [
    {
      "p": 71859.53,
      "s": 0.27994
    },
    {
      "p": 71849.4,
      "s": 0.553986
    },
    {
      "p": 71820.469,
      "s": 0.83495
    }
   ],
  "a": [
    {
      "p": 71939.7,
      "s": 0.83953
    },
    {
      "p": 71940.4,
      "s": 0.28025
    },
    {
      "p": 71950.715,
      "s": 0.555928
    }
    ,
    ...
  ],
  "r": true
}
```

--------------------------------

### Trade Updates Stream - Crypto Fill Example

Source: https://docs.alpaca.markets/docs/websocket-streaming

This section illustrates the structure of a 'fill' event within the trade_updates stream for cryptocurrency trades.

```APIDOC
## GET /v1/stream/trade_updates

### Description
This endpoint provides real-time trade updates for various asset classes. The example below shows a fill event for a cryptocurrency trade.

### Method
GET

### Endpoint
/v1/stream/trade_updates

### Parameters
None

### Request Example
```json
{
  "stream": "trade_updates",
  "data": {
    "event": "fill",
    "execution_id": "2f63ea93-423d-4169-b3f6-3fdafc10c418",
    "order": {
      "asset_class": "crypto",
      "asset_id": "1cf35270-99ee-44e2-a77f-6fab902c7f80",
      "cancel_requested_at": null,
      "canceled_at": null,
      "client_order_id": "4642fd68-d59a-47d7-a9ac-e22f536828d1",
      "created_at": "2022-04-19T13:45:04.981350886-04:00",
      "expired_at": null,
      "extended_hours": false,
      "failed_at": null,
      "filled_at": "2022-04-19T17:45:05.024916716Z",
      "filled_avg_price": "105.8988475",
      "filled_qty": "1790.86",
      "hwm": null,
      "id": "a5be8f5e-fdfa-41f5-a644-7a74fe947a8f",
      "legs": null,
      "limit_price": null,
      "notional": null,
      "order_class": "",
      "order_type": "market",
      "qty": "1790.86",
      "replaced_at": null,
      "replaced_by": null,
      "replaces": null,
      "side": "sell",
      "status": "filled",
      "stop_price": null,
      "submitted_at": "2022-04-19T13:45:04.980944666-04:00",
      "symbol": "SOLUSD",
      "time_in_force": "gtc",
      "trail_percent": null,
      "trail_price": null,
      "type": "market",
      "updated_at": "2022-04-19T13:45:05.027690731-04:00"
    },
    "position_qty": "0",
    "price": "105.8988475",
    "qty": "1790.86",
    "timestamp": "2022-04-19T17:45:05.024916716Z"
  }
}
```

### Response
#### Success Response (200)
- **stream** (string) - The name of the stream.
- **data** (object) - Contains the details of the trade update.
  - **event** (string) - Type of event, e.g., 'fill'.
  - **execution_id** (string) - Unique identifier for the execution.
  - **order** (object) - Details of the order associated with the trade.
    - **asset_class** (string) - The class of the asset (e.g., 'crypto').
    - **asset_id** (string) - Unique identifier for the asset.
    - **order_type** (string) - Type of the order (e.g., 'market').
    - **filled_qty** (string) - Quantity that was filled.
    - **filled_avg_price** (string) - Average price at which the quantity was filled.
    - **symbol** (string) - Trading symbol.
    - **side** (string) - Order side ('buy' or 'sell').
    - **status** (string) - Order status.
    - **timestamp** (string) - Timestamp of the event.

#### Response Example
```json
{
  "stream": "trade_updates",
  "data": {
    "event": "fill",
    "execution_id": "2f63ea93-423d-4169-b3f6-3fdafc10c418",
    "order": {
      "asset_class": "crypto",
      "asset_id": "1cf35270-99ee-44e2-a77f-6fab902c7f80",
      "order_type": "market",
      "filled_qty": "1790.86",
      "filled_avg_price": "105.8988475",
      "symbol": "SOLUSD",
      "side": "sell",
      "status": "filled"
    },
    "timestamp": "2022-04-19T17:45:05.024916716Z"
  }
}
```
```

--------------------------------

### Account Information API

Source: https://docs.alpaca.markets/docs/getting-started-with-trading-api

Retrieve your Alpaca account information. This endpoint is useful for verifying your account status and details.

```APIDOC
## GET /v2/account

### Description
Retrieves the details of the authenticated account.

### Method
GET

### Endpoint
/v2/account

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Request Example
```
GET /v2/account HTTP/1.1
Host: paper-api.alpaca.markets
User-Agent: curl/7.88.1
Accept: */*

```

### Response
#### Success Response (200)
- **id** (string) - The account ID.
- **account_number** (string) - The account number.
- **status** (string) - The account status (e.g., ACTIVE, SUBMITTED, REJECTED, CLOSED).
- **accreditation** (string) - The account accreditation status.
- **buying_power** (string) - The buying power of the account.
- **regt_buying_power** (string) - The regulated buying power.
- **daytrading_buying_power** (string) - The day trading buying power.
- **cash** (string) - The amount of cash in the account.
- **portfolio_value** (string) - The total value of the portfolio.
- **equity** (string) - The equity in the account.
- **last_equity** (string) - The last recorded equity value.
- **long_market_value** (string) - The market value of long positions.
- **short_market_value** (string) - The market value of short positions.
- **initial_margin** (string) - The initial margin requirement.
- **maintenance_margin** (string) - The maintenance margin requirement.
- **sma** (string) - The special memorandum account balance.
- **pattern_day_trader** (boolean) - Whether the account is flagged as a pattern day trader.
- **trading_blocked** (boolean) - Whether trading is blocked for the account.
- **transfers_blocked** (boolean) - Whether transfers are blocked for the account.
- **broker** (string) - The broker associated with the account.
- **created_at** (string) - The timestamp when the account was created.
- **shorting_enabled** (boolean) - Whether shorting is enabled for the account.
- **long_market_value** (string) - The market value of long positions.

#### Response Example
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "account_number": "01002000",
  "status": "ACTIVE",
  "accreditation": "ACCREDITED",
  "buying_power": "10000.00",
  "regt_buying_power": "10000.00",
  "daytrading_buying_power": "20000.00",
  "cash": "5000.00",
  "portfolio_value": "15000.00",
  "equity": "15000.00",
  "last_equity": "14900.00",
  "long_market_value": "10000.00",
  "short_market_value": "0.00",
  "initial_margin": "5000.00",
  "maintenance_margin": "2500.00",
  "sma": "7500.00",
  "pattern_day_trader": false,
  "trading_blocked": false,
  "transfers_blocked": false,
  "broker": "Alpaca Securities LLC",
  "created_at": "2023-01-01T12:00:00Z",
  "shorting_enabled": true
}
```

### Error Handling
- **403 Forbidden**: Returned if the API key is invalid or lacks necessary permissions. The `X-Request-ID` header will contain a unique identifier for the request.
```

--------------------------------

### Trade Event Examples (JSON)

Source: https://docs.alpaca.markets/docs/draft-sse-events

These examples demonstrate the structure of trade event notifications received from Alpaca Markets. They include details about new orders, filled orders, and trade busts, providing real-time insights into trading activity.

```json
{
    "account_id": "aa4439c3-cf7d-4251-8689-a575a169d6d3",
    "at": "2023-10-13T13:28:58.387652Z",
    "event_id": "01HCMKKNRK7S5C1JYP50QGDECQ",
    "event": "new",
    "timestamp": "2023-10-13T13:28:58.37957033Z",
    "order": {
        "id": "bb2403bc-88ec-430b-b41c-f9ee80c8f0e1",
        "client_order_id": "508789e5-cea3-4235-b546-6c62ff92bd79",
        "created_at": "2023-10-13T13:28:58.361530031Z",
        "updated_at": "2023-10-13T13:28:58.386058029Z",
        "submitted_at": "2023-10-13T13:28:58.360070731Z",
        "filled_at": null,
        "expired_at": null,
        "cancel_requested_at": null,
        "canceled_at": null,
        "failed_at": null,
        "replaced_at": null,
        "replaced_by": null,
        "replaces": null,
        "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
        "symbol": "AAPL",
        "asset_class": "us_equity",
        "notional": "10",
        "qty": null,
        "filled_qty": "0",
        "filled_avg_price": null,
        "order_class": "",
        "order_type": "market",
        "type": "market",
        "side": "buy",
        "time_in_force": "day",
        "limit_price": null,
        "stop_price": null,
        "status": "new",
        "extended_hours": false,
        "legs": null,
        "trail_percent": null,
        "trail_price": null,
        "hwm": null,
        "commission": "0"
    },
    "execution_id": "7922ab44-5b33-4049-ab9a-0cfd805ba989"
}
```

```json
{
    "account_id": "aa4439c3-cf7d-4251-8689-a575a169d6d3",
    "at": "2023-10-13T13:30:00.664778Z",
    "event_id": "01HCMKNJJRJ4E3RNFA1XR8CX7R",
    "event": "fill",
    "timestamp": "2023-10-13T13:30:00.658443088Z",
    "order": {
        "id": "db04069d-2e5a-48d4-a42f-6a0dea8ea0b8",
        "client_order_id": "be139e2d-8153-4ae8-83ee-7b98b4e17419",
        "created_at": "2023-10-13T13:22:21.887914Z",
        "updated_at": "2023-10-13T13:30:00.661902331Z",
        "submitted_at": "2023-10-13T13:23:05.411141Z",
        "filled_at": "2023-10-13T13:30:00.658443088Z",
        "expired_at": null,
        "cancel_requested_at": null,
        "canceled_at": null,
        "failed_at": null,
        "replaced_at": null,
        "replaced_by": null,
        "replaces": null,
        "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
        "symbol": "AAPL",
        "asset_class": "us_equity",
        "notional": "10",
        "qty": null,
        "filled_qty": "0.05513895",
        "filled_avg_price": "181.36",
        "order_class": "",
        "order_type": "market",
        "type": "market",
        "side": "buy",
        "time_in_force": "day",
        "limit_price": null,
        "stop_price": null,
        "status": "filled",
        "extended_hours": false,
        "legs": null,
        "trail_percent": null,
        "trail_price": null,
        "hwm": null,
        "commission": "0"
    },
    "price": "181.36",
    "qty": "0.05513895",
    "position_qty": "0.05513895",
    "execution_id": "a958bb42-b034-4d17-bf07-805cf0820ffe"
}
```

```json
{
    "account_id": "aa4439c3-cf7d-4251-8689-a575a169d6d3",
    "at": "2023-10-13T13:30:00.673857Z",
    "event_id": "01HCMKNJK1Y0R7VF6Q6CAC3SH7",
    "event": "fill",
    "timestamp": "2023-10-13T13:30:00.658388668Z",
    "order": {
        "id": "bb2403bc-88ec-430b-b41c-f9ee80c8f0e1",
        "client_order_id": "508789e5-cea3-4235-b546-6c62ff92bd79",
        "created_at": "2023-10-13T13:28:58.361530031Z",
        "updated_at": "2023-10-13T13:30:00.665807961Z",
        "submitted_at": "2023-10-13T13:28:58.360070731Z",
        "filled_at": "2023-10-13T13:30:00.658388668Z",
        "expired_at": null,
        "cancel_requested_at": null,
        "canceled_at": null,
        "failed_at": null,
        "replaced_at": null,
        "replaced_by": null,
        "replaces": null,
        "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
        "symbol": "AAPL",
        "asset_class": "us_equity",
        "notional": "10",
        "qty": null,
        "filled_qty": "0.05513895",
        "filled_avg_price": "181.36",
        "order_class": "",
        "order_type": "market",
        "type": "market",
        "side": "buy",
        "time_in_force": "day",
        "limit_price": null,
        "stop_price": null,
        "status": "filled",
        "extended_hours": false,
        "legs": null,
        "trail_percent": null,
        "trail_price": null,
        "hwm": null,
        "commission": "0"
    },
    "price": "181.36",
    "qty": "0.05513895",
    "position_qty": "0.1102779",
    "execution_id": "33cbb614-bfc0-468b-b4d0-ccf08588ef77"
}
```

```json
{
    "account_id": "aa4439c3-cf7d-4251-8689-a575a169d6d3",
    "at": "2024-09-23T13:30:00.673857Z",
    "event_id": "01HCMQR4S73L9G6EHI0JKL2M3N",
    "event": "trade_bust",
    "timestamp": "2024-09-23T15:30:48.601741737Z",
    "order": {
    }
}
```

--------------------------------

### Example WebSocket Communication (JSON)

Source: https://docs.alpaca.markets/docs/streaming-market-data

Illustrates a typical interaction sequence where a client sends a subscribe request and receives the updated subscription status from the server. This is followed by an unsubscribe request and its confirmation.

```json
> {"action": "subscribe", "trades": ["AAPL"], "quotes": ["AMD", "CLDR"], "bars": ["*"]}
< [{"T":"subscription","trades":["AAPL"],"quotes":["AMD","CLDR"],"bars":["*"],"updatedBars":[],"dailyBars":[],"statuses":[],"lulds":[],"corrections":["AAPL"],"cancelErrors":["AAPL"]}]
...
> {"action": "unsubscribe", "bars": ["*"]}
< [{"T":"subscription","trades":["AAPL"],"quotes":["AMD","CLDR"],"bars":[],"updatedBars":[],"dailyBars":[],"statuses":[],"lulds":[],"corrections":["AAPL"],"cancelErrors":["AAPL"]}]
```

--------------------------------

### Get Funding Wallet Details

Source: https://docs.alpaca.markets/docs/funding-wallets

Retrieves the details of a specific funding wallet.

```APIDOC
## GET /v1/funding/wallets/{wallet_id}

### Description
Retrieves the details of a specific funding wallet, including its account number and current balance.

### Method
GET

### Endpoint
/v1/funding/wallets/{wallet_id}

### Parameters
#### Path Parameters
- **wallet_id** (string) - Required - The unique identifier for the funding wallet.

### Response
#### Success Response (200)
- **wallet_id** (string) - The unique identifier for the funding wallet.
- **account_number** (string) - The account number for the funding wallet.
- **balance** (number) - The current balance of the funding wallet.

#### Response Example
```json
{
  "wallet_id": "wallet_abc",
  "account_number": "123456789",
  "balance": 1000.50
}
```
```

--------------------------------

### Place Market and Limit Orders using Alpaca API

Source: https://docs.alpaca.markets/docs/working-with-orders

Demonstrates how to submit market and limit orders using the Alpaca trading API. This involves preparing order requests with specific parameters like symbol, quantity, side, and time in force. Ensure you have the Alpaca trading client library installed for your respective language.

```python
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

trading_client = TradingClient('api-key', 'secret-key', paper=True)

# preparing market order
market_order_data = MarketOrderRequest(
                    symbol="SPY",
                    qty=0.023,
                    side=OrderSide.BUY,
                    time_in_force=TimeInForce.DAY
                    )

# Market order
market_order = trading_client.submit_order(
                order_data=market_order_data
               )

# preparing limit order
limit_order_data = LimitOrderRequest(
                    symbol="BTC/USD",
                    limit_price=17000,
                    notional=4000,
                    side=OrderSide.SELL,
                    time_in_force=TimeInForce.FOK
                   )

# Limit order
limit_order = trading_client.submit_order(
                order_data=limit_order_data
              )
```

```javascript
const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca();

// Submit a market order to buy 1 share of Apple at market price
alpaca.createOrder({
  symbol: "AAPL",
  qty: 1,
  side: "buy",
  type: "market",
  time_in_force: "day",
});

// Submit a limit order to attempt to sell 1 share of AMD at a
// particular price ($20.50) when the market opens
alpaca.createOrder({
  symbol: "AMD",
  qty: 1,
  side: "sell",
  type: "limit",
  time_in_force: "opg",
  limit_price: 20.5,
});
```

```csharp
using Alpaca.Markets;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CodeExamples
{
    internal static class Example
    {
        private static string API_KEY = "your_api_key";

        private static string API_SECRET = "your_secret_key";

        public static async Task Main(string[] args)
        {
            // First, open the API connection
            var client = Alpaca.Markets.Environments.Paper
                .GetAlpacaTradingClient(new SecretKey(API_KEY, API_SECRET));

            // Submit a market order to buy 1 share of Apple at market price
            var order = await client.PostOrderAsync(MarketOrder.Buy("AAPL", 1));

            // Submit a limit order to attempt to sell 1 share of AMD at a
            // particular price ($20.50) when the market opens
            order = await client.PostOrderAsync(
                LimitOrder.Sell("AMD", 1, 20.50M).WithDuration(TimeInForce.Opg));

            Console.Read();
        }
    }
}
```

```go
package main

import (
	"github.com/alpacahq/alpaca-trade-api-go/alpaca"
	"github.com/shopspring/decimal"
)

func init() {
	alpaca.SetBaseUrl("https://paper-api.alpaca.markets")
}

func main() {
	// Submit a market order to buy 1 share of Apple at market price
	symbol := "AAPL"
	alpaca.PlaceOrder(alpaca.PlaceOrderRequest{
		AssetKey: &symbol,
		Qty: decimal.NewFromFloat(1),
		Side: alpaca.Buy,
		Type: alpaca.Market,
		TimeInForce: alpaca.Day,
	})

	// Submit a limit order to attempt to sell 1 share of AMD at a
	// particular price ($20.50) when the market opens
	symbol = "AMD"
	alpaca.PlaceOrder(alpaca.PlaceOrderRequest{
		AssetKey: &symbol,
		Qty: decimal.NewFromFloat(1),
		Side: alpaca.Sell,
		Type: alpaca.Limit,
		TimeInForce: alpaca.OPG,
		LimitPrice: decimal.NewFromFloat(20.50),
	})
}
```

--------------------------------

### Sample Incoming Deposit Event (JSON)

Source: https://docs.alpaca.markets/docs/crypto-wallets-api

This JSON object represents a sample Server-Sent Event (SSE) detailing an incoming cryptocurrency deposit. It includes transaction details such as quantity, asset information, and account identifiers.

```json
{
    "id": "a6a3f62c-d4dd-4b6f-9b3a-fb65892c9695",
    "qty": 10,
    "cusip": "USDC12345",
    "status": "executed",
    "symbol": "USDCUSD",
    "entry_type": "OCT",
    "net_amount": 0,
    "description": "Deposit Transaction, transfer_id: 296f3a5b-72e8-4ec6-b1fe-77048e77e87f, tx_hash: 0x97fa0e98598d7bedf2871bc1846daa076cddafaa9046b3697b6cd89ca7304932",
    "settle_date": "2025-09-19",
    "system_date": "2025-09-19",
    "price": "0.9997",
    "per_share_amount": null,
    "account_id": "34c18dbe-0983-4e61-b493-9578714dae23",
    "at": "2025-09-19T08:09:01.061337Z",
    "event_ulid": "01K5GG9ZC5A3CVKP5QEZ79PVEX"
}
```

--------------------------------

### Client Credentials Authentication (Broker API Example)

Source: https://docs.alpaca.markets/docs/authentication

This section explains how to obtain an access token using the client credentials flow for Broker API users. It covers exchanging credentials for a short-lived access token.

```APIDOC
## POST /v1/oauth2/token

### Description
Requests an access token using client ID and client secret.

### Method
POST

### Endpoint
`https://authx.alpaca.markets/v1/oauth2/token`

### Parameters
#### Query Parameters
- `grant_type` (string) - Required - Must be `client_credentials`.

#### Request Body
- `client_id` (string) - Required - Your Alpaca client ID.
- `client_secret` (string) - Required - Your Alpaca client secret.

### Request Example
```curl
curl -X POST "https://authx.alpaca.markets/v1/oauth2/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials" \
     -d "client_id={YOUR_CLIENT_ID}" \
     -d "client_secret={YOUR_CLIENT_SECRET}"
```

### Response
#### Success Response (200)
- `access_token` (string) - The obtained access token.
- `expires_in` (integer) - The time in seconds until the token expires.
- `token_type` (string) - The type of token, usually `Bearer`.

#### Response Example
```json
{
    "access_token": "{TOKEN}",
    "expires_in": 899,
    "token_type": "Bearer"
}
```
```

--------------------------------

### Fetch Account Information (curl)

Source: https://docs.alpaca.markets/docs/using-oauth2-and-trading-api

This curl command shows how to make a GET request to the Alpaca Trading API v2 to fetch account information. It requires the Authorization header with the Bearer token obtained previously.

```curl
curl https://api.alpaca.markets/v2/account \
  -H 'Authorization: Bearer 79500537-5796-4230-9661-7f7108877c60'
```

--------------------------------

### GET /v1/accounts/{account_id}/wallets

Source: https://docs.alpaca.markets/docs/crypto-wallets-api

Retrieve a list of crypto funding wallet addresses for a given account and asset. This is typically used to obtain an address for depositing funds.

```APIDOC
## GET /v1/accounts/{account_id}/wallets

### Description
Retrieve a list of crypto funding wallet addresses for a given account and asset. This is typically used to obtain an address for depositing funds.

### Method
GET

### Endpoint
`/v1/accounts/{account_id}/wallets`

### Parameters
#### Path Parameters
- **account_id** (string) - Required - The ID of the account for which to retrieve wallet addresses.

#### Query Parameters
- **asset** (string) - Required - The asset symbol (e.g., USDC).
- **network** (string) - Required - The blockchain network (e.g., ethereum, solana).

### Request Example
```
GET /v1/accounts/123e4567-e89b-12d3-a456-426614174000/wallets?asset=USDC&network=ethereum
```

### Response
#### Success Response (200)
- **asset_id** (string) - The unique identifier for the asset.
- **address** (string) - The generated crypto funding wallet address.
- **created_at** (string) - The timestamp when the wallet address was created.

#### Response Example
```json
{
    "asset_id": "5d0de74f-827b-41a7-9f74-9c07c08fe55f",
    "address": "0x42a76C83014e886e639768D84EAF3573b1876844",
    "created_at": "2025-08-07T08:52:40.656166Z"
}
```
```

--------------------------------

### Get Positions

Source: https://docs.alpaca.markets/docs/options-trading-overview

Displays option positions in the same format as other asset positions, including details like quantity, average entry price, and market value.

```APIDOC
## Positions

### Description
Option positions are displayed within the positions endpoint, mirroring the format used for other asset classes. The example below illustrates the structure of an options position.

### Response Example
```json
{
  "asset_id": "fe4f43e5-60a4-4269-ba4c-3d304444d58b",
  "symbol": "PTON240126C00000500",
  "exchange": "",
  "asset_class": "us_option",
  "asset_marginable": true,
  "qty": "2",
  "avg_entry_price": "6.05",
  "side": "long",
  "market_value": "1068",
  "cost_basis": "1210",
  "unrealized_pl": "-142",
  "unrealized_plpc": "-0.1173553719008264",
  "unrealized_intraday_pl": "-142",
  "unrealized_intraday_plpc": "-0.1173553719008264",
  "current_price": "5.34",
  "lastday_price": "5.34",
  "change_today": "0",
  "qty_available": "2"
}
```
```

--------------------------------

### Submit Market Order (Python)

Source: https://docs.alpaca.markets/docs/working-with-orders

Submits a market order using the Alpaca trading client. This is a basic example showing the structure for submitting an order with predefined order data.

```python
oto_order = trading_client.submit_order(
                order_data=oto_order_data
               )
```

--------------------------------

### Exchange Authorization Code for Access Token (curl)

Source: https://docs.alpaca.markets/docs/using-oauth2-and-trading-api

This example demonstrates how to make a POST request using curl to exchange a temporary authorization code for an access token. It includes all required parameters such as grant_type, code, client_id, client_secret, and redirect_uri. The content type must be application/x-www-form-urlencoded.

```curl
curl -X POST https://api.alpaca.markets/oauth/token \
  -d 'grant_type=authorization_code&code=67f74f5a-a2cc-4ebd-88b4-22453fe07994&client_id=fc9c55efa3924f369d6c1148e668bbe8&client_secret=5b8027074d8ab434882c0806833e76508861c366&redirect_uri=https://example.com/oauth/callback'
```

--------------------------------

### Instant Funding API - Create an Instant Funding Request

Source: https://docs.alpaca.markets/docs/funding-accounts

This endpoint initiates an instant funding request. It's recommended to pass transmitter information at the time of settlement creation for Travel Rule compliance.

```APIDOC
## POST /v1/instant_funding

### Description
Creates an instant funding request. Transmitter information should be provided during settlement creation for Travel Rule compliance.

### Method
POST

### Endpoint
/v1/instant_funding

### Parameters
#### Request Body
- **originator_full_name** (string) - Required - The full name of the customer initiating the transaction.
- **originator_bank_account_number** (string) - Required - The bank account number of the customer or a unique identifier on the broker partner's system.
- **originator_street_address** (string) - Required - The street address of the financial institution transmitting the funds.
- **originator_city** (string) - Required - The city of the financial institution transmitting the funds.
- **originator_state** (string) - Required - The state of the financial institution transmitting the funds.
- **originator_country** (string) - Required - The country of the financial institution transmitting the funds.
- **originator_bank_name** (string) - Required - The name of the transmitter's financial institution.
- **other_identifying_information** (string) - Optional - Recommended to be the originating bank's reference number for the transfer.

### Request Example
```json
{
  "amount": "500.00",
  "originator_full_name": "Jane Smith",
  "originator_bank_account_number": "987654321",
  "originator_street_address": "456 Oak Ave",
  "originator_city": "Somecity",
  "originator_state": "NY",
  "originator_country": "USA",
  "originator_bank_name": "Global Bank",
  "other_identifying_information": "REF12345"
}
```

### Response
#### Success Response (200)
- **request_id** (string) - The unique identifier for the instant funding request.
- **status** (string) - The status of the request.

#### Response Example
```json
{
  "request_id": "irf987xyz",
  "status": "processing"
}
```
```

--------------------------------

### Fetch Orders (curl)

Source: https://docs.alpaca.markets/docs/using-oauth2-and-trading-api

This curl command demonstrates how to make a GET request to the Alpaca Trading API v2 to retrieve orders. It utilizes the paper trading endpoint and requires the Authorization header with a valid Bearer token.

```curl
curl https://paper-api.alpaca.markets/v2/orders \
  -H 'Authorization: Bearer 79500537-5796-4230-9661-7f7108877c60'
```

--------------------------------

### Option Quote Data Schema and Example

Source: https://docs.alpaca.markets/docs/real-time-option-data

Details the schema for quote messages from the option data stream, including message type, symbol, timestamp, bid/ask exchange codes, bid/ask prices, bid/ask sizes, and quote conditions. An example illustrates the message structure.

```json
{
  "T": "q",
  "S": "SPXW240327P04925000",
  "t": "2024-03-12T11:59:38.897261568Z",
  "bx": "C",
  "bp": 9.46,
  "bs": 53,
  "ax": "C",
  "ap": 9.66,
  "as": 38,
  "c": "A"
}
```

--------------------------------

### GET /v1/instant_funding/settlements/{settlement_id}

Source: https://docs.alpaca.markets/docs/instant-funding

Retrieves the status of a specific instant funding settlement using its unique ID. This is used to confirm if the reconciliation process has been completed.

```APIDOC
## GET /v1/instant_funding/settlements/{settlement_id}

### Description
Retrieves the status of a specific instant funding settlement.

### Method
GET

### Endpoint
/v1/instant_funding/settlements/{settlement_id}

### Parameters
#### Path Parameters
- **settlement_id** (string) - Required - The unique identifier of the settlement to check.

#### Query Parameters
None

### Response
#### Success Response (200)
- **completed_at** (string) - Timestamp when the settlement was completed (if applicable).
- **created_at** (string) - Timestamp when the settlement was created.
- **id** (string) - The unique identifier for the settlement.
- **interest_amount** (string) - The interest amount associated with the settlement.
- **source_account_number** (string) - The account number from which funds are sourced.
- **status** (string) - The current status of the settlement (e.g., COMPLETED, FAILED, PENDING).
- **total_amount** (string) - The total amount of the settlement.
- **updated_at** (string) - Timestamp when the settlement was last updated.
- **reason** (string) - (Optional) If the settlement failed, this field provides the reason for failure.

#### Response Example (Success)
```json
{
    "completed_at": "2024-10-29T14:50:46.337084Z",
    "created_at": "2024-10-29T14:50:15.926307Z",
    "id": "a0f41a2c-60f3-49f2-90cd-e4ec2560c819",
    "interest_amount": "0",
    "source_account_number": "{ACCOUNT_NO}",
    "status": "COMPLETED",
    "total_amount": "20",
    "updated_at": "2024-10-29T14:50:46.337131Z"
}
```

#### Response Example (Failure)
```json
{
    "created_at": "2024-08-27T08:30:24.517942Z",
    "id": "c9a89b1b-94fe-4852-8ba1-140b67aa7280",
    "interest_amount": "0",
    "reason": "insufficient balance, available: 0, required: 40",
    "source_account_number": "{ACCOUNT_NO}",
    "status": "FAILED",
    "total_amount": "40",
    "updated_at": "2024-08-27T09:36:01.026356Z"
}
```
```

--------------------------------

### GET /v2/orders - Retrieve Orders (with nesting)

Source: https://docs.alpaca.markets/docs/orders-at-alpaca

Retrieve a list of orders. By specifying `nested=true`, you can view bracket orders with their child orders nested under the parent order.

```APIDOC
## GET /v2/orders

### Description
Retrieves a list of your orders. When querying bracket orders, setting the `nested` query parameter to `true` will group the entry order with its associated take-profit and stop-loss orders under a single parent order, presented in the `legs` array.

### Method
GET

### Endpoint
/v2/orders

### Parameters
#### Query Parameters
- **nested** (boolean) - Optional - If true, the response will nest child orders (take-profit and stop-loss) under the parent bracket order in the `legs` array.
- **status** (string) - Optional - Filter orders by their status (e.g., 'open', 'closed', 'canceled').
- **limit** (integer) - Optional - The maximum number of orders to return.
- **after** (string) - Optional - A cursor for pagination, returning orders after a specific order ID.
- **until** (string) - Optional - A cursor for pagination, returning orders until a specific order ID.

### Request Example
```
GET /v2/orders?nested=true&limit=10
```

### Response
#### Success Response (200)
- **id** (string) - The unique identifier for the order.
- **status** (string) - The current status of the order.
- **created_at** (string) - The timestamp when the order was created.
- **symbol** (string) - The symbol of the asset.
- **side** (string) - The side of the order ('buy' or 'sell').
- **qty** (string) - The quantity of the asset.
- **type** (string) - The type of the order.
- **order_class** (string) - The class of the order (e.g., 'simple', 'bracket').
- **legs** (array) - Present only if `nested=true` and the order is a bracket order. Contains details of the child orders (take-profit and stop-loss).
  - **id** (string) - The unique identifier for the child order.
  - **status** (string) - The status of the child order.
  - **symbol** (string) - The symbol of the asset.
  - **side** (string) - The side of the child order.
  - **qty** (string) - The quantity.
  - **filled_qty** (string) - The quantity that has been filled.
  - **type** (string) - The type of the child order.
  - **limit_price** (string) - The limit price.
  - **stop_price** (string) - The stop price.
  - **time_in_force** (string) - The time in force.

#### Response Example (with nested=true for a bracket order)
```json
[
  {
    "id": "f98e7b6b-1c3d-4a5e-8f0a-9c8d7e6f5a4b",
    "status": "accepted",
    "created_at": "2023-10-27T10:00:00Z",
    "symbol": "SPY",
    "side": "buy",
    "qty": "100",
    "type": "market",
    "order_class": "bracket",
    "legs": [
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "status": "new",
        "symbol": "SPY",
        "side": "sell",
        "qty": "100",
        "filled_qty": "0",
        "type": "limit",
        "limit_price": "301.00",
        "time_in_force": "gtc"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
        "status": "new",
        "symbol": "SPY",
        "side": "sell",
        "qty": "100",
        "filled_qty": "0",
        "type": "stop_limit",
        "stop_price": "299.00",
        "limit_price": "298.50",
        "time_in_force": "gtc"
      }
    ]
  }
]
```

### Error Handling
- **401 Unauthorized**: If the API key is invalid or missing.
- **404 Not Found**: If the requested resource does not exist.
```

--------------------------------

### Make Virtual ACH Transfer - JSON

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Initiates an incoming ACH transfer to a user's account. Requires an existing ACH relationship, account ID, and the transfer amount. The response includes details of the initiated transfer, which will later reflect as a cash deposit activity.

```json
{
  "transfer_type": "ach",
  "relationship_id": "c9b420e0-ae4e-4f39-bcbf-649b407c2129",
  "amount": "1234.567",
  "direction": "INCOMING"
}
```

--------------------------------

### Option Trade Data Schema and Example

Source: https://docs.alpaca.markets/docs/real-time-option-data

Defines the structure of a trade message received from the option data stream. It includes message type, symbol, timestamp, price, size, exchange, and trade conditions. The example demonstrates a typical trade message format.

```json
{
  "T": "t",
  "S": "AAPL240315C00172500",
  "t": "2024-03-11T13:35:35.13312256Z",
  "p": 2.84,
  "s": 1,
  "x": "N",
  "c": "S"
}
```

--------------------------------

### Get Recipient Bank Details

Source: https://docs.alpaca.markets/docs/funding-wallets

Retrieves the details of a previously created recipient bank.

```APIDOC
## GET /v1/funding/recipients/{recipient_id}

### Description
Retrieves the details of a specific recipient bank account.

### Method
GET

### Endpoint
/v1/funding/recipients/{recipient_id}

### Parameters
#### Path Parameters
- **recipient_id** (string) - Required - The unique identifier for the recipient bank.

### Response
#### Success Response (200)
- **recipient_id** (string) - The unique identifier for the recipient bank.
- **account_holder_name** (string) - The name of the account holder.
- **account_number** (string) - The bank account number.
- **routing_number** (string) - The bank routing number.
- **bank_name** (string) - The name of the bank.
- **country** (string) - The country code of the bank.

#### Response Example
```json
{
  "recipient_id": "recipient_def",
  "account_holder_name": "John Doe",
  "account_number": "987654321",
  "routing_number": "021000021",
  "bank_name": "Example Bank",
  "country": "US"
}
```
```

--------------------------------

### Get Market Data Response in Local Currency (JPY) - JSON

Source: https://docs.alpaca.markets/docs/local-currency-trading-lct

This is an example JSON response from the Alpaca Data API when requesting market data in a local currency (JPY). It shows the structure of the returned data, including OHLCV (Open, High, Low, Close, Volume) prices, timestamps, and the 'currency' field indicating the response is in JPY. Compare this to a USD equivalent by omitting the 'currency' parameter in the request.

```json
{
    "bars": [
        {
            "c": 33481.21,
            "h": 33536.65,
            "l": 33476.71,
            "n": 129,
            "o": 33536.65,
            "t": "2024-08-01T08:00:00Z",
            "v": 2750,
            "vw": 33519.41
        },
        ...
    ],
    "currency": "JPY",
    "next_page_token": "QUFQTHxNfDE3MjI1OTg1NjAwMDAwMDAwMDA=",
    "symbol": "AAPL"
}
```

--------------------------------

### Options Position Example

Source: https://docs.alpaca.markets/docs/options-trading-overview

This JSON object represents an options position as displayed in the positions endpoint. It includes details like asset ID, symbol, asset class, quantity, average entry price, market value, and profit/loss.

```json
{
  "asset_id": "fe4f43e5-60a4-4269-ba4c-3d304444d58b",
  "symbol": "PTON240126C00000500",
  "exchange": "",
  "asset_class": "us_option",
  "asset_marginable": true,
  "qty": "2",
  "avg_entry_price": "6.05",
  "side": "long",
  "market_value": "1068",
  "cost_basis": "1210",
  "unrealized_pl": "-142",
  "unrealized_plpc": "-0.1173553719008264",
  "unrealized_intraday_pl": "-142",
  "unrealized_intraday_plpc": "-0.1173553719008264",
  "current_price": "5.34",
  "lastday_price": "5.34",
  "change_today": "0",
  "qty_available": "2"
}
```

--------------------------------

### GET /v1/trading/accounts/{ACCOUNT_ID}/account

Source: https://docs.alpaca.markets/docs/instant-funding

Fetches the user's trading account details, including their current buying power, after an instant funding transfer has been executed.

```APIDOC
## GET /v1/trading/accounts/{ACCOUNT_ID}/account

### Description
Retrieves detailed information about a specific trading account, including current balances, buying power, and account status. This is useful for displaying the user's available funds after an instant funding transfer.

### Method
GET

### Endpoint
`/v1/trading/accounts/{ACCOUNT_ID}/account`

### Parameters
#### Path Parameters
- **ACCOUNT_ID** (string) - Required - The unique identifier of the trading account.

### Request Example
```bash
GET /v1/trading/accounts/fc304c4d-5c2c-41f2-b357-99bbbed9ec90/account
```

### Response
#### Success Response (200)
- **id** (string) - The account ID.
- **admin_configurations** (object) - Administrative settings for the account.
- **user_configurations** (object) - User-specific settings for the account.
- **account_number** (string) - The account number.
- **status** (string) - The current status of the account (e.g., ACTIVE).
- **crypto_status** (string) - The status of cryptocurrency trading for the account.
- **currency** (string) - The currency of the account (e.g., USD).
- **buying_power** (string) - The current available buying power.
- **regt_buying_power** (string) - Regulation T buying power.
- **daytrading_buying_power** (string) - Day trading buying power.
- **effective_buying_power** (string) - Effective buying power.
- **non_marginable_buying_power** (string) - Non-marginable buying power.
- **bod_dtbp** (string) - Beginning of day day trading buying power.
- **cash** (string) - The current cash balance.
- **cash_withdrawable** (string) - The amount of cash that can be withdrawn.
- **cash_transferable** (string) - The amount of cash that can be transferred.
- **accrued_fees** (string) - Accrued fees.
- **pending_transfer_out** (string) - Pending outgoing transfers.
- **pending_transfer_in** (string) - Pending incoming transfers.
- **portfolio_value** (string) - The total value of the portfolio.
- **pattern_day_trader** (boolean) - Indicates if the account is a pattern day trader.
- **trading_blocked** (boolean) - Indicates if trading is blocked for the account.
- **transfers_blocked** (boolean) - Indicates if transfers are blocked for the account.
- **account_blocked** (boolean) - Indicates if the account is blocked.
- **created_at** (string) - The timestamp when the account was created.
- **trade_suspended_by_user** (boolean) - Indicates if trading is suspended by the user.
- **multiplier** (string) - The margin multiplier.
- **shorting_enabled** (boolean) - Indicates if shorting is enabled.
- **equity** (string) - The account equity.
- **last_equity** (string) - The last recorded equity.
- **long_market_value** (string) - The market value of long positions.
- **short_market_value** (string) - The market value of short positions.
- **position_market_value** (string) - The market value of all positions.
- **initial_margin** (string) - The initial margin requirement.
- **maintenance_margin** (string) - The maintenance margin requirement.
- **last_maintenance_margin** (string) - The last recorded maintenance margin.
- **sma** (string) - Special Memorandum Account balance.
- **daytrade_count** (integer) - The number of day trades made.
- **balance_asof** (string) - The date the balance information is as of.
- **previous_close** (string) - The previous day's closing price.
- **last_long_market_value** (string) - The last recorded long market value.
- **last_short_market_value** (string) - The last recorded short market value.
- **last_cash** (string) - The last recorded cash balance.
- **last_initial_margin** (string) - The last recorded initial margin.
- **last_regt_buying_power** (string) - The last recorded Regulation T buying power.
- **last_daytrading_buying_power** (string) - The last recorded day trading buying power.
- **last_buying_power** (string) - The last recorded buying power.
- **last_daytrade_count** (integer) - The last recorded day trade count.
- **clearing_broker** (string) - The clearing broker.
- **memoposts** (string) - Memo posts.
- **intraday_adjustments** (string) - Intraday adjustments.
- **pending_reg_taf_fees** (string) - Pending regulatory transaction fees.

#### Response Example
```json
{
    "id": "{ACCOUNT_ID}",
    "admin_configurations": {
        "allow_instant_ach": true,
        "disable_shorting": true,
        "max_margin_multiplier": "1"
    },
    "user_configurations": null,
    "account_number": "{ACCOUNT_NO}",
    "status": "ACTIVE",
    "crypto_status": "INACTIVE",
    "currency": "USD",
    "buying_power": "100",
    "regt_buying_power": "100",
    "daytrading_buying_power": "0",
    "effective_buying_power": "100",
    "non_marginable_buying_power": "0",
    "bod_dtbp": "0",
    "cash": "100",
    "cash_withdrawable": "0",
    "cash_transferable": "0",
    "accrued_fees": "0",
    "pending_transfer_out": "0",
    "pending_transfer_in": "0",
    "portfolio_value": "0",
    "pattern_day_trader": false,
    "trading_blocked": false,
    "transfers_blocked": false,
    "account_blocked": false,
    "created_at": "2024-07-10T17:23:51.655324Z",
    "trade_suspended_by_user": false,
    "multiplier": "1",
    "shorting_enabled": false,
    "equity": "0",
    "last_equity": "0",
    "long_market_value": "0",
    "short_market_value": "0",
    "position_market_value": "0",
    "initial_margin": "0",
    "maintenance_margin": "0",
    "last_maintenance_margin": "0",
    "sma": "0",
    "daytrade_count": 0,
    "balance_asof": "2024-07-09",
    "previous_close": "2024-07-09T20:00:00-04:00",
    "last_long_market_value": "0",
    "last_short_market_value": "0",
    "last_cash": "0",
    "last_initial_margin": "0",
    "last_regt_buying_power": "0",
    "last_daytrading_buying_power": "0",
    "last_buying_power": "0",
    "last_daytrade_count": 0,
    "clearing_broker": "ALPACA_APCA",
    "memoposts": "100",
    "intraday_adjustments": "0",
    "pending_reg_taf_fees": "0"
}
```
```

--------------------------------

### Quote Data Schema and Example

Source: https://docs.alpaca.markets/docs/real-time-stock-pricing-data

Defines the structure for quote messages, including message type, symbol, bid/ask exchange codes, prices, sizes, quote conditions, and timestamps. The example shows a typical quote object for the symbol 'AMD'.

```JSON
{
  "T": "q",
  "S": "AMD",
  "bx": "U",
  "bp": 87.66,
  "bs": 1,
  "ax": "Q",
  "ap": 87.68,
  "as": 4,
  "t": "2021-02-22T15:51:45.335689322Z",
  "c": ["R"],
  "z": "C"
}
```

--------------------------------

### Get Portfolio Positions - Python

Source: https://docs.alpaca.markets/docs/working-with-positions

Retrieves all open positions in a user's Alpaca trading portfolio using the Python SDK. It iterates through the positions and prints the quantity and symbol for each. Requires the 'alpaca-trading-sdk' package.

```python
from alpaca.trading.client import TradingClient

trading_client = TradingClient('api-key', 'secret-key')

# Get our position in AAPL.
aapl_position = trading_client.get_open_position('AAPL')

# Get a list of all of our positions.
portfolio = trading_client.get_all_positions()

# Print the quantity of shares for each position.
for position in portfolio:
    print("{} shares of {}".format(position.qty, position.symbol))
```

--------------------------------

### Bar Data Schema and Example

Source: https://docs.alpaca.markets/docs/real-time-stock-pricing-data

Details the schema for bar data, which includes minute, daily, and updated bars. It outlines attributes such as message type, symbol, open, high, low, close prices, volume, number of trades, and timestamps. The example illustrates a minute bar for the symbol 'SPY'.

```JSON
{
  "T": "b",
  "S": "SPY",
  "o": 388.985,
  "h": 389.13,
  "l": 388.975,
  "c": 389.12,
  "v": 49378,
  "n": 461,
  "vw": 389.062639,
  "t": "2021-02-22T19:15:00Z"
}
```

--------------------------------

### Instant Funding API - Create a New Settlement

Source: https://docs.alpaca.markets/docs/funding-accounts

This endpoint allows for the creation of a new settlement within the instant funding process. Transmitter information should be included here for Travel Rule compliance.

```APIDOC
## POST /v1/instant_funding/settlements

### Description
Creates a new settlement for an instant funding request. Transmitter information is required for Travel Rule compliance.

### Method
POST

### Endpoint
/v1/instant_funding/settlements

### Parameters
#### Request Body
- **request_id** (string) - Required - The ID of the associated instant funding request.
- **originator_full_name** (string) - Required - The full name of the customer initiating the transaction.
- **originator_bank_account_number** (string) - Required - The bank account number of the customer or a unique identifier on the broker partner's system.
- **originator_street_address** (string) - Required - The street address of the financial institution transmitting the funds.
- **originator_city** (string) - Required - The city of the financial institution transmitting the funds.
- **originator_state** (string) - Required - The state of the financial institution transmitting the funds.
- **originator_country** (string) - Required - The country of the financial institution transmitting the funds.
- **originator_bank_name** (string) - Required - The name of the transmitter's financial institution.
- **other_identifying_information** (string) - Optional - Recommended to be the originating bank's reference number for the transfer.

### Request Example
```json
{
  "request_id": "irf987xyz",
  "originator_full_name": "Jane Smith",
  "originator_bank_account_number": "987654321",
  "originator_street_address": "456 Oak Ave",
  "originator_city": "Somecity",
  "originator_state": "NY",
  "originator_country": "USA",
  "originator_bank_name": "Global Bank",
  "other_identifying_information": "REF12345"
}
```

### Response
#### Success Response (200)
- **settlement_id** (string) - The unique identifier for the settlement.
- **status** (string) - The status of the settlement.

#### Response Example
```json
{
  "settlement_id": "s456uvw",
  "status": "completed"
}
```
```

--------------------------------

### Create Portfolio Response

Source: https://docs.alpaca.markets/docs/portfolio-rebalancing

Example JSON response after successfully creating a portfolio. It includes the unique portfolio ID, name, description, status, creation timestamps, and the defined weights and rebalancing conditions.

```json
{
    "id": "2d49d00e-ab1c-4014-89d8-70c5f64df2fc",
    "name": "Balanced Two",
    "description": "A balanced portfolio of stocks and bonds",
    "status": "active",
    "cooldown_days": 7,
    "created_at": "2022-08-07T14:56:45.116867815-04:00",
    "updated_at": "2022-08-07T14:56:45.196857944-04:00",
    "weights": [
        {
            "type": "cash",
            "symbol": null,
            "percent": "5"
        },
        {
            "type": "asset",
            "symbol": "SPY",
            "percent": "60"
        },
        {
            "type": "asset",
            "symbol": "TLT",
            "percent": "35"
        }
    ],
    "rebalance_conditions": [
        {
            "type": "drift_band",
            "sub_type": "absolute",
            "percent": "5",
            "day": null
        },
        {
            "type": "drift_band",
            "sub_type": "relative",
            "percent": "20",
            "day": null
        }
    ]
}
```

--------------------------------

### Create Bracket, OTO, and OCO Orders (JavaScript)

Source: https://docs.alpaca.markets/docs/working-with-orders

Demonstrates creating bracket, OTO (One-Triggers-Other), and OCO (One-Cancels-Other) limit orders using the Alpaca Trade API for JavaScript. It includes setting stop-loss and take-profit prices relative to the limit price.

```javascript
const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca();

const symbol = "AAPL";
alpaca
  .getBars("minute", symbol, {
    limit: 5,
  })
  .then((barset) => {
    const currentPrice = barset[symbol].slice(-1)[0].closePrice;

    // We could buy a position and add a stop-loss and a take-profit of 5 %
    alpaca.createOrder({
      symbol: symbol,
      qty: 1,
      side: "buy",
      type: "limit",
      time_in_force: "gtc",
      limit_price: currentPrice,
      order_class: "bracket",
      stop_loss: {
        stop_price: currentPrice * 0.95,
        limit_price: currentPrice * 0.94,
      },
      take_profit: {
        limit_price: currentPrice * 1.05,
      },
    });

    // We could buy a position and just add a stop loss of 5 % (OTO Orders)
    alpaca.createOrder({
      symbol: symbol,
      qty: 1,
      side: "buy",
      type: "limit",
      time_in_force: "gtc",
      limit_price: currentPrice,
      order_class: "oto",
      stop_loss: {
        stop_price: currentPrice * 0.95,
      },
    });

    // We could split it to 2 orders. first buy a stock,
    // and then add the stop/profit prices (OCO Orders)
    alpaca.createOrder({
      symbol: symbol,
      qty: 1,
      side: "buy",
      type: "limit",
      time_in_force: "gtc",
      limit_price: currentPrice,
    });

    // wait for it to buy position and then
    alpaca.createOrder({
      symbol: symbol,
      qty: 1,
      side: "sell",
      type: "limit",
      time_in_force: "gtc",
      limit_price: currentPrice,
      order_class: "oco",
      stop_loss: {
        stop_price: currentPrice * 0.95,
      },
      take_profit: {
        limit_price: currentPrice * 1.05,
      },
    });
  });
```

--------------------------------

### POST /v2/orders - Long Call Spread Example

Source: https://docs.alpaca.markets/docs/options-level-3-trading

An example of submitting a Long Call Spread using the multi-leg order functionality. This involves buying a lower-strike call and selling a higher-strike call on the same underlying asset.

```APIDOC
## POST /v2/orders - Long Call Spread

### Description
Demonstrates how to submit a 'Long Call Spread' order. This strategy involves buying a call option at a lower strike price and simultaneously selling a call option at a higher strike price, both with the same expiration date and underlying asset.

### Method
POST

### Endpoint
/v2/orders

### Parameters
#### Query Parameters
None

#### Request Body
- **order_class** (string) - Required - Must be set to "mleg".
- **qty** (string) - Required - Set to "1" for this example.
- **type** (string) - Required - Set to "limit" for this example.
- **limit_price** (string) - Required - The limit price for the spread.
- **time_in_force** (string) - Required - Set to "day" for this example.
- **legs** (array) - Required - Contains two leg objects for the spread.
  - **leg 1**:
    - **symbol** (string) - Required - Symbol for the lower-strike call option.
    - **ratio_qty** (string) - Required - Set to "1".
    - **side** (string) - Required - Set to "buy".
    - **position_intent** (string) - Required - Set to "buy_to_open".
  - **leg 2**:
    - **symbol** (string) - Required - Symbol for the higher-strike call option.
    - **ratio_qty** (string) - Required - Set to "1".
    - **side** (string) - Required - Set to "sell".
    - **position_intent** (string) - Required - Set to "sell_to_open".

### Request Example
```json
{
  "order_class": "mleg",
  "qty": "1",
  "type": "limit",
  "limit_price": "1.00",
  "time_in_force": "day",
  "legs": [
    {
      "symbol": "AAPL250117C00190000",
      "ratio_qty": "1",
      "side": "buy",
      "position_intent": "buy_to_open"
    },
    {
      "symbol": "AAPL250117C00210000",
      "ratio_qty": "1",
      "side": "sell",
      "position_intent": "sell_to_open"
    }
  ]
}
```

### Response
#### Success Response (200)
Returns the details of the submitted Long Call Spread order.

#### Response Example
(Response structure will vary based on Alpaca API response for order creation)
```

--------------------------------

### Get Options Contracts

Source: https://docs.alpaca.markets/docs/options-trading-overview

Retrieves a list of all options contracts for a given underlying symbol. This is similar to the asset master for securities and crypto.

```APIDOC
## Get Options Contracts

### Description
This endpoint returns all the options contracts available for a specified underlying symbol. It functions similarly to the asset master for securities and crypto.

### Endpoint
`GET /v1.1/reference/get-options-contracts-1`

### Response Example
```json
{
  "id": "1fb904df-961a-4a07-a924-53a437626db2",
  "symbol": "AAPL240223C00095000",
  "name": "AAPL Feb 23 2024 95 Call",
  "status": "active",
  "tradable": true,
  "expiration_date": "2024-02-23",
  "root_symbol": "AAPL",
  "underlying_symbol": "AAPL",
  "underlying_asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
  "type": "call",
  "style": "american",
  "strike_price": "95",
  "size": "100",
  "open_interest": "12",
  "open_interest_date": "2024-02-22",
  "close_price": "89.35",
  "close_price_date": "2024-02-22"
 }
```
```

--------------------------------

### Submit Bracket Order JSON Payload

Source: https://docs.alpaca.markets/docs/orders-at-alpaca

Example JSON payload for submitting a bracket order to the Alpaca API. This structure defines the entry order (buy market order in this case) and the associated take-profit and stop-loss exit orders.

```json
{
  "side": "buy",
  "symbol": "SPY",
  "type": "market",
  "qty": "100",
  "time_in_force": "gtc",
  "order_class": "bracket",
  "take_profit": {
    "limit_price": "301"
  },
  "stop_loss": {
    "stop_price": "299",
    "limit_price": "298.5"
  }
}
```

--------------------------------

### Get Supported Assets

Source: https://docs.alpaca.markets/docs/crypto-trading-1

Retrieve a list of supported tradable assets. Tradable cryptocurrencies can be identified by `class = crypto` and `tradable = true`.

```APIDOC
## GET /v1/assets

### Description
Retrieves a list of available assets, including cryptocurrencies, and their trading status.

### Method
GET

### Endpoint
/v1/assets

### Parameters
#### Query Parameters
- **class** (string) - Optional - Filter assets by class (e.g., `crypto`).
- **tradable** (boolean) - Optional - Filter for tradable assets.

### Response
#### Success Response (200)
- **id** (string) - The asset ID.
- **class** (string) - The asset class (e.g., `crypto`).
- **exchange** (string) - The exchange the asset is traded on.
- **symbol** (string) - The trading symbol (e.g., `BTC/USD`).
- **name** (string) - The name of the asset (e.g., `Bitcoin`).
- **status** (string) - The status of the asset (e.g., `active`).
- **tradable** (boolean) - Whether the asset is currently tradable.
- **marginable** (boolean) - Whether the asset is marginable.
- **shortable** (boolean) - Whether the asset is shortable.
- **easy_to_borrow** (boolean) - Whether the asset is easy to borrow.
- **fractionable** (boolean) - Whether the asset is fractionable.

#### Response Example
```json
{
  "id": "64bbff51-59d6-4b3c-9351-13ad85e3c752",
  "class": "crypto",
  "exchange": "CRXL",
  "symbol": "BTC/USD",
  "name": "Bitcoin",
  "status": "active",
  "tradable": true,
  "marginable": false,
  "shortable": false,
  "easy_to_borrow": false,
  "fractionable": true
}
```
```

--------------------------------

### Representing Rights Exercise and Allocation in JSON (VOF)

Source: https://docs.alpaca.markets/docs/voluntary-corporate-actions

This snippet demonstrates the JSON format for 'VOF' (Volume Offset) entries related to rights offers. It covers removing underlying securities, allocating contra securities, removing contra securities, and allocating new shares, including quantities, symbols, and descriptions.

```json
{
  "id": "47007871-2f92-4adf-b7dc-efc6b1550fe7",
  "qty": -2500,
  "price": null,
  "status": "executed",
  "symbol": "067RGT019",
  "entry_type": "VOF",
  "net_amount": 0,
  "description": "Rights Exercise (symbol BNED; expiration 06/05/24)",
  "settle_date": "2024-06-05",
  "system_date": "2024-06-05",
  "per_share_amount": null
}
```

```json
{
  "id": "01233557-9f6b-403f-8832-6b70f057d85c",
  "qty": 2500,
  "price": null,
  "status": "executed",
  "symbol": "067BAS012",
  "entry_type": "VOF",
  "net_amount": 0,
  "description": "Rights Exercise (symbol BNED; expiration 06/05/24)",
  "settle_date": "2024-06-05",
  "system_date": "2024-06-05",
  "per_share_amount": null
}
```

```json
{
  "id": "42830cc1-2dfb-4d6f-959b-463c148774ac",
  "qty": -2500,
  "price": null,
  "status": "executed",
  "symbol": "067BAS012",
  "entry_type": "VOF",
  "net_amount": 0,
  "description": "Rights Payment (symbol BNED; expiration 06/05/24)",
  "settle_date": "2024-06-11",
  "system_date": "2024-06-11",
  "per_share_amount": null
}
```

```json
{
  "id": "43eb77dd-1b8c-4b3d-81b1-647a00436aa3",
  "qty": 42500,
  "price": 0.09,
  "status": "executed",
  "symbol": "BNED",
  "entry_type": "VOF",
  "net_amount": 0,
  "description": "Rights Payment (symbol BNED; expiration 06/05/24)",
  "settle_date": "2024-06-11",
  "system_date": "2024-06-11",
  "per_share_amount": null
}
```

--------------------------------

### Bars Data Structure Example (JSON)

Source: https://docs.alpaca.markets/docs/real-time-crypto-pricing-data

An example JSON payload representing a bar data point. This includes message type, symbol, open, high, low, close prices, volume, and timestamp. Quote mid-prices are included for crypto bars.

```json
{
  "T": "b",
  "S": "BTC/USD",
  "o": 71856.1435,
  "h": 71856.1435,
  "l": 71856.1435,
  "c": 71856.1435,
  "v": 0,
  "t": "2024-03-12T10:37:00Z",
  "n": 0,
  "vw": 0
}
```

--------------------------------

### Get Portfolio Positions - JavaScript

Source: https://docs.alpaca.markets/docs/working-with-positions

Fetches all open positions within an Alpaca trading account using the JavaScript SDK. It then logs the quantity and symbol of each position to the console. Requires the '@alpacahq/alpaca-trade-api' package.

```javascript
const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca();

// Get our position in AAPL.
aaplPosition = alpaca.getPosition("AAPL");

// Get a list of all of our positions.
alpaca.getPositions().then((portfolio) => {
  // Print the quantity of shares for each position.
  portfolio.forEach(function (position) {
    console.log(`${position.qty} shares of ${position.symbol}`);
  });
});
```

--------------------------------

### Strict FIFO Cost Basis Calculation Example

Source: https://docs.alpaca.markets/docs/trading-api-faqs

Illustrates the calculation of cost basis and average entry price using the Strict FIFO method. This method assumes the first shares bought are the first shares sold, deducting costs sequentially.

```pseudocode
# Day 1:
# Buy 100 shares at $10 per share (Cost basis = $1,000)
# Buy 50 shares at $12 per share (Cost basis = $600)
# Day 2:
# Buy 30 shares at $15 per share (Cost basis = $450)
# Day 3:
# Sell 120 shares
# Total initial cost basis = 1000 + 600 + 450 = 2050
# Cost basis after sell: 2050 - 100*10 - 20*12 = $810
# Average Entry Price: cost_basis/qty_left = 810 / (180 - 120) = 810 / 60 = $13.5
```

--------------------------------

### Receive Journal Update Events - SSE

Source: https://docs.alpaca.markets/docs/getting-started-with-broker-api

Listens to real-time Server-Sent Events (SSE) for journal updates. This stream provides information about the lifecycle of a journal entry, including status changes from queued to executed.

```text
data: {"at":"2021-05-07T10:28:23.163857Z","entry_type":"JNLC","event_id":1406,"journal_id":"2f144d2a-91e6-46ff-8e37-959a701cc58d","status_from":"","status_to":"queued"}

data: {"at":"2021-05-07T10:28:23.468461Z","entry_type":"JNLC","event_id":1407,"journal_id":"2f144d2a-91e6-46ff-8e37-959a701cc58d","status_from":"queued","status_to":"pending"}

data: {"at":"2021-05-07T10:28:23.522047Z","entry_type":"JNLC","event_id":1408,"journal_id":"2f144d2a-91e6-46ff-8e37-959a701cc58d","status_from":"pending","status_to":"executed"}
```

--------------------------------

### Logon (A)

Source: https://docs.alpaca.markets/docs/fix-messages

Initiates a FIX session by exchanging logon messages. This message contains session and security information.

```APIDOC
## Logon (A)

### Description
Initiates a FIX session by exchanging logon messages. This message contains session and security information.

### Method
POST (Implied, as FIX is a stateful protocol initiated with a message)

### Endpoint
N/A (FIX Protocol)

### Parameters
#### Header Fields
- **8** (STRING) - Required - BeginString: FIX version identifier.
- **9** (LENGTH) - Required - BodyLength: Length of the message body.
- **35** (CHAR) - Required - MsgType: Indicates the message type. 'A' for Logon.
- **49** (STRING) - Required - SenderCompID: Identifier for the sending application.
- **56** (STRING) - Required - TargetCompID: Identifier for the receiving application.
- **34** (INT) - Required - MsgSeqNum: Sequence number of the message.
- **52** (DATETIME) - Required - SendingTime: Timestamp of when the message was sent.

#### Body Fields
- **98** (INT) - Required - EncryptMethod: Encryption method used. '0' for None.
- **108** (INT) - Required - HeartBtInt: Heartbeat interval in seconds. Must be set to `30`.
- **141** (BOOLEAN) - Optional - ResetSeqNumFlag: 'Y' to reset sequence numbers.

#### Trailer Fields
- **10** (STRING) - Required - Checksum: Validates the message integrity.

### Request Example
```text
|8=FIX.4.2|9=73|35=A|34=1|49=SENDER|52=20240524-16:02:42.003|56=ALPACA|98=0|108=30|141=Y|10=131|
```

### Response
#### Success Response (Logon Acknowledgment)
- **35** (CHAR) - Indicates the message type 'A' (Logon) for acknowledgment.

#### Response Example
(Similar structure to request, indicating successful logon)

```

--------------------------------

### Order Imbalance Message Example JSON

Source: https://docs.alpaca.markets/docs/real-time-stock-pricing-data

An example of an order imbalance message received from Alpaca Markets. This message includes the type ('T'), symbol ('S'), price ('p'), tape ('z'), and a precise timestamp ('t') in RFC-3339 format with nanosecond precision. This data is crucial for understanding market activity during trading halts.

```json
{
  "T": "i",
  "S": "INAQU",
  "p": 9.12,
  "z": "C",
  "t": "2024-12-13T19:58:09.242138635Z"
}
```

--------------------------------

### Create Funding Wallet

Source: https://docs.alpaca.markets/docs/funding-wallets

Creates a dedicated funding wallet with a distinct account number for each user to deposit funds into.

```APIDOC
## POST /v1/funding/wallets

### Description
Creates a new funding wallet for a user.

### Method
POST

### Endpoint
/v1/funding/wallets

### Parameters
#### Query Parameters
- **user_id** (string) - Required - The unique identifier for the user.

### Request Example
```json
{
  "user_id": "user123"
}
```

### Response
#### Success Response (201)
- **wallet_id** (string) - The unique identifier for the created funding wallet.
- **account_number** (string) - The account number for the funding wallet.

#### Response Example
```json
{
  "wallet_id": "wallet_abc",
  "account_number": "123456789"
}
```
```

--------------------------------

### Sample NTA JSON for Contra Security Allocation (VOF)

Source: https://docs.alpaca.markets/docs/voluntary-corporate-actions

This JSON object illustrates a 'VOF' NTA entry for allocating a contra security (e.g., 611NSP014) during a voluntary corporate action. It shows the quantity, symbol, and relevant dates for the allocation.

```JSON
{
  "id": "221e1a62-5e43-4288-b320-0921c6bc56cb",
  "qty": 97,
  "price": null,
  "status": "executed",
  "symbol": "611NSP014",
  "entry_type": "VOF",
  "net_amount": 0,
  "description": "Monster Beverage voluntary submission (expiration 06/05/24)",
  "settle_date": "2024-06-05",
  "system_date": "2024-06-05",
  "per_share_amount": null
}
```

--------------------------------

### Sample Whitelisted Address Response (JSON)

Source: https://docs.alpaca.markets/docs/crypto-wallets-api

This JSON array represents the response after attempting to whitelist a cryptocurrency address. It confirms the details of the whitelisted address, including its unique ID, chain, asset, and current status (e.g., PENDING, APPROVED).

```json
[
    {
        "id": "45efdedd-28cd-4665-98b4-601d5f34ae0a",
        "chain": "ETH",
        "asset": "USDC",
        "address": "0xf38Ecf5764fD2dEcB0dd9C1E7513a0b6eC0dD08a",
        "created_at": "2025-08-07T13:16:46.49111Z",
        "status": "PENDING"
    }
]
```

--------------------------------

### Subscribe to Real-time Crypto Order Book Data (WebSockets)

Source: https://docs.alpaca.markets/docs/crypto-trading

This example shows how to subscribe to real-time crypto data, specifically order book updates, using Alpaca's WebSocket API. It involves connecting to the WebSocket stream, authenticating with API keys, and subscribing to specific trading pairs. The output consists of continuous JSON messages containing quote data for the subscribed symbols.

```json
$ wscat -c wss://stream.data.alpaca.markets/v1beta3/crypto/us
Connected (press CTRL+C to quit)
< [{\"T\":\"success\",\"msg\":\"connected\"}]
> {\"action\":\"auth\",\"key\":\"<YOUR API KEY>\",\"secret\":\"<YOUR API SECRET>\"}
< [{\"T\":\"success\",\"msg\":\"authenticated\"}]
> {\"action\":\"subscribe\",\"quotes\":[\"ETH/USD\"], "orderbooks": ["BTC/USD"]}
< [{\"T\":\"subscription\",\"trades\":[],\"quotes\":[\"ETH/USD\"],\"orderbooks\":[\"BTC/USD\"],\"bars\":[],\"updatedBars\":[],\"dailyBars\":[]}]
< [{\"T\":\"q\",\"S\":\"ETH/USD\",\"bp\":3445.34,\"bs\":4.339,\"ap\":3450.2,\"as\":4.3803,\"t\":\"2024-07-24T07:38:06.88490478Z\"}]
< [{\"T\":\"q\",\"S\":\"ETH/USD\",\"bp\":3445.34,\"bs\":4.339,\"ap\":3451.1,\"as\":8.73823,\"t\":\"2024-07-24T07:38:06.88493591Z\"}]
< [{\"T\":\"q\",\"S\":\"ETH/USD\",\"bp\":3445.34,\"bs\":4.339,\"ap\":3447.03,\"as\":4.36424,\"t\":\"2024-07-24T07:38:06.88511154Z\"}]
< [{\"T\":\"q\",\"S\":\"ETH/USD\",\"bp\":3444.644,\"bs\":8.797,\"ap\":3447.03,\"as\":4.36424,\"t\":\"2024-07-24T07:38:06.88512141Z\"}]
< [{\"T\":\"q\",\"S\":\"ETH/USD\",\"bp\":3444.51,\"bs\":4.33,\"ap\":3447.03,\"as\":4.36424,\"t\":\"2024-07-24T07:38:06.88516355Z\"}]
```

--------------------------------

### Order Placement and Management

Source: https://docs.alpaca.markets/docs/orders-at-alpaca

This section details how to place, monitor, and cancel orders using the Alpaca Trading API. Each order requires a unique client-provided identifier, or one will be automatically generated. Order status can be queried using these IDs.

```APIDOC
## POST /v1/orders

### Description
Places a new order. If a client-side order ID is not provided, the system will generate one.

### Method
POST

### Endpoint
/v1/orders

### Parameters
#### Request Body
- **symbol** (string) - Required - The symbol of the asset to trade.
- **qty** (integer) - Required - The quantity of shares to trade.
- **side** (string) - Required - The side of the order ('buy' or 'sell').
- **type** (string) - Required - The type of order ('market', 'limit', 'stop', 'stop_limit').
- **time_in_force** (string) - Required - The time in force for the order ('day', 'gtc', 'opg', 'cls', 'ioc', 'fok').
- **limit_price** (number) - Optional - The limit price for limit or stop-limit orders.
- **stop_price** (number) - Optional - The stop price for stop or stop-limit orders.
- **client_order_id** (string) - Optional - A unique identifier for the order provided by the client.

### Request Example
```json
{
  "symbol": "AAPL",
  "qty": 10,
  "side": "buy",
  "type": "limit",
  "time_in_force": "gtc",
  "limit_price": "170.00"
}
```

### Response
#### Success Response (200)
- **id** (string) - The system-assigned unique order ID.
- **client_order_id** (string) - The client-provided order ID, if available.
- **created_at** (string) - The timestamp when the order was created.
- **status** (string) - The current status of the order.
- **symbol** (string) - The symbol of the asset.
- **qty** (integer) - The quantity of shares.
- **side** (string) - The side of the order.
- **type** (string) - The type of order.
- **time_in_force** (string) - The time in force.
- **limit_price** (number) - The limit price.
- **stop_price** (number) - The stop price.

#### Response Example
```json
{
  "id": "f7589174-705c-4191-a277-122273227419",
  "client_order_id": "my-custom-order-id-123",
  "created_at": "2023-10-27T10:00:00Z",
  "status": "new",
  "symbol": "AAPL",
  "qty": 10,
  "side": "buy",
  "type": "limit",
  "time_in_force": "gtc",
  "limit_price": 170.00,
  "stop_price": null
}
```

## GET /v1/orders/{order_id}

### Description
Retrieves the status of a specific order using its client-provided or system-assigned ID.

### Method
GET

### Endpoint
/v1/orders/{order_id}

### Parameters
#### Path Parameters
- **order_id** (string) - Required - The ID of the order to retrieve.

### Response
#### Success Response (200)
- **id** (string) - The system-assigned unique order ID.
- **client_order_id** (string) - The client-provided order ID, if available.
- **created_at** (string) - The timestamp when the order was created.
- **status** (string) - The current status of the order.
- **symbol** (string) - The symbol of the asset.
- **qty** (integer) - The quantity of shares.
- **side** (string) - The side of the order.
- **type** (string) - The type of order.
- **time_in_force** (string) - The time in force.
- **limit_price** (number) - The limit price.
- **stop_price** (number) - The stop price.

#### Response Example
```json
{
  "id": "f7589174-705c-4191-a277-122273227419",
  "client_order_id": "my-custom-order-id-123",
  "created_at": "2023-10-27T10:00:00Z",
  "status": "filled",
  "symbol": "AAPL",
  "qty": 10,
  "side": "buy",
  "type": "limit",
  "time_in_force": "gtc",
  "limit_price": 170.00,
  "stop_price": null
}
```
```

--------------------------------

### Legacy Authentication (Trading API Example)

Source: https://docs.alpaca.markets/docs/authentication

This section describes the older authentication method for Trading API users, which involves using API key ID and secret key directly via headers.

```APIDOC
## GET /v2/account

### Description
Retrieves account information using legacy API key ID and secret key authentication.

### Method
GET

### Endpoint
`https://api.alpaca.markets/v2/account`

### Parameters
#### Headers
- `APCA-API-KEY-ID` (string) - Required - Your Alpaca API Key ID.
- `APCA-API-SECRET-KEY` (string) - Required - Your Alpaca API Secret Key.

### Request Example
```curl
curl -X GET "https://api.alpaca.markets/v2/account" \
     -H "APCA-API-KEY-ID: {YOUR_API_KEY_ID}" \
     -H "APCA-API-SECRET-KEY: {YOUR_API_SECRET_KEY}"
```
```

--------------------------------

### POST /oauth/token

Source: https://docs.alpaca.markets/docs/using-oauth2-and-trading-api

Exchanges an authorization code for an access token. This request should be made from your backend server.

```APIDOC
## POST /oauth/token

### Description
Exchanges a temporary authorization code for an access token, which is required to make authenticated requests to the Alpaca API.

### Method
POST

### Endpoint
https://api.alpaca.markets/oauth/token

### Parameters
#### Query Parameters
- **grant_type** (string) - Required - Must be set to `authorization_code`.
- **code** (string) - Required - The authorization code received from the previous step.
- **client_id** (string) - Required - Your application's Client ID.
- **client_secret** (string) - Required - Your application's Client Secret.
- **redirect_uri** (string) - Required - The redirect URI used for the authorization code request.

### Request Body
This endpoint expects `application/x-www-form-urlencoded` content type.

```
application/x-www-form-urlencoded
{
  "grant_type": "authorization_code",
  "code": "<AUTHORIZATION_CODE>",
  "client_id": "<YOUR_CLIENT_ID>",
  "client_secret": "<YOUR_CLIENT_SECRET>",
  "redirect_uri": "<YOUR_REDIRECT_URI>"
}
```

### Request Example
```curl
curl -X POST https://api.alpaca.markets/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'grant_type=authorization_code&code=67f74f5a-a2cc-4ebd-88b4-22453fe07994&client_id=fc9c55efa3924f369d6c1148e668bbe8&client_secret=5b8027074d8ab434882c0806833e76508861c366&redirect_uri=https://example.com/oauth/callback'
```

### Response
#### Success Response (200)
- **access_token** (string) - The obtained access token.
- **token_type** (string) - The type of token, usually "bearer".
- **scope** (string) - The scope granted by the token.

#### Response Example
```json
{
    "access_token": "79500537-5796-4230-9661-7f7108877c60",
    "token_type": "bearer",
    "scope": "account:write trading"
}
```
```

--------------------------------

### Get a List of Assets

Source: https://docs.alpaca.markets/docs/working-with-assets

Retrieve a list of all assets available on Alpaca. This endpoint can be used to fetch US equities and other asset classes.

```APIDOC
## GET /v2/assets

### Description
Retrieves a list of US equities available on Alpaca.

### Method
GET

### Endpoint
/v2/assets

### Query Parameters
- **asset_class** (string) - Optional - Specifies the class of assets to retrieve (e.g., `us_equity`, `crypto`).
- **status** (string) - Optional - Filters assets by their status (e.g., `active`, `inactive`).

### Response
#### Success Response (200)
- **id** (string) - The unique identifier for the asset.
- **symbol** (string) - The trading symbol for the asset.
- **name** (string) - The full name of the asset.
- **asset_class** (string) - The class of the asset (e.g., `us_equity`).
- **exchange** (string) - The exchange where the asset is traded.
- **tradable** (boolean) - Indicates if the asset is currently tradable.
- **fractionable** (boolean) - Indicates if the asset supports fractional trading.
- **status** (string) - The current status of the asset (e.g., `active`).

#### Response Example
```json
[
  {
    "id": "9bf757c0-0728-4139-a060-1234567890ab",
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "asset_class": "us_equity",
    "exchange": "NASDAQ",
    "tradable": true,
    "fractionable": true,
    "status": "active"
  }
]
```
```

--------------------------------

### Get a Specific Asset

Source: https://docs.alpaca.markets/docs/working-with-assets

Retrieve information about a particular asset by its symbol. This is useful for verifying if an asset is tradable.

```APIDOC
## GET /v2/assets/{symbol}

### Description
Retrieves information about a specific asset identified by its symbol.

### Method
GET

### Endpoint
/v2/assets/{symbol}

### Path Parameters
- **symbol** (string) - Required - The trading symbol of the asset to retrieve (e.g., `AAPL`).

### Response
#### Success Response (200)
- **id** (string) - The unique identifier for the asset.
- **symbol** (string) - The trading symbol for the asset.
- **name** (string) - The full name of the asset.
- **asset_class** (string) - The class of the asset (e.g., `us_equity`).
- **exchange** (string) - The exchange where the asset is traded.
- **tradable** (boolean) - Indicates if the asset is currently tradable.
- **fractionable** (boolean) - Indicates if the asset supports fractional trading.
- **status** (string) - The current status of the asset (e.g., `active`).

#### Response Example
```json
{
  "id": "9bf757c0-0728-4139-a060-1234567890ab",
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "asset_class": "us_equity",
  "exchange": "NASDAQ",
  "tradable": true,
  "fractionable": true,
  "status": "active"
}
```
#### Error Response (404)
- **code** (integer) - Error code.
- **message** (string) - Error message describing the issue.

#### Error Response Example
```json
{
  "code": 404,
  "message": "Asset not found for AAPL."
}
```
```