import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Paste } from '@/lib/mongoose';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  console.log('🔄 Creating paste...');
  
  try {
    await connectDB();
    const body = await req.json();
    const { content, ttl_seconds, max_views } = body;

    console.log('📥 Received:', { content: content?.slice(0, 50), ttl_seconds, max_views });

    // Validation
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    const id = uuidv4().slice(0, 8);
    const pasteData = {
      id,
      content: content.trim(),
      ttlSeconds: ttl_seconds || null,
      maxViews: max_views || null,
      viewCount: 0,
      expiresAt: ttl_seconds ? new Date(Date.now() + ttl_seconds * 1000) : null,
    };

    console.log('💾 Saving:', pasteData);

    const paste = await Paste.create(pasteData);
    console.log('✅ SAVED:', paste.id);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.json({
      id: paste.id,
      url: `${baseUrl}/p/${paste.id}`,
    });
  } catch (error: any) {
    console.error('💥 ERROR:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to create paste' }, { status: 500 });
  }
}
