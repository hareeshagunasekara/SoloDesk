const stripe = require("../config/stripe");
const logger = require("../utils/logger");

class StripeService {
  // Create a payment intent
  static async createPaymentIntent(amount, currency = "usd", metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error("Stripe createPaymentIntent error:", error);
      throw error;
    }
  }

  // Retrieve a payment intent
  static async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error("Stripe retrievePaymentIntent error:", error);
      throw error;
    }
  }

  // Confirm a payment intent
  static async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        },
      );

      logger.info(`Payment intent confirmed: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error("Stripe confirmPaymentIntent error:", error);
      throw error;
    }
  }

  // Create a refund
  static async createRefund(
    paymentIntentId,
    amount,
    reason = "requested_by_customer",
  ) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason,
      });

      logger.info(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error("Stripe createRefund error:", error);
      throw error;
    }
  }

  // Get payment method details
  static async getPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod =
        await stripe.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      logger.error("Stripe getPaymentMethod error:", error);
      throw error;
    }
  }

  // Create a customer
  static async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });

      logger.info(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error("Stripe createCustomer error:", error);
      throw error;
    }
  }

  // Update a customer
  static async updateCustomer(customerId, data) {
    try {
      const customer = await stripe.customers.update(customerId, data);
      logger.info(`Customer updated: ${customerId}`);
      return customer;
    } catch (error) {
      logger.error("Stripe updateCustomer error:", error);
      throw error;
    }
  }

  // Get customer details
  static async getCustomer(customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      logger.error("Stripe getCustomer error:", error);
      throw error;
    }
  }

  // List payment intents for a customer
  static async listPaymentIntents(customerId, limit = 10) {
    try {
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customerId,
        limit,
      });
      return paymentIntents;
    } catch (error) {
      logger.error("Stripe listPaymentIntents error:", error);
      throw error;
    }
  }

  // Get payment intent events
  static async getPaymentIntentEvents(paymentIntentId) {
    try {
      const events = await stripe.events.list({
        type: "payment_intent.*",
        "data.object.id": paymentIntentId,
      });
      return events;
    } catch (error) {
      logger.error("Stripe getPaymentIntentEvents error:", error);
      throw error;
    }
  }
}

module.exports = StripeService;
