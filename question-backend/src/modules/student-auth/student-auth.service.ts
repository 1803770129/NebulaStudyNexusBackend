/**
 * 学生端认证服务
 *
 * 处理学生端登录、注册、个人信息管理等业务逻辑
 */
import { Injectable, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { StudentService } from '@/modules/student/student.service';
import { Student } from '@/modules/student/entities/student.entity';
import { StudentJwtPayload } from '@/modules/auth/strategies/jwt.strategy';

/**
 * 学生登录响应接口
 */
export interface StudentLoginResponse {
  accessToken: string;
  refreshToken: string;
  student: {
    id: string;
    phone: string | null;
    nickname: string;
    avatar: string;
    wxOpenid: string | null;
  };
  isNewUser?: boolean;
}

@Injectable()
export class StudentAuthService {
  constructor(
    private studentService: StudentService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 微信登录
   * 使用 code 换取 openid，查找或创建学生
   */
  async wxLogin(code: string, nickname?: string, avatar?: string): Promise<StudentLoginResponse> {
    const appid = this.configService.get<string>('wechat.appid');
    const secret = this.configService.get<string>('wechat.secret');

    if (!appid || !secret) {
      throw new ServiceUnavailableException('微信登录暂不可用，请使用手机号登录');
    }

    // 调用微信 jscode2session 接口
    let wxResponse: any;
    try {
      const url = `https://api.weixin.qq.com/sns/jscode2session`;
      const res = await axios.get(url, {
        params: {
          appid,
          secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });
      wxResponse = res.data;
    } catch {
      throw new ServiceUnavailableException('微信服务暂不可用');
    }

    if (wxResponse.errcode) {
      throw new UnauthorizedException(`微信登录失败：${wxResponse.errmsg || '未知错误'}`);
    }

    const { openid, unionid } = wxResponse;

    // 查找或创建学生
    let student = await this.studentService.findByWxOpenid(openid);
    let isNewUser = false;

    if (student) {
      // 已有用户 → 更新登录时间
      await this.studentService.updateLastLogin(student.id);
      // 更新昵称头像（如果有传入）
      if (nickname || avatar) {
        student = await this.studentService.updateProfile(student.id, {
          ...(nickname ? { nickname } : {}),
          ...(avatar ? { avatar } : {}),
        });
      }
    } else {
      // 新用户 → 创建
      student = await this.studentService.createWxStudent({
        wxOpenid: openid,
        wxUnionid: unionid,
        nickname,
        avatar,
      });
      isNewUser = true;
    }

    return {
      ...this.generateStudentTokens(student),
      isNewUser,
    };
  }

  /**
   * 手机号注册
   */
  async registerByPhone(
    phone: string,
    password: string,
    nickname?: string,
  ): Promise<StudentLoginResponse> {
    const student = await this.studentService.createPhoneStudent({
      phone,
      password,
      nickname,
    });

    return this.generateStudentTokens(student);
  }

  /**
   * 手机号登录
   */
  async loginByPhone(phone: string, password: string): Promise<StudentLoginResponse> {
    const student = await this.studentService.validatePhoneLogin(phone, password);
    return this.generateStudentTokens(student);
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<StudentLoginResponse> {
    try {
      const payload = this.jwtService.verify<StudentJwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      if (payload.type !== 'student') {
        throw new UnauthorizedException('令牌类型错误');
      }

      const student = await this.studentService.findById(payload.sub);
      if (!student.isActive) {
        throw new UnauthorizedException('账号已被禁用');
      }
      return this.generateStudentTokens(student);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /**
   * 获取学生个人信息
   */
  async getProfile(studentId: string): Promise<Student> {
    return this.studentService.findById(studentId);
  }

  /**
   * 更新学生个人信息
   */
  async updateProfile(
    studentId: string,
    data: { nickname?: string; avatar?: string },
  ): Promise<Student> {
    return this.studentService.updateProfile(studentId, data);
  }

  /**
   * 修改密码
   */
  async changePassword(studentId: string, oldPassword: string, newPassword: string): Promise<void> {
    await this.studentService.changePassword(studentId, oldPassword, newPassword);
  }

  /**
   * 绑定手机号
   */
  async bindPhone(studentId: string, phone: string, password: string): Promise<Student> {
    return this.studentService.bindPhone(studentId, phone, password);
  }

  /**
   * 绑定微信
   */
  async bindWechat(studentId: string, code: string): Promise<Student> {
    const appid = this.configService.get<string>('wechat.appid');
    const secret = this.configService.get<string>('wechat.secret');

    if (!appid || !secret) {
      throw new ServiceUnavailableException('微信功能暂不可用');
    }

    // 调用微信接口获取 openid
    let wxResponse: any;
    try {
      const url = `https://api.weixin.qq.com/sns/jscode2session`;
      const res = await axios.get(url, {
        params: {
          appid,
          secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });
      wxResponse = res.data;
    } catch {
      throw new ServiceUnavailableException('微信服务暂不可用');
    }

    if (wxResponse.errcode) {
      throw new UnauthorizedException(`微信授权失败：${wxResponse.errmsg || '未知错误'}`);
    }

    return this.studentService.bindWechat(studentId, wxResponse.openid, wxResponse.unionid);
  }

  /**
   * 生成学生端 JWT 令牌
   */
  private generateStudentTokens(student: Student): StudentLoginResponse {
    const payload: StudentJwtPayload = {
      sub: student.id,
      type: 'student',
      nickname: student.nickname,
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
      student: {
        id: student.id,
        phone: student.phone,
        nickname: student.nickname,
        avatar: student.avatar,
        wxOpenid: student.wxOpenid,
      },
    };
  }
}
