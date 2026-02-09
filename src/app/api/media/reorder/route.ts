import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { order } = await request.json();

    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ success: false, error: 'No order provided' });
    }

    const dataDir = path.join(process.cwd(), 'src', 'data');
    const momentsPath = path.join(dataDir, 'moments.json');
    const orderPath = path.join(dataDir, 'photo-order.json');

    // Save order file
    fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));

    // Also update moments.json directly
    const moments = JSON.parse(fs.readFileSync(momentsPath, 'utf8'));
    const textMoments = moments.filter((m: {image?: unknown}) => !m.image);
    const photoMoments = moments.filter((m: {image?: unknown}) => m.image);

    // Sort photo moments by the new order
    const sortedPhotos = [...photoMoments].sort((a: {image: {filename: string}}, b: {image: {filename: string}}) => {
      const aIdx = order.indexOf(a.image.filename);
      const bIdx = order.indexOf(b.image.filename);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

    // Save with new order
    const newMoments = [...textMoments, ...sortedPhotos];
    fs.writeFileSync(momentsPath, JSON.stringify(newMoments, null, 2));

    return NextResponse.json({
      success: true,
      count: order.length,
      message: `Saved order for ${order.length} photos`
    });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ success: false, error: 'Failed to save order' });
  }
}
