"use client";

import { useState, useEffect, useRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import type H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { motion } from 'framer-motion';
import { IoChevronForward, IoChevronBack } from 'react-icons/io5';
import Image from 'next/image';

interface MetadataResponse {
  [key: string]: Metadata;
}

interface Metadata {
  id: string;
  name: string;
  artist: string;
  cover?: string;
}

interface Song {
  id: string;
  name: string;
  artist: string;
  url: string;
  cover?: string;
}

const MusicPlayer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioPlayerRef = useRef<H5AudioPlayer>(null);

  // 监听用户交互
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      // 移除事件监听器
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };

    // 添加事件监听器
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, handleInteraction);
    });

    return () => {
      // 清理事件监听器
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  useEffect(() => {
    const loadSongs = async () => {
      setIsLoading(true);
      try {
        // 获取元数据
        const metadataResponse = await fetch('/api/music/metadata');
        const metadata: MetadataResponse = await metadataResponse.json();
        
        // 转换为歌曲列表
        const songList = Object.entries(metadata).map(([filename, meta]) => ({
          id: meta.id,
          name: meta.name,
          artist: meta.artist,
          url: `/music/${filename}`,
          cover: meta.cover
        }));

        setSongs(songList);
        if (songList.length > 0) {
          setCurrentSong(songList[0]);
        }
      } catch (error) {
        console.error('加载音乐失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSongs();
  }, []);

  // 监听歌曲加载和用户交互状态，尝试自动播放
  useEffect(() => {
    if (currentSong && hasInteracted && audioPlayerRef.current) {
      const audioEl = audioPlayerRef.current.audio.current;
      if (audioEl) {
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise.catch((error: Error) => {
            console.error('自动播放失败:', error);
          });
        }
      }
    }
  }, [currentSong, hasInteracted]);

  const handleSongEnd = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  return (
    <div className="fixed left-0 bottom-8 z-50">
      <motion.div
        initial={{ x: -160 }}
        animate={{ x: isVisible ? 0 : -160 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="flex items-end"
      >
        {/* 播放器主体 */}
        <div className="w-[160px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-r-lg shadow-lg overflow-hidden">
          {currentSong ? (
            <div>
              {/* 歌曲信息区域 */}
              <div className="relative h-[160px] group">
                {currentSong.cover && (
                  <Image
                    src={currentSong.cover}
                    alt={`${currentSong.name} 封面`}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 group-hover:from-black/40 group-hover:to-black/80 transition-all">
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-xs font-medium text-white truncate">
                      {currentSong.name}
                    </h3>
                    <p className="text-[10px] text-gray-200 truncate mt-0.5">
                      {currentSong.artist}
                    </p>
                  </div>
                </div>
              </div>

              {/* 播放控件区域 */}
              <div className="p-1">
                <AudioPlayer
                  ref={audioPlayerRef}
                  src={currentSong.url}
                  showSkipControls={true}
                  showJumpControls={false}
                  className="player-override mini-player"
                  style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                  onEnded={handleSongEnd}
                  autoPlayAfterSrcChange={true}
                />
              </div>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
              {isLoading ? "加载中..." : "没有可播放的音乐"}
            </div>
          )}
        </div>

        {/* 展开/收起按钮 - 垂直设计，位置更靠下 */}
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center justify-center w-6 h-16 -mb-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-l border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors rounded-r-lg shadow-lg -ml-px"
        >
          {isVisible ? (
            <IoChevronBack className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <IoChevronForward className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default MusicPlayer; 