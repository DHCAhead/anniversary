// 添加时间戳或随机参数到图片URL，防止缓存
export function addCacheBuster(url: string): string {
  if (!url) return url;
  const cacheBuster = `?t=${Date.now()}`;
  return url.includes('?') ? `${url}&t=${Date.now()}` : `${url}${cacheBuster}`;
}

// 获取背景图片列表
export async function getBackgrounds(): Promise<string[]> {
  try {
    // 为API请求添加缓存破坏参数
    const response = await fetch(addCacheBuster('/api/backgrounds'));
    if (response.ok) {
      const data = await response.json();
      // 直接返回背景图片URL，不添加缓存破坏参数
      return data.backgrounds || [];
    }
    return [];
  } catch (error) {
    console.error('获取背景图片失败:', error);
    return [];
  }
}

// 保存背景图片列表
export async function saveBackgrounds(backgrounds: string[]): Promise<boolean> {
  try {
    const response = await fetch('/api/backgrounds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backgrounds),
    });

    if (response.ok) {
      return true;
    } else {
      console.error('保存背景图片到服务器失败');
      return false;
    }
  } catch (error) {
    console.error('保存背景图片失败:', error);
    return false;
  }
}

// 添加背景图片
export async function addBackground(imageUrl: string): Promise<boolean> {
  try {
    const backgrounds = await getBackgrounds();
    if (!backgrounds.includes(imageUrl)) {
      backgrounds.push(imageUrl);
      return await saveBackgrounds(backgrounds);
    }
    return true;
  } catch (error) {
    console.error('添加背景图片失败:', error);
    return false;
  }
}

// 删除背景图片
export async function removeBackground(imageUrl: string): Promise<boolean> {
  try {
    const backgrounds = await getBackgrounds();
    const updatedBackgrounds = backgrounds.filter(bg => bg !== imageUrl);
    if (updatedBackgrounds.length !== backgrounds.length) {
      return await saveBackgrounds(updatedBackgrounds);
    }
    return true;
  } catch (error) {
    console.error('删除背景图片失败:', error);
    return false;
  }
} 