'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// 定义组件属性
interface BackgroundSliderProps {
  images: string[];
  interval?: number; // 轮播间隔，单位毫秒
}

export default function BackgroundSlider({ 
  images, 
  interval = 5000 
}: BackgroundSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [nextImageIndex, setNextImageIndex] = useState(1);

  const hasImages = images && images.length > 0;

  // 预加载下一张图片
  useEffect(() => {
    if (!hasImages || images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    setNextImageIndex(nextIndex);
    const preloadImage = new window.Image();
    preloadImage.src = images[nextIndex];
  }, [currentIndex, hasImages, images]);

  // 图片轮播
  useEffect(() => {
    if (!hasImages || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval, hasImages]);

  // 当前图片变化时
  useEffect(() => {
    if (!hasImages) return;
    setIsLoaded(false);
  }, [currentIndex, hasImages]);

  // 图片加载完成
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // 如果没有图片，不渲染任何内容
  if (!hasImages) return null;

  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
      {/* 图片轮播 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <Image
              src={images[currentIndex]}
              alt="Background"
              fill
              priority={currentIndex === 0}
              quality={100}
              onLoad={handleImageLoad}
              className="object-cover"
              style={{ objectPosition: 'center' }}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            {/* 预加载下一张图片 */}
            {images.length > 1 && (
              <Image
                src={images[nextImageIndex]}
                alt="Next Background"
                fill
                priority={false}
                quality={100}
                className="hidden"
                sizes="100vw"
              />
            )}
            <div className="absolute inset-0 bg-black/60" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}