/**
 * JWT 策略
 * 
 * 用于验证 JWT 令牌并提取用户信息
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/modules/user/user.service';

/**
 * JWT Payload 接口
 */
export interface JwtPayload {
  sub: string;      // 用户 ID
  username: string; // 用户名
  role: string;     // 用户角色
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      // 从 Authorization Bearer 头提取令牌
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不忽略过期时间
      ignoreExpiration: false,
      // JWT 密钥
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * 验证 JWT payload
   * 返回的对象会被附加到 request.user
   */
  async validate(payload: JwtPayload) {
    // 可选：验证用户是否仍然存在
    try {
      await this.userService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
