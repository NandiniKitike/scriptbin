import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Paste } from '@/lib/mongoose';

function getCurrentTime(req: NextRequest): Date {
  if (process.env.TEST_MODE === '1') {
    const testNowMs = req.headers.get('x-test-now-ms');
    if (testNowMs) {
      const ms = parseInt(testNowMs, 10);
      if (!isNaN(ms)) {
        return new Date(ms);
      }
    }
  }
  return new Date();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const now = getCurrentTime(req);

    // Find paste
    const paste = await Paste.findOne({ id });

    if (!paste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check expiry
    if (paste.expiresAt && paste.expiresAt <= now) {
      return NextResponse.json(
        { error: 'Paste has expired' },
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check view limit BEFORE incrementing
    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
      return NextResponse.json(
        { error: 'View limit exceeded' },
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Atomically increment view count
    const updatedPaste = await Paste.findOneAndUpdate(
      { 
        id,
        $or: [
          { maxViews: { $exists: false } },
          { maxViews: null },
          { $expr: { $lt: ['$viewCount', '$maxViews'] } }
        ]
      },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    // Race condition: another request consumed the last view
    if (!updatedPaste) {
      return NextResponse.json(
        { error: 'View limit exceeded' },
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate remaining views (after increment)
    const remainingViews = updatedPaste.maxViews 
      ? Math.max(0, updatedPaste.maxViews - updatedPaste.viewCount)
      : null;

    return NextResponse.json(
      {
        content: updatedPaste.content,
        remaining_views: remainingViews,
        expires_at: updatedPaste.expiresAt ? updatedPaste.expiresAt.toISOString() : null
      },
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching paste:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}