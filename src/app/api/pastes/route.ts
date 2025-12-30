
// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB, Paste } from '@/lib/mongoose';
// import { randomBytes } from 'crypto';

// function generateId(): string {
//   return randomBytes(4).toString('hex');
// }

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();
    
//     let body;
//     try {
//       body = await req.json();
//     } catch {
//       return NextResponse.json(
//         { error: 'Invalid JSON' },
//         { 
//           status: 400,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }

//     const { content, ttl_seconds, max_views } = body;

//     // Validate content
//     if (!content || typeof content !== 'string' || content.trim().length === 0) {
//       return NextResponse.json(
//         { error: 'content is required and must be a non-empty string' },
//         { 
//           status: 400,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }

//     // Validate ttl_seconds
//     if (ttl_seconds !== undefined && ttl_seconds !== null) {
//       if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
//         return NextResponse.json(
//           { error: 'ttl_seconds must be an integer >= 1' },
//           { 
//             status: 400,
//             headers: { 'Content-Type': 'application/json' }
//           }
//         );
//       }
//     }

//     // Validate max_views
//     if (max_views !== undefined && max_views !== null) {
//       if (!Number.isInteger(max_views) || max_views < 1) {
//         return NextResponse.json(
//           { error: 'max_views must be an integer >= 1' },
//           { 
//             status: 400,
//             headers: { 'Content-Type': 'application/json' }
//           }
//         );
//       }
//     }

//     // Generate unique ID
//     const id = generateId();
    
//     // Calculate expiry
//     const expiresAt = ttl_seconds 
//       ? new Date(Date.now() + ttl_seconds * 1000) 
//       : null;

//     // Create paste
//     const paste = await Paste.create({
//       id,
//       content,
//       ttlSeconds: ttl_seconds || null,
//       maxViews: max_views || null,
//       viewCount: 0,
//       expiresAt,
//       createdAt: new Date()
//     });

//     // Build URL
//     const host = req.headers.get('host') || 'localhost:3000';
//     const protocol = host.includes('localhost') ? 'http' : 'https';
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
//     const url = `${baseUrl}/p/${paste.id}`;

//     return NextResponse.json(
//       { id: paste.id, url },
//       { 
//         status: 201,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );

//   } catch (error) {
//     console.error('Error creating paste:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { 
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Paste } from '@/lib/mongoose';
import { randomBytes } from 'crypto';

function generateId(): string {
  return randomBytes(4).toString('hex');
}

function getBaseUrl(req: NextRequest): string {
  // Priority 1: Use environment variable if set
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Priority 2: Build from request headers
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  // Fallback (shouldn't happen in production)
  return 'http://localhost:3000';
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { content, ttl_seconds, max_views } = body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'content is required and must be a non-empty string' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate ttl_seconds
    if (ttl_seconds !== undefined && ttl_seconds !== null) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return NextResponse.json(
          { error: 'ttl_seconds must be an integer >= 1' },
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Validate max_views
    if (max_views !== undefined && max_views !== null) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        return NextResponse.json(
          { error: 'max_views must be an integer >= 1' },
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Generate unique ID
    const id = generateId();
    
    // Calculate expiry
    const expiresAt = ttl_seconds 
      ? new Date(Date.now() + ttl_seconds * 1000) 
      : null;

    // Create paste
    const paste = await Paste.create({
      id,
      content,
      ttlSeconds: ttl_seconds || null,
      maxViews: max_views || null,
      viewCount: 0,
      expiresAt,
      createdAt: new Date()
    });

    // Build URL with proper base
    const baseUrl = getBaseUrl(req);
    const url = `${baseUrl}/p/${paste.id}`;

    return NextResponse.json(
      { id: paste.id, url },
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating paste:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}