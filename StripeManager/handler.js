"use strict";
const request = require("request-promise");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const BigCommerce = require("node-bigcommerce");

const bigCommerce = new BigCommerce({
  logLevel: "info",
  clientId: process.env.BC_CLIENT,
  accessToken: process.env.BC_TOKEN,
  storeHash: process.env.STORE_HASH,
  responseType: "json",
  apiVersion: "v2"
});

async function getOrderData(orderDataId) {
  var orderData = await bigCommerce.get(`/orders/${orderDataId}`);
  return orderData;
}

async function getTransactionId(orderDataId) {
  const options = {
    method: "GET",
    uri: `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/orders/${orderDataId}/transactions`,
    headers: {
      accept: "application/json",
      "X-Auth-Client": process.env.BC_CLIENT,
      "X-Auth-Token": process.env.BC_TOKEN
    }
  };
  var transactionData = await request(options);
  console.log("transaction", transactionData);
  return transactionData;
}

async function getOrderDataProducts(orderDataId) {
  var orderData = await bigCommerce.get(
    `/orders/${orderDataId}/products?include=custom_fields`
  );
  return orderData;
}

async function stripePaymentMethods(purchaseIntent) {
  const paymentIntent = await stripe.paymentIntents.retrieve(purchaseIntent);
  return paymentIntent;
}

async function addSubscription(sku, customerId, paymentMethod) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    default_payment_method: paymentMethod,
    items: [{ price: "price_1HGxdOKzv2axJMmQabIRP6OM" }]
  });
  return subscription;
}

module.exports.stripeManager = async event => {
  let returnValue = {
    statusCode: 500,
    body: JSON.stringify({
      status: 500,
      message: `Something went wrong.`
    })
  };
  let data = JSON.parse(event.body);
  //get order order data
  try {
    const orderData = await getOrderData(data.data.orderId);
    const orderItemsData = await getOrderDataProducts(data.data.orderId);
    if (orderItemsData[0].sku == "prod_HpotjGuPDnCacx" || "prod_HpotjGuPDnCacx-PR") {
      //get transaction from BC and price from the variation option chosen (first 1)

      const transaction = await getTransactionId(data.data.orderId);
      const transactionId = JSON.parse(transaction);
      console.log("transactionId", transactionId);

      //get Customer + PM from Stripe
      const paymentIntent = await stripePaymentMethods(
        transactionId.data[0].gateway_transaction_id
      );
      //create subscription
      const createSubscription = await addSubscription(
        orderItemsData[0].product_options[0].display_value,
        paymentIntent.customer,
        paymentIntent.payment_method
      );

      console.log("createSubscription", createSubscription);
    } else {
      console.log("do nothing");
    }

    returnValue = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify("Checked for subscription")
    };
  } catch (err) {
    returnValue = {
      statusCode: 500,
      body: JSON.stringify({
        status: 500,
        message: `Something went wrong.`
      })
    };
  }
  return returnValue;
};
