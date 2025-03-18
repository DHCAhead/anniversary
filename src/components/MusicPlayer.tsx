"use client";

import { useState, useEffect, useRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import type H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { motion } from 'framer-motion';
import { IoMdMusicalNote } from 'react-icons/io';
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

  const togglePlayer = () => {
    setIsVisible(!isVisible);
  };

  const handleSongEnd = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={togglePlayer}
        className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/80 transition-all"
      >
        <IoMdMusicalNote size={24} />
      </button>
      
      <div className={isVisible ? 'block' : 'hidden'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-80"
        >
          {isLoading ? (
            <div className="text-center py-4">加载中...</div>
          ) : currentSong ? (
            <>
              {currentSong.cover && (
                <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={currentSong.cover}
                    alt={`${currentSong.name} 封面`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="mb-2">
                <h3 className="text-lg font-semibold">{currentSong.name}</h3>
                <p className="text-sm text-gray-500">{currentSong.artist}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">没有可播放的音乐</div>
          )}
        </motion.div>
      </div>

      {/* 音频播放器始终保持加载状态 */}
      <div className={`fixed bottom-0 left-0 right-0 ${isVisible ? 'block' : 'hidden'}`}>
        {currentSong && (
          <AudioPlayer
            ref={audioPlayerRef}
            src={currentSong.url}
            showSkipControls={true}
            showJumpControls={false}
            className="rounded-lg"
            style={{ backgroundColor: 'transparent' }}
            onEnded={handleSongEnd}
            autoPlayAfterSrcChange={true}
          />
        )}
      </div>
    </div>
  );
};

export default MusicPlayer; 