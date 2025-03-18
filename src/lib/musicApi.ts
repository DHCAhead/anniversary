import axios from 'axios';

const API_BASE_URL = 'http://168.138.247.174:3168';

interface NeteaseSong {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album?: { picUrl: string };
}

interface LocalSongMetadata {
  id: string;
  name: string;
  artist: string;
  url: string;
  cover?: string;
}

export interface Song {
  id: string;
  name: string;
  artist: string;
  url: string;
  cover?: string;
}

// 从文件名中提取可能的歌曲名和艺术家名
// 假设格式为: "艺术家名 - 歌曲名.mp3" 或 "歌曲名.mp3"
const extractSongInfo = (filename: string): { title: string; artist?: string } => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, ''); // 移除扩展名
  const parts = nameWithoutExt.split('-').map(part => part.trim());
  
  if (parts.length > 1) {
    return { artist: parts[0], title: parts[1] };
  }
  return { title: parts[0] };
};

// 搜索单个歌曲的元数据
const searchSongMetadata = async (filename: string): Promise<LocalSongMetadata | null> => {
  try {
    const { title, artist } = extractSongInfo(filename);
    const searchQuery = artist ? `${title} ${artist}` : title;
    
    const response = await axios.get(`${API_BASE_URL}/search?keywords=${encodeURIComponent(searchQuery)}&limit=1`);
    const songs = response.data.result.songs;
    
    if (songs && songs.length > 0) {
      const song = songs[0];
      return {
        id: `local_${filename}`,
        name: song.name,
        artist: song.artists[0].name,
        url: `/music/${filename}`,
        cover: song.album?.picUrl
      };
    }
    
    // 如果没有找到匹配的歌曲，使用文件名作为备用信息
    return {
      id: `local_${filename}`,
      name: title,
      artist: artist || '未知艺术家',
      url: `/music/${filename}`
    };
  } catch (error) {
    console.error(`获取歌曲 ${filename} 的元数据失败:`, error);
    return null;
  }
};

export const getLocalSongs = async (): Promise<Song[]> => {
  try {
    // 从API获取音乐文件列表
    const response = await fetch('/api/music');
    const data = await response.json();
    
    if (!data.files || !Array.isArray(data.files)) {
      throw new Error('无效的文件列表格式');
    }

    const songs: Song[] = [];
    for (const filename of data.files) {
      const metadata = await searchSongMetadata(filename);
      if (metadata) {
        songs.push(metadata);
      }
    }
    
    return songs;
  } catch (error) {
    console.error('获取本地音乐失败:', error);
    return [];
  }
};

export const searchSong = async (keyword: string): Promise<Song[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search?keywords=${encodeURIComponent(keyword)}`);
    return response.data.result.songs.map((song: NeteaseSong) => ({
      id: song.id,
      name: song.name,
      artist: song.artists[0].name,
      url: `${API_BASE_URL}/song/url?id=${song.id}`,
      cover: song.album?.picUrl
    }));
  } catch (error) {
    console.error('搜索音乐失败:', error);
    return [];
  }
};

export const getSongDetail = async (id: string): Promise<Song | null> => {
  try {
    // 如果是本地音乐（ID以local_开头）
    if (id.startsWith('local_')) {
      const filename = id.replace('local_', '');
      return await searchSongMetadata(filename);
    }

    // 如果是网易云音乐
    const response = await axios.get(`${API_BASE_URL}/song/detail?ids=${id}`);
    const song = response.data.songs[0];
    return {
      id: song.id,
      name: song.name,
      artist: song.ar[0].name,
      url: `${API_BASE_URL}/song/url?id=${song.id}`,
      cover: song.al?.picUrl
    };
  } catch (error) {
    console.error('获取音乐详情失败:', error);
    return null;
  }
}; 