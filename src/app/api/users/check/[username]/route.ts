import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../lib/userService';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    
    if (!username) {
      return NextResponse.json(
        { success: false, message: '用户名不能为空' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const usernameExists = await UserService.checkUsernameExists(username);
    
    return NextResponse.json({
      success: true,
      data: usernameExists, // 返回布尔值，true表示用户名已存在
      message: usernameExists ? '用户名已存在' : '用户名可用'
    });
  } catch (error) {
    console.error('检查用户名失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}