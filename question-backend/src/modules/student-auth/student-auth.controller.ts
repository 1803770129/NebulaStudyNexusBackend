/**
 * 学生端认证控制器
 *
 * 处理学生端的认证相关 HTTP 请求
 */
import { Controller, Post, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentAuthService } from './student-auth.service';
import {
  WxLoginDto,
  StudentRegisterDto,
  StudentLoginDto,
  UpdateStudentProfileDto,
  ChangeStudentPasswordDto,
  BindPhoneDto,
  BindWechatDto,
} from './dto';
import { Public } from '@/common/decorators/public.decorator';
import { UserType } from '@/common/decorators/user-type.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { StudentJwtPayload } from '@/modules/auth/strategies/jwt.strategy';

@ApiTags('student-auth')
@Controller('student-auth')
export class StudentAuthController {
  constructor(private readonly studentAuthService: StudentAuthService) {}

  @Public()
  @Post('wx-login')
  @ApiOperation({ summary: '微信一键登录' })
  @ApiResponse({ status: 201, description: '登录成功' })
  @ApiResponse({ status: 503, description: '微信登录暂不可用' })
  async wxLogin(@Body() dto: WxLoginDto) {
    return this.studentAuthService.wxLogin(dto.code, dto.nickname, dto.avatar);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '手机号注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '手机号已注册' })
  async register(@Body() dto: StudentRegisterDto) {
    return this.studentAuthService.registerByPhone(dto.phone, dto.password, dto.nickname);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '手机号登录' })
  @ApiResponse({ status: 201, description: '登录成功' })
  @ApiResponse({ status: 400, description: '手机号或密码错误' })
  async login(@Body() dto: StudentLoginDto) {
    return this.studentAuthService.loginByPhone(dto.phone, dto.password);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '刷新令牌' })
  @ApiResponse({ status: 201, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '令牌无效或已过期' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.studentAuthService.refreshToken(refreshToken);
  }

  @Get('profile')
  @UserType('student')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取学生个人信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProfile(@CurrentUser() user: StudentJwtPayload) {
    return this.studentAuthService.getProfile(user.sub);
  }

  @Patch('profile')
  @UserType('student')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '修改个人信息' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async updateProfile(
    @CurrentUser() user: StudentJwtPayload,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentAuthService.updateProfile(user.sub, dto);
  }

  @Patch('password')
  @UserType('student')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  @ApiResponse({ status: 400, description: '旧密码错误' })
  async changePassword(
    @CurrentUser() user: StudentJwtPayload,
    @Body() dto: ChangeStudentPasswordDto,
  ) {
    await this.studentAuthService.changePassword(user.sub, dto.oldPassword, dto.newPassword);
    return { message: '密码修改成功' };
  }

  @Patch('bind-phone')
  @UserType('student')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '绑定手机号' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  @ApiResponse({ status: 409, description: '已绑定或手机号已被使用' })
  async bindPhone(@CurrentUser() user: StudentJwtPayload, @Body() dto: BindPhoneDto) {
    return this.studentAuthService.bindPhone(user.sub, dto.phone, dto.password);
  }

  @Patch('bind-wechat')
  @UserType('student')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '绑定微信' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  @ApiResponse({ status: 409, description: '已绑定或微信已被使用' })
  async bindWechat(@CurrentUser() user: StudentJwtPayload, @Body() dto: BindWechatDto) {
    return this.studentAuthService.bindWechat(user.sub, dto.code);
  }
}
