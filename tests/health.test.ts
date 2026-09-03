import request from 'supertest';
import { app } from '../src/app';

describe('Health & Routing Integration Tests', () => {
  it('GET / should return welcome message and doc links', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.docs).toBe('/api/docs');
    expect(res.body.health).toBe('/api/v1/health');
  });

  it('GET /api/v1/health should return UP status and 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
  });

  it('GET /api/v1/non-existent-route should return 404 with standard error envelope', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not found');
  });
});
