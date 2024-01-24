import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const POST = async (request) => {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  try {
    const formData = await request.formData();

    // Access the file data
    const file = formData.get('file');

    // Upload image file using Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error reading FormData:', error);
    return NextResponse.json({ error: 'Error reading FormData' }, { status: 500 });
  }
};
