import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);
    const attachmentsDir = path.join(process.cwd(), '..', 'Messages - Sweets_');
    const filePath = path.join(attachmentsDir, decodedFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const ext = path.extname(decodedFilename).toLowerCase();

    // For HEIC files, convert to JPEG on the fly
    if (ext === '.heic') {
      const tempDir = '/tmp';
      const tempFile = path.join(tempDir, `${Date.now()}.jpg`);

      try {
        execSync(`sips -s format jpeg "${filePath}" --out "${tempFile}" 2>/dev/null`);
        const data = fs.readFileSync(tempFile);
        fs.unlinkSync(tempFile); // Clean up

        return new NextResponse(data, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      } catch {
        return new NextResponse('Failed to convert HEIC', { status: 500 });
      }
    }

    // For other images, serve directly
    const data = fs.readFileSync(filePath);
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving photo:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
