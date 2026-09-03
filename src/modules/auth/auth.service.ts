import { UserModel } from '../users/users.model';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.validation';
import { AuthResponse, AuthTokens } from './auth.interface';
import { hashPassword, comparePassword } from '../../utils/password.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.util';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../../utils/app-error';

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const existingUser = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await UserModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role,
      phone: data.phone,
    });

    const tokens = this.generateUserTokens(newUser._id.toString(), newUser.email, newUser.role);

    return {
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
      },
      tokens,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await UserModel.findOne({ email: data.email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateUserTokens(user._id.toString(), user.email, user.role);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('User does not exist');
      }

      return this.generateUserTokens(user._id.toString(), user.email, user.role);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const user = await UserModel.findById(userId).select('+password');
    if (!user || !user.password) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await comparePassword(data.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    user.password = await hashPassword(data.newPassword);
    await user.save();
  }

  private generateUserTokens(userId: string, email: string, role: string): AuthTokens {
    const payload = { userId, email, role: role as any };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

export const authService = new AuthService();
