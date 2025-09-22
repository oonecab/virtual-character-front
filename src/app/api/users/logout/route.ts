import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/users/logout - 用户退出登录
export async function POST(request: NextRequest) {
  try {
    // 清除cookie
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

    return NextResponse.json({
      code: '200',
      message: '退出成功',
      data: null,
      requestId: Date.now().toString(),
      success: true
    });
  } catch (error) {
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