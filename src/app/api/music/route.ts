import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), 'public', 'music');
    
    // 确保目录存在
    if (!fs.existsSync(musicDir)) {
      fs.mkdirSync(musicDir, { recursive: true });
    }

    // 读取目录中的所有文件
    const files = fs.readdirSync(musicDir);
    
    // 过滤出音乐文件
    const musicFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext);
    });

    return NextResponse.json({ files: musicFiles });
  } catch (error) {
    console.error('获取音乐文件列表失败:', error);
    return NextResponse.json({ error: '获取音乐文件列表失败' }, { status: 500 });
  }
} 