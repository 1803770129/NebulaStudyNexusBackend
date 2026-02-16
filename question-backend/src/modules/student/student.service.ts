/**
 * 学生服务
 *
 * 处理学生相关的业务逻辑
 */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Student } from './entities/student.entity';
import { QueryStudentDto } from './dto/query-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  /**
   * 分页查询学生列表
   */
  async findAllPaginated(query: QueryStudentDto) {
    const { page = 1, limit = 10, keyword, isActive } = query;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 关键词搜索（昵称或手机号）
    const queryBuilder = this.studentRepository.createQueryBuilder('student');

    if (keyword) {
      queryBuilder.where('(student.nickname ILIKE :keyword OR student.phone ILIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('student.isActive = :isActive', { isActive });
    }

    queryBuilder
      .orderBy('student.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据 ID 查找学生
   */
  async findById(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException('学生不存在');
    }
    return student;
  }

  /**
   * 根据微信 openid 查找学生
   */
  async findByWxOpenid(wxOpenid: string): Promise<Student | null> {
    return this.studentRepository.findOne({ where: { wxOpenid } });
  }

  /**
   * 根据手机号查找学生
   */
  async findByPhone(phone: string): Promise<Student | null> {
    return this.studentRepository.findOne({ where: { phone } });
  }

  /**
   * 创建微信用户
   */
  async createWxStudent(data: {
    wxOpenid: string;
    wxUnionid?: string;
    nickname?: string;
    avatar?: string;
  }): Promise<Student> {
    const existing = await this.findByWxOpenid(data.wxOpenid);
    if (existing) {
      throw new ConflictException('该微信账号已注册');
    }

    const student = this.studentRepository.create({
      wxOpenid: data.wxOpenid,
      wxUnionid: data.wxUnionid || null,
      nickname: data.nickname || '微信用户',
      avatar: data.avatar || '',
      lastLoginAt: new Date(),
    });

    return this.studentRepository.save(student);
  }

  /**
   * 创建手机号用户
   */
  async createPhoneStudent(data: {
    phone: string;
    password: string;
    nickname?: string;
  }): Promise<Student> {
    const existing = await this.findByPhone(data.phone);
    if (existing) {
      throw new ConflictException('该手机号已注册');
    }

    const student = this.studentRepository.create({
      phone: data.phone,
      password: data.password,
      nickname: data.nickname || `用户${data.phone.slice(-4)}`,
      lastLoginAt: new Date(),
    });

    return this.studentRepository.save(student);
  }

  /**
   * 验证手机号登录
   */
  async validatePhoneLogin(phone: string, password: string): Promise<Student> {
    const student = await this.findByPhone(phone);
    if (!student) {
      throw new BadRequestException('手机号或密码错误');
    }

    if (!student.isActive) {
      throw new BadRequestException('账号已被禁用');
    }

    const isPasswordValid = await student.validatePassword(password);
    if (!isPasswordValid) {
      throw new BadRequestException('手机号或密码错误');
    }

    // 更新最后登录时间
    student.lastLoginAt = new Date();
    await this.studentRepository.save(student);

    return student;
  }

  /**
   * 更新学生状态（启用/禁用）
   */
  async updateStatus(id: string, isActive: boolean): Promise<Student> {
    const student = await this.findById(id);
    student.isActive = isActive;
    return this.studentRepository.save(student);
  }

  /**
   * 更新学生个人信息
   */
  async updateProfile(id: string, data: { nickname?: string; avatar?: string }): Promise<Student> {
    const student = await this.findById(id);

    if (data.nickname !== undefined) student.nickname = data.nickname;
    if (data.avatar !== undefined) student.avatar = data.avatar;

    return this.studentRepository.save(student);
  }

  /**
   * 修改学生密码
   */
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const student = await this.findById(id);

    if (!student.password) {
      throw new BadRequestException('请先设置密码（微信用户需先绑定手机号）');
    }

    const isValid = await student.validatePassword(oldPassword);
    if (!isValid) {
      throw new BadRequestException('旧密码错误');
    }

    student.password = newPassword;
    await this.studentRepository.save(student);
  }

  /**
   * 绑定手机号
   */
  async bindPhone(id: string, phone: string, password: string): Promise<Student> {
    const student = await this.findById(id);

    if (student.phone) {
      throw new ConflictException('已绑定手机号');
    }

    // 检查手机号是否已被其他学生使用
    const existing = await this.findByPhone(phone);
    if (existing) {
      throw new ConflictException('该手机号已被使用');
    }

    student.phone = phone;
    student.password = password;
    return this.studentRepository.save(student);
  }

  /**
   * 绑定微信
   */
  async bindWechat(id: string, wxOpenid: string, wxUnionid?: string): Promise<Student> {
    const student = await this.findById(id);

    if (student.wxOpenid) {
      throw new ConflictException('已绑定微信');
    }

    // 检查 openid 是否已被其他学生使用
    const existing = await this.findByWxOpenid(wxOpenid);
    if (existing) {
      throw new ConflictException('该微信已被其他账号绑定');
    }

    student.wxOpenid = wxOpenid;
    if (wxUnionid) student.wxUnionid = wxUnionid;
    return this.studentRepository.save(student);
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.studentRepository.update(id, { lastLoginAt: new Date() });
  }

  /**
   * 删除学生
   */
  async remove(id: string): Promise<void> {
    const student = await this.findById(id);
    await this.studentRepository.remove(student);
  }
}
