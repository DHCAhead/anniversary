import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: '未提供图片URL' },
        { status: 400 }
      );
    }

    // 检查URL是否是上传目录中的图片
    if (!imageUrl.startsWith('/uploads/')) {
      return NextResponse.json(
        { success: false, message: '无效的图片URL' },
        { status: 400 }
      );
    }

    // 获取文件路径
    const filePath = path.join(process.cwd(), 'public', imageUrl);
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: '文件不存在' },
        { status: 404 }
      );
    }
    
    // 删除文件
    await unlink(filePath);
    
    return NextResponse.json({ 
      success: true, 
      message: '文件删除成功' 
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    return NextResponse.json(
      { success: false, message: '删除文件失败' },
      { status: 500 }
    );
  }
} 