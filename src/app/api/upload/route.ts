import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 确保上传目录存在
const ensureUploadDirExists = async (dirName: string) => {
  const uploadDir = path.join(process.cwd(), 'public', dirName);
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadType = formData.get('type') as string || 'uploads'; // 默认上传到uploads目录
    const useSimpleName = formData.get('useSimpleName') === 'true';
    
    // 检查是否有多文件上传
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File;
    
    // 如果没有文件，返回错误
    if ((!files || files.length === 0) && !singleFile) {
      return NextResponse.json(
        { success: false, message: '未找到文件' },
        { status: 400 }
      );
    }
    
    // 确保上传目录存在
    const uploadDir = await ensureUploadDirExists(uploadType);
    
    // 处理多文件上传
    if (files && files.length > 0) {
      const uploadedFiles = [];
      
      for (const file of files) {
        // 生成文件名
        const fileExtension = path.extname(file.name).toLowerCase();
        let fileName;
        
        if (useSimpleName) {
          // 使用简单文件名: bg-timestamp.jpg
          fileName = `bg-${Date.now()}-${Math.floor(Math.random() * 1000)}${fileExtension}`;
        } else {
          // 使用随机文件名
          fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
        }
        
        const filePath = path.join(uploadDir, fileName);
        
        // 读取文件内容
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // 写入文件
        await writeFile(filePath, buffer);
        
        // 添加到上传文件列表
        uploadedFiles.push(`/${uploadType}/${fileName}`);
      }
      
      return NextResponse.json({ 
        success: true, 
        urls: uploadedFiles,
        url: uploadedFiles[0] // 为了兼容旧代码，返回第一个文件的URL
      });
    } 
    // 处理单文件上传
    else if (singleFile) {
      // 生成文件名
      const fileExtension = path.extname(singleFile.name).toLowerCase();
      let fileName;
      
      if (useSimpleName) {
        // 使用简单文件名: bg-timestamp.jpg
        fileName = `bg-${Date.now()}${fileExtension}`;
      } else {
        // 使用随机文件名
        fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
      }
      
      const filePath = path.join(uploadDir, fileName);
      
      // 读取文件内容
      const bytes = await singleFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // 写入文件
      await writeFile(filePath, buffer);
      
      // 返回文件URL
      const fileUrl = `/${uploadType}/${fileName}`;
      
      return NextResponse.json({ 
        success: true, 
        url: fileUrl,
        urls: [fileUrl] // 为了兼容新代码，也返回urls数组
      });
    }
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