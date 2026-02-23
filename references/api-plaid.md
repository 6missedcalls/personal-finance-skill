### Run Plaid Quickstart Frontend (Node.js)

Source: https://plaid.com/docs/quickstart

This section details the steps to set up and run the frontend of the Plaid Quickstart application. It involves navigating to the frontend directory, installing necessary dependencies using npm, and starting the frontend development server. The application will then be accessible at http://localhost:3000.

```bash
1# Install dependencies
2cd quickstart/frontend
3npm install
4
5# Start the frontend app
6npm start
7
8# Go to http://localhost:3000
```

--------------------------------

### Clone and Run Plaid Quickstart with Docker

Source: https://plaid.com/docs/quickstart

This snippet demonstrates how to clone the Plaid Quickstart repository and set up the necessary environment for running it with Docker. It includes steps for copying the example environment file and starting the Docker container for a specified language, such as Node.js. Ensure Docker is installed and running before executing these commands.

```bash
# Note: If on Windows, run
# git clone -c core.symlinks=true https://github.com/plaid/quickstart
# instead to ensure correct symlink behavior

git clone https://github.com/plaid/quickstart.git
cd quickstart

# Copy the .env.example file to .env, then fill
# out PLAID_CLIENT_ID and PLAID_SECRET in .env
cp .env.example .env

# start the container for one of these languages:
# node, python, java, ruby, or go

make up language=node

# Go to http://localhost:3000
```

--------------------------------

### Clone and Run Plaid Quickstart Backend (Node.js)

Source: https://plaid.com/docs/quickstart

This snippet guides you through cloning the Plaid Quickstart repository, configuring your environment variables with Plaid API keys, installing dependencies, and starting the Node.js backend application. Ensure Node.js and npm are installed. For Windows users, a specific git clone command is recommended to handle symlinks correctly.

```bash
1# Note: If on Windows, run
2# git clone -c core.symlinks=true https://github.com/plaid/quickstart
3# instead to ensure correct symlink behavior
4
5git clone https://github.com/plaid/quickstart.git
6
7# Copy the .env.example file to .env, then fill
8# out PLAID_CLIENT_ID and PLAID_SECRET in .env
9cp .env.example .env
10
11cd quickstart/node
12
13# Install dependencies
14npm install
15
16# Start the backend app
17./start.sh
```

--------------------------------

### Installation

Source: https://plaid.com/docs/link/react-native

Instructions for installing the Plaid Link React Native SDK and setting up native dependencies for iOS and Android.

```APIDOC
## Installation

### Description

Instructions for installing the Plaid Link React Native SDK and setting up native dependencies for iOS and Android.

### Installing the SDK

In your react-native project directory, run:

```bash
npm install --save react-native-plaid-link-sdk
```

### iOS Setup

Add Plaid to your project's Podfile (located at `ios/Podfile`):

```ruby
pod 'Plaid', '~> <insert latest version>'
```

Autolinking should install the CocoaPods dependencies. If it fails, run:

```bash
cd ios && bundle install && bundle exec pod install
```

### Android Setup

Requirements:
*   Android 5.0 (API level 21) and above.
*   Your `compileSdkVersion` must be 35.
*   Android Gradle plugin 4.x and above.

Autolinking should handle Android setup. Register your Android package name in the Plaid Dashboard to connect to OAuth institutions.

### Sample App

Refer to the [Tiny Quickstart (React Native)](https://github.com/plaid/react-native-quickstart) for a minimal integration example.
```

--------------------------------

### Install Plaid Libraries

Source: https://plaid.com/docs/layer/add-to-app

Install the official Plaid server-side client libraries using npm.

```APIDOC
## Install Plaid Libraries

### Description
Installs the Plaid client libraries for server-side integration.

### Method
`npm`

### Endpoint
`npm install --save plaid`

### Request Example
```bash
npm install --save plaid
```

### Response
#### Success Response (200)
Package installed successfully.

#### Response Example
```
+ plaid@x.y.z
updated xx packages in x.xxs
```
```

--------------------------------

### Retrieve Account Information with Plaid API (Node.js)

Source: https://plaid.com/docs/quickstart

This code example demonstrates how to make an API request to Plaid's /accounts/get endpoint using the Plaid client object and an access token. It retrieves and displays account details, handling potential errors.

```javascript
app.get('/api/accounts', async function (request, response, next) {
  try {
    const accountsResponse = await client.accountsGet({
      access_token: accessToken,
    });
    prettyPrintResponse(accountsResponse);
    response.json(accountsResponse.data);
  } catch (error) {
    prettyPrintResponse(error);
    return response.json(formatError(error.response));
  }
});
```

--------------------------------

### Manage Plaid Quickstart Docker Container Logs

Source: https://plaid.com/docs/quickstart

This command displays the logs generated by the Plaid Quickstart Docker container for a specific language, such as Node.js. This is useful for debugging and monitoring the application's activity. Ensure the container is running before attempting to view its logs.

```bash
make logs language=node
```

--------------------------------

### Next Steps: Building with Balance

Source: https://plaid.com/docs/balance

Guidance on the next steps to get started with the Balance API, from initial development to launching in Production.

```APIDOC
## Next Steps

### Getting Started

To begin developing with the Balance API, follow the instructions in the "Add Balance to your App" guide.

### Production Launch

If you are ready to launch your application to Production, consult the Launch Center for the necessary steps and requirements.
```

--------------------------------

### POST /api/set_access_token

Source: https://plaid.com/docs/quickstart

Receives the `public_token` from the client-side Link component and initiates the exchange for an `access_token`.

```APIDOC
## POST /api/set_access_token

### Description
Exchanges a `public_token` received from Plaid Link for a permanent `access_token` and `item_id`.

### Method
POST

### Endpoint
/api/set_access_token

### Parameters
#### Request Body
- **public_token** (string) - Required - The public token received from the Plaid Link `onSuccess` callback.

### Request Example
```json
{
  "public_token": "public-token-from-link"
}
```

### Response
#### Success Response (200)
- **access_token** (string) - The permanent access token for the Item.
- **item_id** (string) - The unique identifier for the Item.
- **request_id** (string) - A unique ID for the request.

#### Response Example
```json
{
  "access_token": "access-token-xxxxxxxx",
  "item_id": "item-id-xxxxxxxxx",
  "request_id": "req-xxxxxxxxx"
}
```
```

--------------------------------

### GET /api/accounts

Source: https://plaid.com/docs/quickstart

Retrieves basic information about the accounts associated with an Item, such as name and balance. This endpoint uses the access_token to fetch data from the Plaid client.

```APIDOC
## GET /api/accounts

### Description
Retrieves basic information about the accounts associated with an Item, such as name and balance. This endpoint uses the access_token to fetch data from the Plaid client.

### Method
GET

### Endpoint
/api/accounts

### Parameters
#### Query Parameters
- **access_token** (string) - Required - The access token associated with the Item data you want to retrieve.

### Request Example
```
GET /api/accounts?access_token=YOUR_ACCESS_TOKEN
```

### Response
#### Success Response (200)
- **accounts** (array) - An array of account objects, each containing details like account_id, balances, mask, name, and type.
- **item** (object) - An object containing information about the Item, such as available_products, institution_id, and item_id.
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "accounts": [
    {
      "account_id": "A3wenK5EQRfKlnxlBbVXtPw9gyazDWu1EdaZD",
      "balances": {
        "available": 100,
        "current": 110,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "0000",
      "name": "Plaid Checking",
      "official_name": "Plaid Gold Standard 0% Interest Checking",
      "subtype": "checking",
      "type": "depository"
    },
    {
      "account_id": "GPnpQdbD35uKdxndAwmbt6aRXryj4AC1yQqmd",
      "balances": {
        "available": 200,
        "current": 210,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "1111",
      "name": "Plaid Saving",
      "official_name": "Plaid Silver Standard 0.1% Interest Saving",
      "subtype": "savings",
      "type": "depository"
    }
  ],
  "item": {
    "available_products": [
      "assets",
      "balance",
      "identity",
      "investments",
      "transactions"
    ],
    "billed_products": ["auth"],
    "consent_expiration_time": null,
    "error": null,
    "institution_id": "ins_12",
    "item_id": "gVM8b7wWA5FEVkjVom3ri7oRXGG4mPIgNNrBy",
    "webhook": "https://requestb.in"
  },
  "request_id": "C3IZlexgvNTSukt"
}
```
```

--------------------------------

### Install CocoaPods Dependencies

Source: https://plaid.com/docs/link/ios

Command to install all dependencies listed in the Podfile, including the Plaid SDK. This command should be run after modifying the Podfile.

```bash
pod install
```

--------------------------------

### POST /api/exchange_public_token

Source: https://plaid.com/docs/quickstart

Exchanges a `public_token` for an `access_token` and `item_id` on the server-side.

```APIDOC
## POST /api/exchange_public_token

### Description
Exchanges a `public_token` received from Plaid Link for a permanent `access_token` and `item_id`.

### Method
POST

### Endpoint
/api/exchange_public_token

### Parameters
#### Request Body
- **public_token** (string) - Required - The public token received from the Plaid Link `onSuccess` callback.

### Request Example
```json
{
  "public_token": "public-token-from-link"
}
```

### Response
#### Success Response (200)
- **access_token** (string) - The permanent access token for the Item.
- **item_id** (string) - The unique identifier for the Item.
- **request_id** (string) - A unique ID for the request.

#### Response Example
```json
{
  "access_token": "access-token-xxxxxxxx",
  "item_id": "item-id-xxxxxxxxx",
  "request_id": "req-xxxxxxxxx"
}
```
```

--------------------------------

### Install React Native Plaid Link SDK

Source: https://plaid.com/docs/link/react-native

Installs the Plaid Link SDK for React Native projects using npm. This is the first step in integrating Plaid Link into your application.

```bash
npm install --save react-native-plaid-link-sdk
```

--------------------------------

### POST /api/create_link_token

Source: https://plaid.com/docs/quickstart

Creates a `link_token` which is a temporary, one-time-use token used to authenticate your application with Plaid Link.

```APIDOC
## POST /api/create_link_token

### Description
Creates a `link_token` for initializing Plaid Link. This token is used on the client-side to connect a user's bank account.

### Method
POST

### Endpoint
/api/create_link_token

### Parameters
#### Request Body
- **user** (object) - Required - Information about the user.
  - **client_user_id** (string) - Required - A unique identifier for the current user.
- **client_name** (string) - Required - The name of your application.
- **products** (array) - Required - An array of Plaid products to use (e.g., ['auth']).
- **language** (string) - Optional - The language for Plaid Link (e.g., 'en').
- **webhook** (string) - Optional - The URL for Plaid webhooks.
- **redirect_uri** (string) - Optional - The URI to redirect to after successful OAuth authentication.
- **country_codes** (array) - Required - An array of country codes for supported institutions (e.g., ['US']).

### Request Example
```json
{
  "user": {
    "client_user_id": "user-id-123"
  },
  "client_name": "Plaid Test App",
  "products": ["auth"],
  "language": "en",
  "webhook": "https://webhook.example.com",
  "redirect_uri": "https://domainname.com/oauth-page.html",
  "country_codes": ["US"]
}
```

### Response
#### Success Response (200)
- **link_token** (string) - The generated link token.
- **expiration** (string) - The expiration date of the link token.
- **request_id** (string) - A unique ID for the request.

#### Response Example
```json
{
  "link_token": "link-token-xxxxxxxx",
  "expiration": "2023-10-27T10:00:00Z",
  "request_id": "req-xxxxxxxxx"
}
```
```

--------------------------------

### iOS Setup for Plaid Link SDK

Source: https://plaid.com/docs/link/react-native

Configures the Plaid SDK for iOS projects by adding it to the Podfile. This step is crucial for enabling Plaid functionality on iOS. It also includes commands to install dependencies if autolinking fails.

```ruby
pod 'Plaid', '~> <insert latest version>'
```

```bash
cd ios && bundle install && bundle exec pod install
```

--------------------------------

### Install and Initialize Plaid Libraries

Source: https://plaid.com/docs/investments/add-to-app

Instructions for installing the Plaid client library and initializing it with your API credentials.

```APIDOC
## Install Plaid Libraries

### Description
Install the Plaid client library using npm and initialize it with your Plaid `client_id`, `secret`, and the desired environment.

### Method
N/A (Installation and Initialization)

### Endpoint
N/A

### Parameters
N/A

### Request Example
```bash
npm install --save plaid
```

### Response
N/A

## Initialize Plaid Client

### Description
Initialize the Plaid client with configuration including `client_id`, `secret`, and environment.

### Method
N/A (Initialization)

### Endpoint
N/A

### Parameters
- **basePath** (string) - Required - The Plaid environment (e.g., `PlaidEnvironments.sandbox`).
- **baseOptions.headers** (object) - Required - Headers object containing `PLAID-CLIENT-ID` and `PLAID-SECRET`.
  - **PLAID-CLIENT-ID** (string) - Required - Your Plaid Client ID.
  - **PLAID-SECRET** (string) - Required - Your Plaid API Secret.

### Request Example
```javascript
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);
```

### Response
- **client** (PlaidApi) - An initialized Plaid API client instance.
```

--------------------------------

### Handle Token Exchange and Redirect (Node.js)

Source: https://plaid.com/docs/quickstart

This snippet shows how to handle the public token exchange process, saving the access token and item ID to a persistent database. It then redirects the user upon completion or handles errors.

```javascript
    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = response.data.access_token;
    const itemID = response.data.item_id;

    res.json({ public_token_exchange: 'complete' });
  } catch (error) {
    // handle error
  }
});
```

--------------------------------

### API Object Example

Source: https://plaid.com/docs/api/products/payment-initiation

An example of the API object structure for payment initiation, including `payment_id`, `request_id`, and `status`.

```APIDOC
## API Object Example

```json
{
  "payment_id": "payment-id-sandbox-feca8a7a-5591-4aef-9297-f3062bb735d3",
  "request_id": "4ciYccesdqSiUAB",
  "status": "PAYMENT_STATUS_INITIATED"
}
```
```

--------------------------------

### Create Link Webview Integration Example

Source: https://plaid.com/docs/link/webview

An example of how to construct the Link initialization URL for a webview integration. It includes the base URL and essential parameters like `isWebview`, `token`, and `receivedRedirectUri` for initiating a Link session.

```url
https://cdn.plaid.com/link/v2/stable/link.html
  ?isWebview=true
  &token="GENERATED_LINK_TOKEN"
  &receivedRedirectUri=
```

--------------------------------

### Plaid Link Integration

Source: https://plaid.com/docs/investments/add-to-app

Guides on installing the Plaid Link dependency and configuring the client-side handler to open the Link flow.

```APIDOC
## Install Plaid Link Dependency

### Description
Include the Plaid Link JavaScript library in your HTML's head section.

### Method
N/A (HTML Script Tag)

### Endpoint
N/A

### Parameters
N/A

### Request Example
```html
<head>
  <title>Connect a bank</title>
  <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
</head>
```

### Response
N/A

## Configure Client-Side Link Handler

### Description
Initialize and configure the Plaid Link handler on the client-side, including success, exit, and event callbacks.

### Method
N/A (JavaScript Initialization)

### Endpoint
N/A

### Parameters
- **token** (string) - Required - The `link_token` obtained from the `/link/token/create` endpoint.
- **onSuccess** (function) - Required - Callback function executed when the user successfully links an Item. It receives `public_token` and `metadata`.
- **onExit** (function) - Optional - Callback function executed when the user exits the Link flow. Receives `err` and `metadata`.
- **onEvent** (function) - Optional - Callback function to capture Link flow events. Receives `eventName` and `metadata`.

### Request Example
```javascript
const linkHandler = Plaid.create({
  token: (await $.post('/create_link_token')).link_token, // Assuming you have an endpoint to get the link token
  onSuccess: (public_token, metadata) => {
    // Send the public_token to your app server to exchange for an access token.
    $.post('/exchange_public_token', {
      public_token: public_token,
    });
  },
  onExit: (err, metadata) => {
    // Optionally capture when your user exited the Link flow.
    console.error('Link exited:', err, metadata);
  },
  onEvent: (eventName, metadata) => {
    // Optionally capture Link flow events.
    console.log('Link event:', eventName, metadata);
  },
});

// To open the Link flow:
linkHandler.open();
```

### Response
N/A (This configures a client-side handler)
```

--------------------------------

### Initialize Plaid Link and Handle Success (React)

Source: https://plaid.com/docs/quickstart

This React snippet shows how to initialize Plaid Link using the `usePlaidLink` hook. It fetches a `link_token` from the server and provides an `onSuccess` callback to handle the `public_token` received after a successful bank connection. The `public_token` is then sent to the server for exchange.

```javascript
// APP COMPONENT
// Upon rendering of App component, make a request to create and
// obtain a link token to be used in the Link component
import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
const App = () => {
  const [linkToken, setLinkToken] = useState(null);
  const generateToken = async () => {
    const response = await fetch('/api/create_link_token', {
      method: 'POST',
    });
    const data = await response.json();
    setLinkToken(data.link_token);
  };
  useEffect(() => {
    generateToken();
  }, []);
  return linkToken != null ? <Link linkToken={linkToken} /> : <></>;
};
// LINK COMPONENT
// Use Plaid Link and pass link token and onSuccess function
// in configuration to initialize Plaid Link
interface LinkProps {
  linkToken: string | null;
}
const Link: React.FC<LinkProps> = (props: LinkProps) => {
  const onSuccess = React.useCallback((public_token, metadata) => {
    // send public_token to server
    const response = fetch('/api/set_access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_token }),
    });
    // Handle response ...
  }, []);
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken!,
    onSuccess,
  };
  const { open, ready } = usePlaidLink(config);
  return (
    <button onClick={() => open()} disabled={!ready}>
      Link account
    </button>
  );
};
export default App;
```

--------------------------------

### Initialize Plaid Client

Source: https://plaid.com/docs/layer/add-to-app

Initialize the Plaid client with your API credentials and environment.

```APIDOC
## Initialize Plaid Client

### Description
Initializes the Plaid client using your `client_id`, `secret`, and the desired environment (Sandbox or Production).

### Method
`Node.js`

### Endpoint
`/` (Initialization)

### Parameters
#### Environment Variables
- **PLAID_CLIENT_ID** (string) - Required - Your Plaid Client ID.
- **PLAID_SECRET** (string) - Required - Your Plaid API Secret.

#### Request Body
(Not applicable for initialization)

### Request Example
```javascript
const {
  Configuration,
  PlaidApi,
  PlaidEnvironments
} = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);
```

### Response
#### Success Response (200)
The Plaid client is initialized and ready for use.

#### Response Example
(No direct response; client object is created.)
```

--------------------------------

### Stop Plaid Quickstart Docker Container

Source: https://plaid.com/docs/quickstart

This command stops the running Plaid Quickstart Docker container for a specified language, such as Node.js. This is a clean way to shut down the application when it is no longer needed. Ensure the container is running before attempting to stop it.

```bash
make stop language=node
```

--------------------------------

### Plaid API Response Structure Example

Source: https://plaid.com/docs/api/products/income

An example of a Plaid API response object, demonstrating the structure for request IDs, sessions, link session IDs, results including item additions, bank income data, and session start times.

```json
{
  "request_id": "Aim3b",
  "sessions": [
    {
      "link_session_id": "356dbb28-7f98-44d1-8e6d-0cec580f3171",
      "results": {
        "item_add_results": [
          {
            "public_token": "public-sandbox-5c224a01-8314-4491-a06f-39e193d5cddc",
            "item_id": "M5eVJqLnv3tbzdngLDp9FL5OlDNxlNhlE55op",
            "institution_id": "ins_56"
          }
        ],
        "bank_income_results": [
          {
            "status": "APPROVED",
            "item_id": "M5eVJqLnv3tbzdngLDp9FL5OlDNxlNhlE55op",
            "institution_id": "ins_56"
          }
        ]
      },
      "session_start_time": "2022-09-30T23:40:30.946225Z"
    },
    {
      "link_session_id": "f742cae8-31e4-49cc-a621-6cafbdb26fb9",
      "results": {
        "payroll_income_results": [
          {
            "num_paystubs_retrieved": 2,
            "num_w2s_retrieved": 1,
            "institution_id": "ins_92"
          }
        ]
      },
      "session_start_time": "2022-09-26T23:40:30.946225Z"
    }
  ]
}
```

--------------------------------

### GET /wallet/get

Source: https://plaid.com/docs/payment-initiation/virtual-accounts/add-to-app

Fetches information about your virtual account, including its balance and associated numbers.

```APIDOC
## GET /wallet/get

### Description
Fetches details of a specific virtual account, including its ID, balance, and bank account numbers.

### Method
GET

### Endpoint
`/wallet/get`

### Parameters
#### Query Parameters
- **wallet_id** (string) - Required - The ID of the wallet to retrieve.

### Request Example
(Client-side request construction)
```javascript
const request = {
  wallet_id: walletID,
};
try {
  const response = await plaidClient.walletGet(request);
  // Process response
} catch (error) {
  // handle error
}
```

### Response
#### Success Response (200)
- **wallet_id** (string) - The ID of the wallet.
- **balance** (object) - An object containing the balance details (e.g., amount, currency).
- **numbers** (object) - An object containing the virtual account numbers.

#### Response Example
```json
{
  "wallet_id": "slsk_xxxxxxxxxxxxxx",
  "balance": {
    "current": 1000.50,
    "available": 950.25,
    "currency": "USD"
  },
  "numbers": {
    "account": "1234567890",
    "routing": "012345678",
    "wire": {
      "account": "9876543210",
      "routing": "876543210"
    }
  }
}
```
```

--------------------------------

### User Onboarding Flow

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/user-onboarding-and-account-funding

Describes the standard user onboarding flow using Plaid, involving link token creation, client-side Link initiation, and token exchange.

```APIDOC
## User Onboarding Flow

### Description
This section details the user onboarding process using Plaid. It outlines the steps from backend token creation to client-side initiation and eventual token exchange for access tokens.

### Steps:
1.  **Backend:** Create a `link_token` using the `/link/token/create` endpoint.
2.  **Backend:** Pass the `link_token` to your client application.
3.  **Client App:** Initiate the Plaid Link flow using the `link_token`.
4.  **Client App:** The `onSuccess` callback signals successful account linking.
5.  **Client App:** Send the `public_token` from the `onSuccess` payload to your backend.
6.  **Backend:** Exchange the `public_token` for a long-lived access token using the `/item/public_token/exchange` endpoint.
7.  **Backend:** Use the access token to retrieve user data via `/auth/get` or `/identity/get`.
```

--------------------------------

### Example: Handling Transaction Updates in Node.js (Plaid Pattern)

Source: https://plaid.com/docs/transactions/transactions-data

Illustrates how to manage transaction states, including pending and posted updates, using JavaScript within the Node-based Plaid Pattern sample application. This example provides a practical implementation guide for handling dynamic transaction data.

```javascript
// In update_transactions.js (Plaid Pattern sample app)
// This file demonstrates the code for handling transaction states.
```

--------------------------------

### POST /payment_initiation/payment/create

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/user-onboarding-and-account-funding

Creates a payment request, allowing for compliant account funding by specifying account details.

```APIDOC
## POST /payment_initiation/payment/create

### Description
Creates a payment request. This endpoint can be used to restrict payments to a specific account, aiding in KYC & AML compliance.

### Method
POST

### Endpoint
https://sandbox.plaid.com/payment_initiation/payment/create

### Parameters
#### Query Parameters
None

#### Request Body
- **client_id** (string) - Required - Your Plaid API client ID.
- **secret** (string) - Required - Your Plaid API secret.
- **recipient_id** (string) - Required - The ID of the recipient.
- **reference** (string) - Required - The reference for the payment.
- **amount** (object) - Required - The amount of the payment.
  - **currency** (string) - Required - The currency of the amount (e.g., "GBP").
  - **amount** (number) - Required - The numeric amount.
- **options** (object) - Optional - Additional options for the payment.
  - **bacs** (object) - Optional - BACS details for UK payments.
    - **account** (string) - Required - The account number.
    - **sort_code** (string) - Required - The sort code.
  - **international** (object) - Optional - International bank account details.
    - **iban** (string) - Required - The IBAN.
    - **bic** (string) - Required - The BIC.

