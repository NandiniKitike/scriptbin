'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface PasteData {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

export default function PasteView() {
  const params = useParams();
  const id = params.id as string;
  const [paste, setPaste] = useState<PasteData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pastes/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setPaste(data);
        } else {
          setError(data.error || 'Paste not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load paste');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="text-white text-xl animate-pulse">Loading paste...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-12 shadow-2xl">
          <div className="w-24 h-24 bg-red-500/20 border-2 border-red-500/50 rounded-2xl mx-auto mb-8 flex items-center justify-center">
            <span className="text-3xl">📄</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Paste Not Available</h1>
          <p className="text-slate-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <span className="inline-flex items-center gap-2 bg-blue-600/80 backdrop-blur-sm text-white px-6 py-2 rounded-full text-lg font-semibold border border-blue-500/50">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              pastebin-lite/{id}
            </span>
            <div className="text-sm text-slate-500">
              Shared paste • View #{paste!.remaining_views !== null ? (paste!.remaining_views! + 1) : '∞'}
            </div>
          </div>
          
          {/* Content - XSS SAFE */}
          <div className="mb-12">
            <div className="bg-slate-900/80 border-2 border-slate-700/50 rounded-2xl p-8 shadow-xl backdrop-blur-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap text-lg font-mono text-slate-100 leading-relaxed">
                <code>{paste!.content}</code>
              </pre>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 text-sm text-slate-400 bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
            {paste!.remaining_views !== null && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                <span>Remaining views: {paste!.remaining_views}</span>
              </div>
            )}
            {paste!.expires_at && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                <span>Expires: {new Date(paste!.expires_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
