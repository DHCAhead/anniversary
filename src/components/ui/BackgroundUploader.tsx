'use client';

import { useState } from 'react';
import { FaImage, FaUpload, FaLock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { addBackground } from '@/lib/backgroundService';

// 正确的密码
const CORRECT_PASSWORD = '241214';

export default function BackgroundUploader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 打开上传对话框
  const handleOpenUploader = () => {
    setIsPasswordModalOpen(true);
  };

  // 验证密码
  const handleVerifyPassword = () => {
    if (password === CORRECT_PASSWORD) {
      setIsPasswordModalOpen(false);
      setIsOpen(true);
      setPassword('');
    } else {
      alert('密码错误，请重试！');
    }
  };

  // 选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 上传文件
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', selectedFile);

      // 上传文件
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(50);

      if (!uploadResponse.ok) {
        throw new Error('上传图片失败');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;

      // 添加背景图片
      setUploadProgress(75);
      const success = await addBackground(imageUrl);

      setUploadProgress(100);

      if (success) {
        alert('背景图片上传成功！');
        setIsOpen(false);
        setSelectedFile(null);
        // 刷新页面以显示新背景
        window.location.reload();
      } else {
        throw new Error('添加背景图片失败');
      }
    } catch (error) {
      console.error('上传背景图片失败:', error);
      alert('上传背景图片失败，请重试！');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[100]">
      <button
        onClick={handleOpenUploader}
        className="bg-primary hover:bg-primary/80 text-white p-3 rounded-full shadow-lg transition-colors"
        aria-label="上传背景图片"
      >
        <FaImage size={24} />
      </button>

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
                上传背景图片需要验证密码
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

      {/* 上传背景图片弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                上传背景图片
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                请选择要上传的背景图片，建议使用高清图片（1920x1080或更高分辨率）
              </p>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  选择图片
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-gray-700 dark:text-gray-300"
                  disabled={isUploading}
                />
              </div>

              {selectedFile && (
                <div className="mb-4 p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    已选择: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}

              {isUploading && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
                    上传中... {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isUploading}
                >
                  取消
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className={`px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md flex items-center gap-2 transition-colors ${
                    !selectedFile || isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaUpload size={16} />
                  上传
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 