/**
 * Advanced Cache Manager for large-scale applications
 * Provides intelligent caching with TTL, size limits, and automatic cleanup
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
    accessCount: number;
    lastAccessed: number;
    size: number; // rough size estimation
}

interface CacheConfig {
    maxSize: number; // Maximum cache size in MB
    defaultTTL: number; // Default time to live in ms
    cleanupInterval: number; // Cleanup interval in ms
    maxEntries: number; // Maximum number of cache entries
}

export class CacheManager {
    private cache = new Map<string, CacheEntry<any>>();
    private config: CacheConfig;
    private cleanupTimer: NodeJS.Timeout | null = null;
    private currentSize = 0; // Estimated size in bytes

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            maxSize: 50 * 1024 * 1024, // 50MB default
            defaultTTL: 5 * 60 * 1000, // 5 minutes default
            cleanupInterval: 60 * 1000, // 1 minute cleanup
            maxEntries: 1000, // 1000 entries max
            ...config
        };

        // Start periodic cleanup
        this.startCleanup();
    }

    /**
     * Store data in cache with optional TTL
     */
    set<T>(key: string, data: T, ttl?: number): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.config.defaultTTL,
            accessCount: 0,
            lastAccessed: Date.now(),
            size: this.estimateSize(data)
        };

        // Check if we need to make space
        if (this.cache.size >= this.config.maxEntries || 
            this.currentSize + entry.size > this.config.maxSize) {
            this.makeSpace(entry.size);
        }

        // Remove old entry if exists
        if (this.cache.has(key)) {
            const oldEntry = this.cache.get(key)!;
            this.currentSize -= oldEntry.size;
        }

        this.cache.set(key, entry);
        this.currentSize += entry.size;
    }

    /**
     * Get data from cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        // Check if expired
        if (this.isExpired(entry)) {
            this.delete(key);
            return null;
        }

        // Update access statistics
        entry.accessCount++;
        entry.lastAccessed = Date.now();

        return entry.data as T;
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry || this.isExpired(entry)) {
            if (entry) this.delete(key);
            return false;
        }
        return true;
    }

    /**
     * Delete entry from cache
     */
    delete(key: string): boolean {
        const entry = this.cache.get(key);
        if (entry) {
            this.currentSize -= entry.size;
            return this.cache.delete(key);
        }
        return false;
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
        this.currentSize = 0;
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            entries: this.cache.size,
            sizeBytes: this.currentSize,
            sizeMB: (this.currentSize / (1024 * 1024)).toFixed(2),
            hitRate: this.calculateHitRate()
        };
    }

    /**
     * Get or set pattern with callback
     */
    async getOrSet<T>(
        key: string, 
        factory: () => Promise<T> | T, 
        ttl?: number
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const data = await factory();
        this.set(key, data, ttl);
        return data;
    }

    /**
     * Invalidate cache entries by pattern
     */
    invalidatePattern(pattern: string | RegExp): number {
        let count = 0;
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        
        const keys = Array.from(this.cache.keys());
        for (const key of keys) {
            if (regex.test(key)) {
                this.delete(key);
                count++;
            }
        }
        
        return count;
    }

    /**
     * Start periodic cleanup
     */
    private startCleanup(): void {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }

    /**
     * Stop cleanup timer
     */
    destroy(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.clear();
    }

    /**
     * Check if entry is expired
     */
    private isExpired(entry: CacheEntry<any>): boolean {
        return Date.now() - entry.timestamp > entry.ttl;
    }

    /**
     * Estimate size of data
     */
    private estimateSize(data: any): number {
        try {
            return new Blob([JSON.stringify(data)]).size;
        } catch {
            // Fallback estimation
            const str = typeof data === 'string' ? data : JSON.stringify(data);
            return str.length * 2; // Rough estimate for UTF-16
        }
    }

    /**
     * Make space for new entry
     */
    private makeSpace(requiredSize: number): void {
        // Sort entries by priority (LRU + access frequency)
        const entries = Array.from(this.cache.entries())
            .map(([key, entry]) => ({
                key,
                entry,
                priority: this.calculatePriority(entry)
            }))
            .sort((a, b) => a.priority - b.priority);

        let freedSize = 0;
        let removedCount = 0;

        for (const { key } of entries) {
            if (freedSize >= requiredSize && 
                this.cache.size - removedCount < this.config.maxEntries * 0.8) {
                break;
            }

            const entry = this.cache.get(key);
            if (entry) {
                freedSize += entry.size;
                removedCount++;
                this.delete(key);
            }
        }
    }

    /**
     * Calculate entry priority for eviction
     */
    private calculatePriority(entry: CacheEntry<any>): number {
        const age = Date.now() - entry.timestamp;
        const timeSinceAccess = Date.now() - entry.lastAccessed;
        const frequency = entry.accessCount;
        
        // Lower priority = more likely to be evicted
        // Prioritize frequently accessed, recently used items
        return age + timeSinceAccess - (frequency * 10000);
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const keysToDelete: string[] = [];
        
        const entries = Array.from(this.cache.entries());
        for (const [key, entry] of entries) {
            if (this.isExpired(entry)) {
                keysToDelete.push(key);
            }
        }

        for (const key of keysToDelete) {
            this.delete(key);
        }

        // Also check if we're over size limits
        if (this.currentSize > this.config.maxSize * 0.9) {
            this.makeSpace(this.config.maxSize * 0.1);
        }
    }

    /**
     * Calculate cache hit rate (simplified)
     */
    private calculateHitRate(): number {
        let totalAccesses = 0;
        const values = Array.from(this.cache.values());
        for (const entry of values) {
            totalAccesses += entry.accessCount;
        }
        return totalAccesses > 0 ? (totalAccesses / this.cache.size) : 0;
    }
}

// Create singleton instances for different cache types
export const apiCache = new CacheManager({
    maxSize: 30 * 1024 * 1024, // 30MB for API responses
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxEntries: 500
});

export const userCache = new CacheManager({
    maxSize: 10 * 1024 * 1024, // 10MB for user data
    defaultTTL: 15 * 60 * 1000, // 15 minutes
    maxEntries: 200
});

export const staticCache = new CacheManager({
    maxSize: 20 * 1024 * 1024, // 20MB for static data
    defaultTTL: 60 * 60 * 1000, // 1 hour
    maxEntries: 300
});

// Cache key generators
export const CacheKeys = {
    offers: (filters: any) => `offers:${JSON.stringify(filters)}`,
    user: (uid: string) => `user:${uid}`,
    project: (projectId: string) => `project:${projectId}`,
    group: (groupId: string) => `group:${groupId}`,
    systemAttributes: () => 'system:attributes',
    groupsOfMembership: (uid: string) => `user:${uid}:groups`
};