import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';

// POST /api/users/register - 用户注册
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, realName, phone, mail } = body;

    // 简单的验证逻辑
    if (!username || !password || !realName || !phone || !mail) {
      return NextResponse.json(
        {
          code: '400',
          message: '请填写完整信息',
          data: null,
          requestId: Date.now().toString(),
          success: false
        },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const usernameExists = await UserService.checkUsernameExists(username);
    if (usernameExists) {
      return NextResponse.json(
        {
          code: '409',
          message: '用户名已存在',
          data: null,
          requestId: Date.now().toString(),
          success: false
        },
        { status: 409 }
      );
    }

    // 创建新用户
    await UserService.createUser({ username, password, realName, phone, mail });
    
    return NextResponse.json({
      code: '200',
      message: '注册成功',
      data: null,
      requestId: Date.now().toString(),
      success: true
    });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      {
        code: '500',
        message: '服务器错误',
        data: null,
        requestId: Date.now().toString(),
        success: false
      },
      { status: 500 }
    );
  }
}