import { NextResponse } from 'next/server';
import { connectDB, Paste } from '@/lib/mongoose';

export async function GET() {
  try {
    await connectDB();
    await Paste.countDocuments().limit(1);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
