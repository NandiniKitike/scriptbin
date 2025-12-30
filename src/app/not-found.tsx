export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-12 shadow-2xl">
        <div className="w-24 h-24 bg-red-500/20 border-2 border-red-500/50 rounded-2xl mx-auto mb-8 flex items-center justify-center">
          <span className="text-3xl">📄</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Paste Not Available</h1>
        <p className="text-slate-400 text-lg mb-8">
          This paste does not exist, has expired, or has exceeded its view limit.
        </p>
        <a 
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Create New Paste
        </a>
      </div>
    </div>
  );
}