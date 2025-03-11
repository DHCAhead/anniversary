'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 花瓣颜色
const PETAL_COLORS = [
  '#ffb7c5', // 粉红色
  '#ffc0cb', // 浅粉色
  '#ffd1dc', // 浅浅粉色
  '#ffe6ea', // 超浅粉色
  '#fff0f5', // 淡雾玫瑰色
];

// 花瓣大小范围
const PETAL_SIZES = [10, 15, 20, 25, 30];

// 花瓣形状
const PETAL_PATHS = [
  'M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0',
  'M0,0 C60,40 60,90 0,100 C-60,90 -60,40 0,0',
  'M0,0 C50,25 50,75 25,100 L0,90 L-25,100 C-50,75 -50,25 0,0',
];

// 单个花瓣组件
interface PetalProps {
  index: number;
}

function Petal({ index }: PetalProps) {
  // 随机生成花瓣属性
  const size = PETAL_SIZES[Math.floor(Math.random() * PETAL_SIZES.length)];
  const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  const path = PETAL_PATHS[Math.floor(Math.random() * PETAL_PATHS.length)];
  const left = `${Math.random() * 100}%`;
  const delay = Math.random() * 10;
  const duration = 10 + Math.random() * 20;
  const rotation = Math.random() * 360;
  const scale = 0.5 + Math.random() * 0.5;

  return (
    <motion.div
      key={index}
      initial={{ 
        y: -100, 
        x: 0, 
        rotate: 0, 
        opacity: 0.8 
      }}
      animate={{ 
        y: '110vh', 
        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
        rotate: rotation + 360 * 2,
        opacity: [0.8, 0.9, 0.7, 0]
      }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeInOut",
        times: [0, 0.3, 0.7, 1],
        repeat: Infinity,
        repeatDelay: Math.random() * 5
      }}
      style={{ 
        position: 'absolute', 
        left, 
        top: -size,
        width: size,
        height: size,
      }}
      className="pointer-events-none"
    >
      <svg
        viewBox="-60 -10 120 120"
        style={{ 
          width: '100%', 
          height: '100%',
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.1))'
        }}
      >
        <path
          d={path}
          fill={color}
          opacity={0.8}
        />
      </svg>
    </motion.div>
  );
}

export default function PetalsFalling() {
  const [petals, setPetals] = useState<number[]>([]);
  
  // 生成花瓣
  useEffect(() => {
    // 根据屏幕大小决定花瓣数量
    const petalCount = Math.min(
      Math.max(15, Math.floor(window.innerWidth / 50)), 
      30
    );
    
    setPetals(Array.from({ length: petalCount }, (_, i) => i));
    
    // 窗口大小变化时重新计算花瓣数量
    const handleResize = () => {
      const newPetalCount = Math.min(
        Math.max(15, Math.floor(window.innerWidth / 50)), 
        30
      );
      setPetals(Array.from({ length: newPetalCount }, (_, i) => i));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {petals.map((index) => (
          <Petal key={index} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
} 