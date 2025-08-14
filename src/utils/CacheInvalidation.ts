/**
 * Cache Invalidation Strategies
 * Handles intelligent cache invalidation when data changes
 */

import {apiCache, userCache, staticCache, CacheKeys} from './CacheManager';

export class CacheInvalidationManager {
    /**
     * Invalidate user-related caches when user data changes
     */
    static invalidateUserCache(uid: string): void {
        userCache.delete(CacheKeys.user(uid));
        userCache.delete(CacheKeys.groupsOfMembership(uid));
        console.log(`Invalidated cache for user: ${uid}`);
    }

    /**
     * Invalidate offers cache when filters might return different results
     */
    static invalidateOffersCache(reason?: string): void {
        const invalidatedCount = apiCache.invalidatePattern(/^offers:/);
        console.log(`Invalidated ${invalidatedCount} offers cache entries. Reason: ${reason || 'manual'}`);
    }

    /**
     * Invalidate project-specific cache
     */
    static invalidateProjectCache(projectId: string): void {
        apiCache.delete(CacheKeys.project(projectId));
        // Also invalidate offers cache since project changes might affect offer listings
        this.invalidateOffersCache(`project ${projectId} updated`);
        console.log(`Invalidated cache for project: ${projectId}`);
    }

    /**
     * Invalidate group-specific cache
     */
    static invalidateGroupCache(groupId: string): void {
        staticCache.delete(CacheKeys.group(groupId));
        // Invalidate offers that might be filtered by this group
        this.invalidateOffersCache(`group ${groupId} updated`);
        console.log(`Invalidated cache for group: ${groupId}`);
    }

    /**
     * Smart invalidation based on data type and context
     */
    static smartInvalidate(dataType: string, id?: string, context?: any): void {
        switch (dataType) {
            case 'user_profile_updated':
                if (id) this.invalidateUserCache(id);
                break;
            
            case 'project_created':
            case 'project_updated':
                if (id) this.invalidateProjectCache(id);
                break;
            
            case 'user_joined_group':
            case 'user_left_group':
                if (id) {
                    this.invalidateUserCache(id);
                    if (context?.groupId) this.invalidateGroupCache(context.groupId);
                }
                break;
            
            case 'system_attributes_updated':
                staticCache.delete(CacheKeys.systemAttributes());
                break;
            
            case 'bulk_offers_updated':
                this.invalidateOffersCache('bulk update');
                break;
            
            default:
                console.warn(`Unknown data type for cache invalidation: ${dataType}`);
        }
    }

    /**
     * Get cache statistics for debugging
     */
    static getCacheStats() {
        return {
            api: apiCache.getStats(),
            user: userCache.getStats(),
            static: staticCache.getStats()
        };
    }

    /**
     * Clear all caches (emergency function)
     */
    static clearAllCaches(): void {
        apiCache.clear();
        userCache.clear();
        staticCache.clear();
        console.log('All caches cleared');
    }

    /**
     * Preload commonly accessed data
     */
    static async preloadCommonData(): Promise<void> {
        try {
            // This could be called on app startup to preload frequently accessed data
            console.log('Preloading common data...');
            
            // Example: preload system attributes
            // const systemAttributes = await new SystemRepository().getAttributes();
            // staticCache.set(CacheKeys.systemAttributes(), systemAttributes, 60 * 60 * 1000);
            
        } catch (error) {
            console.error('Failed to preload common data:', error);
        }
    }
}

// Cache warming strategies
export class CacheWarmingManager {
    /**
     * Warm cache with user's likely-to-be-accessed data
     */
    static async warmUserCache(uid: string): Promise<void> {
        try {
            // Preload user data and groups if not already cached
            const userCacheKey = CacheKeys.user(uid);
            const groupsCacheKey = CacheKeys.groupsOfMembership(uid);
            
            if (!userCache.has(userCacheKey) || !userCache.has(groupsCacheKey)) {
                console.log(`Warming cache for user: ${uid}`);
                // The actual data fetching would happen in the authentication action
                // This is just a placeholder for the strategy
            }
        } catch (error) {
            console.error('Failed to warm user cache:', error);
        }
    }

    /**
     * Warm cache with popular offers
     */
    static async warmOffersCache(): Promise<void> {
        try {
            // Preload most common offer queries
            const commonFilters = [
                { phase: 'Live', sector: 'all', visibility: 'all' },
                { phase: 'ExpiredPitch', sector: 'all', visibility: 'all' }
            ];

            for (const filters of commonFilters) {
                const cacheKey = CacheKeys.offers(filters);
                if (!apiCache.has(cacheKey)) {
                    console.log('Warming offers cache for filters:', filters);
                    // Would fetch and cache the data
                }
            }
        } catch (error) {
            console.error('Failed to warm offers cache:', error);
        }
    }
}

// Expose global cache management functions
export const CacheManager = {
    invalidate: CacheInvalidationManager.smartInvalidate.bind(CacheInvalidationManager),
    getStats: CacheInvalidationManager.getCacheStats.bind(CacheInvalidationManager),
    clearAll: CacheInvalidationManager.clearAllCaches.bind(CacheInvalidationManager),
    preload: CacheInvalidationManager.preloadCommonData.bind(CacheInvalidationManager),
    warmUser: CacheWarmingManager.warmUserCache.bind(CacheWarmingManager),
    warmOffers: CacheWarmingManager.warmOffersCache.bind(CacheWarmingManager)
};

// Add to window for debugging in development
if (process.env.NODE_ENV === 'development') {
    (window as any).CacheManager = CacheManager;
}