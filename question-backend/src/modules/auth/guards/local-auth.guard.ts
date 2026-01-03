/**
 * 本地认证守卫
 * 
 * 用于登录接口的用户名密码验证
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