### Request Example
```json
{
  "client_id": "${PLAID_CLIENT_ID}",
  "secret": "${PLAID_SECRET}",
  "recipient_id": "${RECIPIENT_ID}",
  "reference": "Sample reference",
  "amount": {
    "currency": "GBP",
    "amount": 1.99
  },
  "options": {
    "bacs": {
        "account": "26207729",
        "sort_code": "560029"
    }
  }
}
```

### Response
#### Success Response (200)
- **payment_id** (string) - The ID of the created payment.
- **status** (string) - The status of the payment.
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "payment_id": "pay-xxxxxxxxxxxx",
  "status": "PENDING",
  "request_id": "req_xxxxxxxxxxxx"
}
```
```

--------------------------------

### Request Example with Seed and Override Accounts

Source: https://plaid.com/docs/sandbox/user-custom

Example of a request body for creating an Item, including a seed for deterministic results and overriding account details.

```APIDOC
## Request Example with Seed and Override Accounts

### Description
This example demonstrates how to use the `seed` parameter for deterministic Item creation and `override_accounts` to specify account details in the Sandbox environment.

### Request Example
```json
{
  "seed": "my-seed-string-3",
  "override_accounts": [
    {
      "type": "depository",
      "subtype": "checking",
      "identity": {
        "names": ["Jane Doe"]
      }
    }
  ]
}
```
```

--------------------------------

### OAuth Flow

Source: https://plaid.com/docs/link/web

Integrating Plaid Link with an OAuth flow requires specific setup instructions. Refer to the official OAuth Guide for detailed configuration and implementation steps.

```APIDOC
## OAuth Integration

### Description
Instructions and guidance for integrating Plaid Link with an OAuth flow. This typically involves specific server-side and client-side configurations to handle the authentication process with third-party identity providers.

### Method
N/A (Configuration and flow-based)

### Endpoint
N/A

### Parameters
Refer to the official Plaid OAuth Guide for detailed parameter requirements and flow specifics.

### Request Example
N/A

### Response
N/A
```

--------------------------------

### Plaid Webhook Example: PAYMENT_STATUS_UPDATE

Source: https://plaid.com/docs/payment-initiation/virtual-accounts/add-to-app

Example JSON payload for a PAYMENT_STATUS_UPDATE webhook, indicating a change in payment status. Includes payment ID, new and old statuses, and timestamps.

```json
{
  "webhook_type": "PAYMENT_INITIATION",
  "webhook_code": "PAYMENT_STATUS_UPDATE",
  "payment_id": "<PAYMENT_ID>",
  "new_payment_status": "PAYMENT_STATUS_SETTLED",
  "old_payment_status": "PAYMENT_STATUS_EXECUTED",
  "original_reference": "Account Funding 99744",
  "adjusted_reference": "Account Funding 99",
  "original_start_date": "2017-09-14",
  "adjusted_start_date": "2017-09-15",
  "timestamp": "2017-09-14T14:42:19.350Z"
}
```

--------------------------------

### Get Investment Transactions (Node.js)

Source: https://plaid.com/docs/api/products/investments

Fetches investment transactions from Plaid using the /investments/transactions/get endpoint. This example demonstrates making the request and handling the response or potential errors. It requires an access token, start date, and end date.

```javascript
const request = {
  access_token: accessToken,
  start_date: '2019-01-01',
  end_date: '2019-06-10'
};
try {
  const response = await plaidClient.investmentsTransactionsGet(request);
  const investmentTransactions = response.data.investment_transactions;
} catch (error) {
  // handle error
}
```

--------------------------------

### Plaid Webhook Example: WALLET_TRANSACTION_STATUS_UPDATE

Source: https://plaid.com/docs/payment-initiation/virtual-accounts/add-to-app

Example JSON payload for a WALLET_TRANSACTION_STATUS_UPDATE webhook, indicating a change in virtual account transaction status. Includes wallet ID, new and old statuses, and timestamps.

```json
{
  "webhook_type": "WALLET",
  "webhook_code": "WALLET_TRANSACTION_STATUS_UPDATE",
  "wallet_id": "<WALLET_ID>",
  "new_status": "SETTLED",
  "old_status": "INITIATED",
  "timestamp": "2021-09-14T14:42:19.350Z"
}
```

--------------------------------

### Exchange Public Token for Access Token (Node.js)

Source: https://plaid.com/docs/quickstart

This Node.js snippet illustrates the server-side process of exchanging a `public_token` received from Plaid Link for a permanent `access_token`. The `access_token` is crucial for making subsequent requests to retrieve user financial data and must be stored securely.

```javascript
app.post('/api/exchange_public_token', async function (
  request,
  response,
  next,
) {
  const publicToken = request.body.public_token;
  try {
    const response = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });


```

--------------------------------

### Example app.json structure for Universal Links

Source: https://plaid.com/docs/link/troubleshooting

An example of an app site association file structure, showing how to correctly format paths for different iOS versions. This file is crucial for enabling Universal Links and deep linking into your iOS application.

```json
{
  "appID": "YOUR_APP_ID",
  "apple-id": "YOUR_APPLE_ID",
  "paths": [
    "/path1",
    "/path2"
  ],
  "components": [
    {
      "'/path/prefix'" : [
        {
          """latest""" : "/path/prefix/latest/index.html"
        }
      ]
    }
  ]
}
```

--------------------------------

### GET /user_account/session/get

Source: https://plaid.com/docs/layer/add-to-app

Retrieves user-permissioned identity information and Item access tokens.

```APIDOC
## GET /user_account/session/get

### Description
Call `/user_account/session/get` to retrieve user-permissioned identity information as well as Item access tokens. Unlike typical Plaid Link sessions, where you must first exchange your public token for an access token in order to talk to the Plaid API, the `/user_account/session/get` endpoint allows you to retrieve user-permissioned identity information as well as Item access tokens in a single call. You can optionally use Plaid products such as Identity Match or Identity Verification if you wish to verify this data.

### Method
GET

### Endpoint
`/user_account/session/get`

### Parameters
#### Query Parameters
- **public_token** (string) - Required - The public token obtained from Plaid Link.

### Request Example
```json
{
  "public_token": "profile-sandbox-b0e2c4ee-a763-4df5-bfe9-46a46bce992d"
}
```

### Response
#### Success Response (200)
- **identity** (object) - User identity information.
  - **phone_number** (string) - Verified phone number.
  - **name** (object) - User's name.
    - **first_name** (string) - First name.
    - **last_name** (string) - Last name.
  - **address** (object) - User's address.
    - **street** (string) - Street address.
    - **street2** (string) - Street address line 2.
    - **city** (string) - City.
    - **region** (string) - State or region.
    - **postal_code** (string) - Postal code.
    - **country** (string) - Country.
  - **email** (string) - User's email address.
  - **date_of_birth** (string) - User's date of birth (YYYY-MM-DD).
  - **ssn** (string) - User's Social Security Number.
  - **ssn_last4** (string) - Last 4 digits of the SSN.
- **items** (array) - A list of items associated with the user.
  - **item_id** (string) - The ID of the item.
  - **access_token** (string) - The access token for the item.
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "identity": {
    "phone_number": "+14155550015",
    "name": {
      "first_name": "Leslie",
      "last_name": "Knope"
    },
    "address": {
      "street": "123 Main St.",
      "street2": "Apt 123",
      "city": "Pawnee",
      "region": "Indiana",
      "postal_code": "46001",
      "country": "US"
    },
    "email": "leslie@knope.com",
    "date_of_birth": "1979-01-01",
    "ssn": "987654321",
    "ssn_last4": "4321"
  },
  "items": [
    {
      "item_id": "<external_item_id>",
      "access_token": "access-token-<UUID>"
    }
  ],
  "request_id": "j0LkqT9OPdVwjwh"
}
```
```

--------------------------------

### API Endpoints for Compliant Withdrawals

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/user-onboarding-and-account-funding

Details on how to facilitate compliant withdrawals using Plaid's Auth data or Virtual Accounts.

```APIDOC
## Compliant Withdrawals

### Description
This section outlines two methods for ensuring compliant withdrawals, either through Virtual Accounts or by utilizing Auth data.

### Method 1: Using Virtual Accounts

1.  **Confirm Payment Settlement**: Follow the Payment Confirmation flow to verify funds have settled in your virtual account.
2.  **Fetch Payment Object**: Call `/payment_initiation/payment/get` with the `payment_id` to retrieve the payment object, which includes a `transaction_id`.
3.  **Fetch Virtual Account Transaction**: Use the `transaction_id` to call `/wallet/transaction/get`.
4.  **Retrieve Counterparty Details**: The virtual account transaction response will contain account details in the `counterparty` field.
5.  **Execute Payout**: Initiate the payout using the retrieved `counterparty` details.

### Method 2: Using Auth Data

1.  **Fetch Auth Data**: Call `/auth/get` with the `access_token` to retrieve the user's verified account numbers. Specify `bacs` for the UK and `international` for Europe.
2.  **Filter Accounts**: Select accounts where `account.subtype` is "checking".
3.  **Initiate Withdrawal**: Initiate the withdrawal to one of the filtered accounts. Consider allowing the user to choose their preferred account if multiple options exist.

### Endpoints Involved
- `/payment_initiation/payment/get`
- `/wallet/transaction/get`
- `/auth/get`
```

--------------------------------

### POST /link/token/create

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/user-onboarding-and-account-funding

Creates a link_token on your backend to initiate the Plaid Link flow. This token is used on the client side to connect the user's financial institution.

```APIDOC
## POST /link/token/create

### Description
Creates a link_token on your backend to initiate the Plaid Link flow. This token is used on the client side to connect the user's financial institution.

### Method
POST

### Endpoint
https://sandbox.plaid.com/link/token/create

### Parameters
#### Request Body
- **client_id** (string) - Required - Your Plaid API client ID.
- **secret** (string) - Required - Your Plaid API secret.
- **client_name** (string) - Required - The name of your application displayed to the user.
- **user** (object) - Required - An object containing user-specific information. 
  - **client_user_id** (string) - Required - A unique identifier for the user in your system.
- **products** (array of strings) - Required - An array specifying the Plaid products to enable (e.g., `"auth"`, `"identity"`).
- **country_codes** (array of strings) - Required - An array of country codes (e.g., `"GB"`, `"NL"`).
- **language** (string) - Required - The language for the Link flow (e.g., `"en"`).
- **webhook** (string) - Optional - The URL for Plaid webhooks.

### Request Example
```json
{
  "client_id": "${PLAID_CLIENT_ID}",
  "secret": "${PLAID_SECRET}",
  "client_name": "Plaid Test App",
  "user": { "client_user_id": "${UNIQUE_USER_ID}" },
  "products": ["auth", "identity"],
  "country_codes": ["GB", "NL", "DE"],
  "language": "en",
  "webhook": "https://webhook.sample.com"
}
```

### Response
#### Success Response (200)
- **link_token** (string) - The generated link token.
- **expiration** (string) - The expiration date of the link token.
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "link_token": "link-development-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "expiration": "2023-10-27T22:23:12Z",
  "request_id": "Q1v3dM7pSjX8tY4w"
}
```
```

--------------------------------

### Example User Agent for WebView Simulation

Source: https://plaid.com/docs/link/oauth

This is an example of a user agent string that can be used to simulate a mobile webview in browser developer tools. This is useful for testing how your application behaves in a webview environment, particularly for OAuth redirect flows.

```text
Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36
```

--------------------------------

### Product Initialization and Configuration

Source: https://plaid.com/docs/api/link

This section details how to specify and manage products for Plaid integrations. It covers the use of `optional_products`, `required_if_supported_products`, and `additional_consented_products` for initializing products, along with important considerations for billing and product removal.

```APIDOC
## Product Management for Plaid Integrations

### Description
This documentation covers the parameters used to configure products for Plaid website integrations. It explains how to use `optional_products`, `required_if_supported_products`, and `additional_consented_products` to customize product offerings and outlines the implications for billing and item management.

### Key Parameters

#### `optional_products`
- **Type**: `[string]`
- **Description**: A list of Plaid products that enhance the user experience but are not critical for your app's core functionality. Plaid will attempt to fetch data for these products on a best-effort basis. Failure to provide these products will not affect Item creation.
- **Possible values**: `auth`, `identity`, `investments`, `liabilities`, `signal`, `statements`, `transactions`
- **Constraints**: Should not overlap with `products`, `required_if_supported_products`, or `additional_consented_products`. The `products` array must contain at least one product.

#### `required_if_supported_products`
- **Type**: `[string]`
- **Description**: A list of Plaid products that you wish to use only if the institution and account(s) selected by the user support them. Institutions that do not support these products will still be displayed in Link. The products will only be fetched and billed if the user selects a supporting institution and account type.
- **Possible values**: `auth`, `identity`, `investments`, `liabilities`, `transactions`, `signal`, `statements`, `protect_linked_bank`
- **Constraints**: Should not overlap with `products`, `optional_products`, or `additional_consented_products`. The `products` array must contain at least one product.

#### `additional_consented_products`
- **Type**: `[string]`
- **Description**: A list of additional Plaid products for which you want to collect consent to support your use case. These products will not be billed until you start using them by calling the relevant endpoints. Note that `balance` is not a valid value and is automatically consented to when any other product is initialized.
- **Possible values**: `auth`, `balance_plus`, `identity`, `investments`, `investments_auth`, `liabilities`, `transactions`, `signal`
- **Constraints**: Should not overlap with `products` or `required_if_supported_products`.

### Important Considerations

- **`balance` product**: The `balance` product does not require explicit initialization and will automatically be initialized when any other product is initialized.
- **CRA products**: If launching Link with CRA products, `cra_base_reports` is required and must be included in the `products` array.
- **Instant Match**: If `auth` is specified as a product, institutions supporting Instant Match will be shown in Link, even if they do not include `auth` in their product array.
- **Billing**: In Production, you will be billed for each product specified during Link initialization.
- **Product Removal**: A product cannot be removed from an Item once initialized. To stop billing for subscription-based products (e.g., Liabilities, Investments, Transactions), use `/item/remove`.
- **Signal product**: If `signal` is included in `additional_consented_products`, call `/signal/prepare` before `/signal/evaluate` for the first time on an Item.

```

--------------------------------

### GET /wallet/transaction/list

Source: https://plaid.com/docs/changelog

Retrieves a list of wallet transactions. Supports filtering by start and end time.

```APIDOC
## GET /wallet/transaction/list

### Description
Retrieves a list of wallet transactions. Supports filtering by `start_time` and `end_time`.

### Method
GET

### Endpoint
/wallet/transaction/list

### Parameters
#### Query Parameters
- **options.start_time** (datetime) - Optional - The start of the time period to retrieve transactions for.
- **options.end_time** (datetime) - Optional - The end of the time period to retrieve transactions for.

### Response
#### Success Response (200)
- **transactions** (array) - A list of wallet transaction objects.
  - **last_status_update** (datetime) - The last time the status of the transaction was updated.
  - **payment_id** (string) - The ID of the payment associated with the transaction.
  - **start_time** (datetime) - The date-time when the transaction occurred.

#### Response Example
```json
{
  "transactions": [
    {
      "transaction_id": "txn_abc123",
      "last_status_update": "2023-10-27T10:00:00Z",
      "payment_id": "pay_xyz789",
      "start_time": "2023-10-26T09:00:00Z"
    }
  ]
}
```
```

--------------------------------

### Install Plaid Client Library for Node.js

Source: https://plaid.com/docs/assets/add-to-app

Installs the official Plaid server-side client library for Node.js using npm. This library is essential for interacting with the Plaid API from your application's backend.

```bash
npm install --save plaid
```

--------------------------------

### Install Plaid Link Dependency for Web

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/add-to-app

Includes the Plaid Link JavaScript library via a CDN in the HTML head. This makes the Link module available for initializing the payment initiation flow on the web.

```html
<head>
  <title>Link for Payment Initiation</title>
  <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
</head>
```

--------------------------------

### Plaid API Response Example (Asset Report)

Source: https://plaid.com/docs/api/products/assets

An example JSON structure for a successful Plaid API response, specifically illustrating an asset report.

```APIDOC
## Plaid API Asset Report Response Example

### Description
This example demonstrates the structure of a successful response when requesting an asset report from the Plaid API.

### Method
N/A (Response structure example)

### Endpoint
N/A

### Parameters
None

### Request Example
None

### Response
#### Success Response (200)
```json
{
  "report": {
    "asset_report_id": "028e8404-a013-4a45-ac9e-002482f9cafc",
    "client_report_id": "client_report_id_1221",
    "date_generated": "2023-03-30T18:27:37Z",
    "days_requested": 90,
    "items": [
      {
        "accounts": [
          {
            "account_id": "1qKRXQjk8xUWDJojNwPXTj8gEmR48piqRNye8",
            "balances": {
              "available": 43200,
              "current": 43200,
              "limit": null,
              "margin_loan_amount": null,
              "iso_currency_code": "USD",
              "unofficial_currency_code": null
            },
            "days_available": 90,
            "historical_balances": [
              {
                "current": 49050,
                "date": "2023-03-29",
                "iso_currency_code": "USD",
                "unofficial_currency_code": null
              },
              {
                "current": 49050,
                "date": "2023-03-28",
                "iso_currency_code": "USD",
                "unofficial_currency_code": null
              }
            ],
            "mask": "1234",
            "name": "Plaid Checking",
            "official_name": "Plaid Gold Checking Account",
            "subtype": "checking",
            "type": "depository"
          }
        ],
        "item_id": "-LpRb7jL40UWDy7o7v94T8gEmP88a7iqaNJxe",
        "institution_id": "INS-a1b2c3d4e5f6",
        "institution_name": "Plaid Bank"
      }
    ]
  }
}
```
```

--------------------------------

### Plaid API Error Response Example (ACCOUNTS_BALANCE_GET_LIMIT)

Source: https://plaid.com/docs/errors/rate-limit-exceeded

Example of an API error response when the rate limit for the /accounts/balance/get endpoint is exceeded. This response includes the error type, a specific error code for balance get limit, and a message.

