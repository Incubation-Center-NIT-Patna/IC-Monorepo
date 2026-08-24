import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let fileName = '';
    let buffer;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return NextResponse.json(
          { success: false, message: 'No image file provided in form data' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      
      const cleanOriginalName = file.name
        ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        : 'image.png';
      fileName = `${Date.now()}_${cleanOriginalName}`;
    } else {
      // Support JSON payload with Base64
      const body = await request.json();
      const { data, name } = body;

      if (!data) {
        return NextResponse.json(
          { success: false, message: 'No image data provided' },
          { status: 400 }
        );
      }

      // If data is a base64 string
      const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      const cleanOriginalName = name
        ? name.replace(/[^a-zA-Z0-9.-]/g, '_')
        : 'upload.png';
      fileName = `${Date.now()}_${cleanOriginalName}`;
    }

    // Target upload directory in public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: buffer.length,
    });
  } catch (error) {
    console.error('Error handling upload API:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
