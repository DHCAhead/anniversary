import { TimelineEvent } from '@/app/api/timeline/route';

// 本地存储键名
const STORAGE_KEY = 'timeline-events';

// 获取所有时间轴事件
export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  try {
    // 首先尝试从服务器获取数据
    const response = await fetch('/api/timeline', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('从服务器获取数据失败，尝试从本地存储获取');
      // 如果服务器获取失败，尝试从本地存储获取
      return getLocalEvents();
    }
  } catch (error) {
    console.error('获取时间轴事件失败:', error);
    // 如果API请求失败，尝试从本地存储获取
    return getLocalEvents();
  }
}

// 保存时间轴事件到服务器
export async function saveTimelineEvents(events: TimelineEvent[]): Promise<boolean> {
  try {
    // 首先尝试保存到服务器
    const response = await fetch('/api/timeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(events),
    });

    if (response.ok) {
      // 同时保存到本地存储作为备份
      saveLocalEvents(events);
      return true;
    } else {
      console.error('保存到服务器失败，尝试保存到本地存储');
      // 保存到本地存储
      saveLocalEvents(events);
      
      // 尝试解析错误信息
      const errorData = await response.json().catch(() => ({}));
      console.error('服务器错误:', errorData.message || '未知错误');
      
      return false;
    }
  } catch (error) {
    console.error('保存事件失败:', error);
    // 发生错误时也尝试保存到本地存储
    saveLocalEvents(events);
    return false;
  }
}

// 从本地存储获取事件
function getLocalEvents(): TimelineEvent[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (savedEvents) {
      return JSON.parse(savedEvents);
    }
  } catch (error) {
    console.error('从本地存储获取数据失败:', error);
  }
  return [];
}

// 保存事件到本地存储
function saveLocalEvents(events: TimelineEvent[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
} 