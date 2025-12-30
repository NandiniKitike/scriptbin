
import { NextResponse } from 'next/server';
import { connectDB, Paste } from '@/lib/mongoose';

export async function GET() {
  try {
    await connectDB();
    // Quick DB check
    await Paste.countDocuments().limit(1).maxTimeMS(2000);
    
    return NextResponse.json(
      { ok: true },
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false },
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}