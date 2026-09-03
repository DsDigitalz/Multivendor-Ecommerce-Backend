import crypto from 'crypto';
import { Types } from 'mongoose';
import { PaymentModel } from './payments.model';
import { OrderModel } from '../orders/orders.model';
import { IPayment } from './payments.interface';
import { ProcessPaymentInput } from './payments.validation';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/app-error';
import { ORDER_STATUS, PAYMENT_STATUS, ROLES } from '../../config/constants';
import { env } from '../../config/env.config';
import { logger } from '../../config/logger.config';

export interface PaymentInitializationResult {
  checkoutUrl: string;
  reference: string;
  orderId: string;
  amount: number;
  currency: string;
}

export class PaymentsService {
  async initializePayment(customerId: string, orderId: string, paymentMethod = 'stripe'): Promise<PaymentInitializationResult> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.customerId.toString() !== customerId) {
      throw new ForbiddenError('You can only pay for your own orders');
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      throw new BadRequestError('This order has already been paid for');
    }

    const reference = `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await PaymentModel.create({
      orderId: order._id,
      customerId: new Types.ObjectId(customerId),
      amount: order.totalAmount,
      currency: 'USD',
      status: PAYMENT_STATUS.PENDING,
      paymentMethod,
      transactionId: reference,
    });

    const checkoutUrl = `${env.CLIENT_URL}/checkout/pay?reference=${reference}&amount=${order.totalAmount}`;

    return {
      checkoutUrl,
      reference,
      orderId: order._id.toString(),
      amount: order.totalAmount,
      currency: 'USD',
    };
  }

  async processPayment(customerId: string, input: ProcessPaymentInput): Promise<IPayment> {
    const order = await OrderModel.findById(input.orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.customerId.toString() !== customerId) {
      throw new ForbiddenError('You can only pay for your own orders');
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      throw new BadRequestError('This order has already been paid for');
    }

    const transactionId = input.transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let payment = await PaymentModel.findOne({ orderId: order._id });
    if (!payment) {
      payment = await PaymentModel.create({
        orderId: order._id,
        customerId: new Types.ObjectId(customerId),
        amount: order.totalAmount,
        currency: 'USD',
        status: PAYMENT_STATUS.PAID,
        paymentMethod: input.paymentMethod,
        transactionId,
      });
    } else {
      payment.status = PAYMENT_STATUS.PAID;
      payment.transactionId = transactionId;
      await payment.save();
    }

    // Update order status
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.orderStatus = ORDER_STATUS.PROCESSING;
    order.subOrders.forEach((so) => {
      so.status = ORDER_STATUS.PROCESSING;
    });

    await order.save();
    return payment;
  }

  async verifyPayment(reference: string): Promise<IPayment> {
    const payment = await PaymentModel.findOne({ transactionId: reference });
    if (!payment) {
      throw new NotFoundError('Payment reference not found');
    }
    return payment;
  }

  async handleWebhook(rawBody: Buffer | string, signature?: string, provider = 'stripe'): Promise<{ processed: boolean; reference?: string }> {
    logger.info({ provider }, 'Processing payment webhook');

    // Webhook signature verification if secret is configured
    if (env.STRIPE_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', env.STRIPE_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        logger.warn('Webhook signature mismatch');
        throw new BadRequestError('Invalid webhook signature');
      }
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf-8'));
    } catch {
      throw new BadRequestError('Invalid webhook payload format');
    }

    const reference = (payload.reference || (payload.data as any)?.object?.metadata?.reference) as string | undefined;
    const orderId = (payload.orderId || (payload.data as any)?.object?.metadata?.orderId) as string | undefined;

    if (!reference && !orderId) {
      logger.warn({ payload }, 'Webhook missing reference or orderId');
      return { processed: false };
    }

    const payment = reference
      ? await PaymentModel.findOne({ transactionId: reference })
      : await PaymentModel.findOne({ orderId: new Types.ObjectId(orderId) });

    if (!payment) {
      logger.warn({ reference, orderId }, 'Payment record not found for webhook');
      return { processed: false };
    }

    // Idempotency: skip if already marked PAID
    if (payment.status === PAYMENT_STATUS.PAID) {
      logger.info({ reference: payment.transactionId }, 'Payment already marked PAID (idempotent skip)');
      return { processed: true, reference: payment.transactionId };
    }

    payment.status = PAYMENT_STATUS.PAID;
    await payment.save();

    // Update order status
    const order = await OrderModel.findById(payment.orderId);
    if (order) {
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.orderStatus = ORDER_STATUS.PROCESSING;
      order.subOrders.forEach((so) => {
        so.status = ORDER_STATUS.PROCESSING;
      });
      await order.save();
    }

    logger.info({ orderId: payment.orderId }, 'Order and payment successfully marked PAID via webhook');
    return { processed: true, reference: payment.transactionId };
  }

  async getPaymentByOrderId(orderId: string, userId: string, role: string): Promise<IPayment> {
    const payment = await PaymentModel.findOne({ orderId: new Types.ObjectId(orderId) });
    if (!payment) {
      throw new NotFoundError('Payment record not found for this order');
    }

    if (role === ROLES.CUSTOMER && payment.customerId.toString() !== userId) {
      throw new ForbiddenError('Access denied to this payment record');
    }

    return payment;
  }
}

export const paymentsService = new PaymentsService();
