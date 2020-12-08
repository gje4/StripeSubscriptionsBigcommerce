## What

Boilerplate serverless function to enable Stripe Subscriptions.

## What does this application do?

The application is using BigCommerce webhooks to send Order data to a serverless function to determine if the user purchased a subscription product and should be enrolled in a Stripe subscription.

## Contributing

George FitzGibbons

### Running the project

To get started you will need to have a BigCommerce Store.

You will need to have +v10 node.

You will need Serverless

```https://serverless.com/

In this example the serverless.yml is configured for AWS.
https://serverless.com/framework/docs/providers/aws/guide/installation/

You can easily update the yml for your desired FAAS providers
```

You will need to generate BigCommerce API keys, these keys need to have read permissions for products.

In the serverless.yml file update the environment with your site API Keys

```
environment:
  STORE_HASH: {YOUR STORE HASH}
  BC_CLIENT: {BC CLIENT ID}
  BC_TOKEN: {BC TOKEN ID}
  STRIPE_SECRET: {STRIPE SECRET KEY}

```

Now run to set up

```bash
npm install
```

Now you're ready to deploy

```bash
cd stripeManager
sls deploy
```

You will get an API endpoint back, you will use this when you set up your webhook.

```
endpoints:
  POST - https://{XXXXXX}.execute-api.us-east-1.amazonaws.com/dev/stripeManager
```

Now in postman create the webhook to send order created to endpoints
https://developer.bigcommerce.com/api-docs/getting-started/webhooks/webhook-events#orders

```
curl --location --request POST 'https://api.bigcommerce.com/stores/{STORE HASH}/v2/hooks' \
--header 'X-Auth-Client: XXXXX' \
--header 'X-Auth-Token: YYYYYY' \
--data-raw '{
 "scope": "store/cart/converted",
 "destination": "https://ZZZZZ.execute-api.us-east-1.amazonaws.com/dev/stripeManager",
 "is_active": true
}'
```

In BigCommerce you must add your product with the sane sku as in Stripe. You will also need to add a custom field price for the price object of the subscription from Stripe.

### Additional resources

Stripe has great product that can be used to enable user management using a simple iframe.  This enables users to adjust and manage their subscription within their my account page.

Portal
https://dashboard.stripe.com/test/settings/billing/portal

Stripe API docs
Subscription Management Docs
https://stripe.com/docs/billing/subscriptions/overview
https://stripe.com/docs/billing/subscriptions/model
https://stripe.com/docs/billing/subscriptions/change


