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

  // 根据图片数量确定布局
  const getImageLayout = () => {
    if (!event.images || event.images.length === 0) return null;

    if (event.images.length === 1) {
      return (
        <div 
          className="w-full h-48 sm:h-64 relative rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={event.images[0]}
            alt={event.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      );
    } else if (event.images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {event.images.map((image, index) => (
            <div 
              key={index} 
              className="h-48 relative rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image}
                alt={`${event.title} ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      );
    } else if (event.images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="h-96 relative rounded-lg overflow-hidden cursor-pointer"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={event.images[0]}
              alt={`${event.title} 1`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          <div className="grid grid-rows-2 gap-2">
            {event.images.slice(1, 3).map((image, index) => (
              <div 
                key={index} 
                className="h-[11.75rem] relative rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={image}
                  alt={`${event.title} ${index + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="h-96 relative rounded-lg overflow-hidden cursor-pointer"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={event.images[0]}
              alt={`${event.title} 1`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          <div className="grid grid-rows-3 gap-2">
            {event.images.slice(1, 4).map((image, index) => (
              <div 
                key={index} 
                className="h-[7.67rem] relative rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={image}
                  alt={`${event.title} ${index + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {index === 2 && event.images!.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                    +{event.images!.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
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

      {/* 灯箱 */}
      <AnimatePresence>
        {isLightboxOpen && event.images && event.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={closeLightbox}
              aria-label="关闭灯箱"
            >
              <FaTimes size={24} />
            </button>
            
            {event.images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  onClick={prevImage}
                  aria-label="上一张图片"
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  onClick={nextImage}
                  aria-label="下一张图片"
                >
                  <FaChevronRight size={24} />
                </button>
              </>
            )}
            
            <div className="relative w-full max-w-4xl max-h-[80vh] flex items-center justify-center">
              <Image
                src={event.images[currentImageIndex]}
                alt={`${event.title} ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-[80vh] w-auto object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {event.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {event.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-gray-500'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    aria-label={`查看第 ${index + 1} 张图片`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 