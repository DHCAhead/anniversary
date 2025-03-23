import EXIF from 'exif-js';

// 扩展 EXIF 模块的类型定义
declare module 'exif-js' {
  interface EXIFStatic {
    getData(img: HTMLImageElement, callback: (this: HTMLImageElement & {
      exifdata?: {
        DateTimeOriginal?: string;
        DateTime?: string;
        DateTimeDigitized?: string;
      }
    }) => void): void;
    getTag(img: HTMLImageElement & {
      exifdata?: {
        DateTimeOriginal?: string;
        DateTime?: string;
        DateTimeDigitized?: string;
      }
    }, tag: string): string | undefined;
  }
}

/**
 * 从图片文件中解析EXIF日期信息
 * @param file 图片文件
 * @returns 格式化的日期字符串 (YYYY-MM-DD)
 */
export async function parseExifDate(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        if (!e.target?.result) {
          resolve(null);
          return;
        }

        const view = new DataView(e.target.result as ArrayBuffer);
        let offset = 0;
        
        // 检查是否是JPEG格式
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(null);
          return;
        }
        
        const length = view.byteLength;
        offset += 2;
        
        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          
          // 找到APP1标记（Exif数据）
          if (marker === 0xFFE1) {
            const exifLength = view.getUint16(offset, false);
            offset += 2;
            
            // 检查Exif标识符
            const exifIdCode = view.getUint32(offset, false);
            if (exifIdCode !== 0x45786966) {
              resolve(null);
              return;
            }
            
            offset += 6; // 跳过Exif头部
            
            // 获取字节序
            const littleEndian = view.getUint16(offset, false) === 0x4949;
            offset += 2;
            
            // 检查标记
            if (view.getUint16(offset, littleEndian) !== 0x002A) {
              resolve(null);
              return;
            }
            offset += 2;
            
            // 获取第一个IFD偏移量
            const firstIFDOffset = view.getUint32(offset, littleEndian);
            offset += firstIFDOffset - 8;
            
            // 获取目录项数量
            const entries = view.getUint16(offset, littleEndian);
            offset += 2;
            
            // 搜索DateTime标签
            for (let i = 0; i < entries; i++) {
              const tag = view.getUint16(offset, littleEndian);
              
              // DateTime标签是0x0132
              if (tag === 0x0132) {
                const type = view.getUint16(offset + 2, littleEndian);
                const numValues = view.getUint32(offset + 4, littleEndian);
                const valueOffset = view.getUint32(offset + 8, littleEndian) + 6;
                
                if (type === 2 && numValues === 20) {
                  let dateStr = '';
                  for (let j = 0; j < 19; j++) {
                    dateStr += String.fromCharCode(view.getUint8(valueOffset + j));
                  }
                  
                  // 转换为YYYY-MM-DD格式
                  const match = dateStr.match(/^(\d{4}):(\d{2}):(\d{2})/);
                  if (match) {
                    resolve(`${match[1]}-${match[2]}-${match[3]}`);
                    return;
                  }
                }
              }
              offset += 12;
            }
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(null);
      } catch (error) {
        console.error('解析EXIF信息失败:', error);
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      console.error('读取文件失败');
      resolve(null);
    };
    
    // 读取文件的前128KB，通常足够包含EXIF信息
    const blob = file.slice(0, 131072);
    reader.readAsArrayBuffer(blob);
  });
}