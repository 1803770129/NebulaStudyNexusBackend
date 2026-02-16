/**
 * 认证控制器
 *
 * 处理用户认证相关的 HTTP 请求
 */
import { Controller, Post, Body, UseGuards, Get, Patch, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AdminJwtPayload } from './strategies/jwt.strategy';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { ChangeAdminPasswordDto } from './dto/change-admin-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '管理员注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() _loginDto: LoginDto, @Request() req: { user: any }) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @UserType('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前管理员信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@CurrentUser() user: AdminJwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  @Patch('profile')
  @UserType('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '修改个人信息' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async updateProfile(@CurrentUser() user: AdminJwtPayload, @Body() dto: UpdateAdminProfileDto) {
    return this.authService.updateProfile(user.sub, dto);
  }

  @Patch('password')
  @UserType('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  @ApiResponse({ status: 403, description: '旧密码错误' })
  async changePassword(@CurrentUser() user: AdminJwtPayload, @Body() dto: ChangeAdminPasswordDto) {
    await this.authService.changePassword(user.sub, dto.oldPassword, dto.newPassword);
    return { message: '密码修改成功' };
  }
}
