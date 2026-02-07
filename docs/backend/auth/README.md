# 认证模块 (Auth Module)

## 模块概述

认证模块负责用户登录、注册、Token 管理等功能，使用 JWT (JSON Web Token) 实现无状态认证。

## 文件结构

```
modules/auth/
├── auth.module.ts          # 模块定义
├── auth.controller.ts      # 控制器
├── auth.service.ts         # 服务
├── dto/
│   ├── login.dto.ts        # 登录请求
│   ├── register.dto.ts     # 注册请求
│   └── refresh-token.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts   # JWT 守卫
│   └── local-auth.guard.ts # 本地认证守卫
└── strategies/
    ├── jwt.strategy.ts     # JWT 策略
    └── local.strategy.ts   # 本地策略
```

## 核心代码解析

### 1. 模块定义

```typescript
// auth.module.ts
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### 2. 认证服务

```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 验证用户（登录时调用）
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  // 登录 - 生成 Token
  async login(user: User) {
    const payload = { sub: user.id, username: user.username };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
      user: { id: user.id, username: user.username, email: user.email },
    };
  }

  // 注册
  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });
    return this.login(user);
  }

  // 刷新 Token
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findById(payload.sub);
      if (!user) throw new UnauthorizedException();
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### 3. JWT 策略

```typescript
// strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  // 验证通过后，payload 会被附加到 request.user
  async validate(payload: { sub: string; username: string }) {
    return { id: payload.sub, username: payload.username };
  }
}
```

### 4. JWT 守卫

```typescript
// guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 检查是否标记为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

### 5. 控制器

```typescript
// auth.controller.ts
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()  // 跳过 JWT 验证
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)  // 使用本地策略验证
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('profile')  // 需要 JWT 认证
  async getProfile(@Request() req) {
    return this.userService.findById(req.user.id);
  }
}
```

## 认证流程

### 登录流程

```
1. 客户端发送 POST /api/auth/login { username, password }
2. LocalAuthGuard 拦截请求
3. LocalStrategy.validate() 调用 AuthService.validateUser()
4. 验证通过，用户信息附加到 request.user
5. AuthController.login() 调用 AuthService.login()
6. 生成 accessToken 和 refreshToken 返回
```

### 请求认证流程

```
1. 客户端发送请求，Header: Authorization: Bearer <token>
2. JwtAuthGuard 拦截请求
3. 检查 @Public() 装饰器，公开路由直接放行
4. JwtStrategy 验证 Token
5. 验证通过，用户信息附加到 request.user
6. 请求继续处理
```

### Token 刷新流程

```
1. accessToken 过期，请求返回 401
2. 客户端使用 refreshToken 调用 POST /api/auth/refresh
3. 验证 refreshToken 有效性
4. 生成新的 accessToken 和 refreshToken
5. 客户端更新存储的 Token
```

## DTO 定义

```typescript
// dto/register.dto.ts
export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// dto/login.dto.ts
export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
```

## 全局守卫配置

```typescript
// app.module.ts
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,  // 全局启用 JWT 守卫
    },
  ],
})
export class AppModule {}
```

## @Public() 装饰器

```typescript
// common/decorators/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// 使用示例
@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```
