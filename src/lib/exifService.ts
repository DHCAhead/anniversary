import EXIF from 'exif-js';

// 扩展 EXIF 模块的类型定义
declare module 'exif-js' {
  interface EXIFStatic {
    getData(img: HTMLImageElement, callback: (this: HTMLImageElement) => void): void;
    getTag(img: HTMLImageElement, tag: string): string | undefined;
  }
}

interface ExifImage extends HTMLImageElement {
  exifdata?: {
    DateTimeOriginal?: string;
    DateTime?: string;
    DateTimeDigitized?: string;
  };
}

/**
 * 从图片文件中解析EXIF日期信息
 * @param file 图片文件
 * @returns 格式化的日期字符串 (YYYY-MM-DD)
 */
export async function parseExifDate(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      // 创建一个FileReader来读取图片
      const reader = new FileReader();
      
      reader.onload = function(e) {
        if (!e.target?.result) {
          resolve(null);
          return;
        }
        
        // 创建一个临时图片对象来加载图片数据
        const img = new Image();
        img.src = e.target.result as string;
        
        img.onload = function() {
          try {
            // 读取EXIF数据
            EXIF.getData(img, function() {
              try {
                // 尝试获取拍摄时间
                const exifDate = EXIF.getTag(this, 'DateTimeOriginal') ||
                                EXIF.getTag(this, 'DateTime') ||
                                EXIF.getTag(this, 'DateTimeDigitized');
                
                if (!exifDate) {
                  resolve(null);
                  return;
                }
                
                // 解析EXIF日期格式 (YYYY:MM:DD HH:mm:ss)
                const match = exifDate.match(/^(\d{4}):(\d{2}):(\d{2})/);
                if (!match) {
                  resolve(null);
                  return;
                }
                
                // 转换为YYYY-MM-DD格式
                const [, year, month, day] = match;
                resolve(`${year}-${month}-${day}`);
              } catch (error) {
                console.error('解析EXIF日期失败:', error);
                resolve(null);
              }
            });
          } catch (error) {
            console.error('读取EXIF数据失败:', error);
            resolve(null);
          }
        };
        
        img.onerror = function() {
          console.error('加载图片失败');
          resolve(null);
        };
      };
      
      reader.onerror = function() {
        console.error('读取文件失败');
        resolve(null);
      };
      
      // 以DataURL格式读取文件
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('处理图片文件失败:', error);
      resolve(null);
    }
  });
}