import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@/lib/userService';

// POST /api/users/login - 用户登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证用户登录
    const user = await UserService.login(username, password);
    
    if (user) {
      // 生成简单的token
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 设置cookie
      const cookieStore = await cookies();
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7天
      });

      return NextResponse.json({
        code: '200',
        message: '登录成功',
        data: {
          token,
          userInfo: {
            id: user.id.toString(),
            username: user.username,
            realName: user.realName,
            phone: user.phone,
            mail: user.mail,
          }
        },
        requestId: Date.now().toString(),
        success: true
      });
    } else {
      return NextResponse.json(
        {
          code: '401',
          message: '用户名或密码错误',
          data: null,
          requestId: Date.now().toString(),
          success: false
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('登录错误:', error);
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