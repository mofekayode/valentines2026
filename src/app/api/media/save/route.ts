import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { selected } = await request.json();

    if (!Array.isArray(selected) || selected.length === 0) {
      return NextResponse.json({ success: false, error: 'No photos selected' });
    }

    const publicMedia = path.join(process.cwd(), 'public', 'media');
    const tempDir = path.join(process.cwd(), 'public', 'media_temp');
    const dataDir = path.join(process.cwd(), 'src', 'data');

    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });

    // Copy selected files to temp with new numbering
    const moments: Array<{
      id: string;
      title: string;
      date: string;
      timestamp: string;
      messages: Array<{ fromMe: boolean; text: string; time: string }>;
      image: { src: string; filename: string; originalFilename: string };
      tags: string[];
    }> = [];

    selected.forEach((filename: string, index: number) => {
      const sourcePath = path.join(publicMedia, filename);
      if (!fs.existsSync(sourcePath)) return;

      const num = String(index + 1).padStart(3, '0');
      const destFilename = `photo_${num}.jpg`;
      const destPath = path.join(tempDir, destFilename);

      fs.copyFileSync(sourcePath, destPath);

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const now = new Date();

      moments.push({
        id: `moment_photo_${num}`,
        title: 'Moments',
        date: now.toISOString().split('T')[0],
        timestamp: `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
        messages: [{
          fromMe: false,
          text: `Photo ${index + 1}`,
          time: ''
        }],
        image: {
          src: `/media/${destFilename}`,
          filename: destFilename,
          originalFilename: filename
        },
        tags: ['photo', 'love']
      });
    });

    // Clear original media folder
    fs.readdirSync(publicMedia).forEach(f => {
      const filePath = path.join(publicMedia, f);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });

    // Move files from temp to media
    fs.readdirSync(tempDir).forEach(f => {
      fs.renameSync(path.join(tempDir, f), path.join(publicMedia, f));
    });

    // Remove temp directory
    fs.rmdirSync(tempDir);

    // Load existing text moments
    const existingMomentsPath = path.join(dataDir, 'moments.json');
    let existingMoments: unknown[] = [];
    if (fs.existsSync(existingMomentsPath)) {
      const existing = JSON.parse(fs.readFileSync(existingMomentsPath, 'utf8'));
      existingMoments = existing.filter((m: { image?: unknown }) => !m.image);
    }

    // Combine and save
    const allMoments = [...existingMoments, ...moments];
    fs.writeFileSync(existingMomentsPath, JSON.stringify(allMoments, null, 2));

    // Save selected filenames
    fs.writeFileSync(
      path.join(dataDir, 'selected-photos.json'),
      JSON.stringify(selected, null, 2)
    );

    return NextResponse.json({
      success: true,
      count: moments.length,
      message: `Saved ${moments.length} photos`
    });
  } catch (error) {
    console.error('Error saving photos:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' });
  }
}
