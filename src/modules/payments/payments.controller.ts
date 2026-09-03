import { Request, Response } from 'express';
import { paymentsService } from './payments.service';
import { ApiResponse } from '../../utils/api-response';
import { UnauthorizedError } from '../../utils/app-error';

export class PaymentsController {
  async initializePayment(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const { orderId, paymentMethod } = req.body;
    const result = await paymentsService.initializePayment(req.user.userId, orderId, paymentMethod);
    return ApiResponse.created(res, 'Payment initialized successfully', result);
  }

  async processPayment(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const payment = await paymentsService.processPayment(req.user.userId, req.body);
    return ApiResponse.created(res, 'Payment processed successfully', payment);
  }

  async verifyPayment(req: Request, res: Response): Promise<Response> {
    const reference = req.params.reference as string;
    const payment = await paymentsService.verifyPayment(reference);
    return ApiResponse.success(res, 'Payment verified successfully', payment);
  }

  async handleWebhook(req: Request, res: Response): Promise<Response> {
    const signature = req.headers['stripe-signature'] as string | undefined;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const result = await paymentsService.handleWebhook(rawBody, signature);
    return ApiResponse.success(res, 'Webhook received', result);
  }

  async getPaymentByOrderId(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError();
    const orderId = req.params.orderId as string;
    const payment = await paymentsService.getPaymentByOrderId(
      orderId,
      req.user.userId,
      req.user.role
    );
    return ApiResponse.success(res, 'Payment details retrieved', payment);
  }
}

export const paymentsController = new PaymentsController();
