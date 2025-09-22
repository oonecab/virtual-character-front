import { prisma } from './prisma'
import { TUser } from '@prisma/client'
import bcrypt from 'bcryptjs'

export interface CreateUserData {
  username: string
  password: string
  realName?: string
  phone?: string
  mail?: string
}

export interface UpdateUserData {
  username?: string
  password?: string
  realName?: string
  phone?: string
  mail?: string
}

export interface UserQueryOptions {
  page?: number
  pageSize?: number
  username?: string
  realName?: string
  phone?: string
  mail?: string
}

export class UserService {
  /**
   * 创建用户
   */
  static async createUser(userData: CreateUserData): Promise<TUser> {
    // 检查用户名是否已存在
    const existingUser = await prisma.tUser.findFirst({
      where: {
        username: userData.username,
        delFlag: 0
      }
    })

    if (existingUser) {
      throw new Error('用户名已存在')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // 创建用户
    const user = await prisma.tUser.create({
      data: {
        username: userData.username,
        password: hashedPassword,
        realName: userData.realName,
        phone: userData.phone,
        mail: userData.mail,
        createTime: new Date(),
        updateTime: new Date(),
        delFlag: 0
      }
    })

    return user
  }

  /**
   * 根据ID获取用户
   */
  static async getUserById(id: bigint): Promise<TUser | null> {
    return await prisma.tUser.findFirst({
      where: {
        id,
        delFlag: 0
      }
    })
  }

  /**
   * 根据用户名获取用户
   */
  static async getUserByUsername(username: string): Promise<TUser | null> {
    return await prisma.tUser.findFirst({
      where: {
        username,
        delFlag: 0
      }
    })
  }

  /**
   * 更新用户信息
   */
  static async updateUser(id: bigint, userData: UpdateUserData): Promise<TUser> {
    const updateData: any = {
      ...userData,
      updateTime: new Date()
    }

    // 如果更新密码，需要加密
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10)
    }

    // 如果更新用户名，检查是否已存在
    if (userData.username) {
      const existingUser = await prisma.tUser.findFirst({
        where: {
          username: userData.username,
          delFlag: 0,
          NOT: {
            id
          }
        }
      })

      if (existingUser) {
        throw new Error('用户名已存在')
      }
    }

    return await prisma.tUser.update({
      where: { id },
      data: updateData
    })
  }

  /**
   * 软删除用户
   */
  static async deleteUser(id: bigint): Promise<TUser> {
    return await prisma.tUser.update({
      where: { id },
      data: {
        delFlag: 1,
        deletionTime: BigInt(Date.now()),
        updateTime: new Date()
      }
    })
  }

  /**
   * 物理删除用户（谨慎使用）
   */
  static async hardDeleteUser(id: bigint): Promise<TUser> {
    return await prisma.tUser.delete({
      where: { id }
    })
  }

  /**
   * 分页查询用户列表
   */
  static async getUserList(options: UserQueryOptions = {}) {
    const {
      page = 1,
      pageSize = 10,
      username,
      realName,
      phone,
      mail
    } = options

    const where: any = {
      delFlag: 0
    }

    // 构建查询条件
    if (username) {
      where.username = {
        contains: username
      }
    }
    if (realName) {
      where.realName = {
        contains: realName
      }
    }
    if (phone) {
      where.phone = {
        contains: phone
      }
    }
    if (mail) {
      where.mail = {
        contains: mail
      }
    }

    const skip = (page - 1) * pageSize

    const [users, total] = await Promise.all([
      prisma.tUser.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createTime: 'desc'
        }
      }),
      prisma.tUser.count({ where })
    ])

    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  /**
   * 用户登录
   */
  static async login(username: string, password: string): Promise<TUser | null> {
    const user = await this.getUserByUsername(username)
    if (!user || !user.password || user.delFlag === 1) {
      return null
    }

    const isValid = await bcrypt.compare(password, user.password)
    return isValid ? user : null
  }

  /**
   * 验证用户密码
   */
  static async validatePassword(username: string, password: string): Promise<TUser | null> {
    const user = await this.getUserByUsername(username)
    if (!user || !user.password) {
      return null
    }

    const isValid = await bcrypt.compare(password, user.password)
    return isValid ? user : null
  }

  /**
   * 检查用户名是否存在
   */
  static async checkUsernameExists(username: string): Promise<boolean> {
    const user = await prisma.tUser.findFirst({
      where: {
        username,
        delFlag: 0
      }
    })
    return !!user
  }

  /**
   * 恢复已删除的用户
   */
  static async restoreUser(id: bigint): Promise<TUser> {
    return await prisma.tUser.update({
      where: { id },
      data: {
        delFlag: 0,
        deletionTime: null,
        updateTime: new Date()
      }
    })
  }
}