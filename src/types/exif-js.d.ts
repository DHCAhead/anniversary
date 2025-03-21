declare module 'exif-js' {
  interface ExifData {
    DateTimeOriginal?: string;
    DateTime?: string;
    DateTimeDigitized?: string;
  }

  interface ExifImage extends HTMLImageElement {
    exifdata?: ExifData;
  }

  interface EXIF {
    getData(img: HTMLImageElement, callback: (this: ExifImage) => void): void;
    getTag(img: ExifImage, tag: string): string | undefined;
  }

  const EXIF: EXIF;
  export default EXIF;
} 