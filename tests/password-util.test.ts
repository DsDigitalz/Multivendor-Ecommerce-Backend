import { hashPassword, comparePassword } from '../src/utils/password.util';

describe('Password Utility', () => {
  it('should hash a password securely', async () => {
    const raw = 'MySecretPass123!';
    const hashed = await hashPassword(raw);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(raw);
    expect(hashed.length).toBeGreaterThan(20);
  });

  it('should return true for matching password and hash', async () => {
    const raw = 'CorrectPass123!';
    const hashed = await hashPassword(raw);

    const isMatch = await comparePassword(raw, hashed);
    expect(isMatch).toBe(true);
  });

  it('should return false for mismatched password and hash', async () => {
    const raw = 'CorrectPass123!';
    const wrong = 'WrongPass123!';
    const hashed = await hashPassword(raw);

    const isMatch = await comparePassword(wrong, hashed);
    expect(isMatch).toBe(false);
  });
});
