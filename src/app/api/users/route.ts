import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';

// GET /api/users - 获取用户列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const current = parseInt(searchParams.get('current') || '1');
    const size = parseInt(searchParams.get('size') || '10');
    const keyword = searchParams.get('keyword') || '';

    // 从数据库获取用户列表
    const result = await UserService.getUserList({ current, size, keyword });

    return NextResponse.json({
      code: '200',
      message: '获取成功',
      data: result,
      requestId: Date.now().toString(),
      success: true
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
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

// POST /api/users - 创建用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 临时返回成功响应
    return NextResponse.json({
      code: '200',
      message: '创建成功',
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