'use client';

import { useState, useEffect } from 'react';
import { FaImage, FaUpload, FaLock, FaTrash, FaPlus, FaTimes, FaExpand } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { addBackground, getBackgrounds, removeBackground } from '@/lib/backgroundService';
import Image from 'next/image';
import { checkPasswordToken, setPasswordToken } from '@/lib/passwordService';

// 正确的密码
const CORRECT_PASSWORD = '241214';

interface BackgroundUploaderProps {
  onModalChange?: (isOpen: boolean) => void;
}

export default function BackgroundUploader({ onModalChange }: BackgroundUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 通知父组件弹窗状态变化
  useEffect(() => {
    if (onModalChange) {
      onModalChange(isOpen || isPasswordModalOpen || previewImage !== null);
    }
  }, [isOpen, isPasswordModalOpen, previewImage, onModalChange]);

  // 获取背景图片列表
  useEffect(() => {
    if (isOpen) {
      loadBackgrounds();
    }
  }, [isOpen]);

  const loadBackgrounds = async () => {
    const loadedBackgrounds = await getBackgrounds();
    setBackgrounds(loadedBackgrounds);
  };

  // 打开背景管理器
  const handleOpenManager = () => {
    if (checkPasswordToken()) {
      setIsOpen(true);
      return;
    }
    setIsPasswordModalOpen(true);
  };

  // 验证密码
  const handleVerifyPassword = () => {
    if (password === CORRECT_PASSWORD) {
      setPasswordToken();
      setIsPasswordModalOpen(false);
      setIsOpen(true);
      setPassword('');
    } else {
      alert('密码错误，请重试！');
    }
  };

  // 选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // 将FileList转换为数组
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  // 上传文件
  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // 创建FormData对象
      const formData = new FormData();
      
      // 添加多个文件
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('type', 'backgrounds'); // 指定上传到backgrounds目录
      formData.append('useSimpleName', 'true'); // 使用简单文件名

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
      const imageUrls = uploadData.urls || [uploadData.url];

      // 添加背景图片
      setUploadProgress(75);
      
      // 逐个添加背景图片
      let allSuccess = true;
      for (const imageUrl of imageUrls) {
        const success = await addBackground(imageUrl);
        if (!success) {
          allSuccess = false;
        }
      }

      setUploadProgress(100);

      if (allSuccess) {
        alert(`成功上传 ${imageUrls.length} 张背景图片！`);
        setSelectedFiles([]);
        // 重新加载背景列表
        await loadBackgrounds();
        // 切换到管理标签页
        setActiveTab('manage');
      } else {
        alert('部分图片上传成功，但有些图片添加失败');
        await loadBackgrounds();
        setActiveTab('manage');
      }
    } catch (error) {
      console.error('上传背景图片失败:', error);
      alert('上传背景图片失败，请重试！');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 删除背景图片
  const handleDeleteBackground = async (imageUrl: string) => {
    if (!confirm('确定要删除这张背景图片吗？')) return;

    try {
      setIsDeleting(true);

      // 从背景列表中删除
      const success = await removeBackground(imageUrl);
      
      // 如果是上传的图片，还需要删除文件
      if (imageUrl.startsWith('/backgrounds/')) {
        // 删除文件
        const deleteResponse = await fetch('/api/upload/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        });

        if (!deleteResponse.ok) {
          console.error('删除文件失败');
        }
      }

      if (success) {
        alert('背景图片删除成功！');
        // 重新加载背景列表
        await loadBackgrounds();
      } else {
        throw new Error('删除背景图片失败');
      }
    } catch (error) {
      console.error('删除背景图片失败:', error);
      alert('删除背景图片失败，请重试！');
    } finally {
      setIsDeleting(false);
    }
  };

  // 打开图片预览
  const handleOpenPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  // 关闭图片预览
  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="z-[20]">
      <button
        onClick={handleOpenManager}
        className="bg-primary hover:bg-primary/80 text-white p-3 rounded-full shadow-lg transition-colors"
        aria-label="管理背景图片"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4 overflow-hidden"
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
                管理背景图片需要验证密码
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

      {/* 背景图片管理弹窗 */}
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  背景图片管理
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full transition-colors"
                  aria-label="关闭"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              {/* 标签页切换 */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'upload'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  上传图片
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'manage'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  管理图片
                </button>
              </div>
              
              {/* 上传图片内容 */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple // 允许多文件选择
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <FaUpload className="text-gray-400 dark:text-gray-500 text-3xl mb-2" />
                      <p className="text-gray-600 dark:text-gray-300 mb-1">
                        点击选择一张或多张图片
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        支持 JPG, PNG, GIF 格式，可一次选择多张图片
                      </p>
                    </label>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-800 dark:text-gray-200 text-sm mb-2">
                        已选择 {selectedFiles.length} 张图片:
                      </p>
                      <div className="max-h-32 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <p key={index} className="text-gray-600 dark:text-gray-300 text-xs truncate ml-2">
                            {index + 1}. {file.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {isUploading && (
                    <div className="mt-4">
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

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleUpload}
                      disabled={selectedFiles.length === 0 || isUploading}
                      className={`w-full py-2 rounded-md transition-colors ${
                        selectedFiles.length === 0 || isUploading
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/80 text-white'
                      }`}
                    >
                      {isUploading ? '上传中...' : `上传 ${selectedFiles.length} 张背景图片`}
                    </button>
                  </div>
                </div>
              )}
              
              {/* 管理图片内容 */}
              {activeTab === 'manage' && (
                <div>
                  {backgrounds.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        暂无背景图片，请先上传
                      </p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md flex items-center gap-2 mx-auto"
                      >
                        <FaPlus size={16} />
                        添加图片
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {backgrounds.map((bg, index) => (
                        <div key={index} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <div 
                            className="aspect-video relative cursor-pointer" 
                            onClick={() => handleOpenPreview(bg)}
                          >
                            <Image
                              src={bg}
                              alt={`背景图片 ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            <div className="absolute top-2 right-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // 阻止事件冒泡，避免触发图片预览
                                  handleDeleteBackground(bg);
                                }}
                                disabled={isDeleting}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md opacity-70 hover:opacity-100 transition-opacity"
                                aria-label="删除图片"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                              <FaExpand className="text-white opacity-0 group-hover:opacity-80 transition-opacity" size={24} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 图片预览弹窗 */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
            style={{ touchAction: 'none' }}
            onClick={handleClosePreview}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="relative w-[90vw] h-[80vh] md:w-[80vw] md:h-[80vh]">
                  <Image
                    src={previewImage}
                    alt="预览图片"
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </div>
                <button
                  onClick={handleClosePreview}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  aria-label="关闭预览"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}