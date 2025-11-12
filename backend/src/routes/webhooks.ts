import express from 'express';
import { PaymentService } from '../services/paymentService';

const router = express.Router();

// Stripe Webhook
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');

      // Auto-confirm subscription
      try {
        await PaymentService.confirmStripeSubscription(paymentIntent.id);
      } catch (error) {
        console.error('Failed to confirm subscription:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      console.log('PaymentIntent failed:', event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Mercado Pago Webhook
router.post('/mercadopago', async (req, res) => {
  try {
    const { data, type } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;

      if (data.status === 'approved') {
        await PaymentService.confirmMercadoPagoPayment(paymentId);
        console.log(`Mercado Pago payment ${paymentId} approved`);
      }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Mercado Pago webhook error:', error);
    res.status(500).send('Error');
  }
});

export default router;