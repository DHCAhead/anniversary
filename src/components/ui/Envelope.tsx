'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaTimes, FaEdit, FaCheck, FaLock } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 正确的密码
const CORRECT_PASSWORD = '241214';

export default function Envelope() {
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
    <div className="absolute top-4 left-4 z-[100]">
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              ref={letterRef}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#fffdf7] rounded-lg shadow-xl w-full max-w-2xl p-8 max-h-[80vh] overflow-y-auto relative"
              style={{ 
                backgroundImage: 'linear-gradient(#fffdf7 1px, transparent 1px), linear-gradient(90deg, #fffdf7 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '-1px -1px',
                boxShadow: '0 0 15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">我们的信</h2>
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

              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-[60vh] p-4 border border-gray-300 rounded-md font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="在这里编辑信件内容，支持Markdown格式..."
                />
              ) : (
                <div className="prose prose-sm sm:prose max-w-none text-black font-serif">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: (props) => <h1 className="text-2xl font-bold mb-4 text-black" {...props} />,
                      h2: (props) => <h2 className="text-xl font-bold mb-3 text-black" {...props} />,
                      h3: (props) => <h3 className="text-lg font-bold mb-2 text-black" {...props} />,
                      p: (props) => <p className="mb-4 text-black" {...props} />,
                      ul: (props) => <ul className="list-disc pl-5 mb-4 text-black" {...props} />,
                      ol: (props) => <ol className="list-decimal pl-5 mb-4 text-black" {...props} />,
                      li: (props) => <li className="mb-1 text-black" {...props} />,
                      a: (props) => <a className="text-blue-500 hover:underline" {...props} />,
                      blockquote: (props) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-black" {...props} />
                    }}
                  >
                    {letterContent}
                  </ReactMarkdown>
                </div>
              )}
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              ref={passwordRef}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background rounded-lg shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaLock className="text-primary" />
                <h3 className="text-xl font-bold text-primary">密码验证</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                请输入密码以编辑信件内容
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="letter-password" className="block text-sm font-medium mb-1">
                    密码
                  </label>
                  <input
                    type="password"
                    id="letter-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="请输入密码"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyPassword();
                      }
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyPassword}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                  >
                    确认
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 