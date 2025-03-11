import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 背景图片配置文件路径
const configFilePath = path.join(process.cwd(), 'data', 'backgrounds.json');

// 确保数据目录存在
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取背景图片配置
const readBackgrounds = (): string[] => {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(configFilePath)) {
      // 不使用默认背景，使用空数组
      fs.writeFileSync(configFilePath, JSON.stringify([]), 'utf8');
      return [];
    }
    const data = fs.readFileSync(configFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取背景图片配置失败:', error);
    return [];
  }
};

// 保存背景图片配置
const saveBackgrounds = (backgrounds: string[]): boolean => {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(configFilePath, JSON.stringify(backgrounds), 'utf8');
    return true;
  } catch (error) {
    console.error('保存背景图片配置失败:', error);
    return false;
  }
};

// 获取背景图片列表
export async function GET() {
  const backgrounds = readBackgrounds();
  return NextResponse.json({ backgrounds });
}

// 更新背景图片列表
export async function POST(request: Request) {
  try {
    const backgrounds = await request.json() as string[];
    const success = saveBackgrounds(backgrounds);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: '保存背景图片配置失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('处理POST请求失败:', error);
    return NextResponse.json(
      { success: false, message: '处理请求失败' },
      { status: 500 }
    );
  }
} 