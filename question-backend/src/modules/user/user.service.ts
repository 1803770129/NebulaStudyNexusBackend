/**
 * 用户服务
 *
 * 处理用户相关的业务逻辑
 */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    // 创建用户实体
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 获取所有用户
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * 分页查询用户列表
   */
  async findAllPaginated(query: QueryUserDto) {
    const { page = 1, limit = 10, keyword, role, isActive } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // 关键词搜索（用户名或邮箱）
    if (keyword) {
      queryBuilder.where('(user.username ILIKE :keyword OR user.email ILIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    // 角色筛选
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // 状态筛选
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    queryBuilder
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.role',
        'user.isActive',
        'user.createdAt',
        'user.updatedAt',
      ])
      .orderBy('user.createdAt', 'DESC')
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
   * 修改用户角色
   * 不允许修改自己的角色
   */
  async updateRole(id: string, role: UserRole, currentUserId: string): Promise<User> {
    if (id === currentUserId) {
      throw new ForbiddenException('不能修改自己的角色');
    }
    const user = await this.findById(id);
    user.role = role;
    return this.userRepository.save(user);
  }

  /**
   * 更新用户状态（启用/禁用）
   * 不允许禁用自己
   */
  async updateStatus(id: string, isActive: boolean, currentUserId: string): Promise<User> {
    if (id === currentUserId) {
      throw new ForbiddenException('不能修改自己的状态');
    }
    const user = await this.findById(id);
    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  /**
   * 重置用户密码
   * 不允许重置自己的密码（应使用修改密码接口）
   */
  async resetPassword(id: string, newPassword: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) {
      throw new ForbiddenException('不能重置自己的密码，请使用修改密码功能');
    }
    const user = await this.findById(id);
    user.password = newPassword;
    await this.userRepository.save(user);
  }

  /**
   * 修改自己的密码
   */
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    const isValid = await user.validatePassword(oldPassword);
    if (!isValid) {
      throw new ForbiddenException('旧密码错误');
    }
    user.password = newPassword;
    await this.userRepository.save(user);
  }

  /**
   * 更新个人信息（邮箱）
   */
  async updateProfile(id: string, data: { email?: string }): Promise<User> {
    const user = await this.findById(id);

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (existing) {
        throw new ConflictException('邮箱已被使用');
      }
      user.email = data.email;
    }

    return this.userRepository.save(user);
  }

  /**
   * 删除用户
   * 不允许删除自己
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) {
      throw new ForbiddenException('不能删除自己的账号');
    }
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }
}
