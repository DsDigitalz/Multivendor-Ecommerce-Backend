import { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;
  public readonly meta?: PaginationMeta;

  constructor(statusCode: number, message: string, data?: T, meta?: PaginationMeta) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
    if (meta !== undefined) {
      this.meta = meta;
    }
  }

  static success<T>(
    res: Response,
    message: string = 'Operation successful',
    data?: T,
    statusCode: number = HTTP_STATUS.OK,
    meta?: PaginationMeta
  ): Response {
    const response = new ApiResponse(statusCode, message, data, meta);
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, message: string = 'Created successfully', data?: T): Response {
    return ApiResponse.success(res, message, data, HTTP_STATUS.CREATED);
  }

  static noContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
