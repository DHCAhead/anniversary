'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

export default function Header() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // 假设起始日期是100天前
  useEffect(() => {
    const startDate = new Date('2024-12-14T00:00:00');
    
    const interval = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - startDate.getTime();
      
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      
      setDays(d);
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-white">
            和CWX的<span className="text-primary">100</span>天
          </h1>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            目前我能给你的只有时间<br></br>但是我的爱永远不会改变
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-8 text-white">
            <FaHeart className="text-primary text-2xl animate-pulse" />
            <span className="text-xl">我们已经在一起</span>
            <FaHeart className="text-primary text-2xl animate-pulse" />
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="text-3xl sm:text-4xl font-bold text-primary">{days}</div>
              <div className="text-sm text-white">天</div>
            </div>
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="text-3xl sm:text-4xl font-bold text-primary">{hours}</div>
              <div className="text-sm text-white">小时</div>
            </div>
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="text-3xl sm:text-4xl font-bold text-primary">{minutes}</div>
              <div className="text-sm text-white">分钟</div>
            </div>
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="text-3xl sm:text-4xl font-bold text-primary">{seconds}</div>
              <div className="text-sm text-white">秒</div>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
} 