import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config';
import { HTTP_STATUS } from '../config/constants';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many requests from this IP, please try again after some time',
  },
});
