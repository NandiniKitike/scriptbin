import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Paste } from '@/lib/mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // FIXED: Promise type
) {
  await connectDB();
  
  const testNowMs = req.headers.get('x-test-now-ms');
  const now = testNowMs ? new Date(parseInt(testNowMs)) : new Date();

  try {
    // FIXED: await params() → Extract id
    const { id } = await params;  // ← THIS LINE FIXES EVERYTHING

    console.log('Fetching paste ID:', id); // DEBUG

    // Step 1: Check if paste exists and is available
    const paste = await Paste.findOne({ 
      id,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } }
      ]
    });

    if (!paste) {
      console.log('Paste not found:', id); // DEBUG
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
    }

    // Step 2: Check view limit
    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
      return NextResponse.json({ error: 'View limit exceeded' }, { status: 404 });
    }

    // Step 3: Atomic increment view count
    const updatedPaste = await Paste.findOneAndUpdate(
      { id },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    console.log('Paste viewed:', id, 'Remaining:', paste.maxViews ? paste.maxViews - (paste.viewCount + 1) : '∞'); // DEBUG

    return NextResponse.json({
      content: updatedPaste!.content,
      remaining_views: paste.maxViews ? paste.maxViews - (paste.viewCount + 1) : null,
      expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null,
    });
  } catch (error) {
    console.error('Paste fetch error:', error);
    return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
  }
}
