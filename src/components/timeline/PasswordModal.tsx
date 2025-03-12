'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';
import { checkPasswordToken } from '@/lib/passwordService';

interface PasswordModalProps {
  onVerify: (password: string) => void;
  onCancel: () => void;
  action: 'add' | 'edit' | 'delete';
}

export default function PasswordModal({ onVerify, onCancel, action }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 检查是否有有效的密码验证token
  useEffect(() => {
    if (checkPasswordToken()) {
      onVerify('');
      return;
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onVerify]);
  
  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(password);
  };
  
  // 获取操作文本
  const getActionText = () => {
    switch (action) {
      case 'add':
        return '添加';
      case 'edit':
        return '编辑';
      case 'delete':
        return '删除';
      default:
        return '操作';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-center mb-4 text-primary">
          <FaLock size={24} />
        </div>
        <h3 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          请输入密码
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
          {getActionText()}操作需要验证密码
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            placeholder="请输入密码..."
          />
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors"
            >
              确认
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}