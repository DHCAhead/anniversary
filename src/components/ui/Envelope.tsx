'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaTimes, FaEdit, FaCheck, FaLock } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 正确的密码
const CORRECT_PASSWORD = '241214';

interface EnvelopeProps {
  onModalChange?: (isOpen: boolean) => void;
}

export default function Envelope({ onModalChange }: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const letterRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLDivElement>(null);

  // 通知父组件弹窗状态变化
  useEffect(() => {
    if (onModalChange) {
      onModalChange(isOpen || isPasswordModalOpen);
    }
  }, [isOpen, isPasswordModalOpen, onModalChange]);

  // 获取信件内容
  useEffect(() => {
    async function fetchLetter() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/letter');
        if (response.ok) {
          const data = await response.json();
          setLetterContent(data.content);
        }
      } catch (error) {
        console.error('获取信件内容失败:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen && !letterContent) {
      fetchLetter();
    }
  }, [isOpen, letterContent]);

  // 点击外部关闭信件
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (letterRef.current && !letterRef.current.contains(event.target as Node)) {
        if (!isEditing && !isPasswordModalOpen) {
          setIsOpen(false);
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isEditing, isPasswordModalOpen]);

  // 点击外部关闭密码弹窗
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (passwordRef.current && !passwordRef.current.contains(event.target as Node)) {
        setIsPasswordModalOpen(false);
      }
    }

    if (isPasswordModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPasswordModalOpen]);

  // 开始编辑信件
  const handleEdit = () => {
    setIsPasswordModalOpen(true);
  };

  // 验证密码
  const handleVerifyPassword = () => {
    if (password === CORRECT_PASSWORD) {
      setIsPasswordModalOpen(false);
      setEditContent(letterContent);
      setIsEditing(true);
      setPassword('');
    } else {
      alert('密码错误，请重试！');
    }
  };

  // 保存信件内容
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setLetterContent(editContent);
        setIsEditing(false);
      } else {
        console.error('保存信件失败');
      }
    } catch (error) {
      console.error('保存信件失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="z-[10]">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary/80 text-white p-3 rounded-full shadow-lg transition-colors"
        aria-label="打开信件"
      >
        <FaEnvelope size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4 overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            <motion.div
              ref={letterRef}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#fff8e1] rounded-lg shadow-xl w-full max-w-2xl p-8 max-h-[80vh] overflow-y-auto relative"
              style={{ 
                backgroundImage: 'linear-gradient(#fff8e1 1px, transparent 1px), linear-gradient(90deg, #fff8e1 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '-1px -1px',
                boxShadow: '0 0 15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">给你的一封信</h2>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleEdit}
                        className="text-gray-500 hover:text-primary transition-colors"
                        aria-label="编辑信件"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="关闭信件"
                      >
                        <FaTimes size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`text-green-500 hover:text-green-600 transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="保存信件"
                      >
                        <FaCheck size={18} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="取消编辑"
                      >
                        <FaTimes size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="prose prose-sm sm:prose max-w-none text-black font-serif overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[60vh] p-4 border border-gray-300 rounded-md font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto"
                    placeholder="在这里编辑信件内容，支持Markdown格式..."
                  />
                ) : (
                  <div className="prose prose-sm sm:prose max-w-none text-black font-serif overflow-y-auto">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p style={{color: 'black', whiteSpace: 'pre-wrap'}} {...props}/>,
                        li: ({node, ...props}) => <li style={{color: 'black'}} {...props}/>,
                        ol: ({node, ...props}) => <ol style={{color: 'black'}} {...props}/>,
                        ul: ({node, ...props}) => <ul style={{color: 'black'}} {...props}/>
                      }}
                    >
                      {letterContent || `# 亲爱的

这是我写给你的一封信，希望你能喜欢。

## 我想对你说

* 感谢你一直陪伴在我身边
* 希望我们的未来更加美好
* 我会一直爱你

> 爱是一种选择，而我选择了你。

祝你每天都开心！`}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 密码验证弹窗 */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4 overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            <motion.div
              ref={passwordRef}
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
                编辑信件内容需要验证密码
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="请输入密码..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleVerifyPassword}
                  className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors"
                >
                  确认
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}