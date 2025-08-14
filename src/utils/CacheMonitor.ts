/**
 * Cache Monitoring and Performance Analytics
 * Provides insights into cache performance and usage patterns
 */

import {apiCache, userCache, staticCache} from './CacheManager';

export class CacheMonitor {
    private static instance: CacheMonitor;
    private startTime: number = Date.now();
    private hitCounts = { api: 0, user: 0, static: 0 };
    private missCounts = { api: 0, user: 0, static: 0 };

    static getInstance(): CacheMonitor {
        if (!CacheMonitor.instance) {
            CacheMonitor.instance = new CacheMonitor();
        }
        return CacheMonitor.instance;
    }

    recordHit(cacheType: 'api' | 'user' | 'static'): void {
        this.hitCounts[cacheType]++;
    }

    recordMiss(cacheType: 'api' | 'user' | 'static'): void {
        this.missCounts[cacheType]++;
    }

    getPerformanceReport() {
        const uptime = Date.now() - this.startTime;
        const totalHits = Object.values(this.hitCounts).reduce((a, b) => a + b, 0);
        const totalMisses = Object.values(this.missCounts).reduce((a, b) => a + b, 0);
        const totalRequests = totalHits + totalMisses;
        
        const hitRate = totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) : '0';

        return {
            uptime: Math.floor(uptime / 1000), // seconds
            totalRequests,
            totalHits,
            totalMisses,
            overallHitRate: `${hitRate}%`,
            byCache: {
                api: {
                    hits: this.hitCounts.api,
                    misses: this.missCounts.api,
                    hitRate: this.calculateHitRate('api'),
                    stats: apiCache.getStats()
                },
                user: {
                    hits: this.hitCounts.user,
                    misses: this.missCounts.user,
                    hitRate: this.calculateHitRate('user'),
                    stats: userCache.getStats()
                },
                static: {
                    hits: this.hitCounts.static,
                    misses: this.missCounts.static,
                    hitRate: this.calculateHitRate('static'),
                    stats: staticCache.getStats()
                }
            }
        };
    }

    private calculateHitRate(cacheType: 'api' | 'user' | 'static'): string {
        const hits = this.hitCounts[cacheType];
        const misses = this.missCounts[cacheType];
        const total = hits + misses;
        
        if (total === 0) return '0%';
        return `${(hits / total * 100).toFixed(2)}%`;
    }

    logPerformanceReport(): void {
        const report = this.getPerformanceReport();
        console.group('🚀 Cache Performance Report');
        console.log(`Uptime: ${report.uptime}s`);
        console.log(`Overall Hit Rate: ${report.overallHitRate}`);
        console.log(`Total Requests: ${report.totalRequests} (${report.totalHits} hits, ${report.totalMisses} misses)`);
        
        console.group('📊 By Cache Type:');
        Object.entries(report.byCache).forEach(([type, data]) => {
            console.log(`${type.toUpperCase()}: ${data.hitRate} hit rate, ${data.stats.entries} entries, ${data.stats.sizeMB}MB`);
        });
        console.groupEnd();
        console.groupEnd();
    }

    /**
     * Auto-log performance report every few minutes in development
     */
    startPeriodicReporting(intervalMinutes: number = 5): void {
        if (process.env.NODE_ENV === 'development') {
            setInterval(() => {
                this.logPerformanceReport();
            }, intervalMinutes * 60 * 1000);
        }
    }
}

// Helper functions to integrate with cache operations
export const monitorCacheHit = (cacheType: 'api' | 'user' | 'static') => {
    CacheMonitor.getInstance().recordHit(cacheType);
};

export const monitorCacheMiss = (cacheType: 'api' | 'user' | 'static') => {
    CacheMonitor.getInstance().recordMiss(cacheType);
};

// Expose to window for debugging
if (process.env.NODE_ENV === 'development') {
    (window as any).CacheMonitor = CacheMonitor.getInstance();
}