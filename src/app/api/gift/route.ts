import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 礼物内容文件路径
const giftFilePath = path.join(process.cwd(), 'data', 'gift.md');

// 确保目录存在
const ensureDirectoryExists = () => {
  const dir = path.dirname(giftFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 读取礼物内容
const readGiftContent = (): string => {
  ensureDirectoryExists();
  
  if (!fs.existsSync(giftFilePath)) {
    // 默认礼物内容
    const defaultContent = `# 小惊喜 🎁

亲爱的，这是我为你准备的特别惊喜！

## 惊喜清单

1. **一份特别的礼物** - 等你来发现
2. **一段美好的回忆** - 我们一起创造
3. **一个温暖的拥抱** - 随时为你准备

> 爱是最好的礼物，而你是我最珍贵的礼物。

![礼物图片](https://source.unsplash.com/random/800x600/?gift)

期待与你一起度过更多美好时光！❤️
`;
    fs.writeFileSync(giftFilePath, defaultContent, { encoding: 'utf8' });
    return defaultContent;
  }
  
  return fs.readFileSync(giftFilePath, { encoding: 'utf8' });
};

// 保存礼物内容
const saveGiftContent = (content: string): boolean => {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(giftFilePath, content, { encoding: 'utf8' });
    return true;
  } catch (error) {
    console.error('保存礼物内容失败:', error);
    return false;
  }
};

// GET 请求处理 - 获取礼物内容
export async function GET() {
  const content = readGiftContent();
  return NextResponse.json({ content });
}

// POST 请求处理 - 保存礼物内容
export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    if (typeof content !== 'string') {
      return NextResponse.json(
        { success: false, message: '无效的内容格式' },
        { status: 400 }
      );
    }
    
    const success = saveGiftContent(content);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: '保存礼物内容失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('处理礼物内容请求失败:', error);
    return NextResponse.json(
      { success: false, message: '处理请求失败' },
      { status: 500 }
    );
  }
} 