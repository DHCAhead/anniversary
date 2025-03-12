'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaImage, FaUpload, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import { parseExifDate } from '@/lib/exifService';

interface TimelineFormProps {
  onSubmit: (formData: {
    date: string;
    title: string;
    content: string;
    images: string[];
  }) => void;
  onCancel: () => void;
  initialData?: {
    date: string;
    title: string;
    content: string;
    images: string[];
  };
  isEdit?: boolean;
}

export default function TimelineForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  isEdit = false
}: TimelineFormProps) {
  const [date, setDate] = useState(initialData?.date || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // 表单验证
  const [errors, setErrors] = useState({
    date: '',
    title: '',
    content: ''
  });

  // 自动滚动到底部
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTop = formRef.current.scrollHeight;
    }
  }, [images]);

  // 验证表单
  const validateForm = () => {
    const newErrors = {
      date: '',
      title: '',
      content: ''
    };
    
    if (!date) newErrors.date = '请选择日期';
    // 验证日期格式和年份位数
    if (date) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(date)) {
        newErrors.date = '日期格式不正确';
      }
    }
    if (!title) newErrors.title = '请输入标题';
    if (!content) newErrors.content = '请输入内容';
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error);
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        date,
        title,
        content,
        images
      });
    }
  };

  // 处理图片上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const files = Array.from(e.target.files);
      const formData = new FormData();
      
      // 尝试从第一张图片中获取拍摄时间
      try {
        const firstImage = files[0];
        const exifDate = await parseExifDate(firstImage);
        if (exifDate && (!date || date === '')) {
          setDate(exifDate);
        }
      } catch (error) {
        console.error('读取图片EXIF信息失败:', error);
      }
      
      // 添加多个文件
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      setUploadProgress(70);
      
      if (!response.ok) {
        throw new Error('上传失败');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      
      // 添加新上传的图片URL到图片列表
      const newUrls = data.urls || [data.url];
      setImages(prev => [...prev, ...newUrls]);
      
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      alert('上传图片失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 添加图片URL
  const handleAddImageUrl = () => {
    if (!imageUrl) return;
    
    // 验证URL是否为图片
    const isValidImageUrl = /\.(jpeg|jpg|gif|png|webp)$/i.test(imageUrl);
    
    if (!isValidImageUrl) {
      alert('请输入有效的图片URL');
      return;
    }
    
    setImages(prev => [...prev, imageUrl]);
    setImageUrl('');
  };

  // 删除图片
  const handleRemoveImage = async (index: number) => {
    const imageToDelete = images[index];
    
    try {
      // 检查是否为上传的图片
      if (imageToDelete.startsWith('/uploads/')) {
        // 删除服务器上的文件
        const response = await fetch('/api/upload/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: imageToDelete }),
        });
        
        if (!response.ok) {
          console.error('删除服务器图片失败:', imageToDelete);
        }
      }
      
      // 从列表中移除图片
      setImages(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('删除图片失败:', error);
      alert('删除图片失败，请重试');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      <div 
        ref={formRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">
            {isEdit ? '编辑回忆' : '添加回忆'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="关闭"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              日期
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                // 限制日期输入，确保年份为4位数
                const inputDate = e.target.value;
                const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                if (!inputDate || datePattern.test(inputDate)) {
                  setDate(inputDate);
                }
              }}
              max="9999-12-31" // 设置最大日期，限制年份为4位数
              className={`w-full px-4 py-2 border ${
                errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 border ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white`}
              placeholder="输入标题..."
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full px-4 py-2 border ${
                errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white min-h-[120px]`}
              placeholder="输入内容..."
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              图片
            </label>
            
            <div className="flex flex-col gap-4">
              {/* 上传图片 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  multiple
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isUploading}
                >
                  <FaUpload size={16} />
                  上传图片
                </button>
                
                {/* 或者添加图片URL */}
                <div className="flex-1 flex gap-2 w-full mt-2 sm:mt-0">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="或者输入图片URL..."
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors"
                  >
                    <FaImage size={16} />
                  </button>
                </div>
              </div>
              
              {/* 上传进度 */}
              {isUploading && (
                <div className="w-full">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    上传中... {uploadProgress}%
                  </p>
                </div>
              )}
              
              {/* 已添加的图片预览 */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image
                          src={image}
                          alt={`图片 ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        aria-label="删除图片"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
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
              {isEdit ? '保存修改' : '添加回忆'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}