import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const mediaDir = path.join(process.cwd(), 'public', 'media');
    const orderPath = path.join(process.cwd(), 'src', 'data', 'photo-order.json');

    // Get all photo files from public/media
    const allFiles = fs.readdirSync(mediaDir)
      .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));

    // Get saved order
    let order: string[] = [];
    if (fs.existsSync(orderPath)) {
      order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
    }

    // Sort photos by saved order
    let sortedPhotos: string[];
    if (order.length > 0) {
      // Photos in order first, then any new ones not in order
      const inOrder = order.filter(f => allFiles.includes(f));
      const notInOrder = allFiles.filter(f => !order.includes(f));
      sortedPhotos = [...inOrder, ...notInOrder];
    } else {
      sortedPhotos = allFiles.sort();
    }

    // Return as simple array with src paths
    const photos = sortedPhotos.map(filename => ({
      filename,
      src: `/media/${filename}`
    }));

    return NextResponse.json({ photos, count: photos.length });
  } catch (error) {
    console.error('Error reading photos:', error);
    return NextResponse.json({ photos: [], count: 0 });
  }
}
