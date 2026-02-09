import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data');
    const momentsPath = path.join(dataDir, 'moments.json');
    const orderPath = path.join(dataDir, 'photo-order.json');

    if (!fs.existsSync(momentsPath)) {
      return NextResponse.json([]);
    }

    const moments = JSON.parse(fs.readFileSync(momentsPath, 'utf8'));

    // Separate text moments and photo moments
    const textMoments = moments.filter((m: { image?: unknown }) => !m.image);
    const photoMoments = moments.filter((m: { image?: unknown }) => m.image);

    // Apply saved order if it exists
    let sortedPhotoMoments = photoMoments;
    if (fs.existsSync(orderPath)) {
      const savedOrder: string[] = JSON.parse(fs.readFileSync(orderPath, 'utf8'));

      if (savedOrder.length > 0) {
        sortedPhotoMoments = [...photoMoments].sort((a: { image: { filename: string } }, b: { image: { filename: string } }) => {
          const aIdx = savedOrder.indexOf(a.image.filename);
          const bIdx = savedOrder.indexOf(b.image.filename);
          if (aIdx === -1 && bIdx === -1) return 0;
          if (aIdx === -1) return 1;
          if (bIdx === -1) return -1;
          return aIdx - bIdx;
        });
      }
    }

    // Return text moments first, then sorted photo moments
    return NextResponse.json([...textMoments, ...sortedPhotoMoments]);
  } catch (error) {
    console.error('Error reading moments:', error);
    return NextResponse.json([]);
  }
}
