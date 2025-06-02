// BibScrip Analytics Module
// Tracks AI usage, costs, and cache effectiveness

interface AnalyticsEvent {
  eventType: string;
  timestamp: number;
  metadata: Record<string, any>;
}

interface AIUsageEvent extends AnalyticsEvent {
  eventType: 'ai_request';
  metadata: {
    provider: string;
    fromCache: boolean;
    tokenUsage?: {
      input: number;
      output: number;
      total: number;
    };
    latencyMs: number;
    cost?: number;
    query?: string;
    status: 'success' | 'error';
    errorType?: string;
    cacheKey?: string;
    cacheAge?: number;
  };
}

interface CacheEvent extends AnalyticsEvent {
  eventType: 'cache_operation';
  metadata: {
    operation: 'hit' | 'miss' | 'set' | 'expired' | 'evicted';
    key: string;
    latencyMs?: number;
    size?: number;
    ttl?: number;
  };
}

interface RateLimitEvent extends AnalyticsEvent {
  eventType: 'rate_limit';
  metadata: {
    provider: string;
    limitType: 'requests_per_minute' | 'requests_per_hour' | 'tokens_per_minute';
    currentCount: number;
    limit: number;
  };
}

type BibScripAnalyticsEvent = AIUsageEvent | CacheEvent | RateLimitEvent;

// Provider-specific cost estimates in USD per 1000 tokens
const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  'openai-gpt4': { input: 0.01, output: 0.03 },
  'openai-gpt35': { input: 0.0015, output: 0.002 },
  'mistral-large': { input: 0.0025, output: 0.008 },
  'claude-opus': { input: 0.015, output: 0.075 },
  'claude-sonnet': { input: 0.003, output: 0.015 }
};

class AnalyticsManager {
  private events: BibScripAnalyticsEvent[] = [];
  private isBrowser: boolean;
  private flushInterval?: NodeJS.Timeout;
  private maxEventsBeforeFlush = 50;
  private costEstimates: Record<string, number> = {};
  private cacheStats = {
    hits: 0,
    misses: 0,
    hitRatio: 0,
    estimatedSavings: 0
  };

  constructor() {
    this.isBrowser = typeof window !== 'undefined';
    this.setupPeriodicFlush();
    this.loadPersistentData();
  }

  /**
   * Track an AI request event
   */
  trackAIRequest(data: Omit<AIUsageEvent['metadata'], 'timestamp'>): void {
    const event: AIUsageEvent = {
      eventType: 'ai_request',
      timestamp: Date.now(),
      metadata: data
    };

    this.events.push(event);
    this.updateCostEstimates(event);
    
    // If we've accumulated enough events, flush them
    if (this.events.length >= this.maxEventsBeforeFlush) {
      this.flush();
    }
  }

  /**
   * Track a cache operation event
   */
  trackCacheOperation(data: Omit<CacheEvent['metadata'], 'timestamp'>): void {
    const event: CacheEvent = {
      eventType: 'cache_operation',
      timestamp: Date.now(),
      metadata: data
    };

    this.events.push(event);
    this.updateCacheStats(event);
    
    if (this.events.length >= this.maxEventsBeforeFlush) {
      this.flush();
    }
  }

  /**
   * Track a rate limit event
   */
  trackRateLimit(data: Omit<RateLimitEvent['metadata'], 'timestamp'>): void {
    const event: RateLimitEvent = {
      eventType: 'rate_limit',
      timestamp: Date.now(),
      metadata: data
    };

    this.events.push(event);
    
    if (this.events.length >= this.maxEventsBeforeFlush) {
      this.flush();
    }
  }

  /**
   * Calculate cost for tokens used
   */
  calculateCost(provider: string, inputTokens: number, outputTokens: number): number {
    let costProfile = COST_PER_1K_TOKENS['openai-gpt35']; // default
    
    // Map provider string to cost profile
    if (provider === 'openai') {
      costProfile = COST_PER_1K_TOKENS['openai-gpt4']; // Assuming GPT-4 by default
    } else if (provider === 'claude') {
      costProfile = COST_PER_1K_TOKENS['claude-sonnet'];
    } else if (provider === 'mistral') {
      costProfile = COST_PER_1K_TOKENS['mistral-large'];
    }
    
    const inputCost = (inputTokens / 1000) * costProfile.input;
    const outputCost = (outputTokens / 1000) * costProfile.output;
    
    return inputCost + outputCost;
  }

  /**
   * Get analytics summary for display
   */
  getAnalyticsSummary(): {
    totalRequests: number;
    cachedRequests: number;
    cacheHitRatio: number;
    totalCost: number;
    estimatedSavings: number;
    providerBreakdown: Record<string, { count: number; cost: number }>;
    timeWindowStats: { today: number; thisWeek: number; thisMonth: number };
  } {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Filter AI request events
    const aiEvents = this.events.filter(
      event => event.eventType === 'ai_request'
    ) as AIUsageEvent[];

    // Calculate basic stats
    const totalRequests = aiEvents.length;
    const cachedRequests = aiEvents.filter(e => e.metadata.fromCache).length;
    const cacheHitRatio = totalRequests > 0 ? cachedRequests / totalRequests : 0;
    
    // Calculate costs by provider
    const providerBreakdown: Record<string, { count: number; cost: number }> = {};
    let totalCost = 0;

    aiEvents.forEach(event => {
      const provider = event.metadata.provider;
      
      if (!providerBreakdown[provider]) {
        providerBreakdown[provider] = { count: 0, cost: 0 };
      }
      
      providerBreakdown[provider].count += 1;
      
      if (event.metadata.cost && !event.metadata.fromCache) {
        providerBreakdown[provider].cost += event.metadata.cost;
        totalCost += event.metadata.cost;
      }
    });

    // Calculate time-based stats
    const timeWindowStats = {
      today: aiEvents.filter(e => e.timestamp > oneDayAgo).length,
      thisWeek: aiEvents.filter(e => e.timestamp > oneWeekAgo).length,
      thisMonth: aiEvents.filter(e => e.timestamp > oneMonthAgo).length
    };

    // Calculate estimated savings from cache hits
    const estimatedSavings = this.cacheStats.estimatedSavings;

    return {
      totalRequests,
      cachedRequests,
      cacheHitRatio,
      totalCost,
      estimatedSavings,
      providerBreakdown,
      timeWindowStats
    };
  }

