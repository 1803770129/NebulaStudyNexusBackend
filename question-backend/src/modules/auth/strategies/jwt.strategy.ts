/**
 * JWT 策略
 *
 * 用于验证 JWT 令牌并提取用户信息
 * 支持双用户类型：admin（管理端）和 student（学生端）
 */
import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/modules/user/user.service';
import { StudentService } from '@/modules/student/student.service';
import { UserRole } from '@/modules/user/enums/user-role.enum';

/**
 * 管理端 JWT Payload
 */
export interface AdminJwtPayload {
  sub: string;
  type: 'admin';
  username: string;
  role: UserRole;
}

/**
 * 学生端 JWT Payload
 */
export interface StudentJwtPayload {
  sub: string;
  type: 'student';
  nickname: string;
}

/**
 * 统一 JWT Payload 类型
 */
export type JwtPayload = AdminJwtPayload | StudentJwtPayload;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    @Inject(forwardRef(() => StudentService))
    private studentService: StudentService,
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
   * 根据 type 字段查询不同的表，验证用户存在且 isActive
   * 返回的对象会被附加到 request.user
   */
  async validate(payload: JwtPayload) {
    if (payload.type === 'student') {
      // 学生端验证
      try {
        const student = await this.studentService.findById(payload.sub);
        if (!student.isActive) {
          throw new UnauthorizedException('账号已被禁用');
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) throw error;
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      return {
        sub: payload.sub,
        type: 'student' as const,
        nickname: payload.nickname,
      };
    }

    // 管理端验证（默认 / type === 'admin' / 旧 token 无 type 字段）
    try {
      const user = await this.userService.findById(payload.sub);
      if (!user.isActive) {
        throw new UnauthorizedException('账号已被禁用');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return {
      sub: payload.sub,
      type: 'admin' as const,
      username: (payload as AdminJwtPayload).username,
      role: (payload as AdminJwtPayload).role,
    };
  }
}
