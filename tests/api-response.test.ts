import { ApiResponse } from '../src/utils/api-response';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../src/utils/app-error';

describe('ApiResponse & AppError Utilities', () => {
  it('should create ApiResponse instance with success true for 200', () => {
    const response = new ApiResponse(200, 'Success test', { sample: 123 });
    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.message).toBe('Success test');
    expect(response.data).toEqual({ sample: 123 });
  });

  it('should instantiate BadRequestError with status code 400', () => {
    const error = new BadRequestError('Invalid input parameter');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid input parameter');
    expect(error.isOperational).toBe(true);
  });

  it('should instantiate UnauthorizedError with status code 401', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized access');
  });

  it('should instantiate NotFoundError with status code 404', () => {
    const error = new NotFoundError('Product not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Product not found');
  });
});
