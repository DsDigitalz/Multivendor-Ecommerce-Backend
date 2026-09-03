import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.config';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MarketHub — Multi-Vendor E-Commerce Platform API',
      version: '1.0.0',
      description:
        'Production-grade Multi-Vendor Marketplace REST API with JWT Auth, Role-Based Access Control (Admin, Vendor, Customer), multi-vendor split orders, automated commissions, verified reviews, and sandbox payments.',
      contact: {
        name: 'MarketHub Engineering Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste your JWT token here (obtained from /auth/login or /auth/register)',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 45 },
                totalPages: { type: 'integer', example: 3 },
              },
            },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Sarah Connor' },
            email: { type: 'string', format: 'email', example: 'customer@demo.com' },
            password: { type: 'string', format: 'password', example: 'Password123!' },
            role: { type: 'string', enum: ['customer', 'vendor'], default: 'customer' },
            phone: { type: 'string', example: '+1 (555) 019-2833' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'customer@demo.com' },
            password: { type: 'string', format: 'password', example: 'Password123!' },
          },
        },
        AddToCartInput: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'string', example: '64e8b0a1d94f4c0012a4b891' },
            quantity: { type: 'integer', minimum: 1, example: 2 },
            variantSku: { type: 'string', example: 'AUD-ACPR-001' },
          },
        },
        CheckoutInput: {
          type: 'object',
          required: ['shippingAddress'],
          properties: {
            shippingAddress: {
              type: 'object',
              required: ['street', 'city', 'state', 'country', 'postalCode'],
              properties: {
                street: { type: 'string', example: '742 Evergreen Terrace' },
                city: { type: 'string', example: 'Springfield' },
                state: { type: 'string', example: 'OR' },
                country: { type: 'string', example: 'USA' },
                postalCode: { type: 'string', example: '97477' },
              },
            },
            paymentMethod: { type: 'string', example: 'stripe' },
          },
        },
        ProcessPaymentInput: {
          type: 'object',
          required: ['orderId'],
          properties: {
            orderId: { type: 'string', example: '64e8b0a1d94f4c0012a4b892' },
            paymentMethod: { type: 'string', example: 'stripe' },
            transactionId: { type: 'string', example: 'TXN-SANDBOX-102938' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'API Service Health Check',
          responses: {
            '200': { description: 'API is healthy' },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new customer or vendor account',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } },
          },
          responses: { '201': { description: 'Registration successful' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Authenticate and receive JWT tokens',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
          },
          responses: { '200': { description: 'Login successful' } },
        },
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'Browse & search catalog with filters and pagination',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for keyword indexing' },
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category ID filter' },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'rating'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: { '200': { description: 'Products retrieved successfully' } },
        },
      },
      '/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Retrieve all active product taxonomy categories',
          responses: { '200': { description: 'Categories retrieved' } },
        },
      },
      '/vendors': {
        get: {
          tags: ['Vendors'],
          summary: 'List verified marketplace vendors and stores',
          responses: { '200': { description: 'Vendors list' } },
        },
      },
      '/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get active shopping cart for authenticated customer',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Cart retrieved' } },
        },
      },
      '/cart/items': {
        post: {
          tags: ['Cart'],
          summary: 'Add an item to customer shopping cart',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AddToCartInput' } } },
          },
          responses: { '200': { description: 'Item added to cart' } },
        },
      },
      '/orders/checkout': {
        post: {
          tags: ['Orders'],
          summary: 'Checkout cart into multi-vendor order with commission partitioning',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckoutInput' } } },
          },
          responses: { '201': { description: 'Order created successfully' } },
        },
      },
      '/orders/my-orders': {
        get: {
          tags: ['Orders'],
          summary: 'Get order history for logged-in customer',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Orders list' } },
        },
      },
      '/payments/initialize': {
        post: {
          tags: ['Payments'],
          summary: 'Initialize sandbox payment intent / checkout URL',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['orderId'],
                  properties: { orderId: { type: 'string' }, paymentMethod: { type: 'string', default: 'stripe' } },
                },
              },
            },
          },
          responses: { '201': { description: 'Payment initialized' } },
        },
      },
      '/payments/process': {
        post: {
          tags: ['Payments'],
          summary: 'Execute sandbox payment confirmation',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProcessPaymentInput' } } },
          },
          responses: { '201': { description: 'Payment processed successfully' } },
        },
      },
      '/wishlist': {
        get: {
          tags: ['Wishlist'],
          summary: 'Retrieve customer saved wishlist products',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Wishlist retrieved' } },
        },
      },
      '/admin/metrics': {
        get: {
          tags: ['Admin'],
          summary: 'Retrieve platform overview metrics, total revenue & commission',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Platform metrics' } },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
