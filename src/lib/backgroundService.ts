// 获取背景图片列表
export async function getBackgrounds(): Promise<string[]> {
  try {
    const response = await fetch('/api/backgrounds', {
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
      console.error('从服务器获取背景图片失败');
      return [];
    }
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