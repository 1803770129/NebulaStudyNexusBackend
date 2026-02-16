/**
 * 认证服务
 *
 * 处理管理端用户认证相关的业务逻辑
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/modules/user/user.service';
import { User } from '@/modules/user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { AdminJwtPayload } from './strategies/jwt.strategy';

/**
 * 登录响应接口
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 验证用户凭证
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findByUsername(username);
    if (user && user.isActive && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.userService.create(registerDto);
    return this.generateTokens(user);
  }

  /**
   * 用户登录
   */
  async login(user: User): Promise<LoginResponse> {
    return this.generateTokens(user);
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      // 验证刷新令牌
      const payload = this.jwtService.verify<AdminJwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // 确保是管理端令牌
      if (payload.type && payload.type !== 'admin') {
        throw new UnauthorizedException('令牌类型错误');
      }

      // 获取用户信息
      const user = await this.userService.findById(payload.sub);
      if (!user.isActive) {
        throw new UnauthorizedException('账号已被禁用');
      }
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /**
   * 获取管理员个人信息
   */
  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * 更新个人信息
   */
  async updateProfile(userId: string, data: { email?: string }) {
    return this.userService.updateProfile(userId, data);
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    await this.userService.changePassword(userId, oldPassword, newPassword);
  }

  /**
   * 生成访问令牌和刷新令牌
   */
  private generateTokens(user: User): LoginResponse {
    const payload: AdminJwtPayload = {
      sub: user.id,
      type: 'admin',
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
