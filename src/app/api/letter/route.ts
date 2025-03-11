import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 信件文件路径
const letterFilePath = path.join(process.cwd(), 'data', 'letter.md');

// 确保数据目录存在
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取信件内容
const readLetter = (): string => {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(letterFilePath)) {
      const defaultContent = `# 我们的100天

亲爱的，

这是我们在一起的第100天，感谢你一直陪伴在我身边。

希望未来的日子里，我们能一起创造更多美好的回忆。

爱你的我`;
      fs.writeFileSync(letterFilePath, defaultContent, 'utf8');
      return defaultContent;
    }
    return fs.readFileSync(letterFilePath, 'utf8');
  } catch (error) {
    console.error('读取信件失败:', error);
    return '读取信件内容失败';
  }
};

// 保存信件内容
const saveLetter = (content: string): boolean => {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(letterFilePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('保存信件失败:', error);
    return false;
  }
};

// 获取信件内容
export async function GET() {
  const content = readLetter();
  return NextResponse.json({ content });
}

// 更新信件内容
export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { success: false, message: '内容不能为空' },
        { status: 400 }
      );
    }
    
    const success = saveLetter(content);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: '保存信件失败' },
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