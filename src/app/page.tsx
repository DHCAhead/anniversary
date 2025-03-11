'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import Timeline from '@/components/timeline/Timeline';
import Footer from '@/components/ui/Footer';
import Envelope from '@/components/ui/Envelope';
import Gift from '@/components/ui/Gift';
import BackgroundSlider from '@/components/ui/BackgroundSlider';
import BackgroundUploader from '@/components/ui/BackgroundUploader';
import { getBackgrounds } from '@/lib/backgroundService';

export default function Home() {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);

  // 获取背景图片
  useEffect(() => {
    async function loadBackgrounds() {
      try {
        const loadedBackgrounds = await getBackgrounds();
        if (loadedBackgrounds.length > 0) {
          setBackgrounds(loadedBackgrounds);
        }
      } catch (error) {
        console.error('加载背景图片失败:', error);
      }
    }

    loadBackgrounds();
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* 背景图片轮播 */}
      {backgrounds.length > 0 && <BackgroundSlider images={backgrounds} />}
      
      {/* 信封和背景上传按钮 */}
      <Envelope />
      <BackgroundUploader />
      
      <Header />
      
      <main className="flex-grow py-12 z-10 relative">
        <Timeline />
        
        {/* 礼物图标 */}
        <Gift />
      </main>
      
      <Footer />
    </div>
  );
}
