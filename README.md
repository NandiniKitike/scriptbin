# Scriptbin

A simple pastebin application that allows users to create and share text snippets with optional expiry times and view limits.

## Features

- Create text pastes with shareable URLs
- Optional time-based expiry (TTL in seconds)
- Optional view-count limits
- Pastes become unavailable when constraints are met
- Safe rendering (XSS protection)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Deployment**: Vercel

## Persistence Layer

This application uses **MongoDB** as its persistence layer. MongoDB was chosen because:
- It provides persistent storage across serverless function invocations
- It handles atomic operations for concurrent view counting
- It supports TTL indexes for automatic cleanup of expired pastes
- It's reliable and scales well on Vercel

## Local Development

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud, e.g., MongoDB Atlas)

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd scriptbin
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
MONGODB_URI=mongodb+srv://your-connection-string
NEXT_PUBLIC_BASE_URL=http://localhost:3000
TEST_MODE=0
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Health Check
```
GET /api/healthz
Response: { "ok": true }
```

### Create Paste
```
POST /api/pastes
Body: {
  "content": "string",
  "ttl_seconds": 60,      // optional
  "max_views": 5          // optional
}
Response: {
  "id": "abc123",
  "url": "https://your-app.vercel.app/p/abc123"
}
```

### Get Paste (API)
```
GET /api/pastes/:id
Response: {
  "content": "string",
  "remaining_views": 4,   // null if unlimited
  "expires_at": "2026-01-01T00:00:00.000Z"  // null if no TTL
}
```

### View Paste (HTML)
```
GET /p/:id
Returns: HTML page with paste content
```

## Design Decisions

1. **Server-Side Rendering for HTML**: The `/p/:id` route uses Next.js server components to render HTML directly without calling the API, avoiding unnecessary view increments.

2. **Atomic View Counting**: View increments use MongoDB's `findOneAndUpdate` with conditions to prevent race conditions under concurrent load.

3. **Deterministic Testing**: The app supports `TEST_MODE=1` with `x-test-now-ms` header for deterministic time-based testing.

4. **Short IDs**: Paste IDs are 8-character hex strings generated using Node.js crypto for uniqueness without being too long.

5. **XSS Protection**: Paste content is rendered inside `<code>` tags within `<pre>` to prevent script execution.

## Deployment

Deploy to Vercel:
```bash
npm run build
vercel
```

Set environment variables in Vercel dashboard:
- `MONGODB_URI`
- `NEXT_PUBLIC_BASE_URL`
- `TEST_MODE=0`

## License

MIT