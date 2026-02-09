import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const orderPath = path.join(process.cwd(), 'src', 'data', 'photo-order.json');

    if (!fs.existsSync(orderPath)) {
      return NextResponse.json({ order: [] });
    }

    const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error reading order:', error);
    return NextResponse.json({ order: [] });
  }
}
