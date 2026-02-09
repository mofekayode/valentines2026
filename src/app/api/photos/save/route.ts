import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { selected } = await request.json();

    if (!Array.isArray(selected) || selected.length === 0) {
      return NextResponse.json({ success: false, error: 'No photos selected' });
    }

    const attachmentsDir = path.join(process.cwd(), '..', 'Messages - Sweets_');
    const publicMedia = path.join(process.cwd(), 'public', 'media');
    const dataDir = path.join(process.cwd(), 'src', 'data');

    // Clear existing media
    if (fs.existsSync(publicMedia)) {
      fs.readdirSync(publicMedia).forEach(f => fs.unlinkSync(path.join(publicMedia, f)));
    }
    fs.mkdirSync(publicMedia, { recursive: true });

    // Process selected photos
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
      const sourcePath = path.join(attachmentsDir, filename);
      if (!fs.existsSync(sourcePath)) return;

      const num = String(index + 1).padStart(3, '0');
      const destFilename = `photo_${num}.jpg`;
      const destPath = path.join(publicMedia, destFilename);

      try {
        const ext = path.extname(filename).toLowerCase();

        if (ext === '.heic') {
          execSync(`sips -s format jpeg "${sourcePath}" --out "${destPath}" 2>/dev/null`);
        } else if (ext === '.png' || ext === '.jpeg' || ext === '.jpg') {
          fs.copyFileSync(sourcePath, destPath);
        }

        // Extract date from filename
        const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
        const dateStr = dateMatch ? dateMatch[1] : '2023-01-01';
        const date = new Date(dateStr);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];

        moments.push({
          id: `moment_photo_${num}`,
          title: 'Moments',
          date: dateStr,
          timestamp: `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
          messages: [{
            fromMe: false,
            text: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
            time: ''
          }],
          image: {
            src: `/media/${destFilename}`,
            filename: destFilename,
            originalFilename: filename
          },
          tags: ['photo', 'love']
        });
      } catch (err) {
        console.error(`Failed to process ${filename}:`, err);
      }
    });

    // Load existing text moments
    const existingMomentsPath = path.join(dataDir, 'moments.json');
    let existingMoments: unknown[] = [];
    if (fs.existsSync(existingMomentsPath)) {
      const existing = JSON.parse(fs.readFileSync(existingMomentsPath, 'utf8'));
      // Keep only text moments (no image)
      existingMoments = existing.filter((m: { image?: unknown }) => !m.image);
    }

    // Combine text moments with new photo moments
    const allMoments = [...existingMoments, ...moments]
      .sort((a, b) => {
        const dateA = (a as { date: string }).date;
        const dateB = (b as { date: string }).date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

    // Save
    fs.writeFileSync(existingMomentsPath, JSON.stringify(allMoments, null, 2));

    // Also save selected filenames for reference
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
