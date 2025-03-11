import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 图片上传目录
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// 确保上传目录存在
const ensureUploadDirExists = async () => {
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: '未找到文件' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    
    // 确保上传目录存在
    await ensureUploadDirExists();
    
    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 写入文件
    await writeFile(filePath, buffer);
    
    // 返回文件URL
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl 
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    return NextResponse.json(
      { success: false, message: '上传文件失败' },
      { status: 500 }
    );
  }
}

// 设置较大的请求体大小限制
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 