import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const mediaDir = path.join(process.cwd(), 'public', 'media');

    if (!fs.existsSync(mediaDir)) {
      return NextResponse.json({ photos: [] });
    }

    const files = fs.readdirSync(mediaDir)
      .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
      .sort((a, b) => {
        // Sort by number in filename (photo_001.jpg, photo_002.jpg, etc.)
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    const photos = files.map(filename => ({
      filename,
      date: '',
      src: `/media/${filename}`
    }));

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error reading media:', error);
    return NextResponse.json({ photos: [] });
  }
}
