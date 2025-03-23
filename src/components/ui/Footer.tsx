import { FaHeart, FaStar } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} DHC和CWX的100天纪念日
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">用</span>
            <FaStar className="text-primary text-sm" />
            <span className="text-sm text-gray-600 dark:text-gray-400">制作</span>
          </div>
        </div>
      </div>
    </footer>
  );
} 