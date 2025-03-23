'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineItem from './TimelineItem';
import TimelineForm from './TimelineForm';
import PasswordModal from './PasswordModal';
import { FaPlus, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { getTimelineEvents, saveTimelineEvents } from '@/lib/timelineService';
import { TimelineEvent } from '@/app/api/timeline/route';
import { setPasswordToken } from '@/lib/passwordService';

// 正确的密码
const CORRECT_PASSWORD = '241214';

interface TimelineProps {
  onModalChange?: (isOpen: boolean) => void;
}

export default function Timeline({ onModalChange }: TimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isAscending, setIsAscending] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'add' | 'edit' | 'delete'>('add');
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<TimelineEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 通知父组件弹窗状态变化
  useEffect(() => {
    if (onModalChange) {
      onModalChange(isFormOpen || isPasswordModalOpen || isDeleteConfirmOpen);
    }
  }, [isFormOpen, isPasswordModalOpen, isDeleteConfirmOpen, onModalChange]);

  // 获取时间轴事件
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const data = await getTimelineEvents();
        // 根据当前的排序状态对事件进行排序
        const sortedEvents = [...data].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return isAscending ? dateA - dateB : dateB - dateA;
        });
        setEvents(sortedEvents);
      } catch (error) {
        console.error('获取事件失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvents();
  }, [isAscending]);

  // 处理排序切换
  const handleSortToggle = () => {
    setIsAscending(!isAscending);
  };

  // 保存数据到服务器
  const saveEvents = async (updatedEvents: TimelineEvent[]) => {
    try {
      setSaveStatus('saving');
      const success = await saveTimelineEvents(updatedEvents);
      setSaveStatus(success ? 'success' : 'error');
      
      // 3秒后重置状态
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);

      return success; // 返回保存结果
    } catch (error) {
      console.error('保存事件失败:', error);
      setSaveStatus('error');
      
      // 3秒后重置状态
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);

      return false; // 发生错误时返回false
    }
  };

  // 处理添加按钮点击
  const handleAddClick = () => {
    setCurrentAction('add');
    setEditingEvent(null);
    setDeletingEvent(null);
    setIsPasswordModalOpen(true);
  };

  // 处理编辑按钮点击
  const handleEditClick = (event: TimelineEvent) => {
    setCurrentAction('edit');
    setEditingEvent(event);
    setDeletingEvent(null);
    setIsPasswordModalOpen(true);
  };

  // 处理删除按钮点击
  const handleDeleteClick = (event: TimelineEvent) => {
    setCurrentAction('delete');
    setDeletingEvent(event);
    setEditingEvent(null);
    setIsPasswordModalOpen(true);
  };

  // 处理密码验证
  const handlePasswordVerify = (password: string) => {
    // 如果是通过token验证，直接通过
    if (password === '') {
      setIsPasswordModalOpen(false);
      
      if (currentAction === 'delete' && deletingEvent) {
        setIsDeleteConfirmOpen(true);
      } else {
        setIsFormOpen(true);
      }
      return;
    }

    if (password === CORRECT_PASSWORD) {
      setPasswordToken();
      setIsPasswordModalOpen(false);
      
      if (currentAction === 'delete' && deletingEvent) {
        setIsDeleteConfirmOpen(true);
      } else {
        setIsFormOpen(true);
      }
    } else {
      alert('密码错误，请重试！');
    }
  };

  // 添加事件
  const addEvent = async (event: Omit<TimelineEvent, 'id'>) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
    };
    // 添加新事件并按日期重新排序
    const updatedEvents = [...events, newEvent].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setEvents(updatedEvents);
    setIsFormOpen(false);
    
    // 保存到服务器
    await saveEvents(updatedEvents);
  };

  // 更新事件
  const updateEvent = async (updatedEvent: TimelineEvent) => {
    // 更新事件并按日期重新排序
    const updatedEvents = events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setEvents(updatedEvents);
    setIsFormOpen(false);
    setEditingEvent(null);
    
    // 保存到服务器
    await saveEvents(updatedEvents);
  };

  // 删除事件
  const deleteEvent = async () => {
    if (!deletingEvent) return;
    
    try {
      // 删除关联的图片文件
      if (deletingEvent.images && deletingEvent.images.length > 0) {
        console.log('正在删除关联图片:', deletingEvent.images);
        
        for (const imageUrl of deletingEvent.images) {
          // 检查图片是否是上传的图片（包括backgrounds和uploads目录）
          if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('/backgrounds/')) {
            console.log('删除图片:', imageUrl);
            
            try {
              const response = await fetch('/api/upload/delete', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl }),
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`删除图片失败: ${errorText}`);
              }
              
              console.log('图片删除成功:', imageUrl);
            } catch (err) {
              console.error('删除图片出错:', imageUrl, err);
              throw err; // 向上抛出错误，中断删除过程
            }
          }
        }
      }
      
      // 所有图片删除成功后，更新事件列表
      const updatedEvents = events.filter(event => event.id !== deletingEvent.id);
      
      // 先保存到服务器
      const saveSuccess = await saveEvents(updatedEvents);
      if (!saveSuccess) {
        throw new Error('保存事件列表失败');
      }
      
      // 保存成功后更新状态
      setEvents(updatedEvents);
      setIsDeleteConfirmOpen(false);
      setDeletingEvent(null);
      
      alert('回忆及相关图片已成功删除');
    } catch (error) {
      console.error('删除事件失败:', error);
      alert('删除事件失败，请重试');
    }
  };

  // 处理表单提交
  const handleFormSubmit = (formData: Omit<TimelineEvent, 'id'>) => {
    if (currentAction === 'add') {
      addEvent(formData);
    } else if (currentAction === 'edit' && editingEvent) {
      updateEvent({ ...formData, id: editingEvent.id });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-primary">我们的珍贵点滴</h3>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="text-sm text-gray-500">保存中...</span>
          )}
          {saveStatus === 'success' && (
            <span className="text-sm text-green-500">保存成功</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-500">保存失败</span>
          )}
          <button
            onClick={handleSortToggle}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full transition-colors"
            title={isAscending ? "当前为时间正序" : "当前为时间倒序"}
          >
            {isAscending ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-full transition-colors"
          >
            <FaPlus /> 添加回忆
          </button>
        </div>
      </div>

      <div className="timeline">
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              加载中...
            </motion.div>
          ) : events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              点击&quot;添加回忆&quot;按钮开始创建您的时间轴
            </motion.div>
          ) : (
            events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TimelineItem 
                  event={event} 
                  onEditClick={() => handleEditClick(event)}
                  onDeleteClick={() => handleDeleteClick(event)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

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
            <PasswordModal
              onVerify={handlePasswordVerify}
              onCancel={() => setIsPasswordModalOpen(false)}
              action={currentAction}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4 overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-background rounded-lg shadow-xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-red-500">确认删除</h3>
              <p className="mb-6">
                您确定要删除 <span className="font-bold">{deletingEvent?.title}</span> 这条回忆吗？此操作无法撤销。
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={deleteEvent}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 添加/编辑表单弹窗 */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4 overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-background rounded-lg shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-hidden"
            >
              <h3 className="text-xl font-bold mb-4">
                {currentAction === 'add' ? '添加新回忆' : '编辑回忆'}
              </h3>
              <TimelineForm 
                initialData={editingEvent || undefined}
                onSubmit={handleFormSubmit} 
                onCancel={() => setIsFormOpen(false)} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}