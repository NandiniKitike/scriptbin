import mongoose from 'mongoose';

const pasteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  content: { type: String, required: true },
  ttlSeconds: { type: Number },
  maxViews: { type: Number },
  viewCount: { type: Number, default: 0 },
  expiresAt: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now }
}, { 
  versionKey: false 
});

export const Paste = mongoose.models.Paste || mongoose.model('Paste', pasteSchema);

let cached: typeof mongoose | null = null;

export async function connectDB() {
  if (cached) return cached;
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    cached = conn;
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    console.error(' MongoDB connection failed:', error);
    throw new Error('MongoDB connection failed');
  }
}
