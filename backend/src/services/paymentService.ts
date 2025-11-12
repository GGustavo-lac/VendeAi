import stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import MercadoPago from 'mercadopago';

const prisma = new PrismaClient();

// Initialize Stripe
const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Mercado Pago
MercadoPago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!
});

export class PaymentService {
  // Stripe - Credit Card Payments
  static async createStripePaymentIntent(planId: string, userId: string) {
    const planPrices = {
      'pro': { monthly: 2900, annual: 29000 }, // in cents
      'premium': { monthly: 4900, annual: 49000 }
    };

    const price = planPrices[planId as keyof typeof planPrices];
    if (!price) {
      throw new Error('Invalid plan');
    }

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: price.monthly,
      currency: 'brl',
      metadata: {
        userId,
        planId,
        type: 'subscription'
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return paymentIntent;
  }

  static async confirmStripeSubscription(paymentIntentId: string) {
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    const { userId, planId } = paymentIntent.metadata;

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not successful');
    }

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId,
        status: 'ACTIVE',
        stripeId: paymentIntentId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      update: {
        planId,
        status: 'ACTIVE',
        stripeId: paymentIntentId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    return subscription;
  }

  // Mercado Pago - PIX Payments
  static async createMercadoPagoPixPayment(planId: string, userId: string) {
    const planPrices = {
      'pro': { monthly: 29.90, annual: 299.00 },
      'premium': { monthly: 49.90, annual: 499.00 }
    };

    const price = planPrices[planId as keyof typeof planPrices];
    if (!price) {
      throw new Error('Invalid plan');
    }

    const payment_data = {
      transaction_amount: price.monthly,
      description: `Plano ${planId.toUpperCase()} VendeAí`,
      payment_method_id: 'pix',
      external_reference: `${userId}_${planId}_${Date.now()}`,
      payer: {
        email: 'user@vendeai.com', // Would get from user data
        first_name: 'VendeAí',
        last_name: 'User',
      },
      notification_url: `${process.env.API_URL}/webhooks/mercadopago`
    };

    try {
      const payment = await MercadoPago.payment.create(payment_data);
      return payment;
    } catch (error) {
      console.error('Mercado Pago error:', error);
      throw new Error('Failed to create PIX payment');
    }
  }

  static async confirmMercadoPagoPayment(paymentId: string) {
    try {
      const payment = await MercadoPago.payment.get(paymentId);

      if (payment.status === 'approved') {
        const [userId, planId] = payment.external_reference?.split('_') || [];

        if (!userId || !planId) {
          throw new Error('Invalid external reference');
        }

        // Create or update subscription
        const subscription = await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planId,
            status: 'ACTIVE',
            mercadoPagoId: paymentId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          update: {
            planId,
            status: 'ACTIVE',
            mercadoPagoId: paymentId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });

        return subscription;
      }

      throw new Error('Payment not approved');
    } catch (error) {
      console.error('Mercado Pago confirmation error:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  static async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel in Stripe if exists
    if (subscription.stripeId) {
      try {
        await stripeClient.paymentIntents.cancel(subscription.stripeId);
      } catch (error) {
        console.error('Stripe cancellation error:', error);
      }
    }

    // Update in database
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date()
      }
    });

    return updatedSubscription;
  }

  static async getSubscriptionStatus(userId: string) {
    return await prisma.subscription.findUnique({
      where: { userId },
      include: { user: true }
    });
  }
}