'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import Timeline from '@/components/timeline/Timeline';
import Footer from '@/components/ui/Footer';
import Envelope from '@/components/ui/Envelope';
import Gift from '@/components/ui/Gift';
import BackgroundSlider from '@/components/ui/BackgroundSlider';
import BackgroundUploader from '@/components/ui/BackgroundUploader';
import PetalsFalling from '@/components/ui/PetalsFalling';
import { getBackgrounds } from '@/lib/backgroundService';

export default function Home() {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 获取背景图片
  useEffect(() => {
    async function loadBackgrounds() {
      try {
        const loadedBackgrounds = await getBackgrounds();
        if (loadedBackgrounds && loadedBackgrounds.length > 0) {
          // 过滤掉无效的背景图片路径
          const validBackgrounds = loadedBackgrounds.filter(bg => 
            bg && bg.startsWith('/backgrounds/') && 
            (bg.endsWith('.jpg') || bg.endsWith('.jpeg') || bg.endsWith('.png') || bg.endsWith('.webp') || bg.endsWith('.gif'))
          );
          setBackgrounds(validBackgrounds);
        }
      } catch (error) {
        console.error('加载背景图片失败:', error);
      }
    }

    loadBackgrounds();
  }, []);

  // 当弹窗打开时，禁止背景滚动
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // 禁止触摸操作
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = ''; // 恢复触摸操作
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isModalOpen]);

  return (
    <div className={`flex flex-col min-h-screen ${isModalOpen ? 'overflow-hidden' : ''}`}>
      {/* 弹窗层 - 最高层级 */}
      <div className="fixed inset-0 z-[999] pointer-events-none">
        {/* 这里不放任何内容，只是为了确保弹窗层级高于其他所有元素 */}
      </div>
      
      {/* 按钮层 - 中间层级 */}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-[50] pointer-events-none">
        {/* 信封按钮 - 左上角 */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <Envelope onModalChange={setIsModalOpen} />
        </div>
        
        {/* 背景上传按钮 - 右上角 */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <BackgroundUploader onModalChange={setIsModalOpen} />
        </div>
      </div>
      
      {/* 内容层 - 最底层 */}
      <div className="flex flex-col min-h-screen relative z-[10]">
        {/* 上半部分 - 包含背景图片和Header */}
        <div className="h-[50vh] relative">
          {/* 背景图片 */}
          <BackgroundSlider images={backgrounds} />
          <Header />
        </div>
        
        {/* 下半部分 - 包含Timeline */}
        <div className="flex-grow bg-black relative">
          <div className="py-2">
            <Timeline onModalChange={setIsModalOpen} />
          </div>
          
          {/* 礼物按钮 - 位于页脚上方 */}
          <div className="flex justify-end px-4 mb-4">
            <Gift onModalChange={setIsModalOpen} />
          </div>
          
          <Footer />
        </div>
      </div>
      
      {/* 花瓣飘落效果 - 中间层级 */}
      <div className="fixed inset-0 z-[30] pointer-events-none">
        <PetalsFalling />
      </div>
    </div>
  );
}
