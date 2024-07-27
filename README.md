## What

Boilerplate serverless function to enable Stripe Subscriptions.

## What does this application do?

The application is using BigCommerce webhooks to send Order data to a serverless function to determine if the user purchased a subscription product and should be enrolled in a Stripe subscription.

## Contributing

George FitzGibbons, Joshua Walcher

### Running the project

To get started you will need to have a BigCommerce Store.

You will need to have nodeJS of version 10 or greater in the location where you want to install this application. I recommend installing NVM and using version 20.15.1 of Node since the latest versions of Lambda use node 20.

To install NVM:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```
Then you'll need to close your terminal and re-open it and then run:
```bash
nvm install 20.15.1
```

You will need Serverless. Go to [serverless.com](https://serverless.com) and set up a free account. If you do not already have one, go to [aws.amazon.com](https://aws.amazon.com) and set up a free account where we will install your lambda also.

To install serverless with npm, run this command:
```bash
npm i serverless -g
```

In this example the serverless.yml is configured for AWS:
[Serverless AWS Guide]([https://serverless.com/framework/docs/providers/aws/guide/installation/](https://www.serverless.com/framework/docs/getting-started))

You can easily update the yml for your desired FAAS providers.

You will need to generate BigCommerce API keys. To generate the API keys in BigCommerce, go to the store admin and then click Settings -> Store-level API accounts.

These keys need to have read permissions for products.

After generating the keys, you will need to copy the API Client ID and Access Token and save it. You will also need to know your store's hash. The store hash is the alphanumeric code after the "store-" in the URL when you go to your admin.

The last thing you will need is the Stripe Secret Key from the Developers section of the Stripe Dashboard. If you don't see one there yet, go ahead and generate one.

Now clone this repository and run the following command to set it up locally.

```bash
cd StripeSubscriptionsBigcommerce
npm install
```
In the serverless.yml file update the environment with your site's API Keys and store information.

```
environment:
  STORE_HASH: {YOUR STORE HASH}
  BC_CLIENT: {BC CLIENT ID}
  BC_TOKEN: {BC TOKEN ID}
  STRIPE_SECRET: {STRIPE SECRET KEY}
```

Next, you need to update the handler.js file in the code to handle your subscription products and prices. These come from Stripe after you add them into the Stripe Dashboard and then are connected to the BigCommerce store by the productID matching the SKU of the product in your BigCommerce store. Search for the word "note" to see where you need to edit the file.

Now you're ready to deploy. To do that, run this command:

```bash
sls deploy
```
You will be walked through some steps to connect your AWS account to serverless and eventually will get an API endpoint back. You will use this when you set up your webhook.

The endpoint will look something like this:
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


