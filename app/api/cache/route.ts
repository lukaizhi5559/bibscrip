import { NextRequest, NextResponse } from 'next/server';

// In a production setup, you'd use Vercel KV, Redis, or another distributed cache
// For this implementation, we'll use a simple in-memory cache with TTL
// which will be replaced with Vercel KV in production

// Simple in-memory cache for development/demo
interface CacheEntry {
  key: string;
  value: any;
  expires: number;
}

// Cache store with namespace separation
const cacheStore: Record<string, CacheEntry[]> = {};

// Helper to extract namespace from key
function getNamespaceFromKey(key: string): string {
  const parts = key.split(':');
  return parts[0] || 'default';
}

/**
 * GET handler for retrieving cached items
 * Supports Edge runtime for optimal performance
 */
export async function GET(request: NextRequest) {
  try {
    // Get the key from the query string
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'No cache key provided' }, { status: 400 });
    }
    
    const namespace = getNamespaceFromKey(key);
    const now = Date.now();
    
    // Find the item in the cache
    if (cacheStore[namespace]) {
      const entry = cacheStore[namespace].find(entry => entry.key === key);
      
      if (entry && entry.expires > now) {
        // Return the cached value
        return NextResponse.json(entry.value, {
          status: 200,
          headers: {
            'Cache-Control': `public, max-age=${Math.floor((entry.expires - now) / 1000)}`,
            'X-Cache': 'HIT'
          }
        });
      }
    }
    
    // Item not found or expired
    return NextResponse.json({ error: 'Cache miss' }, {
      status: 404,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Cache GET error:', error);
    return NextResponse.json({ error: 'Cache access error' }, { status: 500 });
  }
}

/**
 * POST handler for storing cache items
 * Supports Edge runtime for optimal performance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl = 86400000 } = body; // Default TTL: 24 hours
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }
    
    const namespace = getNamespaceFromKey(key);
    const now = Date.now();
    const expires = now + ttl;
    
    // Initialize namespace if needed
    if (!cacheStore[namespace]) {
      cacheStore[namespace] = [];
    }
    
    // Check if key exists and update, or add new entry
    const existingIndex = cacheStore[namespace].findIndex(entry => entry.key === key);
    
    if (existingIndex !== -1) {
      // Update existing entry
      cacheStore[namespace][existingIndex] = { key, value, expires };
    } else {
      // Add new entry
      cacheStore[namespace].push({ key, value, expires });
      
      // Cleanup expired items every 10 additions (basic memory management)
      if (cacheStore[namespace].length % 10 === 0) {
        cacheStore[namespace] = cacheStore[namespace].filter(entry => entry.expires > now);
      }
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Cache POST error:', error);
    return NextResponse.json({ error: 'Cache write error' }, { status: 500 });
  }
}

/**
 * DELETE handler for clearing cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { namespace, key } = body;
    
    if (namespace && key) {
      // Delete specific key in namespace
      if (cacheStore[namespace]) {
        cacheStore[namespace] = cacheStore[namespace].filter(entry => entry.key !== key);
      }
    } else if (namespace) {
      // Delete entire namespace
      delete cacheStore[namespace];
    } else {
      // Delete all cache
      Object.keys(cacheStore).forEach(ns => delete cacheStore[ns]);
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Cache DELETE error:', error);
    return NextResponse.json({ error: 'Cache delete error' }, { status: 500 });
  }
}

// Config for Edge runtime
export const runtime = 'edge';