```json
{
 "error_type": "RATE_LIMIT_EXCEEDED",
 "error_code": "ACCOUNTS_BALANCE_GET_LIMIT",
 "error_message": "rate limit exceeded for attempts to access this item. please try again later",
 "display_message": null,
 "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Plaid API Error Response: USER_SETUP_REQUIRED

Source: https://plaid.com/docs/errors/item

This API error response indicates that the user needs to perform additional setup steps directly at their financial institution before Plaid can access their accounts. The response includes the error type, code, a detailed error message, a user-friendly display message, and a request ID.

```json
{
 "error_type": "ITEM_ERROR",
 "error_code": "USER_SETUP_REQUIRED",
 "error_message": "the account has not been fully set up. prompt the user to visit the issuing institution's site and finish the setup process",
 "display_message": "The given account is not fully setup. Please visit your financial institution's website to setup your account.",
 "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### User Creation for Multi-Item Link

Source: https://plaid.com/docs/link/multi-item-link

Initiates a user for Multi-Item Link by creating a user token.

```APIDOC
## POST /user/create

### Description
Creates a user token to be used for initiating a Multi-Item Link session.

### Method
POST

### Endpoint
/user/create

### Parameters
#### Request Body
- **client_id** (string) - Required - Your Plaid API client ID.
- **secret** (string) - Required - Your Plaid API secret.
- **client_user_id** (string) - Required - Your own internal identifier for the end user.

### Request Example
```json
{
    "client_id": "${PLAID_CLIENT_ID}",
    "secret": "${PLAID_SECRET}",
    "client_user_id" : "c0e2c4ee-b763-4af5-cfe9-46a46bce883d"
}
```

### Response
#### Success Response (200)
- **user_token** (string) - The generated user token.
- **created** (string) - Timestamp of user creation.

#### Response Example
```json
{
  "user_token": "user-sandbox-b0e2c4ee-a763-4df5-bfe9-46a46bce9",
  "created": "2023-10-27T10:00:00Z"
}
```
```

--------------------------------

### Plaid API Error: INVALID_CREDENTIALS Example

Source: https://plaid.com/docs/errors/item

This snippet displays a sample API error response for 'INVALID_CREDENTIALS'. This error indicates that the provided credentials were not correct. The response includes error details and a request ID.

```json
{
  "error_type": "ITEM_ERROR",
  "error_code": "INVALID_CREDENTIALS",
  "error_message": "the provided credentials were not correct",
  "display_message": "The provided credentials were not correct. Please try again.",
  "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Payment Initiation - Sandbox Endpoint for Testing

Source: https://plaid.com/docs/changelog

A new endpoint, `/sandbox/payment/simulate`, has been added to the Payment Initiation product to improve the ease of testing in the Sandbox environment.

```APIDOC
## POST /sandbox/payment/simulate

### Description
Simulates a payment in the Sandbox environment for testing Payment Initiation flows.

### Method
POST

### Endpoint
/sandbox/payment/simulate

### Parameters
#### Query Parameters
None

#### Request Body
- **payment_id** (string) - Required - The ID of the payment to simulate.
- **status** (string) - Required - The desired status to simulate for the payment (e.g., "SUCCEEDED", "FAILED").

### Request Example
```json
{
  "payment_id": "pi_sandbox_abc123xyz",
  "status": "SUCCEEDED"
}
```

### Response
#### Success Response (200)
- **success** (boolean) - Indicates if the simulation was successful.

#### Response Example
```json
{
  "success": true
}
```
```

--------------------------------

### API Error Response Example (PRODUCT_NOT_READY)

Source: https://plaid.com/docs/errors/item

This JSON object represents an API error response from Plaid, specifically indicating that a requested product is not yet ready. This can occur when accessing data before it's fully initialized or available. The error includes details like error type, error code, and a message suggesting to provide a webhook or retry the request.

```json
{
 "error_type": "ITEM_ERROR",
 "error_code": "PRODUCT_NOT_READY",
 "error_message": "the requested product is not yet ready. please provide a webhook or try the request again later",
 "display_message": null,
 "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Plaid onSuccess Event Handler Example (TypeScript)

Source: https://plaid.com/docs/link/react-native

This TypeScript example demonstrates how to handle the onSuccess event from Plaid Link. It shows how to extract the public token and metadata, and then use them to make a POST request to exchange the public token for an access token on your server. This is crucial for accessing user financial data via the Plaid API. Dependencies include the LinkSuccess type from Plaid.

```typescript
const onSuccess = (success: LinkSuccess) => {
  // If using Item-based products, exchange public_token
  // for access_token
  fetch('https://yourserver.com/exchange_public_token', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.Stringify({
      publicToken: linkSuccess.publicToken,
      accounts: linkSuccess.metadata.accounts,
      institution: linkSuccess.metadata.institution,
      linkSessionId: linkSuccess.metadata.linkSessionId,
    }),
  });
};
```

--------------------------------

### Wallet Create

Source: https://plaid.com/docs/api/products/payment-initiation

Create a virtual account (wallet).

```APIDOC
## POST /wallet/create

### Description
Creates a virtual account, referred to as a wallet, which can be used to hold funds for specific purposes, such as managing payment flows.

### Method
POST

### Endpoint
/wallet/create

### Parameters
#### Request Body
- **iso_currency_code** (string) - Required - The ISO 4217 currency code for the wallet (e.g., "GBP", "EUR").
- **description** (string) - Optional - A description for the wallet.

### Request Example
```json
{
  "iso_currency_code": "GBP",
  "description": "Main operational wallet"
}
```

### Response
#### Success Response (201)
- **wallet_id** (string) - A unique identifier for the created wallet.
- **wallet_idempotency_key** (string) - The idempotency key used for the creation request.

#### Response Example
```json
{
  "wallet_id": "va_main_gbp_123",
  "wallet_idempotency_key": "wallet-create-key-xyz"
}
```
```

--------------------------------

### Example Entity Watchlist Screening GET Request Object

Source: https://plaid.com/docs/api/products/monitor

This JSON object represents the structure of a request for the /watchlist_screening/entity/get API endpoint. It includes details for searching watchlist entities, assignee information, status, client user ID, and audit trail.

```json
{
  "id": "entscr_52xR9LKo77r1Np",
  "search_terms": {
    "entity_watchlist_program_id": "entprg_2eRPsDnL66rZ7H",
    "legal_name": "Al-Qaida",
    "document_number": "C31195855",
    "email_address": "user@example.com",
    "country": "US",
    "phone_number": "+14025671234",
    "url": "https://example.com",
    "version": 1
  },
  "assignee": "54350110fedcbaf01234ffee",
  "status": "cleared",
  "client_user_id": "your-db-id-3b24110",
  "audit_trail": {
    "source": "dashboard",
    "dashboard_user_id": "54350110fedcbaf01234ffee",
    "timestamp": "2020-07-24T03:26:02Z"
  },
  "request_id": "saKrIBuEB9qJZng"
}
```

--------------------------------

### API Response Example

Source: https://plaid.com/docs/api/products/transactions

An example of a typical API response, illustrating the structure of account and transaction data.

```APIDOC
## API Response Example

### Description
This example showcases a response from the Plaid API, detailing account information and a list of transactions.

### Response Body Example
```json
{
  "accounts": [
    {
      "account_id": "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp",
      "balances": {
        "available": 110.94,
        "current": 110.94,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "0000",
      "name": "Plaid Checking",
      "official_name": "Plaid Gold Standard 0% Interest Checking",
      "subtype": "checking",
      "type": "depository"
    }
  ],
  "transactions": [
    {
      "account_id": "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp",
      "account_owner": null,
      "amount": 28.34,
      "iso_currency_code": "USD",
      "unofficial_currency_code": null,
      "check_number": null,
      "counterparties": [
        {
          "name": "DoorDash",
          "type": "marketplace",
          "logo_url": "https://plaid-counterparty-logos.plaid.com/doordash_1.png",
          "website": "doordash.com",
          "entity_id": "YNRJg5o2djJLv52nBA1Yn1KpL858egYVo4dpm",
          "confidence_level": "HIGH"
        },
        {
          "name": "Burger King",
          "type": "merchant",
          "logo_url": "https://plaid-merchant-logos.plaid.com/burger_king_155.png",
          "website": "burgerking.com",
          "entity_id": "mVrw538wamwdm22mK8jqpp7qd5br0eeV9o4a1",
          "confidence_level": "VERY_HIGH"
        }
      ],
      "date": "2023-09-28",
      "datetime": "2023-09-28T15:10:09Z",
      "authorized_date": "2023-09-27",
      "authorized_datetime": "2023-09-27T08:01:58Z",
      "location": {
        "address": null,
        "city": null,
        "region": null,
        "postal_code": null,
        "country": null,
        "lat": null,
        "lon": null,
        "store_number": null
      },
      "name": "Dd Doordash Burgerkin",
      "merchant_name": "Burger King",
      "merchant_entity_id": "mVrw538wamwdm22mK8jqpp7qd5br0eeV9o4a1",
      "logo_url": "https://plaid-merchant-logos.plaid.com/burger_king_155.png",
      "website": "burgerking.com",
      "payment_meta": {
        "by_order_of": null,
        "payee": null,
        "payer": null,
        "payment_method": null,
        "payment_processor": null,
        "ppd_id": null,
        "reason": null,
        "reference_number": null
      },
      "payment_channel": "online",
      "pending": true,
      "pending_transaction_id": null,
      "personal_finance_category": {
        "balance_classification": "category_not_found",
        "detailed_category": "category_not_found",
        "primary_category": "category_not_found"
      }
    }
  ],
  "item": {
    "item_id": "wrRvyj5q99H1X36MvVq5u8mB7mZw5Vl9wQeXe",
    "webhook": "https://www.generic-webhook-processor.com/",
    "error": null,
    "available_products": [
      "assets",
      "auth",
      "balance",
      "balance_plus",
      "beacon",
      "identity",
      "identity_match",
      "investments",
      "investments_auth",
      "liabilities",
      "payment_initiation",
      "identity_verification",
      "transactions",
      "credit_details",
      "income",
      "income_verification",
      "standing_orders",
      "transfer",
      "employment",
      "recurring_transactions",
      "transactions_refresh",
      "signal",
      "statements",
      "processor_payments",
      "processor_identity",
      "profile",
      "cra_base_report",
      "cra_income_insights",
      "cra_partner_insights",
      "cra_network_insights",
      "cra_cashflow_insights",
      "cra_monitoring",
      "cra_lend_score",
      "cra_plaid_credit_score",
      "layer",
      "pay_by_bank",
      "protect_linked_bank"
    ],
    "billed_products": [
      "auth",
      "balance",
      "identity",
      "transactions"
    ],
    "consent_expiration_time": null,
    "update_type": "background",
    "institution_id": "INS-800517",
    "institution_name": "Plaid Development"
  }
}
```
```

--------------------------------

### Investments Product Configuration

Source: https://plaid.com/docs/api/link

Configure options for initializing Link for the Investments product.

```APIDOC
## Investments Product Configuration (within Link Token Create Request)

### Description
Configuration parameters for the Investments product.

### Parameters
#### Request Body (within `investments` object)
- **allow_unverified_crypto_wallets** (boolean) - Optional - If `true`, allow self-custody crypto wallets to be added without requiring signature verification. Defaults to `false`.
- **allow_manual_entry** (boolean) - Optional - If `true`, allow users to manually enter Investments account and holdings information. Defaults to `false`.

### Request Example
```json
{
  "investments": {
    "allow_unverified_crypto_wallets": true,
    "allow_manual_entry": false
  }
}
```
```

--------------------------------

### Initialize CocoaPods Podfile

Source: https://plaid.com/docs/link/ios

Command to initialize a new Podfile for CocoaPods dependency management. This creates a basic Podfile in the current directory if one does not exist.

```bash
pod init
```

--------------------------------

### Plaid API Response Example (JSON)

Source: https://plaid.com/docs/api/accounts

This is an example JSON response from the Plaid API, illustrating the structure of account information, item details (including available products, billed products, and update types), and the request ID. It serves as a reference for integrating with the Plaid API.

```json
{
  "accounts": [
    {
      "account_id": "blgvvBlXw3cq5GMPwqB6s6q4dLKB9WcVqGDGo",
      "balances": {
        "available": 100,
        "current": 110,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "holder_category": "personal",
      "mask": "0000",
      "name": "Plaid Checking",
      "official_name": "Plaid Gold Standard 0% Interest Checking",
      "subtype": "checking",
      "type": "depository"
    },
    {
      "account_id": "6PdjjRP6LmugpBy5NgQvUqpRXMWxzktg3rwrk",
      "balances": {
        "available": null,
        "current": 23631.9805,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "6666",
      "name": "Plaid 401k",
      "official_name": null,
      "subtype": "401k",
      "type": "investment"
    },
    {
      "account_id": "XMBvvyMGQ1UoLbKByoMqH3nXMj84ALSdE5B58",
      "balances": {
        "available": null,
        "current": 65262,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "7777",
      "name": "Plaid Student Loan",
      "official_name": null,
      "subtype": "student",
      "type": "loan"
    }
  ],
  "item": {
    "available_products": [
      "balance",
      "identity",
      "payment_initiation",
      "transactions"
    ],
    "billed_products": [
      "assets",
      "auth"
    ],
    "consent_expiration_time": null,
    "error": null,
    "institution_id": "ins_117650",
    "institution_name": "Royal Bank of Plaid",
    "item_id": "DWVAAPWq4RHGlEaNyGKRTAnPLaEmo8Cvq7na6",
    "update_type": "background",
    "webhook": "https://www.genericwebhookurl.com/webhook",
    "auth_method": "INSTANT_AUTH"
  },
  "request_id": "bkVE1BHWMAZ9Rnr"
}
```

--------------------------------

### Plaid API Error: INSUFFICIENT_CREDENTIALS Example

Source: https://plaid.com/docs/errors/item

This snippet shows a sample API error response for 'INSUFFICIENT_CREDENTIALS'. This error occurs when insufficient authorization is provided to complete the request. It includes error type, code, messages, and a request ID.

```json
{
  "error_type": "ITEM_ERROR",
  "error_code": "INSUFFICIENT_CREDENTIALS",
  "error_message": "insufficient authorization was provided to complete the request",
  "display_message": "INSUFFICIENT_CREDENTIALS",
  "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Sandbox Payment Simulate

Source: https://plaid.com/docs/api/products/payment-initiation

Simulate a payment in the Sandbox environment.

```APIDOC
## POST /sandbox/payment/simulate

### Description
Simulates a payment transaction within the Plaid Sandbox environment. This is useful for testing your integration without affecting real accounts.

### Method
POST

### Endpoint
/sandbox/payment/simulate

### Parameters
#### Request Body
- **payment_id** (string) - Required - The ID of the payment to simulate.
- **status** (string) - Required - The desired status for the simulated payment (e.g., "PROCESSED", "FAILED").

### Request Example
```json
{
  "payment_id": "pay_sim_12345",
  "status": "PROCESSED"
}
```

### Response
#### Success Response (200)
- **message** (string) - Confirmation message indicating the simulation was successful.

#### Response Example
```json
{
  "message": "Payment simulation successful."
}
```
```

--------------------------------

### Plaid API Response Object Example

Source: https://plaid.com/docs/api/products/balance

An example JSON object representing a typical response from the Plaid API. It includes details about linked accounts, their balances, and item information.

```json
{
  "accounts": [
    {
      "account_id": "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp",
      "balances": {
        "available": 100,
        "current": 110,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "holder_category": "personal",
      "mask": "0000",
      "name": "Plaid Checking",
      "official_name": "Plaid Gold Standard 0% Interest Checking",
      "subtype": "checking",
      "type": "depository"
    },
    {
      "account_id": "dVzbVMLjrxTnLjX4G66XUp5GLklm4oiZy88yK",
      "balances": {
        "available": null,
        "current": 410,
        "iso_currency_code": "USD",
        "limit": 2000,
        "unofficial_currency_code": null
      },
      "mask": "3333",
      "name": "Plaid Credit Card",
      "official_name": "Plaid Diamond 12.5% APR Interest Credit Card",
      "subtype": "credit card",
      "type": "credit"
    },
    {
      "account_id": "Pp1Vpkl9w8sajvK6oEEKtr7vZxBnGpf7LxxLE",
      "balances": {
        "available": null,
        "current": 65262,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "7777",
      "name": "Plaid Student Loan",
      "official_name": null,
      "subtype": "student",
      "type": "loan"
    }
  ],
  "item": {
    "item_id": "initial-item-id",
    "available_products": [
      "assets",
      "auth",
      "balance",
      "identity",
      "investments",
      "liabilities",
      "transactions"
    ],
    "billed_products": [
      "assets",
      "auth",
      "balance",
      "identity",
      "investments",
      "liabilities",
      "transactions"
    ],
    "error": null,
    "institution_id": "ins_101247",
    "webhook": "https://example.com/webhook",
    "consent_expiration_time": null,
    "update_type": "background"
  }
}
```

--------------------------------

### Opening Link

Source: https://plaid.com/docs/link/react-native

Details on how to create a `link_token` and open the Plaid Link interface using the SDK's `create` and `open` methods.

```APIDOC
## Opening Link

### Description

Details on how to create a `link_token` and open the Plaid Link interface using the SDK's `create` and `open` methods. This functionality requires SDK version 11.6 or later.

### Creating a `link_token`

Before opening Link, you must create a `link_token`. This token is used to configure Link flows and control its behavior. For instructions on creating a `link_token`, refer to the API Reference entry for `/link/token/create`. If your application runs on Android, the `link/token/create` call must include the `android_package_name` parameter. A new `link_token` is required for each Link session.

### Initiating Link Preloading (`create` function)

Use the `create` function to initiate the Link preloading process. This function requires SDK version 11.6 or later.

#### Method
`create`

#### Parameters

*   **`linkTokenConfiguration`** (object) - Required - A configuration object used to open Link with a `link_token`.
    *   **`token`** (string) - Required - The `link_token` to authenticate your app with Link. This is a short-lived, one-time use token. It can also be configured for update mode.
    *   **`noLoadingState`** (boolean) - Optional - Hides the native activity indicator if set to `true`.
    *   **`logLevel`** (string) - Optional - Sets the logging level. Possible values: `DEBUG`, `INFO`, `WARN`, `ERROR`.

#### Request Example

```javascript
import { create } from 'react-native-plaid-link-sdk';

// ...

create({
  token: linkToken,
  noLoadingState: false,
  logLevel: 'INFO',
});

setDisabled(false);
// ...
```

### Opening Link (`open` function)

After calling `create`, invoke the `open` function to display the Link interface. This function also requires SDK version 11.6 or later.

#### Method
`open`

#### Parameters

This function does not take any parameters.

### Legacy `PlaidLink` Component

For SDK versions earlier than 11.6, use the legacy `PlaidLink` component. This component configures Link and registers a callback in a single step, but may have higher user-facing latency compared to the `create` and `open` methods.
```

--------------------------------

### NEW_ACCOUNTS_AVAILABLE Webhook Example

Source: https://plaid.com/docs/api/items

This is an example JSON payload for the NEW_ACCOUNTS_AVAILABLE webhook. It indicates that an item ID is associated with new accounts and that there are no errors. The webhook originates from the 'production' environment.

```json
{
  "webhook_type": "ITEM",
  "webhook_code": "NEW_ACCOUNTS_AVAILABLE",
  "item_id": "gAXlMgVEw5uEGoQnnXZ6tn9E7Mn3LBc4PJVKZ",
  "error": null,
  "environment": "production"
}
```

--------------------------------

### Integration Overview: Retrieving Account Balances

Source: https://plaid.com/docs/balance

This section outlines the steps to integrate the Balance product, focusing on retrieving account balances using the `/accounts/balance/get` endpoint.

```APIDOC
## Integration Overview: Retrieving Account Balances

This guide explains how to integrate with the Balance API to retrieve account balance information.

### Steps

1.  **Initiate Link Token Creation**: Call the `/link/token/create` endpoint. Do **not** include `balance` in the `products` array for this step.
2.  **Client-Side Link Flow**: Use the `link_token` received from the previous step to create an instance of Plaid Link on the client side. Refer to the Link documentation for detailed instructions.
3.  **Token Exchange**: After the user completes the Link flow, exchange the `public_token` for an `access_token` by calling the `/item/public_token/exchange` endpoint.
4.  **Retrieve Account Balances**: Call the `/accounts/balance/get` endpoint, providing the `access_token` obtained in step 3.
```

--------------------------------

### Example API Response for Listing Payment Recipients

Source: https://plaid.com/docs/api/products/payment-initiation

This is an example JSON response from the `/payment_initiation/recipient/list` Plaid API endpoint. It shows the structure of the `recipients` array, including details like `recipient_id`, `name`, `iban`, and `address`. It also includes the `request_id` for tracking.

```json
{
  "recipients": [
    {
      "recipient_id": "recipient-id-sandbox-9b6b4679-914b-445b-9450-efbdb80296f6",
      "name": "Wonder Wallet",
      "iban": "GB29NWBK60161331926819",
      "address": {
        "street": [
          "96 Guild Street",
          "9th Floor"
        ],
        "city": "London",
        "postal_code": "SE14 8JW",
        "country": "GB"
      }
    }
  ],
  "request_id": "4zlKapIkTm8p5KM"
}
```

--------------------------------

### Layer Onboarding

Source: https://plaid.com/docs/check/onboard-users-with-layer

Onboard the user with Layer by creating a Link token and retrieving user-permissioned identity information.

```APIDOC
## POST /session/token/create

### Description
Creates a Link token for user onboarding with Layer, enabling CRA products.

### Method
POST

### Endpoint
/session/token/create

### Parameters
#### Request Body
- **user_token** (string) - Required - The user token created previously.
- **template** (string) - Required - The template used, which must have CRA products enabled.
```

```APIDOC
## GET /user_account/session/get

### Description
Retrieves user-permissioned identity information after Layer onboarding.

### Method
GET

### Endpoint
/user_account/session/get
```

```APIDOC
## PUT /user/update

### Description
Updates the Plaid user record with relevant identity information.

### Method
PUT

### Endpoint
/user/update

### Parameters
#### Request Body
- **consumer_report_user_identity** (string) - Required - The relevant identity information to populate.
```

--------------------------------

### Get Virtual Account Details

Source: https://plaid.com/docs/payment-initiation/virtual-accounts/add-to-app

Fetches the current details of a virtual account, including its balance and account numbers. This is useful for confirming funds before executing a payout.

```APIDOC
## GET /wallet/get

### Description
Retrieves the details of a specific virtual account, including its current balance and associated account numbers.

### Method
GET

### Endpoint
/wallet/get

### Parameters
#### Query Parameters
- **wallet_id** (string) - Required - The unique identifier for the virtual wallet.

### Response
#### Success Response (200)
- **wallet_id** (string) - The unique identifier for the virtual wallet.
- **balance** (object) - The current balance of the virtual wallet.
  - **current** (number) - The current available balance.
  - **iso_currency_code** (string) - The ISO currency code.
- **numbers** (object) - The account numbers associated with the virtual wallet.
  - **ach** (object) - ACH routing and account numbers.
    - **account** (string) - ACH account number.
    - **routing** (string) - ACH routing number.
  - **eft** (object) - EFT routing and account numbers.
    - **account** (string) - EFT account number.
    - **routing** (string) - EFT routing number.

#### Response Example
```json
{
  "wallet_id": "wallet_abc123",
  "balance": {
    "current": 950.00,
    "iso_currency_code": "USD"
  },
  "numbers": {
    "ach": {
      "account": "4100000001",
      "routing": "011000025"
    },
    "eft": {
      "account": "4100000001",
      "routing": "011000025"
    }
  }
}
```
```

--------------------------------

### Asset Report Object Example

Source: https://plaid.com/docs/api/products/assets

An example of the structure of an Asset Report object returned by the Plaid API.

```APIDOC
## Asset Report Object Example

### Description
This is an example of the `report` object returned within an Asset Report response.

### Response Example
```json
{
  "report": {
    "asset_report_id": "028e8404-a013-4a45-ac9e-002482f9cafc",
    "client_report_id": "client_report_id_1221",
    "date_generated": "2023-03-30T18:27:37Z",
    "days_requested": 90,
    "items": [
      {
        "accounts": [
          {
            "account_id": "1qKRXQjk8xUWDJojNwPXTj8gEmR48piqRNye8",
            "balances": {
              "available": 43200,
              "current": 43200,
              "limit": null,
              "margin_loan_amount": null,
              "iso_currency_code": "USD",
              "unofficial_currency_code": null
            },
            "days_available": 90,
            "historical_balances": [
              {
                "current": 49050,
                "date": "2023-03-29",
                "iso_currency_code": "USD",
                "unofficial_currency_code": null
              }
            ],
            "mask": "4444",
            "name": "Plaid Money Market",
            "official_name": "Plaid Platinum Standard 1.85% Interest Money Market",
            "owners": [
              {
                "addresses": [
                  {
                    "data": {
                      "city": "Malakoff",
                      "country": "US",
                      "region": "NY",
                      "street": "2992 Cameron Road",
                      "postal_code": "14236"
                    },
                    "primary": true
                  }
                ],
                "emails": [
                  {
                    "data": "accountholder0@example.com",
                    "primary": true,
                    "type": "primary"
                  }
                ],
                "names": [
                  "Alberta Bobbeth Charleson"
                ],
                "phone_numbers": [
                  // ... phone numbers can be listed here
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```
```

--------------------------------

### Get Consent Events

Source: https://plaid.com/docs/link/data-transparency-messaging-migration-guide

Retrieves historical authorization records. These records are retained for at least 3 years and are crucial for audit requirements and understanding past consent changes.

```APIDOC
## GET /consent/events/get

### Description
Retrieves historical authorization records. These records are retained for at least 3 years and are crucial for audit requirements and understanding past consent changes.

### Method
GET

### Endpoint
/consent/events/get

### Parameters
#### Path Parameters
None

#### Query Parameters
- **start_date** (string) - Optional - The start date for retrieving events (YYYY-MM-DD).
- **end_date** (string) - Optional - The end date for retrieving events (YYYY-MM-DD).
- **limit** (integer) - Optional - The number of events to return.

#### Request Body
None

### Request Example
None

### Response
#### Success Response (200)
- **consent_events** (array) - A list of historical consent events.
  - **event_type** (string) - The type of consent event.
  - **timestamp** (string) - The timestamp of the event.
  - **item_id** (string) - The ID of the associated Item.

#### Response Example
{
  "consent_events": [
    {
      "event_type": "GRANT_CONSENT",
      "timestamp": "2024-01-15T10:30:00Z",
      "item_id": "item_123"
    },
    {
      "event_type": "REVOKE_CONSENT",
      "timestamp": "2024-02-20T15:00:00Z",
      "item_id": "item_456"
    }
  ],
  "next_cursor": "some_cursor_value"
}
```

--------------------------------

### Plaid Environments and Credentials

Source: https://plaid.com/docs/auth/partnerships/rize

Information on using Plaid's Sandbox and Production environments, including how to obtain and use credentials.

```APIDOC
## Plaid Environments and Credentials

### Description
Plaid offers two primary API environments: Sandbox for testing and Production for live use. Understanding how to switch between these and manage credentials is key to a successful integration.

### Sandbox Environment
- **URL:** `https://sandbox.plaid.com`
- **Purpose:** Allows for testing the entire Plaid integration flow with simulated user data. You do not need to request access for Sandbox; it is available immediately.
- **Testing Flow:** When using the `/sandbox/public_token/create` endpoint, the Account Select flow is bypassed, and the `accounts` array will be empty. To get account IDs in Sandbox, you should call `/accounts/get` and use an account ID with a `checking` or `savings` subtype.

### Production Environment
- **URL:** `https://production.plaid.com`
- **Purpose:** The live environment for processing real user data. You must request access to Production via the Plaid Dashboard.
- **Credentials:** You will need valid Rize Production credentials before initiating live traffic with the Rize API via Plaid.

### Credentials Management
- **`PLAID_CLIENT_ID`**: Your Plaid API key.
- **`PLAID_SECRET`**: Your Plaid API secret.
- **`PLAID_ENV`**: Specifies the environment to connect to ('sandbox' or 'production').

### Example Configuration (Node.js)
```javascript
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const plaidClient = new PlaidApi(configuration);
```
```

--------------------------------

### Get Webhook Verification Key (Node.js)

Source: https://plaid.com/docs/api/webhooks/webhook-verification

Example of how to call the `/webhook_verification_key/get` endpoint using the Plaid Node.js client to retrieve a JWK for webhook verification. Requires the `key_id` extracted from the JWT header.

```javascript
const request = {
  key_id: keyID,
};
try {
  const response = await plaidClient.webhookVerificationKeyGet(request);
  const key = response.data.key;
} catch (error) {
  // handle error
}
```

--------------------------------

### Plaid Webhook PAYMENT_STATUS_UPDATE Example (JSON)

Source: https://plaid.com/docs/api/products/payment-initiation

An example JSON object representing a Plaid webhook for a payment status update. This includes details about the payment, status changes, and environment.

```json
{
  "webhook_type": "PAYMENT_INITIATION",
  "webhook_code": "PAYMENT_STATUS_UPDATE",
  "payment_id": "payment-id-production-2ba30780-d549-4335-b1fe-c2a938aa39d2",
  "new_payment_status": "PAYMENT_STATUS_INITIATED",
  "old_payment_status": "PAYMENT_STATUS_PROCESSING",
  "original_reference": "Account Funding 99744",
  "adjusted_reference": "Account Funding 99",
  "original_start_date": "2017-09-14",
  "adjusted_start_date": "2017-09-15",
  "timestamp": "2017-09-14T14:42:19.350Z",
  "environment": "production"
}
```

--------------------------------

### Plaid Legacy Transaction Categories Example

Source: https://plaid.com/docs/transactions/pfc-migration

Illustrates the structure of legacy transaction categories as returned by Plaid's API. This format is being superseded by Personal Finance Categories (PFCs).

```json
{
  "category": [
    "Shops",
    "Computers and Electronics"
  ],
  "category_id": "19013000"
}
```

--------------------------------

### Investments Auth Product Configuration

Source: https://plaid.com/docs/api/link

Configure options for initializing Link for the Investments Move product.

```APIDOC
## Investments Auth Product Configuration (within Link Token Create Request)

### Description
Configuration parameters for the Investments Move product.

### Parameters
#### Request Body (within `investments_auth` object)
- **manual_entry_enabled** (boolean) - Optional - If `true`, show institutions that use the manual entry fallback flow. Defaults to `false`.
- **masked_number_match_enabled** (boolean) - Optional - If `true`, show institutions that use the masked number match fallback flow. Defaults to `false`.
- **stated_account_number_enabled** (boolean) - Optional - If `true`, show institutions that use the stated account number fallback flow. Defaults to `false`.

### Request Example
```json
{
  "investments_auth": {
    "manual_entry_enabled": true,
    "masked_number_match_enabled": false,
    "stated_account_number_enabled": false
  }
}
```
```

--------------------------------

### Plaid Payment Initiation API Response Example

Source: https://plaid.com/docs/api/products/payment-initiation

This is an example of a JSON response object for a payment initiation request in the Plaid API. It outlines key details such as payment ID, status, amount, and recipient information. The `bacs` object contains specific UK bank details.

```json
{
  "payment_id": "payment-id-sandbox-feca8a7a-5591-4aef-9297-f3062bb735d3",
  "payment_token": "payment-token-sandbox-c6a26505-42b4-46fe-8ecf-bf9edcafbebb",
  "reference": "Account Funding 99744",
  "amount": {
    "currency": "GBP",
    "value": 100
  },
  "status": "PAYMENT_STATUS_INPUT_NEEDED",
  "last_status_update": "2019-11-06T21:10:52Z",
  "recipient_id": "recipient-id-sandbox-9b6b4679-914b-445b-9450-efbdb80296f6",
  "bacs": {
    "account": "31926819",
    "account_id": "vzeNDwK7KQIm4yEog683uElbp9GRLEFXGK98D",
    "sort_code": "601613"
  },
  "iban": null,
  "request_id": "aEAQmewMzlVa1k6"
}
```

--------------------------------

### Payment Initiation Payment Create

Source: https://plaid.com/docs/api/products/payment-initiation

Create a new payment to be initiated.

```APIDOC
## POST /payment_initiation/payment/create

### Description
Initiates the creation of a payment. This endpoint is used to set up the details of the payment transaction.

### Method
POST

### Endpoint
/payment_initiation/payment/create

### Parameters
#### Request Body
- **recipient_id** (string) - Required - The ID of the recipient to send the payment to.
- **amount** (integer) - Required - The amount of the payment in the smallest currency unit (e.g., cents for USD, pence for GBP).
- **currency** (string) - Required - The ISO 4217 currency code (e.g., "GBP", "EUR").
- **reference** (string) - Optional - A reference for the payment.
- **schedule** (object) - Optional - Details for scheduled payments.
  - **interval** (string) - Required - The interval for recurring payments (e.g., "DAILY", "WEEKLY", "MONTHLY").
  - **start_date** (string) - Required - The date to start the recurring payments (YYYY-MM-DD).
  - **end_date** (string) - Optional - The date to end the recurring payments (YYYY-MM-DD).

### Request Example
```json
{
  "recipient_id": "ri_abc123xyz",
  "amount": 1000,
  "currency": "GBP",
  "reference": "Invoice #12345"
}
```

### Response
#### Success Response (201)
- **payment_id** (string) - A unique identifier for the created payment.
- **status** (string) - The status of the payment.

#### Response Example
```json
{
  "payment_id": "pay_abc123xyz",
  "status": "PENDING_AUTHORIZATION"
}
```
```

--------------------------------

### Transfer Configuration Get API Response Example

Source: https://plaid.com/docs/api/products/transfer/metrics

This JSON object represents a typical response from the Plaid API's `/transfer/configuration/get` endpoint. It outlines the maximum limits for single, daily, and monthly credit and debit transfers, along with the ISO currency code and a request ID for troubleshooting.

```json
{
  "max_single_transfer_amount": "",
  "max_single_transfer_credit_amount": "1000.00",
  "max_single_transfer_debit_amount": "1000.00",
  "max_daily_credit_amount": "50000.00",
  "max_daily_debit_amount": "50000.00",
  "max_monthly_amount": "",
  "max_monthly_credit_amount": "500000.00",
  "max_monthly_debit_amount": "500000.00",
  "iso_currency_code": "USD",
  "request_id": "saKrIBuEB9qJZno"
}
```

--------------------------------

### GET /payment_initiation/payment/get

Source: https://plaid.com/docs/api/products/payment-initiation

Retrieves the status and basic information of a payment. This endpoint is also used for standing orders to get the status of the overall order, not individual payments.

```APIDOC
## GET /payment_initiation/payment/get

### Description
Retrieves the status and basic information of a payment. This endpoint is also used for standing orders to get the status of the overall order, not individual payments. It is highly discouraged to poll this endpoint for status updates in Production; use the `payment_status_update` webhook instead.

### Method
GET

### Endpoint
/payment_initiation/payment/get

### Parameters
#### Query Parameters
- **client_id** (string) - Required - Your Plaid API `client_id`.
- **secret** (string) - Required - Your Plaid API `secret`.
- **payment_id** (string) - Required - The `payment_id` returned from `/payment_initiation/payment/create`.

### Request Example
```json
{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "payment_id": "payment_abc123"
}
```

### Response
#### Success Response (200)
- **payment_id** (string) - The ID of the payment.
- **amount** (object) - The amount and currency of the payment.
  - **currency** (string) - The ISO-4217 currency code of the payment. Possible values: `GBP`, `EUR`, `PLN`, `SEK`, `DKK`, `NOK`.
  - **value** (number) - The amount of the payment. Must contain at most two digits of precision.
- **status** (string) - The status of the payment. Possible values include `PAYMENT_STATUS_INPUT_NEEDED`, `PAYMENT_STATUS_AUTHORISING`, `PAYMENT_STATUS_INITIATED`, `PAYMENT_STATUS_EXECUTED`, `PAYMENT_STATUS_SETTLED`, `PAYMENT_STATUS_INSUFFICIENT_FUNDS`, `PAYMENT_STATUS_FAILED`, `PAYMENT_STATUS_BLOCKED`, `PAYMENT_STATUS_REJECTED`, `PAYMENT_STATUS_CANCELLED`.

#### Response Example
```json
{
  "payment_id": "payment_abc123",
  "amount": {
    "currency": "GBP",
    "value": 10.50
  },
  "status": "PAYMENT_STATUS_EXECUTED"
}
```
```

--------------------------------

### Identity Verification Product Configuration

Source: https://plaid.com/docs/api/link

Configure options for initializing Link for the Identity Verification product.

```APIDOC
## Identity Verification Product Configuration (within Link Token Create Request)

### Description
Specifies options for initializing Link for use with the Identity Verification product.

### Parameters
#### Request Body (within `identity_verification` object)
- **template_id** (string) - Required - ID of the associated Identity Verification template. Like all Plaid identifiers, this is case-sensitive.
- **gave_consent** (boolean) - Optional - A flag specifying whether the end user has already agreed to a privacy policy specifying that their data will be shared with Plaid for verification purposes. If `gave_consent` is set to `true`, the `accept_tos` step will be marked as `skipped` and the end user's session will start at the next step requirement.

### Request Example
```json
{
  "identity_verification": {
    "template_id": "tmpl_abc123",
    "gave_consent": true
  }
}
```
```

--------------------------------

### Plaid Network Status Get Response Example

Source: https://plaid.com/docs/api/network

This JSON object represents a successful response from the /network/status/get endpoint. It indicates the user's network status ('RETURNING_USER') and includes a unique request ID for troubleshooting.

```json
{
  "network_status": "RETURNING_USER",
  "request_id": "m8MDnv9okwxFNBV"
}
```

--------------------------------

### Statements Product Configuration

Source: https://plaid.com/docs/api/link

Configure options for initializing Link for the Statements product.

```APIDOC
## Statements Product Configuration (within Link Token Create Request)

### Description
Specifies options for initializing Link for use with the Statements product. This field is required for the statements product.

### Parameters
#### Request Body (within `statements` object)
- **start_date** (string) - Required - The start date for statements, in ISO 8601 "YYYY-MM-DD" format, e.g. "2020-10-30". Format: `date`
- **end_date** (string) - Required - The end date for statements, in ISO 8601 "YYYY-MM-DD" format, e.g. "2020-10-30". You can request up to two years of data. Format: `date`

### Request Example
```json
{
  "statements": {
    "start_date": "2022-01-01",
    "end_date": "2022-12-31"
  }
}
```
```

--------------------------------

### Wallet Transaction List Response Example

Source: https://plaid.com/docs/api/products/virtual-accounts

An example of a successful response when listing wallet transactions.

```APIDOC
## GET /wallet/transaction/list Response Example (Success)

### Response Body

```json
{
  "next_cursor": "YWJjMTIzIT8kKiYoKSctYEB",
  "transactions": [
    {
      "transaction_id": "wallet-transaction-id-sandbox-feca8a7a-5591-4aef-9297-f3062bb735d3",
      "wallet_id": "wallet-id-production-53e58b32-fc1c-46fe-bbd6-e584b27a88",
      "type": "PAYOUT",
      "reference": "Payout 99744",
      "amount": {
        "iso_currency_code": "GBP",
        "value": 123.12
      },
      "status": "EXECUTED",
      "created_at": "2020-12-02T21:14:54Z",
      "last_status_update": "2020-12-02T21:15:01Z",
      "counterparty": {
        "numbers": {
          "bacs": {
            "account": "31926819",
            "sort_code": "601613"
          }
        },
        "name": "John Smith"
      },
      "related_transactions": [
        {
          "id": "wallet-transaction-id-sandbox-2ba30780-d549-4335-b1fe-c2a938aa39d2",
          "type": "RETURN"
        }
      ]
    },
    {
      "transaction_id": "wallet-transaction-id-sandbox-feca8a7a-5591-4aef-9297-f3062bb735d3",
      "wallet_id": "wallet-id-production-53e58b32-fc1c-46fe-bbd6-e584b27a88",
      "type": "PAYOUT",
      "reference": "Payout 99744",
      "amount": {
        "iso_currency_code": "EUR",
        "value": 456.78
      },
      "status": "EXECUTED",
      "created_at": "2020-12-02T21:14:54Z",
      "last_status_update": "2020-12-02T21:15:01Z",
      "counterparty": {
        "numbers": {
          "international": {
            "iban": "GB33BUKB20201555555555"
          }
        },
        "name": "John Smith"
      },
      "related_transactions": []
    }
  ],
  "request_id": "4zlKapIkTm8p5KM"
}
```
```

--------------------------------

### Payment Initiation Payment Get

Source: https://plaid.com/docs/api/products/payment-initiation

Fetch payment data by payment ID.

```APIDOC
## GET /payment_initiation/payment/get

### Description
Retrieves the details of a specific payment transaction using its unique ID.

### Method
GET

### Endpoint
/payment_initiation/payment/get

### Parameters
#### Query Parameters
- **payment_id** (string) - Required - The unique identifier of the payment to fetch.

### Response
#### Success Response (200)
- **payment_id** (string) - The unique identifier for the payment.
- **recipient_id** (string) - The ID of the recipient.
- **amount** (integer) - The amount of the payment.
- **currency** (string) - The currency of the payment.
- **reference** (string) - The reference for the payment.
- **status** (string) - The current status of the payment.
- **created_at** (string) - The timestamp when the payment was created.

#### Response Example
```json
{
  "payment_id": "pay_abc123xyz",
  "recipient_id": "ri_abc123xyz",
  "amount": 1000,
  "currency": "GBP",
  "reference": "Invoice #12345",
  "status": "COMPLETED",
  "created_at": "2023-10-27T10:00:00Z"
}
```
```

--------------------------------

### Initializing Products for Data Transparency Messaging

Source: https://plaid.com/docs/link/data-transparency-messaging-migration-guide

This snippet demonstrates how to populate the 'products' field when initializing Plaid Link. It includes the 'additional_consented_products' field for gathering consent for specific products, ensuring all necessary products are accounted for.

```javascript
const linkToken = "YOUR_LINK_TOKEN";

Plaid.create({
  token: linkToken,
  env: 'sandbox',
  onSuccess: function(public_token, metadata) {
    // Send public_token to your app's server to exchange for an access_token
    console.log(public_token, metadata);
  },
  onExit: function(err, metadata) {
    // The user exited the Link flow. Handle this gracefully.
    console.log(err, metadata);
  },
  // Example of how products might be configured, including additional_consented_products
  products: ['transactions', 'auth'],
  additional_consented_products: ['investments', 'credit_report']
});
```

--------------------------------

### Get Item Authorization Details

Source: https://plaid.com/docs/link/data-transparency-messaging-migration-guide

Retrieves current authorization details for an Item, including consented products and use cases. This endpoint is essential for reviewing current consent status and configuring update mode.

```APIDOC
## GET /item/get

### Description
Retrieves current authorization details for an Item, including consented products and use cases. This endpoint is essential for reviewing current consent status and configuring update mode.

### Method
GET

### Endpoint
/item/get

### Parameters
#### Path Parameters
None

#### Query Parameters
- **access_token** (string) - Required - The access token associated with the Item.

#### Request Body
None

### Request Example
None

### Response
#### Success Response (200)
- **item** (object) - Information about the Item.
  - **consented_products** (array) - A list of products the user has consented to.
  - **consented_data_scopes** (array) - A list of data scopes the user has consented to.

#### Response Example
{
  "item": {
    "item_id": "item_123",
    "access_token": "access-development-xxxx",
    "consented_products": ["auth", "identity", "transactions"],
    "consented_data_scopes": ["account_and_balance_info", "contact_info", "transactions"]
  },
  "status": "active"
}
```

--------------------------------

### Create a Payment Initiation Payment (Node.js)

Source: https://plaid.com/docs/payment-initiation/virtual-accounts/add-to-app

Creates a payment to be initiated to a virtual account. Requires a recipient ID, reference, and amount. Outputs the payment ID and status upon success.

```javascript
const request: PaymentInitiationPaymentCreateRequest = {
  recipient_id: recipientID,
  reference: 'TestPayment',
  amount: {
    currency: 'GBP',
    value: 100.0,
  },
};
try {
  const response = await plaidClient.paymentInitiationPaymentCreate(request);
  const paymentID = response.data.payment_id;
  const status = response.data.status;
} catch (error) {
  // handle error
}
```

--------------------------------

### API Error Response: PAYMENT_CANCELLED

Source: https://plaid.com/docs/errors/payment

Example of an API error response when a payment is cancelled by the user during the authorization process. The response includes a user-facing message guiding the user to try again or select a different bank.

```json
{
 "error_type": "PAYMENT_ERROR",
 "error_code": "PAYMENT_CANCELLED",
 "error_message": "user cancelled the payment",
 "display_message": "Try making your payment again or select a different bank to continue.",
 "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Plaid onSuccess Metadata Schema Example

Source: https://plaid.com/docs/link/web

An example of the metadata object structure returned by the Plaid `onSuccess` callback. This object contains details about the institution, associated accounts, and a link session ID.

```json
{
  "institution": {
    "name": "Wells Fargo",
    "institution_id": "ins_4"
  },
  "accounts": [
    {
      "id": "ygPnJweommTWNr9doD6ZfGR6GGVQy7fyREmWy",
      "name": "Plaid Checking",
      "mask": "0000",
      "type": "depository",
      "subtype": "checking",
      "verification_status": null
    },
    {
      "id": "9ebEyJAl33FRrZNLBG8ECxD9xxpwWnuRNZ1V4",
      "name": "Plaid Saving",
      "mask": "1111",
      "type": "depository",
      "subtype": "savings"
    }
    ...
  ],
  "link_session_id": "79e772be-547d-4c9c-8b76-4ac4ed4c441a"
}

```

--------------------------------

### Plaid SDK Event Emitter

Source: https://plaid.com/docs/link/react-native

This section details the event types emitted by the Plaid SDK, such as auth type selection and view transitions. It also provides examples of event data, including timestamps and view names.

```APIDOC
## Plaid Event Types

### Description
This section details the various event types emitted by the Plaid SDK, providing insights into user interactions and flow states within the Plaid Link interface.

### Event Data

- **`flow_type`** (string) - The Auth Type Select flow type selected by the user. Possible values are `flow_type_manual` or `flow_type_instant`. Emitted by: `SELECT_AUTH_TYPE`.
- **`timestamp`** (string) - An ISO 8601 representation of when the event occurred. For example, `2017-09-14T14:42:19.350Z`. Emitted by: _all events_.
- **`viewName`** (LinkEventViewName) - The name of the view that is being transitioned to. Emitted by: `TRANSITION_VIEW`.

### Possible `viewName` Values

- `ACCEPT_TOS`: The view showing Terms of Service in the identity verification flow.
- `CONNECTED`: The user has connected their account.
- `CONSENT`: We ask the user to consent to the privacy policy.
- `CREDENTIAL`: Asking the user for their account credentials.
- `DOCUMENTARY_VERIFICATION`: The view requesting document verification in the identity verification flow.
- `ERROR`: An error has occurred.
- `EXIT`: Confirming if the user wishes to close Link.
- `INSTANT_MICRODEPOSIT_AUTHORIZED`: The user has authorized an instant micro-deposit.
- `KYC_CHECK`: The view representing the "know your customer" step.
- `LOADING`: Link is making a request to our servers.
- `MFA`: The user is asked by the institution for additional MFA authentication.
- `NUMBERS`: The user is asked to insert their account and routing numbers.
- `NUMBERS_SELECT_INSTITUTION`: The user goes through the Same Day micro-deposits flow.
- `OAUTH`: The user is informed they will authenticate with the financial institution via OAuth.
- `PROFILE_DATA_REVIEW`: The user is asked to review their profile data.
- `RECAPTCHA`: The user was presented with a Google reCAPTCHA.
- `RISK_CHECK`: The risk check step in the identity verification flow.
- `SAME_DAY_MICRODEPOSIT_AUTHORIZED`: The user has authorized a same day micro-deposit.
- `SCREENING`: The watchlist screening step.
- `SELECT_ACCOUNT`: We ask the user to choose an account.
- `SELECT_AUTH_TYPE`: The user is asked to choose whether to Link instantly or manually.
- `SELECT_BRAND`: The user is asked to select a brand.
- `SELECT_INSTITUTION`: We ask the user to choose their institution.
- `SELECT_SAVED_ACCOUNT`: The user is asked to select their saved accounts.
- `SELECT_SAVED_INSTITUTION`: The user is asked to pick a saved institution.
- `SELFIE_CHECK`: The view which uses the camera to confirm there is a real user present.
- `SUBMIT_PHONE`: The user is asked for their phone number.
- `UPLOAD_DOCUMENTS`: The user is asked to upload documents.
- `VERIFY_PHONE`: The user is asked to verify their phone.
- `VERIFY_SMS`: The SMS verification step.

### Usage Example

```javascript
usePlaidEmitter((event) => {
  console.log(event);
});
```
```

--------------------------------

### Plaid API Example Response Structure

Source: https://plaid.com/docs/api/products/transactions

This JSON snippet illustrates the basic structure of a Plaid API response, showcasing account information and balances. It serves as a foundational example for understanding how Plaid returns data.

```json
{
  "accounts": [
    {
      "account_id": "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp",
      "balances": {
        "available": 110.94
      }
    }
  ]
}
```

--------------------------------

### Open Plaid Link (Kotlin)

Source: https://plaid.com/docs/layer/add-to-app

Launches the Plaid Link interface using the registered activity result launcher and the created Plaid handler. This action initiates the Plaid connection flow for the user.

```Kotlin
1linkAccountToPlaid.launch(plaidHandler)
```

--------------------------------

### Plaid API Error: INVALID_MFA Example

Source: https://plaid.com/docs/errors/item

This snippet shows a sample API error response for 'INVALID_MFA'. This error signifies that the provided response for Multi-Factor Authentication was invalid. The response contains error type, code, messages, and a request ID.

```json
{
  "error_type": "ITEM_ERROR",
  "error_code": "INVALID_MFA",
  "error_message": "the provided MFA response(s) were not correct",
  "display_message": "The provided MFA responses were not correct. Please try again.",
  "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Sandbox Payment Simulate

Source: https://plaid.com/docs/api/sandbox

Simulates a payment for the Payment Initiation product in the Sandbox environment.

```APIDOC
## POST /sandbox/payment/simulate

### Description
This endpoint simulates a payment event for the Payment Initiation product in the Sandbox environment. This allows you to test various payment statuses and flows without executing real payments.

### Method
POST

### Endpoint
/sandbox/payment/simulate

### Parameters
#### Query Parameters
- **payment_id** (string) - Required - The ID of the payment to simulate.
- **status** (string) - Required - The status to simulate for the payment (e.g., "pending", "succeeded", "failed").

### Request Example
```json
{
  "payment_id": "pay_abcde",
  "status": "succeeded"
}
```

### Response
#### Success Response (200)
- **message** (string) - A confirmation message indicating the payment has been simulated.

#### Response Example
```json
{
  "message": "Payment simulated successfully."
}
```
```

--------------------------------

### Plaid API Object Example

Source: https://plaid.com/docs/api/products/payment-initiation

An example of a Plaid API object, likely representing a payment consent or transaction. It includes fields like request_id, consent_id, status, and constraints for payment amounts and schedules.

```json
{
  "request_id": "4ciYuuesdqSiUAB",
  "consent_id": "consent-id-production-feca8a7a-5491-4aef-9298-f3062bb735d3",
  "status": "AUTHORISED",
  "created_at": "2021-10-30T15:26:48Z",
  "recipient_id": "recipient-id-production-9b6b4679-914b-445b-9450-efbdb80296f6",
  "reference": "ref-00001",
  "constraints": {
    "valid_date_time": {
      "from": "2021-12-25T11:12:13Z",
      "to": "2022-12-31T15:26:48Z"
    },
    "max_payment_amount": {
      "currency": "GBP",
      "value": 100
    },
    "periodic_amounts": [
      {
        "amount": {
          "currency": "GBP",
          "value": 300
        },
        "interval": "WEEK",
        "alignment": "CALENDAR"
      }
    ]
  },
  "type": "SWEEPING"
}
```

--------------------------------

### POST /link/token/create (with Beacon product)

Source: https://plaid.com/docs/beacon

Creates a Link token that includes the `beacon` product, necessary for launching Link and collecting data for Beacon Account Insights.

```APIDOC
## POST /link/token/create

### Description
Creates a Link token to initialize Plaid Link. To enable Beacon Account Insights, ensure the `beacon` product is included in the `products` array.

### Method
POST

### Endpoint
/link/token/create

### Parameters
#### Request Body
- **client_name** (string) - Required - The name of your application shown to the user in Plaid Link.
- **user** (object) - Required - Object containing information about the user.
  - **client_user_id** (string) - Required - A unique identifier for the user in your system.
- **products** (array) - Required - An array of Plaid products to include in the Link token. Must include `"beacon"` for Beacon Account Insights.
- **country_codes** (array) - Required - An array of country codes (e.g., `["US"]`) to be used with Plaid Link.

### Request Example
```json
{
  "client_name": "My App",
  "user": {
    "client_user_id": "unique-user-id-123"
  },
  "products": ["beacon", "auth"],
  "country_codes": ["US"]
}
```

### Response
#### Success Response (200)
- **link_token** (string) - The token used to initialize Plaid Link.
- **expiration** (string) - The expiration date for the link_token, in ISO 8601 format.
- **request_id** (string) - A unique identifier for the request, safe to log.

#### Response Example
```json
{
  "link_token": "link-token-test-1234",
  "expiration": "2024-01-01T12:00:00Z",
  "request_id": "req_abcdef12345"
}
```
```

--------------------------------

### Get User Items - Node.js Example

Source: https://plaid.com/docs/api/users

This Node.js snippet demonstrates how to call the Plaid API to retrieve all Items associated with a specific user. It requires a `user_token` and uses the Plaid client library to make the request. Error handling is included to manage potential issues during the API call.

```javascript
1const request = {
2  user_token: 'user-environment-1234567-abcd-abcd-1234-1234567890ab'
3};
4
5try {
6  const response = await client.userItemsGetRequest(request);
7} catch (error) {
8  // handle error
9}
```

--------------------------------

### Install react-plaid-link Package

Source: https://plaid.com/docs/link/web

Install the react-plaid-link package using either npm or yarn. This package provides the necessary components for integrating Plaid Link into React applications.

```bash
npm install --save react-plaid-link
```

```bash
yarn add react-plaid-link
```

--------------------------------

### Auth Product Initialization Options

Source: https://plaid.com/docs/api/link

Configure the Auth product initialization for Link sessions. This object allows enabling or disabling various authentication flows and verification methods.

```APIDOC
## Auth Product Initialization Options

### Description

Specifies options for initializing Link for use with the Auth product. This field can be used to enable or disable extended Auth flows for the resulting Link session. Omitting any field will result in a default that can be configured by your account manager. The default behavior described in the documentation is the default behavior that will apply if you have not requested your account manager to apply a different default. If you have enabled the Dashboard Account Verification pane, the settings enabled there will override any settings in this object.

### Object

`auth` (object)

#### Fields

- **`auth_type_select_enabled`** (boolean) - Optional - Specifies whether Auth Type Select is enabled for the Link session, allowing the end user to choose between linking via a credentials-based flow (i.e. Instant Auth, Instant Match, Automated Micro-deposits) or a manual flow that does not require login (all other Auth flows) prior to selecting their financial institution. Default behavior is `false`.
- **`automated_microdeposits_enabled`** (boolean) - Optional - Specifies whether the Link session is enabled for the Automated Micro-deposits flow. Default behavior is `false`.
- **`instant_match_enabled`** (boolean) - Optional - Specifies whether the Link session is enabled for the Instant Match flow. Instant Match is enabled by default. Instant Match can be disabled by setting this field to `false`.
- **`same_day_microdeposits_enabled`** (boolean) - Optional - Specifies whether the Link session is enabled for the Same Day Micro-deposits flow. Default behavior is `false`.
- **`instant_microdeposits_enabled`** (boolean) - Optional - Specifies whether the Link session is enabled for the Instant Micro-deposits flow. Default behavior for Plaid teams created after November 2023 is `false`; default behavior for Plaid teams created before that date is `true`.
- **`reroute_to_credentials`** (string) - Optional - Specifies what type of Reroute to Credentials pane should be used in the Link session for the Same Day Micro-deposits flow. Default behavior is `OPTIONAL`. Possible values: `OFF`, `OPTIONAL`, `FORCED`.
- **`sms_microdeposits_verification_enabled`** (boolean) - Optional - Specifies whether the Link session is enabled for SMS micro-deposits verification. Default behavior is `true`.

#### Deprecated Fields

- **`database_match_enabled`** (boolean) - Deprecated, boolean. Database Match has been deprecated and replaced with Database Auth. Use the Account Verification Dashboard to enable Database Auth.
- **`database_insights_enabled`** (boolean) - Deprecated, boolean. Database Insights has been deprecated and replaced with Database Auth. Use the Account Verification Dashboard to enable Database Auth.
- **`flow_type`** (string) - Deprecated, string. This field has been deprecated in favor of `auth_type_select_enabled`. Possible values: `FLEXIBLE_AUTH`.
```

--------------------------------

### Register for Activity Result (Kotlin)

Source: https://plaid.com/docs/layer/add-to-app

Registers a callback to handle the result of the Plaid Link flow using Activity Result APIs. This setup allows your application to receive success or exit events from Plaid Link, enabling appropriate post-flow actions.

```Kotlin
1private val linkAccountToPlaid =
2registerForActivityResult(FastOpenPlaidLink()) {
3  when (it) {
4    is LinkSuccess -> /* handle LinkSuccess */
5    is LinkExit -> /* handle LinkExit */
6  }
7}
```

--------------------------------

### INITIAL_UPDATE Webhook Payload Example

Source: https://plaid.com/docs/api/products/transactions

An example of the JSON payload received for the INITIAL_UPDATE webhook. This payload includes details about the transaction pull, such as the item ID, the number of new transactions, and the environment it originated from. It also contains fields for potential errors.

```json
{
  "webhook_type": "TRANSACTIONS",
  "webhook_code": "INITIAL_UPDATE",
  "item_id": "wz666MBjYWTp2PDzzggYhM6oWWmBb",
  "error": null,
  "new_transactions": 19,
  "environment": "production"
}
```

--------------------------------

### Create Link Token

Source: https://plaid.com/docs/auth/coverage/instant

Creates a `link_token` required to initialize Plaid Link for the Auth product.

```APIDOC
## POST /api/create_link_token

### Description
Creates a `link_token` with specified parameters for initializing Plaid Link. This token is essential for initiating the authentication flow.

### Method
POST

### Endpoint
/api/create_link_token

### Parameters
#### Request Body
- **user** (object) - Required - Contains user-specific information, including `client_user_id`.
  - **client_user_id** (string) - Required - A unique identifier for the current user.
- **client_name** (string) - Required - The name of your application.
- **products** (array) - Required - An array of Plaid products to use. Must contain 'auth' if it's the only product.
- **language** (string) - Optional - The language for Plaid Link, defaults to 'en'.
- **webhook** (string) - Optional - The URL for receiving webhook notifications.
- **redirect_uri** (string) - Optional - The URI for OAuth redirect.
- **country_codes** (array) - Optional - An array of country codes for supported institutions.

### Request Example
```json
{
  "user": {
    "client_user_id": "user-1234"
  },
  "client_name": "Plaid Test App",
  "products": ["auth"],
  "language": "en",
  "webhook": "https://webhook.example.com",
  "redirect_uri": "https://domainname.com/oauth-page.html",
  "country_codes": ["US"]
}
```

### Response
#### Success Response (200)
- **link_token** (string) - The generated link token.
- **expiration_time** (string) - The expiration time of the link token.
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "link_token": "link-token-example",
  "expiration_time": "2024-04-05T16:00:00Z",
  "request_id": "req-example"
}
```
```

--------------------------------

### Plaid Personal Finance Categories (PFCs) Example

Source: https://plaid.com/docs/transactions/pfc-migration

Demonstrates the structure of new Personal Finance Categories (PFCs) from Plaid. This includes primary and detailed categories, confidence level, and an icon URL, offering more granular and accurate transaction insights.

```json
{
  "personal_finance_category": {
    "primary": "GENERAL_MERCHANDISE",
    "detailed": "GENERAL_MERCHANDISE_ELECTRONICS",
    "confidence_level": "VERY_HIGH"
  },
  "personal_finance_category_icon_url": "https://plaid-category-icons.plaid.com/PFC_GENERAL_MERCHANDISE.png"
}
```

--------------------------------

### GET /credit/sessions/get

Source: https://plaid.com/docs/api/products/income

Get Link session metadata and results for the end user. This endpoint retrieves the current status and outcome of a Link session related to income verification.

```APIDOC
## GET /credit/sessions/get

### Description
Get Link session metadata and results for the end user.

### Method
GET

### Endpoint
/credit/sessions/get

### Parameters
#### Query Parameters
- **session_id** (string) - Required - The ID of the Link session.

### Request Example
(No request body for GET requests)

### Response
#### Success Response (200)
- **session_id** (string) - The ID of the Link session.
- **status** (string) - The status of the session (e.g., "complete", "error").
- **result** (object) - The results of the session.

#### Response Example
{
  "session_id": "sess_abcdef123456",
  "status": "complete",
  "result": {
    "income_verification": {
      "status": "succeeded"
    }
  }
}
```

--------------------------------

### Plaid LOGIN_REPAIRED Webhook Object Example

Source: https://plaid.com/docs/api/items

This is an example of the JSON object received when the LOGIN_REPAIRED webhook is fired. It includes the webhook type, code, the associated item ID, and the Plaid environment.

```json
{
  "webhook_type": "ITEM",
  "webhook_code": "LOGIN_REPAIRED",
  "item_id": "wz666MBjYWTp2PDzzggYhM6oWWmBb",
  "environment": "production"
}
```

--------------------------------

### Plaid Asset Report JSON Structure Example

Source: https://plaid.com/docs/assets

An example of the JSON structure for a Plaid Asset Report. This structure includes details about the report itself, associated items, accounts, balances, and owner information.

```json
{
  "report": {
    "asset_report_id": "ebb8f490-8f45-4c93-a6c3-5801bf92c3ff",
    "client_report_id": null,
    "date_generated": "2023-12-18T07:20:25Z",
    "days_requested": 2,
    "items": [
      {
        "accounts": [
          {
            "account_id": "1Gd3X8NmgLFVn47RorabTJ7Bvy8vBqfpaG5Ky",
            "balances": {
              "available": null,
              "current": 320.76,
              "iso_currency_code": "USD",
              "limit": null,
              "unofficial_currency_code": null
            },
            "days_available": 0,
            "historical_balances": [],
            "mask": "5555",
            "name": "Plaid IRA",
            "official_name": null,
            "owners": [
              {
                "addresses": [
                  {
                    "data": {
                      "city": "Malakoff",
                      "country": "US",
                      "postal_code": "14236",
                      "region": "NY",
                      "street": "2992 Cameron Road"
                    },
                    "primary": true
                  }
                ],
                "emails": [
                  {
                    "data": "accountholder0@example.com",
                    "primary": true,
                    "type": "primary"
                  }
                ],
                "names": [
                  "Alberta Bobbeth Charleson"
                ],
                "phone_numbers": [
                  {
                    "data": "1112225555",
                    "primary": false,
                    "type": "mobile"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

--------------------------------

### Transactions Product Configuration

Source: https://plaid.com/docs/api/link

Configure options for initializing Link for the Transactions product.

```APIDOC
## Transactions Product Configuration (within Link Token Create Request)

### Description
Configuration parameters for the Transactions product.

### Parameters
#### Request Body (within `transactions` object)
- **days_requested** (integer) - Optional - The maximum number of days of transaction history to request for the Transactions product. The more transaction history is requested, the longer the historical update poll will take. The default value is 90 days. If a value under 30 is provided, a minimum of 30 days of history will be requested. Once Transactions has been added to an Item, this value cannot be updated. Customers using Recurring Transactions should request at least 180 days of history for optimal results. Minimum: `1`, Maximum: `730`, Default: `90`.

### Request Example
```json
{
  "transactions": {
    "days_requested": 180
  }
}
```
```

--------------------------------

### Get Public Token from Plaid onSuccess Callback

Source: https://plaid.com/docs/layer/add-to-app

Captures the 'public_token' from the onSuccess callback, which is invoked upon successful completion of the Plaid Link flow. This token is essential for backend processing and should be sent to your server. The input is the success object containing the public token.

```Kotlin
val profileToken = success.publicToken
// Send the public token to your backend
```

```Swift
onSuccess: { linkSuccess in
}
// Send the public token to your backend
```

```JavaScript
const onSuccess = (success: LinkSuccess) => {
  let publicToken =  linkSuccess.publicToken
  // Send the public token to your backend
};
```

```JavaScript
onSuccess: (public_token) => {
  const publicToken = public_token
  // Send the public token to your backend
};
```

--------------------------------

### Transfer Intent Get API Response Example

Source: https://plaid.com/docs/api/products/transfer/account-linking

This JSON object represents a successful response from the /transfer/intent/get API endpoint. It includes details about the transfer, such as account IDs, amount, currency, status, and user information. It also contains a unique request ID for troubleshooting.

```json
{
  "transfer_intent": {
    "account_id": "3gE5gnRzNyfXpBK5wEEKcymJ5albGVUqg77gr",
    "funding_account_id": "9853defc-e703-463d-86b1-dc0607a45359",
    "ach_class": "ppd",
    "amount": "12.34",
    "iso_currency_code": "USD",
    "created": "2020-08-06T17:27:15Z",
    "description": "Desc",
    "id": "460cbe92-2dcc-8eae-5ad6-b37d0ec90fd9",
    "metadata": {
      "key1": "value1",
      "key2": "value2"
    },
    "mode": "PAYMENT",
    "origination_account_id": "9853defc-e703-463d-86b1-dc0607a45359",
    "status": "PENDING",
    "user": {
      "address": {
        "street": "100 Market Street",
        "city": "San Francisco",
        "region": "CA",
        "postal_code": "94103",
        "country": "US"
      },
      "email_address": "acharleston@email.com",
      "legal_name": "Anne Charleston",
      "phone_number": "123-456-7890"
    }
  },
  "request_id": "saKrIBuEB9qJZno"
}
```

--------------------------------

### Investments Refresh Response Example

Source: https://plaid.com/docs/api/products/investments

This is an example of the JSON response received after a successful call to the /investments/refresh endpoint. The response primarily contains a `request_id`, which is a unique identifier for the request used for troubleshooting purposes.

```json
1{
2  "request_id": "1vwmF5TBQwiqfwP"
3}
```

--------------------------------

### Example: Refreshing Item Consent with Update Mode

Source: https://plaid.com/docs/link/oauth

Demonstrates the concept of refreshing an Item's consent using Plaid's update mode, which is crucial when consent expires, especially in regions like Europe. This is a conceptual example; actual implementation requires calling the Plaid API.

```javascript
// Conceptual example of initiating an update mode flow to refresh consent
// Replace with actual Plaid SDK calls and parameters

async function refreshItemConsent(itemId, linkToken) {
  // In a real application, you would likely use the link_token generated
  // for update mode to re-launch Link or make an API call.
  console.log(`Attempting to refresh consent for item: ${itemId}`);

  // Example: Imagine a function that re-initializes Link in update mode
  // launchLink({ token: linkToken, mode: 'update', onSuccess: handleSuccess, onExit: handleExit });

  // Or, if using the Plaid API directly for update:
  // const response = await plaidClient.itemUpdate(linkToken, {
  //   // ... parameters for update mode ...
  // });
  // console.log('Update response:', response);

  // This is a placeholder to illustrate the concept.
  // The actual implementation depends on your integration's architecture.
  console.log('Refer to Plaid documentation for specific API calls or SDK usage.');
}

// Example usage (assuming you have an item ID and a link token for update mode):
// const itemId = 'some-item-id';
// const updateLinkToken = 'generated-link-token-for-update';
// refreshItemConsent(itemId, updateLinkToken);
```

--------------------------------

### Plaid PARTNER_END_CUSTOMER_OAUTH_STATUS_UPDATED Webhook Example (JSON)

Source: https://plaid.com/docs/api/partner

This JSON object represents an example payload for the PARTNER_END_CUSTOMER_OAUTH_STATUS_UPDATED webhook. It includes details about the webhook type, code, end customer, environment, institution, and the OAuth status.

```json
{
  "webhook_type": "PARTNER",
  "webhook_code": "END_CUSTOMER_OAUTH_STATUS_UPDATED",
  "end_customer_client_id": "634758733ebb4f00134b85ea",
  "environment": "production",
  "institution_id": "ins_127989",
  "institution_name": "Bank of America",
  "status": "attention-required"
}
```

--------------------------------

### Balance Plus Launch (Beta)

Source: https://plaid.com/docs/changelog

Launched Balance Plus (beta), an enhancement to Plaid's Balance product offering additional insights, lower latency, and minimal integration effort for existing Balance customers.

```APIDOC
## Balance Plus Launch (Beta)

### Description
Launched Balance Plus (beta). Balance Plus enhances Plaid's Balance product with additional insights and lower latency and is designed to require minimal integration work for existing Balance customers.

### Method
N/A (Product Feature)

### Endpoint
N/A (Product Feature)

### Parameters
N/A

### Request Example
N/A

### Response
N/A
```

--------------------------------

### Create Payment Request with Account Restrictions

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/user-onboarding-and-account-funding

Creates a payment request, allowing for restrictions on the source account to comply with KYC & AML regulations. This involves providing specific account details (like BACS account and sort code for the UK) under the `options` object. Not all institutions support this feature, and Plaid may allow account selection if support is limited.

```shell
curl -X POST https://sandbox.plaid.com/payment_initiation/payment/create \
-H 'Content-Type: application/json' \
-d '{ \
  "client_id": "${PLAID_CLIENT_ID}", \
  "secret": "${PLAID_SECRET}", \
  "recipient_id": "${RECIPIENT_ID}", \
  "reference": "Sample reference", \
  "amount": { \
    "currency": "GBP", \
    "amount": 1.99 \
  }, \
  "options": { // additional payee account restriction \
    "bacs": { \
        "account": "26207729", \
        "sort_code": "560029" \
    } \
  } \
}'
```

--------------------------------

### Plaid API Error Response: INCORRECT_OAUTH_NONCE

Source: https://plaid.com/docs/errors/oauth

This JSON response indicates an 'INCORRECT_OAUTH_NONCE' error from the Plaid API. It occurs when a mismatched nonce is supplied during the re-initialization of Plaid Link after the OAuth flow. Ensure the same nonce used for initial Link setup is reused for re-initialization.

```json
{
  "error_type": "OAUTH_ERROR",
  "error_code": "INCORRECT_OAUTH_NONCE",
  "error_message": "nonce does not match",
  "display_message": null,
  "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Payment Initiation Recipient Get

Source: https://plaid.com/docs/api/products/payment-initiation

Fetch recipient data for payment initiation.

```APIDOC
## GET /payment_initiation/recipient/get

### Description
Fetches the details of a specific recipient based on their unique ID.

### Method
GET

### Endpoint
/payment_initiation/recipient/get

### Parameters
#### Query Parameters
- **recipient_id** (string) - Required - The unique identifier of the recipient to fetch.

### Response
#### Success Response (200)
- **recipient_id** (string) - The unique identifier for the recipient.
- **name** (string) - The name of the recipient.
- **iban** (string) - The IBAN of the recipient.
- **address** (string) - The physical address of the recipient.
- **status** (string) - The current status of the recipient.

#### Response Example
```json
{
  "recipient_id": "ri_abc123xyz",
  "name": "John Doe",
  "iban": "GB29 NWBK 6016 1331 9268 19",
  "address": "1st Floor, 123 Street, London, UK",
  "status": "ACTIVE"
}
```
```

--------------------------------

### Plaid Item Object Example

Source: https://plaid.com/docs/api/items

This is an example of a Plaid Item object, which represents a connection to a financial institution. It includes details about available and billed products, creation time, and institution information.

```json
{
  "item": {
    "created_at": "2019-01-22T04:32:00Z",
    "available_products": [
      "balance",
      "auth"
    ],
    "billed_products": [
      "identity",
      "transactions"
    ],
    "products": [
      "identity",
      "transactions"
    ],
    "error": null,
    "institution_id": "ins_109508",
    "institution_name": "First Platypus Bank"
  }
}
```

--------------------------------

### Upload Documentation for Originator Onboarding (Node.js)

Source: https://plaid.com/docs/api/products/transfer/platform-payments

This Node.js snippet demonstrates how to upload documentation for originator onboarding using the `/transfer/platform/document/submit` endpoint. It utilizes the `node-fetch` and `form-data` libraries to construct and send a `multipart/form-data` request. Ensure you have these dependencies installed. The input includes originator client ID, the document file path, and the requirement type. The output is a JSON response containing a request ID.

```javascript
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

const form = new FormData();
form.append('originator_client_id', '6a65dh3d1h0d1027121ak184');
form.append('document_submission', fs.createReadStream('/path/to/sample/file.txt'));
form.append('requirement_type', 'BUSINESS_ADDRESS_VALIDATION');

const res = await fetch(`https://sandbox.plaid.com/transfer/platform/document/submit`, {
  method: 'POST',
  headers: {
    'Plaid-Client-ID': '<CLIENT_ID>',
    'Plaid-Secret': '<SECRET>',
    ...form.getHeaders(),
  },
  body: form,
});
const data = await res.json();

```

--------------------------------

### Plaid API Error Response: MFA Not Supported

Source: https://plaid.com/docs/errors/item

This is an example of an API error response from Plaid when a user's account requires multi-factor authentication (MFA) that is not currently supported by the institution. It includes details like error type, code, messages, and a request ID for further investigation.

```json
{
 "error_type": "ITEM_ERROR",
 "error_code": "MFA_NOT_SUPPORTED",
 "error_message": "this account requires a MFA type that we do not currently support for the institution",
 "display_message": "The multi-factor security features enabled on this account are not currently supported for this financial institution. We apologize for the inconvenience.",
 "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Payment Initiation Consent Get

Source: https://plaid.com/docs/api/products/payment-initiation

Fetch payment consent data by consent ID.

```APIDOC
## GET /payment_initiation/consent/get

### Description
Retrieves the details of a specific payment consent using its unique ID.

### Method
GET

### Endpoint
/payment_initiation/consent/get

### Parameters
#### Query Parameters
- **consent_id** (string) - Required - The unique identifier of the payment consent to fetch.

### Response
#### Success Response (200)
- **consent_id** (string) - The unique identifier for the consent.
- **reference_id** (string) - The reference ID provided during creation.
- **amount** (integer) - The maximum amount allowed under the consent.
- **currency** (string) - The currency of the consent.
- **sub** (string) - The user's Plaid identifier.
- **scopes** (array of strings) - The granted scopes.
- **status** (string) - The current status of the consent.
- **created_at** (string) - The timestamp when the consent was created.

#### Response Example
```json
{
  "consent_id": "con_abc123xyz",
  "reference_id": "my-consent-ref-123",
  "amount": 10000,
  "currency": "GBP",
  "sub": "user_abcdefg",
  "scopes": ["PAYMENT_INITIATION_DEBIT"],
  "status": "AUTHORISED",
  "created_at": "2023-10-27T09:00:00Z"
}
```
```

--------------------------------

### Plaid Accounts Schema Example

Source: https://plaid.com/docs/link/webview

An example of the JSON structure for the 'accounts' object returned with the 'connected' event. This schema details the properties for each account, including ID, metadata, type, subtype, and verification status.

```json
"accounts": [
  {
    "_id": "ygPnJweommTWNr9doD6ZfGR6GGVQy7fyREmWy",
    "meta": {
      "name": "Plaid Checking",
      "number": "0000"
    },
    "type": "depository",
    "subtype": "checking",
    "verification_status": null
  },
  {
    "_id": "9ebEyJAl33FRrZNLBG8ECxD9xxpwWnuRNZ1V4",
    "meta": {
      "name": "Plaid Saving",
      "number": "1111"
    },
    "type": "depository",
    "subtype": "savings"
  }
  ...
]
```

--------------------------------

### Launch Plaid Link with JavaScript

Source: https://plaid.com/docs/auth/partnerships/apex-clearing

This JavaScript snippet demonstrates how to initialize and launch Plaid Link on the client-side. It requires a link_token fetched from your server and handles successful authentication by sending data to your backend. Dependencies include the Plaid Link JavaScript SDK.

```javascript
var linkHandler = Plaid.create({
  // Make a request to your server to fetch a new link_token.
  token: (await $.post('/create_link_token')).link_token,
  onSuccess: function(public_token, metadata) {
    // The onSuccess function is called when the user has successfully
    // authenticated and selected an account to use.
    //
    // When called, you will send the public_token and the selected accounts,
    // metadata.accounts, to your backend app server.
    sendDataToBackendServer({
       public_token: public_token,
       accounts: metadata.accounts
    });
  },
  onExit: function(err, metadata) {
    // The user exited the Link flow.
    if (err != null) {
        // The user encountered a Plaid API error prior to exiting.
    }
    // metadata contains information about the institution
    // that the user selected and the most recent API request IDs.
    // Storing this information can be helpful for support.
  },
});

// Trigger the authentication view
document.getElementById('linkButton').onclick = function() {
  // Link will automatically detect the institution ID
  // associated with the public token and present the
  // credential view to your user.
  linkHandler.open();
};
```

--------------------------------

### Plaid API Error Response Example (JSON)

Source: https://plaid.com/docs/errors/item

This snippet shows a typical API error response from Plaid when an item linking operation fails due to a timeout. It includes error type, code, and user-facing messages. This response is crucial for diagnosing and resolving user-specific linking issues.

```json
{
  "error_type": "ITEM_ERROR",
  "error_code": "USER_INPUT_TIMEOUT",
  "error_message": "user must retry this operation",
  "display_message": "The application timed out waiting for user input",
  "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### POST /link/token/create - Preselect Institution

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/user-onboarding-and-account-funding

Creates a link token that preselects a specific financial institution for the user, enhancing conversion by skipping manual selection.

```APIDOC
## POST /link/token/create

### Description
Creates a link token that can be used to initiate Plaid Link. This endpoint can preselect a financial institution if the `institution_id` is provided.

### Method
POST

### Endpoint
https://sandbox.plaid.com/link/token/create

### Parameters
#### Query Parameters
None

#### Request Body
- **client_id** (string) - Required - Your Plaid API client ID.
- **secret** (string) - Required - Your Plaid API secret.
- **client_name** (string) - Required - The name of your application.
- **user** (object) - Required - User object containing `client_user_id`.
  - **client_user_id** (string) - Required - A unique identifier for the user.
- **products** (array of strings) - Required - An array of products to use, e.g., `["payment_initiation"]`.
- **country_codes** (array of strings) - Required - An array of country codes (e.g., `["GB", "NL", "DE"]`).
- **language** (string) - Optional - The language to use for Plaid Link (default: `en`).
- **webhook** (string) - Optional - The URL to receive webhooks.
- **payment_initiation** (object) - Optional - Configuration for payment initiation.
  - **payment_id** (string) - Required if `payment_initiation` is present - The ID of the payment.
- **institution_id** (string) - Optional - The ID of the institution to preselect.

### Request Example
```json
{
  "client_id": "${PLAID_CLIENT_ID}",
  "secret": "${PLAID_SECRET}",
  "client_name": "Plaid Test App",
  "user": { "client_user_id": "${UNIQUE_USER_ID}" },
  "products": ["payment_initiation"],
  "country_codes": ["GB", "NL", "DE"],
  "language": "en",
  "webhook": "https://webhook.sample.com",
  "payment_initiation": { "payment_id": "${PAYMENT_ID}" },
  "institution_id": "${INSTITUTION_ID}" 
}
```

### Response
#### Success Response (200)
- **link_token** (string) - The link token to be used in Plaid Link.
- **expiration** (string) - The expiration date of the link token.
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "link_token": "link-token-xxxxxxxxxxxx",
  "expiration": "2023-10-27T23:59:59Z",
  "request_id": "req_xxxxxxxxxxxx"
}
```
```

--------------------------------

### Investments Move Integration Overview

Source: https://plaid.com/docs/investments-move

This section outlines the general steps to integrate Investments Move, from token creation to fetching investment data.

```APIDOC
## Overview of Investments Move Integration

This integration allows for the automation of ACATS (Automated Customer Account Transfer Service) transfers in the US and ATON transfers in Canada by leveraging broker-sourced data.

### Integration Steps

1.  **Create Link Token:** Call the `/link/token/create` endpoint. Ensure the `products` array includes `"investments_auth"`. Optionally, configure fallback flows by setting flags within the `investments_auth` object (e.g., `masked_number_match_enabled`, `stated_account_number_enabled`, `manual_entry_enabled`).
2.  **Initialize Plaid Link:** On the client-side, use the `link_token` obtained from the previous step to instantiate Plaid Link.
3.  **Exchange Public Token:** After the user completes the Link flow, exchange the `public_token` for an `access_token` by calling the `/item/public_token/exchange` endpoint.
4.  **Fetch Investment Data:** Use the obtained `access_token` to call the `/investments/auth/get` endpoint. This endpoint returns the necessary data for initiating an ACATS transfer, including account holder name, account number, and DTC number.
```

--------------------------------

### Plaid API Error Response: PRODUCTS_NOT_SUPPORTED

Source: https://plaid.com/docs/errors/item

This is an example of an API error response from Plaid when a requested product is not supported by the user's institution. It includes error type, code, and a request ID for debugging. This typically occurs when trying to access a product that the institution does not allow via Plaid.

```json
{
 "error_type": "ITEM_ERROR",
 "error_code": "PRODUCTS_NOT_SUPPORTED",
 "error_message": "",
 "display_message": null,
 "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Plaid API Object Example

Source: https://plaid.com/docs/api/products/payment-initiation

This JSON object represents an example of an API response for payment status. It includes fields like 'payment_id', 'request_id', and 'status'. This structure is common for requests related to payment processing.

```json
{
  "payment_id": "payment-id-sandbox-feca8a7a-5591-4aef-9297-f3062bb735d3",
  "request_id": "4ciYccesdqSiUAB",
  "status": "PAYMENT_STATUS_INITIATED"
}
```

--------------------------------

### GET /payment_initiation/payment/list

Source: https://plaid.com/docs/changelog

Retrieves a list of payment initiations, including the amount refunded for each.

```APIDOC
## GET /payment_initiation/payment/list

### Description
Retrieves a list of payment initiations.

### Method
GET

### Endpoint
/payment_initiation/payment/list

### Response
#### Success Response (200)
- **payments** (array) - A list of payment objects.
  - **amount_refunded** (integer) - The amount that has been refunded for this payment.

#### Response Example
```json
{
  "payments": [
    {
      "payment_id": "pay_abc123",
      "amount": 10000,
      "amount_refunded": 5000
    }
  ]
}
```
```

--------------------------------

### Plaid Layer Launch

Source: https://plaid.com/docs/changelog

Plaid Layer has been launched to early availability. Layer offers a fast, high-converting onboarding experience powered by Plaid Link.

```APIDOC
## Plaid Layer Launch

### Description
Launched Plaid Layer to early availability. Layer provides a fast, high-converting onboarding experience powered by Plaid Link.

### Method
N/A (Product Feature)

### Endpoint
N/A (Product Feature)

### Parameters
N/A

### Request Example
N/A

### Response
N/A
```

--------------------------------

### USER_SETUP_REQUIRED Error

Source: https://plaid.com/docs/errors/item

Details for the USER_SETUP_REQUIRED error, indicating that the user must perform actions at their financial institution.

```APIDOC
## USER_SETUP_REQUIRED

### Description
This error signifies that the user must log in directly to their financial institution and complete certain actions before Plaid can access their accounts.

### Method
N/A (This is an error response, not an endpoint)

### Endpoint
N/A

### Parameters
N/A

### Request Example
N/A

### Response
#### Success Response (200)
N/A

#### Error Response (400)
- **error_type** (string) - ITEM_ERROR
- **error_code** (string) - USER_SETUP_REQUIRED
- **error_message** (string) - The account has not been fully set up. Prompt the user to visit the issuing institution's site and finish the setup process.
- **display_message** (string) - The given account is not fully setup. Please visit your financial institution's website to setup your account.
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "error_type": "ITEM_ERROR",
  "error_code": "USER_SETUP_REQUIRED",
  "error_message": "the account has not been fully set up. prompt the user to visit the issuing institution's site and finish the setup process",
  "display_message": "The given account is not fully setup. Please visit your financial institution's website to setup your account.",
  "request_id": "HNTDNrA8F1shFEW"
}
```

### Troubleshooting
1. Request that the user log in and complete their account setup directly at their institution.
2. Advise the user to check for updated terms and conditions, password resets, or additional account information requirements.
3. Instruct the user to look for settings like 'third party application password' or 'allow third party access' on their bank's website.
4. Once setup is complete, prompt the user to re-authenticate with Plaid Link.
5. If issues persist, submit a 'Invalid credentials errors' Support ticket with `access_token`, `institution_id`, and either `link_session_id` or `request_id`.
```

--------------------------------

### POST /beacon/user/create

Source: https://plaid.com/docs/beacon

Creates a new user in the Beacon network. This is the initial step to onboard a user into the fraud detection system. You can optionally include a `report` object to backfill existing data or flag known fraudulent users.

```APIDOC
## POST /beacon/user/create

### Description
Creates a new user in the Beacon network. This is the initial step to onboard a user into the fraud detection system. You can optionally include a `report` object to backfill existing data or flag known fraudulent users.

### Method
POST

### Endpoint
`/beacon/user/create`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **client_user_id** (string) - Required - A unique identifier for the end user.
- **report** (object) - Optional - Contains information about known fraud instances for the user.
  - **fraud_type** (string) - Required (if report is present) - The type of fraud reported (e.g., 'synthetic_identity', 'account_takeover').
  - **data** (object) - Optional - Additional data related to the fraud report.

### Request Example
```json
{
  "client_user_id": "user-12345",
  "report": {
    "fraud_type": "synthetic_identity",
    "data": {
      "email": "test@example.com"
    }
  }
}
```

### Response
#### Success Response (200)
- **user_id** (string) - The unique identifier for the created user in Beacon.
- **status** (string) - The status of the user (e.g., 'active', 'flagged').

#### Response Example
```json
{
  "user_id": "beaconuser_abcde12345",
  "status": "active"
}
```
```

--------------------------------

### API Error Response Example

Source: https://plaid.com/docs/errors/invalid-request

This JSON object represents a typical API error response from Plaid. It includes error type, code, a descriptive error message, and a request ID for tracking. This structure helps developers identify and resolve issues with API requests, such as unrecognized fields.

```json
1http code 400
2{
3 "error_type": "INVALID_REQUEST",
4 "error_code": "UNKNOWN_FIELDS",
5 "error_message": "the following fields are not recognized by this endpoint: {fields}",
6 "display_message": null,
7 "request_id": "HNTDNrA8F1shFEW"
8}
```

--------------------------------

### Plaid API Access Token Object Example

Source: https://plaid.com/docs/api/oauth

An example of the API object returned when an access token is successfully generated or refreshed. This object contains tokens for access and refresh, expiration information, and a request ID for troubleshooting.

```json
{
  "access_token": "pda-RDdg0TUCB0FB25_UPIlnhA==",
  "refresh_token": "pdr--viXurkDg88d5zf8m6Wl0g==",
  "expires_in": 900,
  "token_type": "Bearer",
  "request_id": "m8MDqcS6F3lzqvP"
}
```

--------------------------------

### Payment Initiation Consent Create

Source: https://plaid.com/docs/api/products/payment-initiation

Create a payment consent to authorize future payments.

```APIDOC
## POST /payment_initiation/consent/create

### Description
Creates a payment consent, which is an authorization given by the user to initiate payments on their behalf. This is a prerequisite for executing payments.

### Method
POST

### Endpoint
/payment_initiation/consent/create

### Parameters
#### Request Body
- **reference_id** (string) - Required - A unique identifier for the consent, generated by your application.
- **amount** (integer) - Required - The maximum amount that can be paid under this consent.
- **currency** (string) - Required - The ISO 4217 currency code for the consent.
- **sub** (string) - Required - The user's Plaid identifier.
- **scopes** (array of strings) - Required - The permissions granted by the consent (e.g., "PAYMENT_INITIATION_DEBIT").
- **institution_id** (string) - Optional - The ID of the financial institution to connect to.

### Request Example
```json
{
  "reference_id": "my-consent-ref-123",
  "amount": 10000,
  "currency": "GBP",
  "sub": "user_abcdefg",
  "scopes": ["PAYMENT_INITIATION_DEBIT"]
}
```

### Response
#### Success Response (201)
- **consent_id** (string) - A unique identifier for the created consent.
- **status** (string) - The status of the consent.
- **link_token** (string) - A token to be used with Plaid Link to initiate the user authorization flow.

#### Response Example
```json
{
  "consent_id": "con_abc123xyz",
  "status": "PENDING_AUTHORIZATION",
  "link_token": "link_test_abcdefg..."
}
```
```

--------------------------------

### Plaid Asset Report API Response Example

Source: https://plaid.com/docs/api/products/assets

An example JSON response from the Plaid Asset Report API, showcasing the structure of a generated report. It includes report identifiers, generation date, requested days, and detailed account information with balances and historical data.

```json
{
  "report": {
    "asset_report_id": "028e8404-a013-4a45-ac9e-002482f9cafc",
    "client_report_id": "client_report_id_1221",
    "date_generated": "2023-03-30T18:27:37Z",
    "days_requested": 90,
    "items": [
      {
        "accounts": [
          {
            "account_id": "1qKRXQjk8xUWDJojNwPXTj8gEmR48piqRNye8",
            "balances": {
              "available": 43200,
              "current": 43200,
              "limit": null,
              "margin_loan_amount": null,
              "iso_currency_code": "USD",
              "unofficial_currency_code": null
            },
            "days_available": 90,
            "historical_balances": [
              {
                "current": 49050,
                "date": "2023-03-29",
                "iso_currency_code": "USD",
                "unofficial_currency_code": null
              },
              {
                "current": 49050,
                "date": "2023-03-28",
                "iso_currency_code": "USD",
                "unofficial_currency_code": null
              },
              {
                "current": 49050,
                "date": "2023-03-27",
                "iso_currency_code": "USD",
                "unofficial_currency_code": null
              },
              {
                "current": 49050,
                "date": "2023-03-26",
                "iso_currency_code": "USD",
                "unofficial_currency_code": null
              }
            ]
          }
        ]
      }
    ]
  }
}
```

--------------------------------

### Initiating an Instant Payout via RTP or FedNow

Source: https://plaid.com/docs/transfer/creating-transfers

Instructions on how to initiate instant payout transfers using the RTP or FedNow networks by specifying the network in the `/transfer/authorization/create` call.

```APIDOC
## Initiating an Instant Payout via RTP or FedNow

### Description
This guide explains how to initiate an Instant Payout transfer using either the RTP or FedNow network. It covers specifying the network, checking account eligibility, and understanding limitations.

### Method:
Initiating an Instant Payout transfer via RTP or FedNow functions similarly to initiating an ACH transfer. To do so, specify `network=rtp` when calling `/transfer/authorization/create`.

*   `network=rtp`: This refers to all real-time payment rails. Plaid will automatically route between The Clearing House (TCH) Real Time Payment rail or FedNow rails as necessary.

### Eligibility and Error Handling:
*   Approximately 70% of US accounts are eligible to receive Instant Payouts.
*   If an account is ineligible, `/transfer/authorization/create` will return an `INVALID_FIELD` error code with a message indicating ineligibility.
*   To check account eligibility *before* calling `/transfer/authorization/create`, use the `/transfer/capabilities/get` endpoint.

### Transfer Type Limitation:
*   Only `credit` style transfers (funds being sent *to* a user) can be processed using Instant Payout transfers.
```

--------------------------------

### Plaid API Error Response: INCORRECT_LINK_TOKEN

Source: https://plaid.com/docs/errors/oauth

This JSON response signifies an 'INCORRECT_LINK_TOKEN' error from the Plaid API. This error arises if a different link_token is provided during Plaid Link re-initialization compared to the one used for the initial setup within the OAuth flow. Always use the original link_token for re-initialization.

```json
{
  "error_type": "OAUTH_ERROR",
  "error_code": "INCORRECT_LINK_TOKEN",
  "error_message": "link token does not match original link token",
  "display_message": null,
  "request_id": "HNTDNrA8F1shFEW"
}
```

--------------------------------

### Initialize Link with Link Token (Android)

Source: https://plaid.com/docs/link/link-token-migration-guide

Provides a Kotlin example for initializing Plaid Link on Android using `LinkTokenConfiguration`. This code snippet shows how to set the `link_token` and optional configurations like `logLevel` before opening Plaid Link, including an example of setting a link event listener.

```kotlin
1import android.os.Bundle
2import android.util.Log
3import androidx.appcompat.app.AppCompatActivity
4
5import com.plaid.link.Plaid
6import com.plaid.link.linkTokenConfiguration
7import com.plaid.link.openPlaidLink
8import com.plaid.link.configuration.AccountSubtype
9import com.plaid.link.configuration.LinkLogLevel
10import com.plaid.link.configuration.PlaidEnvironment
11import com.plaid.link.configuration.PlaidProduct
12import com.plaid.link.event.LinkEvent
13import java.util.Locale
14
15class MainActivity : AppCompatActivity() {
16
17  override fun onCreate(savedInstanceState: Bundle?) {
18    super.onCreate(savedInstanceState)
19
20    // Optional
21    Plaid.setLinkEventListener { event -> Log.i("Event", event.toString()) }
22
23    // Open Link – put this inside of a Button / Fab click listener
24    this@MAINACTIVITY.openPlaidLink(
25      linkTokenConfiguration {
26        // required
27        token = "GENERATED_LINK_TOKEN"
28
29        // optional
30        logLevel = LinkLogLevel.WARN // Defaults to ASSERT
31        extraParams = mapOf() // Map of additional configs
32      }
33    );
34  }
35}
```

--------------------------------

### Install Plaid Link Library

Source: https://plaid.com/docs/income/add-to-app

Instructions for including the Plaid Link JavaScript library in your web application's HTML.

```APIDOC
## Install Plaid Link Library

### Description
Instructions for including the Plaid Link JavaScript library in your web application's HTML `<head>` section to enable the Plaid Link UI flow.

### Method
HTML Integration

### Endpoint
`index.html` (or any HTML file)

### Parameters
None

### Request Example
```html
<head>
  <title>Connect a bank</title>
  <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
</head>
```

### Response
N/A (This is an HTML integration step.)

### Error Handling
N/A
```

--------------------------------

### Wallet Get

Source: https://plaid.com/docs/api/products/payment-initiation

Fetch virtual account (wallet) data by wallet ID.

```APIDOC
## GET /wallet/get

### Description
Retrieves the details of a specific virtual account (wallet) using its unique ID.

### Method
GET

### Endpoint
/wallet/get

### Parameters
#### Query Parameters
- **wallet_id** (string) - Required - The unique identifier of the wallet to fetch.

### Response
#### Success Response (200)
- **wallet_id** (string) - The unique identifier for the wallet.
- **iso_currency_code** (string) - The currency of the wallet.
- **balance** (object) - The current balance of the wallet.
  - **current** (integer) - The available balance.
  - **available** (integer) - The total balance including pending transactions.
- **description** (string) - The description of the wallet.
- **created_at** (string) - The timestamp when the wallet was created.

#### Response Example
```json
{
  "wallet_id": "va_main_gbp_123",
  "iso_currency_code": "GBP",
  "balance": {
    "current": 50000,
    "available": 48000
  },
  "description": "Main operational wallet",
  "created_at": "2023-10-25T11:00:00Z"
}
```
```

--------------------------------

### Create Link Token for Auth and Identity Products (curl)

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/user-onboarding-and-account-funding

This snippet demonstrates how to create a link token using Plaid's `/link/token/create` endpoint. It specifies the client ID, secret, user information, the products to be used (auth and identity in this case), country codes, language, and a webhook URL. This is a prerequisite for initiating the Plaid Link flow.

```curl
curl -X POST https://sandbox.plaid.com/link/token/create \
-H 'Content-Type: application/json' \
-d '{
  "client_id": "${PLAID_CLIENT_ID}",
  "secret": "${PLAID_SECRET}",
  "client_name": "Plaid Test App",
  "user": { "client_user_id": "${UNIQUE_USER_ID}" },
  "products": ["auth", "identity"], // using both products
  "country_codes": ["GB", "NL", "DE"],
  "language": "en"
  "webhook": "https://webhook.sample.com",
}'
```

--------------------------------

### GET /processor/transactions/sync

Source: https://plaid.com/docs/api/products/transactions

Get transaction data or incremental transaction updates for a processor token.

```APIDOC
## GET /processor/transactions/sync

### Description
Retrieves transaction data or incremental updates using a processor token. This endpoint is part of the Plaid Processor integration.

### Method
GET

### Endpoint
/processor/transactions/sync

### Parameters
#### Query Parameters
- **client_id** (string) - Required - Your Plaid API client ID.
- **secret** (string) - Required - Your Plaid API secret.
- **processor_token** (string) - Required - The processor token associated with the Item.
- **cursor** (string) - Optional - The latest cursor obtained from sync responses or the initial `/processor/transactions/sync` call.

### Request Example
```json
{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "processor_token": "processor-sandbox",
  "cursor": "INITIAL_CURSOR"
}
```

### Response
#### Success Response (200)
- **processor_token** (string) - The processor token associated with the Item.
- **added** (array) - An array of transaction objects that have been added since the last sync.
- **modified** (array) - An array of transaction objects that have been modified since the last sync.
- **removed** (array) - An array of transaction objects that have been removed since the last sync.
- **has_more** (boolean) - Indicates if there are more transactions available.
- **next_cursor** (string) - The cursor for the next sync request.

#### Response Example
```json
{
  "processor_token": "processor-sandbox",
  "added": [
    {
      "account_id": "q9999999999999",
      "amount": 50.00,
      "iso_currency_code": "USD",
      "merchant_name": "Processor Merchant",
      "name": "Processor Purchase",
      "payment_channel": "online",
      "transaction_id": "processor_transaction_id_1",
      "date": "2023-10-26",
      "pending": false
    }
  ],
  "modified": [],
  "removed": [],
  "has_more": false,
  "next_cursor": "next_cursor_value"
}
```
```

--------------------------------

### Initialize Plaid Link (JavaScript)

Source: https://plaid.com/docs/auth/add-to-app

This example shows how to initialize Plaid Link in your JavaScript application. It demonstrates obtaining a link token and handling the onSuccess, onLoad, onExit, and onEvent callbacks.

```APIDOC
## Initialize Link with the Link token

This code snippet demonstrates how to initialize Plaid Link using a pre-generated link token and handle various callbacks.

### Method
GET (Implicitly via `$.post` to `/create_link_token`)

### Endpoint
Client-side initialization, server-side call to `/create_link_token`

### Parameters

#### Request Body (for POST to `/create_link_token`)
(Not directly shown, but assumed to return `link_token`)

#### Request Body (for `Plaid.create`)
- **token** (string) - Required - The link token obtained from your server.
- **onSuccess** (function) - Required - Callback function executed upon successful linking. Receives `public_token` and `metadata`.
- **onLoad** (function) - Optional - Callback function executed when Link has loaded.
- **onExit** (function) - Optional - Callback function executed when the user exits Link. Receives `err` and `metadata`.
- **onEvent** (function) - Optional - Callback function to capture Link flow events. Receives `eventName` and `metadata`.

### Request Example
```javascript
const handler = Plaid.create({
  token: (await $.post('/create_link_token')).link_token,
  onSuccess: (public_token, metadata) => {
    // Upon successful linking of a bank account,
    // Link will return a public token.
    // Exchange the public token for an access token
    // to make calls to the Plaid API.
    $.post('/exchange_public_token', {
      public_token: public_token,
    });
  },
  onLoad: () => {},
  onExit: (err, metadata) => {
    // Optionally capture when your user exited the Link flow.
    // Storing this information can be helpful for support.
  },
  onEvent: (eventName, metadata) => {
    // Optionally capture Link flow events, streamed through
    // this callback as your users connect an Item to Plaid.
  },
});

handler.open();
```

### Response
No direct response, but triggers callbacks and potentially a POST to `/exchange_public_token`.

#### Success Response (Implicit)
- `public_token` (string) - A one-time-use token returned by `onSuccess`.

#### Response Example (from `onSuccess` callback)
(No direct JSON response, but `public_token` is provided to the callback.
```

--------------------------------

### Plaid Link Exit Event URL Example

Source: https://plaid.com/docs/link/webview

An example URL demonstrating the structure of the 'exit' event query string. This URL includes various parameters that provide details about why the user exited the Link flow, such as the status, error type, error code, and institution information.

```url
plaidlink://exit?status=requires_credentials&error_type=ITEM_ERROR&error_code=ITEM_LOGIN_REQUIRED&error_display_message=The%20credentials%20were%20not%20correct.%20Please%20try%20again.&error_message=the%20credentials%20were%20not%20correct&institution_id=ins_3&institution_name=Chase&link_session_id=79e772be-547d-4c9c-8b76-4ac4ed4c441a&request_id=m8MDnv9okwxFNBV
```

--------------------------------

### Initialize Link with Link Token (Web)

Source: https://plaid.com/docs/link/link-token-migration-guide

Demonstrates initializing Plaid Link on the web using a `link_token`. It includes fetching the token, handling successful authentication, and managing exit events, particularly the invalid `link_token` error by destroying and reinitializing Link.

```javascript
1<button id="link-button">Link Account</button>
2<script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
3<script type="text/javascript">
4(async function() {
5  const fetchLinkToken = async () => {
6    const response = await fetch('/create_link_token', { method: 'POST' });
7    const responseJSON = await response.json();
8    return responseJSON.link_token;
9  };
10
11  const configs = {
12    // 1. Pass a new link_token to Link.
13    token: await fetchLinkToken(),
14    onSuccess: async function(public_token, metadata) {
15      // 2a. Send the public_token to your app server.
16      // The onSuccess function is called when the user has successfully
17      // authenticated and selected an account to use.
18      await fetch('/exchange_public_token', {
19        method: 'POST',
20        body: JSON.stringify({ public_token: public_token }),
21      });
22    },
23    onExit: async function(err, metadata) {
24      // 2b. Gracefully handle the invalid link token error. A link token
25      // can become invalidated if it expires, has already been used
26      // for a link session, or is associated with too many invalid logins.
27      if (err != null && err.error_code === 'INVALID_LINK_TOKEN') {
28        linkHandler.destroy();
29        linkHandler = Plaid.create({
30          ...configs,
31          token: await fetchLinkToken(),
32        });
33      }
34      if (err != null) {
35        // Handle any other types of errors.
36      }
37      // metadata contains information about the institution that the
38      // user selected and the most recent API request IDs.
39      // Storing this information can be helpful for support.
40    },
41  };
42
43  var linkHandler = Plaid.create(configs);
44
45  document.getElementById('link-button').onclick = function() {
46    linkHandler.open();
47  };
48})();
49</script>
```

--------------------------------

### GET /transactions/sync

Source: https://plaid.com/docs/api/products/transactions

Get transaction data or incremental transaction updates. This endpoint is recommended for migrating from `/transactions/get`.

```APIDOC
## GET /transactions/sync

### Description
Retrieves transaction data or incremental updates. Useful for migrations from the `/transactions/get` endpoint.

### Method
GET

### Endpoint
/transactions/sync

### Parameters
#### Query Parameters
- **client_id** (string) - Required - Your Plaid API client ID.
- **secret** (string) - Required - Your Plaid API secret.
- **access_token** (string) - Required - The access token associated with the Item.
- **cursor** (string) - Optional - The latest cursor obtained from sync responses or the initial `transactions/sync` call.

### Request Example
```json
{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "access_token": "YOUR_ACCESS_TOKEN",
  "cursor": "INITIAL_CURSOR"
}
```

### Response
#### Success Response (200)
- **access_token** (string) - The access token associated with the Item.
- **added** (array) - An array of transaction objects that have been added since the last sync.
- **modified** (array) - An array of transaction objects that have been modified since the last sync.
- **removed** (array) - An array of transaction objects that have been removed since the last sync.
- **has_more** (boolean) - Indicates if there are more transactions available.
- **next_cursor** (string) - The cursor for the next sync request.

#### Response Example
```json
{
  "access_token": "access-sandbox",
  "added": [
    {
      "account_id": "q9999999999999",
      "amount": 100.00,
      "iso_currency_code": "USD",
      "merchant_name": "Apple Store",
      "name": "Apple Store",
      "payment_channel": "online",
      "transaction_id": "transaction_id_1",
      "date": "2023-10-25",
      "pending": false
    }
  ],
  "modified": [],
  "removed": [],
  "has_more": true,
  "next_cursor": "next_cursor_value"
}
```
```

--------------------------------

### PRODUCT_READY Webhook API Object

Source: https://plaid.com/docs/api/products/assets

This is an example of the API object structure for the PRODUCT_READY webhook, which fires when an Asset Report is ready to be retrieved. It includes details like asset_report_id, report_type, and environment.

```json
{
  "webhook_type": "ASSETS",
  "webhook_code": "PRODUCT_READY",
  "asset_report_id": "47dfc92b-bba3-4583-809e-ce871b321f05",
  "report_type": "FULL"
}
```

--------------------------------

### Configure Plaid Link Client-Side Handler (JavaScript)

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/add-to-app

This code snippet demonstrates how to configure the client-side Plaid Link handler in JavaScript. It outlines the setup for token creation, success callbacks, exit handling, and event capturing during the user's interaction with Plaid Link. Dependencies include the Plaid library and a backend endpoint for token creation.

```javascript
const linkHandler = Plaid.create({
  // Create a new link_token to initialize Link
  token: (await $.post('/create_link_token')).link_token,
  onSuccess: (public_token, metadata) => {
    // Show a success page to your user confirming that the
    // payment will be processed.
    //
    // The 'metadata' object contains info about the institution
    // the user selected.
    // For example:
    //  metadata  = {
    //    link_session_id: "123-abc",
    //    institution: {
    //      institution_id: "ins_117243",
    //      name:"Monzo"
    //    }
    //  }
  },
  onExit: (err, metadata) => {
    // The user exited the Link flow.
    if (err != null) {
      // The user encountered a Plaid API error prior to exiting.
    }
    // 'metadata' contains information about the institution
    // that the user selected and the most recent API request IDs.
    // Storing this information can be helpful for support.
  },
  onEvent: (eventName, metadata) => {
    // Optionally capture Link flow events, streamed through
    // this callback as your users connect with Plaid.
    // For example:
    //  eventName = "TRANSITION_VIEW",
    //  metadata  = {
    //    link_session_id: "123-abc",
    //    mfa_type:        "questions",
    //    timestamp:       "2017-09-14T14:42:19.350Z",
    //    view_name:       "MFA",
    //  }
  },
});

linkHandler.open();
```

--------------------------------

### GET /protect/user/insights/get

Source: https://plaid.com/docs/api/products/protect

Get the latest user event details and other metadata.

```APIDOC
## GET /protect/user/insights/get

### Description
Get the latest user event details and other metadata.

### Method
GET

### Endpoint
/protect/user/insights/get

### Parameters
#### Query Parameters
- **client_user_id** (string) - Required - The unique identifier for the user.

### Response
#### Success Response (200)
- **client_user_id** (string) - The unique identifier for the user.
- **user_risk_level** (string) - The risk level associated with the user.
- **recent_events** (array) - An array of recent events associated with the user.
  - **timestamp** (string) - The timestamp of the event.
  - **event_type** (string) - The type of the event.
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "client_user_id": "user-abc",
  "user_risk_level": "medium",
  "recent_events": [
    {
      "timestamp": "2023-10-27T10:00:00Z",
      "event_type": "user_sign_in"
    },
    {
      "timestamp": "2023-10-27T09:55:00Z",
      "event_type": "app_visit"
    }
  ],
  "request_id": "saKrIBuEB9qJZng"
}
```
```

--------------------------------

### Income API Status Updates

Source: https://plaid.com/docs/changelog

The /credit/sessions/get endpoint now supports `STARTED` and `INTERNAL_ERROR` statuses for income sessions.

```APIDOC
## GET /credit/sessions/get

### Description
Retrieves the status of an income session.

### Method
GET

### Endpoint
/credit/sessions/get

### Parameters
#### Query Parameters
- **session_id** (string) - Required - The ID of the session.

### Request Example
```
/credit/sessions/get?session_id=session_abc456
```

### Response
#### Success Response (200)
- **status** (string) - The status of the session. Possible values include `STARTED`, `INTERNAL_ERROR`, `success`, `error`.

#### Response Example
```json
{
  "status": "STARTED"
}
```
```

--------------------------------

### Sample LLM Prompt for Plaid API Documentation

Source: https://plaid.com/docs/resources

A sample prompt to be used with an LLM-powered coding assistant to help incorporate Plaid API documentation into a workflow. This prompt is designed to guide the LLM in accessing and utilizing the provided documentation links effectively.

```text
## Instructions on using the Plaid API

For instructions on how to use the Plaid API, please go to 
https://plaid.com/docs/llms.txt. There you can find a list of other
documentation pages that you can retrieve to obtain the necessary 
information. If you need to search for additional documentation, you
should first try to use a link that is listed in the llms.txt file.
```

--------------------------------

### GET /transfer/recurring/get

Source: https://plaid.com/docs/api/products/transfer/recurring-transfers

Retrieves information about a specific recurring transfer. Use this endpoint to get details about an existing recurring transfer.

```APIDOC
## GET /transfer/recurring/get

### Description
Retrieves information about a specific recurring transfer. Use this endpoint to get details about an existing recurring transfer.

### Method
GET

### Endpoint
/transfer/recurring/get

### Parameters
#### Query Parameters
- **recurring_transfer_id** (string) - Required - The ID of the recurring transfer to retrieve.

### Request Example
```
GET /transfer/recurring/get?recurring_transfer_id=rt-xyz789
```

### Response
#### Success Response (200)
- **recurring_transfer_id** (string) - The ID of the recurring transfer.
- **user_id** (string) - The ID of the user.
- **origination_account_id** (string) - The ID of the origination account.
- **amount** (string) - The transfer amount.
- **currency** (string) - The transfer currency.
- **schedule** (object) - The transfer schedule.
- **status** (string) - The current status of the recurring transfer.
- **created_at** (string) - The timestamp when the recurring transfer was created.

#### Response Example
```json
{
  "recurring_transfer_id": "rt-xyz789",
  "user_id": "user-123",
  "origination_account_id": "acc-abc",
  "amount": "50.00",
  "currency": "USD",
  "schedule": {
    "start_date": "2023-10-27",
    "interval": "WEEKLY",
    "interval_count": 1
  },
  "status": "ACTIVE",
  "created_at": "2023-10-27T10:00:00Z"
}
```
```

--------------------------------

### POST /payment_initiation/payment/create

Source: https://plaid.com/docs/api/products/payment-initiation

Creates a payment initiation request. This endpoint allows you to initiate a payment from a user's account to a specified recipient. It includes options for specifying the amount, reference, currency, and advanced settings like refund details or account restrictions.

```APIDOC
## POST /payment_initiation/payment/create

### Description
Creates a payment initiation request. This endpoint allows you to initiate a payment from a user's account to a specified recipient. It includes options for specifying the amount, reference, currency, and advanced settings like refund details or account restrictions.

### Method
POST

### Endpoint
/payment_initiation/payment/create

### Parameters
#### Request Body
- **recipient_id** (string) - Required - The ID of the recipient to pay.
- **reference** (string) - Required - The reference message to include with the payment.
- **amount** (object) - Required - The amount of the payment.
  - **currency** (string) - Required - The currency of the amount (e.g., "GBP").
  - **value** (number) - Required - The value of the amount (e.g., 100.0).
- **start_date** (date) - Optional - The start date for the standing order.
- **end_date** (date) - Optional - The end date for the standing order.
- **adjusted_start_date** (date) - Optional - The adjusted start date after considering holidays or weekends.
- **options** (object) - Optional - Additional payment options.
  - **request_refund_details** (boolean) - Optional - When true, Plaid will attempt to request refund details.
  - **iban** (string) - Optional - The International Bank Account Number (IBAN) for the payer's account. Min length: 15, Max length: 34.
  - **bacs** (object) - Optional - An optional object used to restrict the accounts used for payments.
    - **account** (string) - Optional - The account number of the account. Max length: 10.
    - **sort_code** (string) - Optional - The 6-character sort code of the account. Min length: 6, Max length: 6.
  - **scheme** (string) - Optional - Payment scheme. Possible values: `null`, `LOCAL_DEFAULT`, `LOCAL_INSTANT`, `SEPA_CREDIT_TRANSFER`, `SEPA_CREDIT_TRANSFER_INSTANT`.

### Request Example
```json
{
  "recipient_id": "recipient-id-sandbox-...
```

--------------------------------

### GET /beacon/report_syndication/get

Source: https://plaid.com/docs/beacon

Retrieves details about a specific fraud report syndication. This endpoint is used to get more information when the `REPORT_SYNDICATION_CREATED` webhook is triggered.

```APIDOC
## GET /beacon/report_syndication/get

### Description
Retrieves details about a specific fraud report syndication. This endpoint is used to get more information when the `REPORT_SYNDICATION_CREATED` webhook is triggered.

### Method
GET

### Endpoint
`/beacon/report_syndication/get`

### Parameters
#### Path Parameters
None

#### Query Parameters
- **report_syndication_id** (string) - Required - The unique identifier for the report syndication.

### Request Example
```
GET /beacon/report_syndication/get?report_syndication_id=beacon_syndication_klmno12345
```

### Response
#### Success Response (200)
- **report_syndication_id** (string) - The unique identifier for the report syndication.
- **user_id** (string) - The unique identifier of the user associated with the report.
- **fraud_type** (string) - The type of fraud reported.
- **timestamp** (string) - The timestamp when the report was syndicated.

#### Response Example
```json
{
  "report_syndication_id": "beacon_syndication_klmno12345",
  "user_id": "beaconuser_abcde12345",
  "fraud_type": "synthetic_identity",
  "timestamp": "2023-10-27T10:00:00Z"
}
```
```

--------------------------------

### POST /sandbox/public_token/create

Source: https://plaid.com/docs/changelog

Creates a public token for sandbox environments, with support for Income.

```APIDOC
## POST /sandbox/public_token/create

### Description
Creates a public token for sandbox environments, including support for Income.

### Method
POST

### Endpoint
/sandbox/public_token/create

### Parameters
#### Request Body
- **institution_id** (string) - Required - The ID of the institution.
- **income_verification** (object) - Optional - Configuration for income verification.

### Request Example
```json
{
  "institution_id": "ins_101",
  "income_verification": {
    "income_source_type": " பயோமெட்ரிக்"
  }
}
```

### Response
#### Success Response (200)
- **public_token** (string) - The generated public token.

#### Response Example
```json
{
  "public_token": "public-sandbox-token"
}
```
```

--------------------------------

### API Response Example with Match Status

Source: https://plaid.com/docs/api/products/beacon

An example JSON response from the Plaid API, showcasing the 'beacon_report_syndications' array. Each syndication includes a report and an analysis object, where fields like 'address', 'date_of_birth', 'email_address', and 'name' are assigned a match status.

```json
{
  "beacon_report_syndications": [
    {
      "id": "becrsn_11111111111111",
      "beacon_user_id": "becusr_42cF1MNo42r9Xj",
      "report": {
        "id": "becrpt_11111111111111",
        "created_at": "2020-07-24T03:26:02Z",
        "type": "first_party",
        "fraud_date": "1990-05-29",
        "event_date": "1990-05-29"
      },
      "analysis": {
        "address": "match",
        "date_of_birth": "match",
        "email_address": "match",
        "name": "match"
      }
    }
  ]
}
```

--------------------------------

### GET /transfer/sweep/get

Source: https://plaid.com/docs/api/products/transfer/reading-transfers

Retrieves information about a specific transfer sweep. This endpoint is used to get details about a Plaid-initiated sweep, including its amount and associated transfer.

```APIDOC
## GET /transfer/sweep/get

### Description
Retrieves information about a specific transfer sweep. This endpoint is used to get details about a Plaid-initiated sweep, including its amount and associated transfer.

### Method
GET

### Endpoint
/transfer/sweep/get

### Parameters
#### Query Parameters
- **sweep_id** (string) - Required - Plaid’s unique identifier for a sweep.

### Request Example
```
GET /transfer/sweep/get?sweep_id=sweep_abc123
```

### Response
#### Success Response (200)
- **sweep_id** (string) - Plaid’s unique identifier for a sweep.
- **transfer_id** (string) - Plaid’s unique identifier for the transfer that initiated the sweep.
- **sweep_amount** (string) - A signed amount of how much was swept or return_swept for this transfer (decimal string with two digits of precision e.g. "-5.50").
- **iso_currency_code** (string) - The ISO currency code for the amount, e.g. "USD".
- **created_at** (string) - The date and time the sweep was created, in ISO 8601 format.
- **request_id** (string) - A unique identifier for the request, which can be used for troubleshooting. This identifier, like all Plaid identifiers, is case sensitive.

#### Response Example
```json
{
  "sweep_id": "sweep_abc123",
  "transfer_id": "trf_abc123",
  "sweep_amount": "-10.00",
  "iso_currency_code": "USD",
  "created_at": "2023-10-27T10:00:00Z",
  "request_id": "mdqfuVxeoza6mhu"
}
```
```

--------------------------------

### Create End Customer

Source: https://plaid.com/docs/api/partner

Creates a new end customer for the partner. This is the first step in onboarding an end customer.

```APIDOC
## POST /partner/customer/create

### Description
Creates a new end customer for the partner.

### Method
POST

### Endpoint
/partner/customer/create

### Parameters
#### Request Body
- **user_token** (string) - Required - A token representing the end user.
- **api_key** (string) - Required - Your partner API key.

### Request Example
{
  "user_token": "<user_token>",
  "api_key": "<api_key>"
}

### Response
#### Success Response (200)
- **customer_id** (string) - The unique identifier for the created end customer.
- **status** (string) - The current status of the end customer ('created', 'pending_oauth', etc.).

#### Response Example
{
  "customer_id": "cust_12345",
  "status": "created"
}
```

--------------------------------

### CUSTOMER_NOT_READY_FOR_ENABLEMENT Error

Source: https://plaid.com/docs/errors/partner

Details for troubleshooting CUSTOMER_NOT_READY_FOR_ENABLEMENT, meaning the customer requires manual approval or has been denied access.

```APIDOC
## CUSTOMER_NOT_READY_FOR_ENABLEMENT Error

### Description
This error signifies that the end customer is not yet ready for enablement, possibly due to requiring manual approval or having been denied API access.

### Common Causes
* The end customer needs manual approval from Plaid's Partnerships team.
* The end customer has been denied access to the Plaid API.

### Troubleshooting Steps
1. **Check Customer Status**: Wait until the end customer's status is updated to `READY FOR ENABLEMENT` before retrying the request.
2. **Contact Plaid Support**: If the issue persists, reach out to your Partner Account Manager for assistance.

### API Error Response Example
```json
{
  "error_type": "PARTNER_ERROR",
  "error_code": "CUSTOMER_NOT_READY_FOR_ENABLEMENT",
  "error_message": "this customer is not ready for enablement",
  "display_message": null,
  "request_id": "HNTDNrA8F1shFEW"
}
```
```

--------------------------------

### Initiate Plaid Link Preloading (React Native)

Source: https://plaid.com/docs/link/react-native

Initiates the preloading process for Plaid Link by calling the 'create' function. This function requires SDK version 11.6 or later and is typically followed by a call to 'open'. It takes a configuration object including the link token.

```javascript
TouchableOpacity
  style={styles.button}
  onPress={() => {
      create({token: linkToken});
      setDisabled(false);
    }
  }>
  <Text style={styles.button}>Create Link</Text>
</TouchableOpacity>
```

--------------------------------

### POST /api/create_session_token

Source: https://plaid.com/docs/layer/add-to-app

Create a `link_token` for initializing Plaid Link, used for Layer integration.

```APIDOC
## POST /api/create_session_token

### Description
Creates a `link_token` on the server side, which is required to initialize Plaid Link for the Layer integration. This token is short-lived and single-use.

### Method
`POST`

### Endpoint
`/api/create_session_token`

### Parameters
#### Path Parameters
(None)

#### Query Parameters
(None)

#### Request Body
(Implicitly defined by the `request` object within the code example)
- **user** (object) - Required - Information about the user.
  - **client_user_id** (string) - Required - A unique identifier for the current user.
- **template_id** (string) - Required - The ID of the pre-configured Layer template.

### Request Example
```javascript
// Assuming 'User' model and 'TEMPLATE_ID' are defined elsewhere

app.post('/api/create_session_token', async function (request, response) {
  // Get the client_user_id by searching for the current user
  const user = await User.find(...);
  const clientUserId = user.id;
  const requestBody = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: clientUserId,
    },
    template_id: TEMPLATE_ID,
  };
  try {
    const createTokenResponse = await client.sessionTokenCreate(requestBody);
    response.json(createTokenResponse.data);
  } catch (error) {
    // handle error
    console.error('Error creating session token:', error);
    response.status(500).json({ error: 'Failed to create session token' });
  }
});
```

### Response
#### Success Response (200)
- **link_token** (string) - The generated token for Plaid Link.
- **expiration** (string) - The expiration time of the token.
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "link_token": "link-token-example",
  "expiration": "2023-10-27T10:00:00Z",
  "request_id": "example-request-id"
}
```

#### Error Response (e.g., 400, 500)
- **error_type** (string) - The type of error.
- **error_code** (string) - A specific error code.
- **error_message** (string) - A human-readable error message.
- **request_id** (string) - A unique identifier for the request.
```

--------------------------------

### GET /payment_initiation/payment/get

Source: https://plaid.com/docs/changelog

Retrieves details for a specific payment initiation, including the amount refunded.

```APIDOC
## GET /payment_initiation/payment/get

### Description
Retrieves details for a specific payment initiation.

### Method
GET

### Endpoint
/payment_initiation/payment/get

### Parameters
#### Query Parameters
- **payment_id** (string) - Required - The ID of the payment.

### Response
#### Success Response (200)
- **amount_refunded** (integer) - The amount that has been refunded for this payment.

#### Response Example
```json
{
  "payment_id": "pay_abc123",
  "amount": 10000,
  "amount_refunded": 5000
}
```
```

--------------------------------

### GET /auth/get

Source: https://plaid.com/docs/api/products/auth

Fetch account information for electronic funds transfers.

```APIDOC
## GET /auth/get

### Description
Fetches account information to set up electronic funds transfers.

### Method
GET

### Endpoint
/auth/get

### Parameters
#### Query Parameters
- **access_token** (string) - Required - The access token for the Item whose Auth data you want to retrieve.

### Request Example
```
GET /auth/get?access_token=YOUR_ACCESS_TOKEN
```

### Response
#### Success Response (200)
- **accounts** (array) - An array of account objects.
  - **account_id** (string) - The Plaid account ID.
  - **name** (string) - The user-friendly name of the account.
  - **mask** (string) - The last few digits of the account number.
  - **official_name** (string) - The official name of the account.
  - **type** (string) - The type of account (e.g., 'checking', 'savings').
  - **subtype** (string) - The type of account (e.g., 'checking', 'savings').
- **numbers** (object) - An object containing account number details.
  - **ach** (array) - ACH routing number and account number.
    - **routing** (string) - ACH routing number.
    - **account** (string) - Account number.
  - **eft** (array) - EFT routing number and account number (Canada).
    - **wire_routing** (string) - Wire transfer routing number.
    - **wire_account** (string) - Account number.
  - **international** (array) - International bank account details (IBAN, SWIFT/BIC).
    - **iban** (string) - IBAN number.
    - **bic** (string) - SWIFT/BIC code.
- **item** (object) - Metadata about the Item.
  - **item_id** (string) - The ID of the Item.
  - **institution_id** (string) - The ID of the financial institution.

#### Response Example
```json
{
  "accounts": [
    {
      "account_id": "123456789",
      "name": "Checking",
      "mask": "1234",
      "official_name": "Plaid Example Checking Account",
      "type": "depository",
      "subtype": "checking"
    }
  ],
  "numbers": {
    "ach": [
      {
        "routing": "123456789",
        "account": "987654321"
      }
    ]
  },
  "item": {
    "item_id": "abcdef12345",
    "institution_id": "ins_12345"
  }
}
```
```

--------------------------------

### PRODUCT_NOT_READY Error

Source: https://plaid.com/docs/errors/assets

This error arises when `/asset_report/get` or `/asset_report/pdf/get` is called before the Asset Report generation is complete.

```APIDOC
## PRODUCT_NOT_READY

### Description
This error indicates that `/asset_report/get` or `/asset_report/pdf/get` was invoked before the Asset Report generation process was finished. Note that this is distinct from the `PRODUCT_NOT_READY` error of type `ITEM_ERROR`.

### Troubleshooting Steps
Listen for the `PRODUCT_READY` webhook. Only call `/asset_report/get` or `/asset_report/pdf/get` after this webhook has been received.

### API Error Response
```json
{
  "error_type": "ASSET_REPORT_ERROR",
  "error_code": "PRODUCT_NOT_READY",
  "error_message": "",
  "display_message": null,
  "request_id": "HNTDNrA8F1shFEW"
}
```
```

--------------------------------

### PRODUCT_NOT_READY Error

Source: https://plaid.com/docs/errors/income

Explains the PRODUCT_NOT_READY error, indicating that the Income product processing is incomplete, and suggesting webhook usage or retries.

```APIDOC
## Product Not Ready Error

### Description
This error signifies that the Income product has not yet finished its processing. This can happen if the parsing of uploaded pay stubs is still ongoing. You should listen for webhooks or retry the request later.

### Error Handling
#### PRODUCT_NOT_READY
- **Error Type**: INCOME_VERIFICATION_ERROR
- **Error Code**: PRODUCT_NOT_READY
- **Error Message**: The requested product is not yet ready. Please provide a webhook or try the request again later.
- **Common Causes**: Parsing of the uploaded pay stubs has not yet completed.
- **Troubleshooting Steps**: Listen for the `INCOME: INCOME_VERIFICATION` webhook with a corresponding `item_id`, which will fire once verification is complete. Alternatively, retry the request at a later time.
```

--------------------------------

### Plaid Asset Report API Response Example

Source: https://plaid.com/docs/api/products/assets

An example of a successful response from the Plaid Asset Report API. This JSON structure illustrates the organization of report data, including report metadata, associated items, account details, balances, historical data, and owner information.

```json
{
  "report": {
    "asset_report_id": "028e8404-a013-4a45-ac9e-002482f9cafc",
    "client_report_id": "client_report_id_1221",
    "date_generated": "2023-03-30T18:27:37Z",
    "days_requested": 90,
    "items": [
      {
        "accounts": [
          {
            "account_id": "1qKRXQjk8xUWDJojNwPXTj8gEmR48piqRNye8",
            "balances": {
              "available": 43200,
              "current": 43200,
              "limit": null,
              "margin_loan_amount": null,
              "iso_currency_code": "USD",
              "unofficial_currency_code": null
            },
            "days_available": 90,
            "historical_balances": [
              {
                "current": 49050,
                "date": "2023-03-29",
                "iso_currency_code": "USD",
                "unofficial_currency_code": null
              }
            ],
            "mask": "4444",
            "name": "Plaid Money Market",
            "official_name": "Plaid Platinum Standard 1.85% Interest Money Market",
            "owners": [
              {
                "addresses": [
                  {
                    "data": {
                      "city": "Malakoff",
                      "country": "US",
                      "region": "NY",
                      "street": "2992 Cameron Road",
                      "postal_code": "14236"
                    },
                    "primary": true
                  }
                ],
                "emails": [
                  {
                    "data": "accountholder0@example.com",
                    "primary": true,
                    "type": "primary"
                  }
                ],
                "names": [
                  "Alberta Bobbeth Charleson"
                ],
                "phone_numbers": [
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

--------------------------------

### POST /bank_transfer/create

Source: https://plaid.com/docs/bank-transfers/reference

Initiate a bank transfer. This endpoint allows you to start a new bank transfer transaction.

```APIDOC
## POST /bank_transfer/create

### Description
Initiate a bank transfer. This endpoint allows you to start a new bank transfer transaction.

### Method
POST

### Endpoint
/bank_transfer/create

### Parameters
#### Request Body
- **client_id** (string) - Optional - Your Plaid API client ID.
- **secret** (string) - Optional - Your Plaid API secret.
- **access_token** (string) - Required - The access token of the institution.
- **account_id** (string) - Required - The account ID for the transfer.
- **type** (string) - Required - The type of transfer (e.g., "depository", "credit").
- **amount** (string) - Required - The amount of the transfer (e.g., "10.00").
- **user_id** (string) - Optional - An identifier that maps to a consumer or business.
- **metadata** (object) - Optional - Custom key-value pairs.

### Request Example
```json
{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "access_token": "access-sandbox-xxxxxx",
  "account_id": "xxxxxxxxx",
  "type": "depository",
  "amount": "10.00",
  "user_id": "user-1234",
  "metadata": {
    "purpose": "Salary payment"
  }
}
```

### Response
#### Success Response (200)
- **bank_transfer_id** (string) - The ID of the created bank transfer.
- **status** (string) - The status of the bank transfer.
- **created_at** (string) - The date and time the transfer was created.
- **amount** (string) - The amount of the transfer.
- **type** (string) - The type of transfer.
- **user_id** (string) - The user ID associated with the transfer.
- **account_id** (string) - The account ID used for the transfer.

#### Response Example
```json
{
  "bank_transfer_id": "ba_xxxxxxxxx",
  "status": "pending",
  "created_at": "2023-10-27T10:00:00Z",
  "amount": "10.00",
  "type": "depository",
  "user_id": "user-1234",
  "account_id": "xxxxxxxxx"
}
```
```

--------------------------------

### GET /payment_initiation/payment/get

Source: https://plaid.com/docs/payment-initiation/virtual-accounts/refunds

Retrieves details of a Payment Initiation payment, including the `refund_id` and `amount_refunded`.

```APIDOC
## GET /payment_initiation/payment/get

### Description
Retrieves details of a specific Payment Initiation payment. This endpoint can be used to check the status of a payment, view associated refunds, and determine the remaining amount that can be refunded.

### Method
GET

### Endpoint
/payment_initiation/payment/get

### Parameters
#### Path Parameters
- **payment_id** (string) - Required - The ID of the Payment Initiation payment to retrieve.

#### Query Parameters
None

### Request Example
```json
{
  "payment_id": "b1b0d7c1-3445-4251-a81b-d5a7c14d4c60"
}
```

### Response
#### Success Response (200)
- **payment_id** (string) - The unique identifier for the payment.
- **amount** (object) - The total amount of the payment.
  - **amount** (string) - The amount, in the smallest currency unit.
  - **currency** (string) - The currency code.
- **amount_refunded** (object) - The total amount that has been refunded for this payment.
  - **amount** (string) - The refunded amount, in the smallest currency unit.
  - **currency** (string) - The currency code.
- **refund_id** (string) - The ID of the refund associated with this payment (if any).
- **status** (string) - The current status of the payment.

#### Response Example
```json
{
  "payment_id": "b1b0d7c1-3445-4251-a81b-d5a7c14d4c60",
  "amount": {
    "amount": "50.00",
    "currency": "GBP"
  },
  "amount_refunded": {
    "amount": "25.00",
    "currency": "GBP"
  },
  "refund_id": "f82e1a12-3456-7890-abcd-ef1234567890",
  "status": "PARTIALLY_REFUNDED"
}
```
```

--------------------------------

### Create Link Token with Institution Preselected

Source: https://plaid.com/docs/payment-initiation/payment-initiation-one-time/user-onboarding-and-account-funding

Creates a link token with a specific institution preselected. This is useful for improving conversion by skipping the manual institution selection step if the institution is already known. It requires the `institution_id` obtained from a previous `/item/get` call.

```shell
curl -X POST https://sandbox.plaid.com/link/token/create \
-H 'Content-Type: application/json' \
-d '{ \
  "client_id": "${PLAID_CLIENT_ID}", \
  "secret": "${PLAID_SECRET}", \
  "client_name": "Plaid Test App", \
  "user": { "client_user_id": "${UNIQUE_USER_ID}" }, \
  "products": ["payment_initiation"], \
  "country_codes": ["GB", "NL", "DE"], \
  "language": "en" \
  "webhook": "https://webhook.sample.com", \
  "payment_initiation": { "payment_id": "${PAYMENT_ID}" }, \
  "institution_id": "${INSTITUTION_ID}" // preselect institution_id \
}'
```

--------------------------------

### POST /payment_initiation/payment/reverse

Source: https://plaid.com/docs/payment-initiation/virtual-accounts/add-to-app

Initiates a refund for a Payment Initiation payment.

```APIDOC
## POST /payment_initiation/payment/reverse

### Description
Reverses or refunds a previously initiated payment. This is useful for correcting errors or processing returns.

### Method
POST

### Endpoint
`/payment_initiation/payment/reverse`

### Parameters
#### Request Body
- **payment_id** (string) - Required - The ID of the payment to reverse.
- **reference** (string) - Required - A reference text for the refund transaction.
- **idempotency_key** (string) - Required - A unique key to ensure the request is processed only once.

### Request Example
```javascript
const request = {
  payment_id: paymentID,
  reference: 'Refund for purchase ABC123',
  idempotency_key: 'ae009325-df8d-4f52-b1e0-53ff26c23912',
};
try {
  const response = await plaidClient.paymentInitiationPaymentReverse(request);
  // Process response
} catch (error) {
  // handle error
}
```

### Response
#### Success Response (200)
- **refund_id** (string) - The ID of the refund transaction.
- **status** (string) - The status of the refund (e.g., 'pending', 'completed').

#### Response Example
```json
{
  "refund_id": "ref_xxxxxxxxxxxxxx",
  "status": "pending"
}
```
```

--------------------------------

### Add Plaid Dependency to Podfile

Source: https://plaid.com/docs/link/ios

Instruction to add the 'Plaid' pod to your Podfile to include the Plaid SDK. This line should be added to the target dependencies within your Podfile.

```ruby
pod 'Plaid'
```

--------------------------------

### Initialize Plaid Link with link_token (Node.js)

Source: https://plaid.com/docs/auth/coverage/instant

This Node.js snippet shows how to initialize Plaid Link using a `link_token` obtained from the server. It defines an `onSuccess` callback that sends the resulting `public_token` and account metadata to the application server for further processing.

```javascript
Plaid.create({
  // Fetch a link_token configured for 'auth' from your app server
  token: (await $.post('/create_link_token')).link_token,
  onSuccess: (public_token, metadata) => {
    // Send the public_token and accounts to your app server
    $.post('/exchange_public_token', {
      publicToken: public_token,
      accounts: metadata.accounts,
    });
  },
});
```

--------------------------------

### GET /watchlist_screening/entity/program/get

Source: https://plaid.com/docs/api/products/monitor

Retrieves details for a specific entity watchlist screening program. You can use this endpoint to get information about a program's configuration, enabled watchlists, and scanning status.

```APIDOC
## GET /watchlist_screening/entity/program/get

### Description
Retrieves details for a specific entity watchlist screening program.

### Method
GET

### Endpoint
/watchlist_screening/entity/program/get

### Parameters
#### Query Parameters
- **entity_watchlist_program_id** (string) - Required - ID of the associated entity program.
- **secret** (string) - Optional - Your Plaid API `secret`. Can be provided in the `PLAID-SECRET` header.
- **client_id** (string) - Optional - Your Plaid API `client_id`. Can be provided in the `PLAID-CLIENT-ID` header.

### Request Example
(No request body for GET request, parameters are typically in query string or headers)

### Response
#### Success Response (200)
- **id** (string) - ID of the associated entity program.
- **created_at** (string) - An ISO8601 formatted timestamp.
- **is_rescanning_enabled** (boolean) - Indicator specifying whether the program is enabled for daily rescans.
- **lists_enabled** (array of strings) - Watchlists enabled for the associated program.
- **name** (string) - A name for the entity program.
- **name_sensitivity** (string) - The valid name matching sensitivity configurations for a screening program (`coarse`, `balanced`, `strict`, `exact`).
- **audit_trail** (object) - Information about the last change made to the parent object.
  - **source** (string) - Indicates who last modified the object (`dashboard`, `link`, `api`, `system`).
  - **dashboard_user_id** (string) - ID of the associated dashboard user (if applicable).
  - **timestamp** (string) - An ISO8601 formatted timestamp of the last modification.
- **is_archived** (boolean) - Indicates if the program is archived (read-only).
- **request_id** (string) - A unique identifier for the request.

#### Response Example
```json
{
  "id": "entprg_2eRPsDnL66rZ7H",
  "created_at": "2020-07-24T03:26:02Z",
  "is_rescanning_enabled": true,
  "lists_enabled": [
    "EU_CON"
  ],
  "name": "Sample Program",
  "name_sensitivity": "balanced",
  "audit_trail": {
    "source": "dashboard",
    "dashboard_user_id": "54350110fedcbaf01234ffee",
    "timestamp": "2020-07-24T03:26:02Z"
  },
  "is_archived": false,
  "request_id": "saKrIBuEB9qJZng"
}
```
```

--------------------------------

### POST /asset_report/create

Source: https://plaid.com/docs/api/products/assets

Initiates the creation of an Asset Report. This report aggregates financial data from specified access tokens and can be retrieved later. Plaid fires a PRODUCT_READY webhook when the report is available.

```APIDOC
## POST /asset_report/create

### Description
Initiates the process of creating an Asset Report, which aggregates financial data from specified access tokens. The report is not available immediately and a `PRODUCT_READY` webhook is fired upon completion. Use `/asset_report/get` or `/asset_report/pdf/get` to retrieve the report.

### Method
POST

### Endpoint
/asset_report/create

### Parameters
#### Request Body
- **client_id** (string) - Required - Your Plaid API `client_id`. Can be provided in the `PLAID-CLIENT-ID` header.
- **secret** (string) - Required - Your Plaid API `secret`. Can be provided in the `PLAID-SECRET` header.
- **access_tokens** (array of strings) - Required - An array of access tokens for the Items to be included in the report. Minimum 1, Maximum 99 items.
- **days_requested** (integer) - Required - The maximum number of days of history to include in the Asset Report. Maximum: 731, Minimum: 0.
- **options** (object) - Optional - An object to filter `/asset_report/create` results.
  - **client_report_id** (string) - Optional - Client-generated identifier for tracking loan applications.
  - **webhook** (string) - Optional - URL to which Plaid will send Assets webhooks.
  - **add_ons** (array of strings) - Optional - A list of add-ons to include. Possible values: `investments`, `fast_assets`.
  - **user** (object) - Optional - Object for user information. Required fields (`first_name`, `last_name`, `ssn`) for Fannie Mae Day 1 Certainty eligibility.
    - **client_user_id** (string) - Optional - Identifier you determine for the user.
    - **first_name** (string) - Optional - User's first name. Required for Fannie Mae Day 1 Certainty.
    - **middle_name** (string) - Optional - User's middle name.
    - **last_name** (string) - Optional - User's last name. Required for Fannie Mae Day 1 Certainty.
    - **ssn** (string) - Optional - User's Social Security Number. Format: "ddd-dd-dddd". Required for Fannie Mae Day 1 Certainty.
    - **phone_number** (string) - Optional - User's phone number in E.164 format.
    - **email** (string) - Optional - User's email address.
    - **require_all_items** (boolean) - Optional - 

### Request Example
```json
{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "access_tokens": ["access-sandbox-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"],
  "days_requested": 730,
  "options": {
    "client_report_id": "my_loan_application_123",
    "webhook": "https://example.com/webhook",
    "add_ons": ["fast_assets"],
    "user": {
      "client_user_id": "user-abc-123",
      "first_name": "John",
      "last_name": "Doe",
      "ssn": "000-00-0000",
      "email": "john.doe@example.com"
    }
  }
}
```

### Response
#### Success Response (200)
- **created_request_id** (string) - A unique identifier for the request to create the Asset Report.
- **asset_report_token** (string) - A token that can be used to retrieve the Asset Report.
- **status** (string) - The status of the Asset Report creation request.

#### Response Example
```json
{
  "created_request_id": "b1a07234-6243-456d-8372-000000000000",
  "asset_report_token": "art-sandbox-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "status": "pending"
}
```
```

--------------------------------

### Initialize and Launch Plaid Link with JavaScript

Source: https://plaid.com/docs/auth/partnerships/treasury-prime

This snippet demonstrates how to initialize Plaid Link using client-side JavaScript. It fetches a `link_token` from your server, configures success and exit callbacks, and provides a button to open the Link flow. The `onSuccess` callback sends `public_token` and `metadata` to a backend endpoint.

```javascript
(async function(){
    var linkHandler = Plaid.create({
      // Make a request to your server to fetch a new link_token.
      token: (await $.post('/create_link_token')).link_token,
      onSuccess: function(public_token, metadata) {
        // The onSuccess function is called when the user has successfully
        // authenticated and selected an account to use.
        //
        // When called, you will send the public_token and the selected accounts,
        // metadata.accounts, to your backend app server.
        sendDataToBackendServer({
           public_token: public_token,
           accounts: metadata.accounts
        });
      },
      onExit: function(err, metadata) {
        // The user exited the Link flow.
        if (err != null) {
            // The user encountered a Plaid API error prior to exiting.
        }
        // metadata contains information about the institution
        // that the user selected and the most recent API request IDs.
        // Storing this information can be helpful for support.
      },
    });
  
    // Trigger the authentication view
    document.getElementById('linkButton').onclick = function() {
      // Link will automatically detect the institution ID
      // associated with the public token and present the
      // credential view to your user.
      linkHandler.open();
    };
  })();
```

--------------------------------

### Create Virtual Account

Source: https://plaid.com/docs/payment-initiation/virtual-accounts/add-to-app

This endpoint creates a new virtual account. It is a prerequisite for using other virtual account features and is used to test in the Sandbox environment.

```APIDOC
## POST /wallet/create

### Description
Creates a virtual account to manage funds. This is required before enabling virtual accounts in production or for testing in the Sandbox.

### Method
POST

### Endpoint
/wallet/create

### Parameters
#### Request Body
- **iso_currency_code** (string) - Required - The ISO currency code of the currency for the wallet. 

### Request Example
```json
{
  "iso_currency_code": "USD"
}
```

### Response
#### Success Response (200)
- **wallet_id** (string) - The unique identifier for the virtual wallet.
- **balance** (object) - The current balance of the virtual wallet.
  - **current** (number) - The current available balance.
  - **iso_currency_code** (string) - The ISO currency code.
- **numbers** (object) - The account numbers associated with the virtual wallet.
  - **ach** (object) - ACH routing and account numbers.
    - **account** (string) - ACH account number.
    - **routing** (string) - ACH routing number.
  - **eft** (object) - EFT routing and account numbers.
    - **account** (string) - EFT account number.
    - **routing** (string) - EFT routing number.
- **recipient_id** (string) - The Plaid identifier for the recipient associated with this virtual account, used for Payment Initiation.

#### Response Example
```json
{
  "wallet_id": "wallet_abc123",
  "balance": {
    "current": 1000.00,
    "iso_currency_code": "USD"
  },
  "numbers": {
    "ach": {
      "account": "4100000001",
      "routing": "011000025"
    },
    "eft": {
      "account": "4100000001",
      "routing": "011000025"
    }
  },
  "recipient_id": "recipient_xyz789"
}
```
```

--------------------------------

### USER_ACCOUNT_REVOKED Webhook Payload Example

Source: https://plaid.com/docs/api/items

This JSON payload represents an example of the USER_ACCOUNT_REVOKED webhook as received from Plaid. It contains essential information like the item ID, account ID, and environment.

```json
{
  "webhook_type": "ITEM",
  "webhook_code": "USER_ACCOUNT_REVOKED",
  "item_id": "gAXlMgVEw5uEGoQnnXZ6tn9E7Mn3LBc4PJVKZ",
  "account_id": "BxBXxLj1m4HMXBm9WZJyUg9XLd4rKEhw8Pb1J",
  "environment": "production"
}
```

--------------------------------

### Create Virtual Account

Source: https://plaid.com/docs/payment-initiation/virtual-accounts/managing-virtual-accounts

Initiate the creation of a virtual account. This endpoint is available in Sandbox by default. For Production use, contact your Account Manager.

```APIDOC
## POST /wallet/create

### Description
Creates a new virtual account. This functionality is available in Sandbox by default. For Production environments, please contact your Account Manager.

### Method
POST

### Endpoint
/wallet/create

### Parameters

#### Query Parameters
None

#### Request Body
None

### Request Example
```json
{}
```

### Response
#### Success Response (200)
- **wallet_id** (string) - The unique identifier for the newly created virtual account.

#### Response Example
```json
{
  "wallet_id": "vwl_abc123xyz789"
}
```
```

--------------------------------

### PRODUCT_NOT_ENABLED Error

Source: https://plaid.com/docs/errors/income

Details the PRODUCT_NOT_ENABLED error, highlighting the necessity of enabling the Income product and correct Link initialization.

```APIDOC
## Product Not Enabled Error

### Description
This error occurs when the Income product has not been enabled for your Plaid account. To resolve this, ensure the `income_verification` product is included when initializing Link and contact Plaid Support if necessary.

### Error Handling
#### PRODUCT_NOT_ENABLED
- **Error Type**: INCOME_VERIFICATION_ERROR
- **Error Code**: PRODUCT_NOT_ENABLED
- **Error Message**: The 'income_verification' product is not enabled for the following client ID: <CLIENT_ID>. Please ensure that the 'income_verification' is included in the 'product' array when initializing Link and try again.
- **Common Causes**: The Income product has not been enabled for the account.
- **Troubleshooting Steps**: Confirm that `income_verification` is included in the `product` array during Link initialization. If the product is still not enabled, contact your Plaid Account Manager or Plaid Support to request enablement for Income Verification.
```

--------------------------------

### Wallet Transaction Get

Source: https://plaid.com/docs/api/products/payment-initiation

Fetch transaction data for a virtual account (wallet).

```APIDOC
## GET /wallet/transaction/get

### Description
Retrieves the details of a specific transaction associated with a virtual account (wallet) using its unique ID.

### Method
GET

### Endpoint
/wallet/transaction/get

### Parameters
#### Query Parameters
- **transaction_id** (string) - Required - The unique identifier of the transaction to fetch.
- **wallet_id** (string) - Required - The unique identifier of the wallet associated with the transaction.

### Response
#### Success Response (200)
- **transaction_id** (string) - The unique identifier for the transaction.
- **wallet_id** (string) - The ID of the wallet involved.
- **counterparty_wallet_id** (string) - The ID of the counterparty wallet, if applicable.
- **amount** (integer) - The transaction amount.
- **currency** (string) - The currency of the transaction.
- **reference** (string) - The reference for the transaction.
- **type** (string) - The type of transaction.
- **status** (string) - The current status of the transaction.
- **created_at** (string) - The timestamp when the transaction was created.

#### Response Example
```json
{
  "transaction_id": "txn_abc123xyz",
  "wallet_id": "va_main_gbp_123",
  "counterparty_wallet_id": "va_secondary_eur_456",
  "amount": 1000,
  "currency": "GBP",
  "reference": "Internal transfer",
  "type": "DEBIT",
  "status": "COMPLETED",
  "created_at": "2023-10-27T11:30:00Z"
}
```
```

--------------------------------

### Submit Additional Documentation

Source: https://plaid.com/docs/transfer/platform-payments

Use this endpoint to submit additional documents if requested by Plaid during the onboarding process. After submission, monitor webhook notifications or poll for status updates.

```APIDOC
## POST /transfer/platform/document/submit

### Description
Submits additional documentation required for Plaid platform onboarding.

### Method
POST

### Endpoint
/transfer/platform/document/submit

### Parameters
#### Request Body
- **document_type** (string) - Required - The type of document being submitted (e.g., 'business_name', 'business_address', 'business_ein', 'individual_name_dob', 'individual_id_number', 'individual_address').
- **document_file** (file) - Required - The actual document file to be uploaded.

### Request Example
{
  "document_type": "business_address",
  "document_file": "<binary file data>"
}

### Response
#### Success Response (200)
- **status** (string) - Indicates the status of the document submission (e.g., 'submitted', 'accepted', 'rejected').
- **message** (string) - A confirmation message or details about the submission.

#### Response Example
{
  "status": "submitted",
  "message": "Document submitted successfully for review."
}
```

--------------------------------

### Credit Partner Insights Options

Source: https://plaid.com/docs/api/link

Configures options for initializing Link for use with the Credit Partner Insights product, including Prism product versions.

```APIDOC
## POST /websites/plaid/link/token/create (with Partner Insights)

### Description
Creates a Link token with specific configurations for the Credit Partner Insights product.

### Method
POST

### Endpoint
/websites/plaid/link/token/create

### Parameters
#### Request Body
- **partner_insights** (object) - Specifies options for initializing Link for use with the Credit Partner Insights product.
  - **prism_products** (array) - Deprecated - The specific Prism products to return. If none are passed in, then all products will be returned. Possible values: `insights`, `scores`.
  - **prism_versions** (object) - The versions of Prism products to evaluate.
    - **firstdetect** (string) - The version of Prism FirstDetect. Defaults to v3. Possible values: `3`, `null`.
    - **detect** (string) - The version of Prism Detect. Possible values: `4`, `null`.
    - **cashscore** (string) - The version of Prism CashScore. Defaults to v3. Possible values: `4`, `3`, `null`.
    - **extend** (string) - The version of Prism Extend. Possible values: `4`, `null`.
    - **insights** (string) - The version of Prism Insights. Defaults to v3. Possible values: `4`, `3`, `null`.

### Request Example
```json
{
  "client_name": "Example Corp",
  "products": ["partner_insights"],
  "country_codes": ["US"],
  "language": "en",
  "user": {
    "client_user_id": "unique-user-id"
  },
  "partner_insights": {
    "prism_versions": {
      "firstdetect": "3",
      "detect": "4",
      "cashscore": "4",
      "extend": "4",
      "insights": "3"
    }
  }
}
```

### Response
#### Success Response (200)
- **link_token** (string) - The generated Link token.
- **expiration** (string) - The expiration time of the Link token.

#### Response Example
```json
{
  "link_token": "link-token-example",
  "expiration": "2023-10-27T22:23:10Z"
}
```
```

--------------------------------

### Plaid /transfer/event/sync Request Payload Example

Source: https://plaid.com/docs/transfer/reconciling-transfers

This is an example of a request payload for the /transfer/event/sync endpoint. It's used to retrieve a batch of transfer events, optionally after a specific event ID and with a specified count.

```json
{
  "after_id": "4",
  "count": "20"
}
```