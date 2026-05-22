import crypto from 'node:crypto';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';

const razorpay = env.razorpayKeyId && env.razorpayKeySecret
  ? new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret })
  : null;

export const createOrderSchema = z.object({
  body: z.object({
    amount: z.coerce.number().int().positive(),
    currency: z.string().trim().default('INR')
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().trim().min(1),
    razorpay_payment_id: z.string().trim().min(1),
    razorpay_signature: z.string().trim().min(1)
  })
});

export async function createOrder(req, res) {
  const { amount, currency } = req.validated.body;

  if (!razorpay) {
    return res.json({
      id: `order_mock_${Date.now()}`,
      amount: amount * 100,
      currency,
      keyId: env.razorpayKeyId,
      mocked: true
    });
  }

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt: `receipt_${Date.now()}`
  });

  res.status(201).json({ ...order, keyId: env.razorpayKeyId });
}

export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.validated.body;

  if (!env.razorpayKeySecret) {
    return res.json({ verified: true, paymentId: razorpay_payment_id, mocked: true });
  }

  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  res.json({ verified: true, paymentId: razorpay_payment_id });
}
