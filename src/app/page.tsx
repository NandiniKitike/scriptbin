'use client';
import { useState, FormEvent } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id?: string; url?: string; error?: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ttl_seconds: ttlSeconds ? parseInt(ttlSeconds) : undefined,
          max_views: maxViews ? parseInt(maxViews) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ id: data.id, url: data.url });
      } else {
        setResult({ error: data.error });
      }
    } catch {
      setResult({ error: 'Failed to create paste' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8">
          Pastebin Lite
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Paste Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="w-full p-6 bg-slate-900/80 border border-slate-600 rounded-xl text-white text-lg focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 resize-vertical transition-all duration-200"
              placeholder="Enter your text, code, or anything..."
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">TTL (seconds, optional)</label>
              <input
                type="number"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                min={1}
                className="w-full p-4 bg-slate-900/80 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g. 3600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Views (optional)</label>
              <input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                min={1}
                className="w-full p-4 bg-slate-900/80 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-800 text-white font-semibold py-4 px-8 rounded-xl text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Creating Paste...' : 'Create & Share Paste'}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-8 rounded-2xl border-2 transition-all duration-300 animate-in">
            {result.error ? (
              <div className="text-red-400 text-lg font-medium bg-red-900/30 border border-red-800/50 p-6 rounded-xl">
                 Error: {result.error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-green-400 text-2xl font-bold">Paste Created!</div>
                <div className="text-sm text-slate-400 bg-slate-900/50 p-4 rounded-lg">
                  ID: <code className="font-mono bg-slate-800 px-2 py-1 rounded text-blue-400">{result.id}</code>
                </div>
                <a
                  href={result.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-8 rounded-xl text-lg text-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                >
                   Open Shareable Paste
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
