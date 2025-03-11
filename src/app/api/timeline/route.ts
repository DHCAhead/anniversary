import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 定义时间轴事件类型
export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  content: string;
  images: string[]; // 修改为图片数组
};

// 数据文件路径
const dataFilePath = path.join(process.cwd(), 'data', 'timeline.json');

// 确保数据目录存在
const ensureDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取数据
const readData = (): TimelineEvent[] => {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8');
      return [];
    }
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    return [];
  }
};

// 写入数据
const writeData = (data: TimelineEvent[]): boolean => {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入数据失败:', error);
    return false;
  }
};

// 获取所有时间轴事件
export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

// 添加或更新时间轴事件
export async function POST(request: Request) {
  try {
    const events = await request.json() as TimelineEvent[];
    const success = writeData(events);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: '保存数据失败' },
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