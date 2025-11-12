import express from 'express';
import { PaymentService } from '../services/paymentService';
import { authenticateToken } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// All payment routes require authentication
router.use(authenticateToken);

const paymentValidation = [
  body('planId').isIn(['pro', 'premium']).withMessage('Invalid plan ID')
];

// Stripe - Create Payment Intent
router.post('/stripe/create-intent', paymentValidation, async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId } = req.body;
    const userId = req.user.userId;

    const paymentIntent = await PaymentService.createStripePaymentIntent(planId, userId);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe - Confirm Subscription
router.post('/stripe/confirm', async (req: any, res) => {
  try {
    const { paymentIntentId } = req.body;
    const subscription = await PaymentService.confirmStripeSubscription(paymentIntentId);

    res.json({
      message: 'Subscription activated successfully',
      subscription
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Mercado Pago - Create PIX Payment
router.post('/mercadopago/create-pix', paymentValidation, async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId } = req.body;
    const userId = req.user.userId;

    const payment = await PaymentService.createMercadoPagoPixPayment(planId, userId);

    res.json({
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      paymentId: payment.id,
      expirationDate: payment.date_of_expiration
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mercado Pago - Check Payment Status
router.get('/mercadopago/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Import here to avoid initialization issues
    const MercadoPago = require('mercadopago');
    MercadoPago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!
    });

    const payment = await MercadoPago.payment.get(paymentId);

    res.json({
      status: payment.status,
      statusDetail: payment.status_detail,
      approvedDate: payment.date_approved
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Subscription Status
router.get('/subscription', async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await PaymentService.getSubscriptionStatus(userId);

    res.json({ subscription });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel Subscription
router.post('/subscription/cancel', async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await PaymentService.cancelSubscription(userId);

    res.json({
      message: 'Subscription canceled successfully',
      subscription
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;