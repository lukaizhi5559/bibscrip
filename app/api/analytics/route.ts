import { NextRequest, NextResponse } from 'next/server';

// In a production setup, you'd use a proper database or analytics service 
// like Firebase Analytics, Vercel KV, or a custom solution
// This is a simple in-memory implementation for the demo/development

// Accumulate events in memory (not suitable for production)
// In production, use a dedicated database/store
let analyticsEvents: any[] = [];

/**
 * POST handler for recording analytics events
 * Supports Edge runtime for optimal performance
 */
export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    
    // Validate that we received an array of events
    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events format, array expected' }, { status: 400 });
    }
    
    // Add events to our store
    analyticsEvents.push(...events);
    
    // In a production environment, we would:
    // 1. Validate events
    // 2. Store in a database
    // 3. Process for dashboards or export to analytics service
    
    // Log event count for development
    console.log(`Received ${events.length} analytics events. Total stored: ${analyticsEvents.length}`);
    
    // Basic memory management - cap the number of events we store in memory
    if (analyticsEvents.length > 1000) {
      // Keep only the most recent 1000 events
      analyticsEvents = analyticsEvents.slice(-1000);
    }
    
    return NextResponse.json({ success: true, eventsReceived: events.length });
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json({ error: 'Analytics processing error' }, { status: 500 });
  }
}

/**
 * GET handler to retrieve analytics summary
 * For admin/monitoring purposes
 */
export async function GET(request: NextRequest) {
  try {
    // Check for authentication in a real-world scenario
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'summary';
    
    if (format === 'raw' && analyticsEvents.length > 0) {
      // Return raw events (with pagination in a real implementation)
      return NextResponse.json({ events: analyticsEvents });
    }
    
    // Calculate some basic summary statistics
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    // Filter AI request events
    const aiEvents = analyticsEvents.filter(event => event.eventType === 'ai_request');
    const cacheEvents = analyticsEvents.filter(event => event.eventType === 'cache_operation');
    
    // Calculate summary metrics
    const summary = {
      total: {
        aiRequests: aiEvents.length,
        cacheOperations: cacheEvents.length,
        rateLimitEvents: analyticsEvents.filter(e => e.eventType === 'rate_limit').length
      },
      timeWindows: {
        last24Hours: aiEvents.filter(e => e.timestamp > oneDayAgo).length,
        lastWeek: aiEvents.filter(e => e.timestamp > oneWeekAgo).length
      },
      cacheStats: {
        hits: cacheEvents.filter(e => e.metadata.operation === 'hit').length,
        misses: cacheEvents.filter(e => e.metadata.operation === 'miss').length,
        hitRatio: 0
      },
      providers: {} as Record<string, { count: number; cachedCount: number; estimatedCost: number }>
    };
    
    // Calculate cache hit ratio
    const totalCacheOps = summary.cacheStats.hits + summary.cacheStats.misses;
    if (totalCacheOps > 0) {
      summary.cacheStats.hitRatio = summary.cacheStats.hits / totalCacheOps;
    }
    
    // Calculate provider stats
    aiEvents.forEach(event => {
      const provider = event.metadata.provider || 'unknown';
      
      if (!summary.providers[provider]) {
        summary.providers[provider] = { count: 0, cachedCount: 0, estimatedCost: 0 };
      }
      
      summary.providers[provider].count += 1;
      
      if (event.metadata.fromCache) {
        summary.providers[provider].cachedCount += 1;
      }
      
      if (event.metadata.cost && !event.metadata.fromCache) {
        summary.providers[provider].estimatedCost += event.metadata.cost;
      }
    });
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Analytics retrieval error' }, { status: 500 });
  }
}

// Config for Edge runtime
export const runtime = 'edge';
