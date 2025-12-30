
import mongoose from 'mongoose';

const pasteSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  ttlSeconds: { 
    type: Number,
    min: 1 
  },
  maxViews: { 
    type: Number,
    min: 1 
  },
  viewCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  expiresAt: { 
    type: Date,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now
  }
}, { 
  versionKey: false,
  collection: 'pastes'
});

// TTL index for automatic cleanup (disabled in TEST_MODE)
if (process.env.TEST_MODE !== '1') {
  pasteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export const Paste = mongoose.models.Paste || mongoose.model('Paste', pasteSchema);

let cached: typeof mongoose | null = null;

export async function connectDB() {
  if (cached && cached.connection.readyState === 1) {
    return cached;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    
    cached = conn;
    return conn;
  } catch (error) {
    cached = null;
    throw error;
  }
}