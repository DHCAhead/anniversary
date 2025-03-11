'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { TimelineEvent } from '@/app/api/timeline/route';

interface TimelineItemProps {
  event: TimelineEvent;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export default function TimelineItem({ event, onEditClick, onDeleteClick }: TimelineItemProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 打开灯箱
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  // 关闭灯箱
  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // 下一张图片
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.images && event.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images!.length);
    }
  };

  // 上一张图片
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.images && event.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images!.length) % event.images!.length);
    }
  };

  // 统一图片布局为网格
  const getImageLayout = () => {
    if (!event.images || event.images.length === 0) return null;

    // 根据图片数量确定网格列数
    let gridCols = "grid-cols-1";
    if (event.images.length === 2) {
      gridCols = "grid-cols-2";
    } else if (event.images.length >= 3) {
      gridCols = "grid-cols-3";
    }

    // 限制最多显示6张图片，其余的在最后一张上显示+N
    const displayImages = event.images.slice(0, 6);
    const remainingCount = event.images.length - 6;

    return (
      <div className={`grid ${gridCols} gap-2`}>
        {displayImages.map((image, index) => (
          <div 
            key={index} 
            className="aspect-square relative rounded-lg overflow-hidden cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={image}
              alt={`${event.title} ${index + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 33vw, 20vw"
            />
            {index === 5 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                +{remainingCount}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="timeline-item">
      <div className="timeline-date">
        <span className="font-bold">{event.date}</span>
      </div>
      <div className="timeline-content bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 animate-fadeIn">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-primary">{event.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={onEditClick}
              className="text-gray-500 hover:text-primary transition-colors"
              aria-label="编辑事件"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={onDeleteClick}
              className="text-gray-500 hover:text-red-500 transition-colors"
              aria-label="删除事件"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{event.content}</p>
        
        {event.images && event.images.length > 0 && (
          <div className="mt-4">
            {getImageLayout()}
          </div>
        )}
      </div>

      {/* 灯箱 - 全屏设计 */}
      <AnimatePresence>
        {isLightboxOpen && event.images && event.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-0 overflow-hidden"
            onClick={closeLightbox}
            style={{ touchAction: 'none' }}
          >
            {/* 美化的关闭按钮 - 右上角 */}
            <div className="fixed top-4 right-4 z-[1000]">
              <button
                className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-full shadow-lg transition-all duration-300 border border-white/50 backdrop-blur-sm"
                onClick={closeLightbox}
                aria-label="关闭灯箱"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            {/* 图片容器 - 完全全屏并确保居中 */}
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
              <div className="relative w-full h-full max-h-[90vh] max-w-[90vw] flex items-center justify-center">
                <Image
                  src={event.images[currentImageIndex]}
                  alt={`${event.title} ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  onClick={(e) => e.stopPropagation()}
                  priority
                />
                
                {/* 左右切换按钮 - 缩小并优化样式 */}
                {event.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full shadow-lg z-[1000] border border-white/30 backdrop-blur-sm transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage(e);
                      }}
                      aria-label="上一张图片"
                    >
                      <FaChevronLeft size={18} />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full shadow-lg z-[1000] border border-white/30 backdrop-blur-sm transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage(e);
                      }}
                      aria-label="下一张图片"
                    >
                      <FaChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* 底部指示器和计数器 - 简化版 */}
            {event.images.length > 1 && (
              <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-[1000]">
                <div className="bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-3 backdrop-blur-sm border border-white/20">
                  <span className="text-white text-xs font-medium">
                    {currentImageIndex + 1} / {event.images.length}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {event.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-gray-500 hover:bg-gray-300'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        aria-label={`查看第 ${index + 1} 张图片`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}