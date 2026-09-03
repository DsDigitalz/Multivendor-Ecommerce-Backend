import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../utils/api-response';
import { UnauthorizedError } from '../../utils/app-error';

export class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, 'Registration successful', result);
  }

  async login(req: Request, res: Response): Promise<Response> {
    const result = await authService.login(req.body);

    res.cookie('accessToken', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return ApiResponse.success(res, 'Login successful', result);
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }
    const tokens = await authService.refreshTokens(refreshToken);
    return ApiResponse.success(res, 'Token refreshed successfully', tokens);
  }

  async logout(_req: Request, res: Response): Promise<Response> {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return ApiResponse.success(res, 'Logged out successfully');
  }

  async changePassword(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    await authService.changePassword(req.user.userId, req.body);
    return ApiResponse.success(res, 'Password changed successfully');
  }
}

export const authController = new AuthController();
