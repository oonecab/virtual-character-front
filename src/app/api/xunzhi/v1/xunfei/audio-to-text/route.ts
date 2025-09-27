import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 收到语音转文字请求');
    
    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('🎤 未找到音频文件');
      return NextResponse.json({
        code: '400',
        message: '未找到音频文件',
        data: null,
        requestId: Date.now().toString()
      }, { status: 400 });
    }
    
    console.log('🎤 接收到音频文件:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // 模拟语音转文字处理
    // 在实际项目中，这里应该调用讯飞的API
    const mockResult = {
      code: '200',
      message: '转换成功',
      data: {
        result: '这是一个测试语音转文字的结果', // 模拟转换结果
        stack: {
          status: 2,
          next: {
            status: 2,
            next: null
          }
        }
      },
      requestId: Date.now().toString()
    };
    
    console.log('🎤 返回模拟结果:', mockResult);
    
    return NextResponse.json(mockResult);
    
  } catch (error) {
    console.error('🎤 语音转文字处理失败:', error);
    
    return NextResponse.json({
      code: '500',
      message: '服务器内部错误',
      data: null,
      requestId: Date.now().toString()
    }, { status: 500 });
  }
}