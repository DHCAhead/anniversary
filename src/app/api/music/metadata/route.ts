import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const API_BASE_URL = 'http://168.138.247.174:3168';
const METADATA_FILE = path.join(process.cwd(), 'src', 'app', 'api', 'music', 'metadata.json');
const COVERS_DIR = path.join(process.cwd(), 'public', 'music', 'covers');

// 确保目录存在
if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

interface Metadata {
  id: string;
  name: string;
  artist: string;
  cover?: string;
  neteaseSongId?: string;
}

// 从文件名中提取信息
function extractSongInfo(filename: string): { title: string; artist?: string } {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const parts = nameWithoutExt.split('-').map(part => part.trim());
  
  if (parts.length > 1) {
    return { artist: parts[0], title: parts[1] };
  }
  return { title: parts[0] };
}

// 下载封面图片
async function downloadCover(url: string, filename: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const coverPath = path.join(COVERS_DIR, `${filename}.jpg`);
    fs.writeFileSync(coverPath, response.data);
    return `/music/covers/${filename}.jpg`;
  } catch (error) {
    console.error('下载封面失败:', error);
    return '';
  }
}

// 获取或更新元数据
async function getOrUpdateMetadata(filename: string): Promise<Metadata> {
  // 读取现有元数据
  let metadata: Record<string, Metadata> = {};
  if (fs.existsSync(METADATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
    metadata = data.songs || {};
  }

  // 如果已存在且有网易云ID，尝试更新封面
  if (metadata[filename] && metadata[filename].neteaseSongId) {
    if (!metadata[filename].cover) {
      try {
        // 获取歌曲详情
        const detailResponse = await axios.get(`${API_BASE_URL}/song/detail?ids=${metadata[filename].neteaseSongId}`);
        const song = detailResponse.data.songs[0];
        if (song && song.al?.picUrl) {
          const coverPath = await downloadCover(song.al.picUrl, `${metadata[filename].neteaseSongId}`);
          if (coverPath) {
            metadata[filename].cover = coverPath;
            fs.writeFileSync(METADATA_FILE, JSON.stringify({ songs: metadata }, null, 2));
          }
        }
      } catch (error) {
        console.error('更新封面失败:', error);
      }
    }
    return metadata[filename];
  }

  // 搜索网易云音乐
  try {
    const { title, artist } = extractSongInfo(filename);
    const searchQuery = artist ? `${title} ${artist}` : title;
    
    const response = await axios.get(`${API_BASE_URL}/search?keywords=${encodeURIComponent(searchQuery)}&limit=1`);
    const songs = response.data.result.songs;
    
    if (songs && songs.length > 0) {
      const song = songs[0];
      
      // 获取歌曲详情以获取更好质量的封面
      const detailResponse = await axios.get(`${API_BASE_URL}/song/detail?ids=${song.id}`);
      const songDetail = detailResponse.data.songs[0];
      const coverUrl = songDetail?.al?.picUrl || song.album?.picUrl;
      const coverPath = coverUrl ? await downloadCover(coverUrl, `${song.id}`) : '';
      
      const newMetadata: Metadata = {
        id: `local_${filename}`,
        name: song.name,
        artist: song.artists[0].name,
        cover: coverPath,
        neteaseSongId: song.id.toString()
      };

      // 更新元数据文件
      metadata[filename] = newMetadata;
      fs.writeFileSync(METADATA_FILE, JSON.stringify({ songs: metadata }, null, 2));
      
      return newMetadata;
    }
  } catch (error) {
    console.error('获取网易云音乐元数据失败:', error);
  }

  // 如果没有找到匹配或发生错误，使用文件名信息
  const { title, artist } = extractSongInfo(filename);
  const fallbackMetadata: Metadata = {
    id: `local_${filename}`,
    name: title,
    artist: artist || '未知艺术家'
  };

  // 保存基本元数据
  metadata[filename] = fallbackMetadata;
  fs.writeFileSync(METADATA_FILE, JSON.stringify({ songs: metadata }, null, 2));

  return fallbackMetadata;
}

// 获取所有元数据
export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), 'public', 'music');
    const files = fs.readdirSync(musicDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext);
    });

    const metadata: Record<string, Metadata> = {};
    for (const file of files) {
      metadata[file] = await getOrUpdateMetadata(file);
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('获取元数据失败:', error);
    return NextResponse.json({ error: '获取元数据失败' }, { status: 500 });
  }
} 