
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { connectDB, Paste } from '@/lib/mongoose';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCurrentTime(): Promise<Date> {
  // Support TEST_MODE with x-test-now-ms header
  if (process.env.TEST_MODE === '1') {
    const headersList = await headers();
    const testNowMs = headersList.get('x-test-now-ms');
    if (testNowMs) {
      const ms = parseInt(testNowMs, 10);
      if (!isNaN(ms)) {
        return new Date(ms);
      }
    }
  }
  return new Date();
}

export default async function PasteView({ params }: PageProps) {
  try {
    await connectDB();
    
    const { id } = await params;
    const now = await getCurrentTime(); // Await the async function

    // Fetch paste WITHOUT incrementing view count
    const paste = await Paste.findOne({ id }).lean();

    if (!paste) {
      notFound();
    }

    // Check expiry with deterministic time
    if (paste.expiresAt && paste.expiresAt <= now) {
      notFound();
    }

    // Check view limit
    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 shadow-2xl">
            <div className="flex items-center justify-between mb-12">
              <span className="inline-flex items-center gap-2 bg-blue-600/80 backdrop-blur-sm text-white px-6 py-2 rounded-full text-lg font-semibold border border-blue-500/50">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                pastebin-lite/{id}
              </span>
              <div className="text-sm text-slate-500">
                Shared paste
              </div>
            </div>
            
            <div className="mb-12">
              <div className="bg-slate-900/80 border-2 border-slate-700/50 rounded-2xl p-8 shadow-xl backdrop-blur-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap text-lg font-mono text-slate-100 leading-relaxed">
                  <code>{paste.content}</code>
                </pre>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400 bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
              {paste.maxViews && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                  <span>Views: {paste.viewCount} / {paste.maxViews}</span>
                </div>
              )}
              {paste.expiresAt && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                  <span>Expires: {new Date(paste.expiresAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading paste:', error);
    notFound();
  }
}