  /**
   * Flush analytics data to storage
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    try {
      if (this.isBrowser) {
        // In browser, store in localStorage with a timestamp-based key
        const timestamp = Date.now();
        const eventsKey = `bibscrip_analytics_events_${timestamp}`;
        localStorage.setItem(eventsKey, JSON.stringify(this.events));
        
        // Store cost estimates and cache stats
        localStorage.setItem('bibscrip_analytics_costs', JSON.stringify(this.costEstimates));
        localStorage.setItem('bibscrip_analytics_cache', JSON.stringify(this.cacheStats));
      } else {
        // In server environment, send to analytics endpoint
        // This would typically go to a database, logging service, etc.
        // For now, we'll just log for development
        try {
          await fetch('/api/analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.events)
          });
        } catch (error) {
          console.error('Error sending server analytics:', error);
        }
      }
      
      // Clear events after successful flush
      this.events = [];
    } catch (error) {
      console.error('Error flushing analytics:', error);
    }
  }

  /**
   * Clean up resources used by the analytics manager
   */
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = undefined;
    }
    
    // Flush any remaining events
    this.flush();
  }

  // Private methods

  private setupPeriodicFlush(): void {
    // Flush every 5 minutes
    this.flushInterval = setInterval(() => this.flush(), 5 * 60 * 1000);
  }

  private updateCostEstimates(event: AIUsageEvent): void {
    if (
      event.metadata.status === 'success' &&
      !event.metadata.fromCache &&
      event.metadata.tokenUsage &&
      event.metadata.provider
    ) {
      const { provider, tokenUsage } = event.metadata;
      
      // Calculate cost
      const cost = this.calculateCost(
        provider,
        tokenUsage.input,
        tokenUsage.output
      );
      
      // Update event with cost
      event.metadata.cost = cost;
      
      // Update provider cost tracking
      if (!this.costEstimates[provider]) {
        this.costEstimates[provider] = 0;
      }
      this.costEstimates[provider] += cost;
    }
    
    // If it's a cache hit, calculate the savings
    if (event.metadata.fromCache && event.metadata.tokenUsage) {
      const { provider, tokenUsage } = event.metadata;
      const savedCost = this.calculateCost(
        provider || 'openai', // default to openai if provider is not specified
        tokenUsage.input,
        tokenUsage.output
      );
      this.cacheStats.estimatedSavings += savedCost;
    }
  }

  private updateCacheStats(event: CacheEvent): void {
    const operation = event.metadata.operation;
    
    if (operation === 'hit') {
      this.cacheStats.hits++;
    } else if (operation === 'miss') {
      this.cacheStats.misses++;
    }
    
    // Update hit ratio
    const total = this.cacheStats.hits + this.cacheStats.misses;
    if (total > 0) {
      this.cacheStats.hitRatio = this.cacheStats.hits / total;
    }
  }

  private loadPersistentData(): void {
    if (!this.isBrowser) return;
    
    try {
      // Load cost estimates
      const costData = localStorage.getItem('bibscrip_analytics_costs');
      if (costData) {
        this.costEstimates = JSON.parse(costData);
      }
      
      // Load cache stats
      const cacheData = localStorage.getItem('bibscrip_analytics_cache');
      if (cacheData) {
        this.cacheStats = JSON.parse(cacheData);
      }
      
      // Process any stored events that haven't been sent to server yet
      // This could happen if the app closed before events were flushed
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bibscrip_analytics_events_')) {
          keys.push(key);
        }
      }
      
      // Sort keys by timestamp (part after last underscore)
      keys.sort((a, b) => {
        const timestampA = parseInt(a.split('_').pop() || '0', 10);
        const timestampB = parseInt(b.split('_').pop() || '0', 10);
        return timestampA - timestampB;
      });
      
      // Process each batch of events
      keys.forEach(key => {
        const eventsData = localStorage.getItem(key);
        if (eventsData) {
          try {
            const events = JSON.parse(eventsData) as BibScripAnalyticsEvent[];
            
            // Add events to the current batch
            this.events.push(...events);
            
            // Remove the processed batch
            localStorage.removeItem(key);
          } catch (error) {
            console.error(`Error processing stored analytics events from ${key}:`, error);
            localStorage.removeItem(key);
          }
        }
      });
      
      // If we've accumulated enough events, flush them
      if (this.events.length >= this.maxEventsBeforeFlush) {
        this.flush();
      }
    } catch (error) {
      console.error('Error loading persistent analytics data:', error);
    }
  }
}

// Export a singleton instance
export const analytics = new AnalyticsManager();
