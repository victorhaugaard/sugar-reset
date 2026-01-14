/**
 * Community Stats Service
 * 
 * Handles fetching and displaying community-wide statistics.
 * Stats can be aggregated by a Cloud Function or calculated client-side for smaller communities.
 */

import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    query,
    limit,
    serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseReady } from '../config/firebase';

export interface CommunityStats {
    totalUsers: number;
    activeUsers: number; // Users with activity in last 7 days
    averageStreak: number;
    averageHealthScore: number;
    totalDaysSugarFree: number; // Sum of all user streaks
    topStreak: number;
    topHealthScore: number;
    updatedAt: Date;
}

export const communityStatsService = {
    /**
     * Get cached community stats from Firestore with retry logic
     * This is the preferred method - stats are pre-calculated
     */
    async getCommunityStats(retryCount = 0): Promise<CommunityStats> {
        // If Firebase isn't configured, return defaults silently
        if (!isFirebaseReady()) {
            return this.getDefaultStats();
        }

        try {
            console.log(`📊 Fetching community stats (attempt ${retryCount + 1})`);
            const statsRef = doc(db, 'communityStats', 'latest');
            const statsSnap = await getDoc(statsRef);

            if (!statsSnap.exists()) {
                console.log('📊 No community stats document found, creating initial stats...');
                // Create initial stats document
                const initialStats = this.getDefaultStats();
                await this.saveCommunityStats(initialStats);
                return initialStats;
            }

            const data = statsSnap.data();
            console.log('✅ Community stats loaded successfully');
            return {
                totalUsers: data.totalUsers || 0,
                activeUsers: data.activeUsers || 0,
                averageStreak: data.averageStreak || 0,
                averageHealthScore: data.averageHealthScore || 0,
                totalDaysSugarFree: data.totalDaysSugarFree || 0,
                topStreak: data.topStreak || 0,
                topHealthScore: data.topHealthScore || 0,
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        } catch (error: any) {
            // Retry once on network errors
            if (retryCount < 1 && (error?.code === 'unavailable' || error?.message?.includes('offline'))) {
                console.log('🔄 Retrying community stats after network error...');
                await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5 seconds
                return this.getCommunityStats(retryCount + 1);
            }
            
            // Log the actual error for debugging
            if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
                console.log('📊 Firestore temporarily unavailable for community stats, using defaults');
            } else {
                console.warn('⚠️ Community stats fetch failed:', error?.code || error?.message);
            }
            // Return defaults instead of null to prevent UI errors
            return this.getDefaultStats();
        }
    },

    /**
     * Get default stats for when Firestore is unavailable
     */
    getDefaultStats(): CommunityStats {
        return {
            totalUsers: 0,
            activeUsers: 0,
            averageStreak: 0,
            averageHealthScore: 0,
            totalDaysSugarFree: 0,
            topStreak: 0,
            topHealthScore: 0,
            updatedAt: new Date(),
        };
    },

    /**
     * Calculate community stats on-the-fly
     * This is used as a fallback when no cached stats exist
     * For larger communities, this should be done by a Cloud Function
     */
    async calculateCommunityStats(): Promise<CommunityStats | null> {
        try {
            const statsRef = collection(db, 'userStats');
            // Limit to prevent excessive reads - for larger communities use Cloud Functions
            const q = query(statsRef, limit(500));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return {
                    totalUsers: 0,
                    activeUsers: 0,
                    averageStreak: 0,
                    averageHealthScore: 0,
                    totalDaysSugarFree: 0,
                    topStreak: 0,
                    topHealthScore: 0,
                    updatedAt: new Date(),
                };
            }

            let totalStreak = 0;
            let totalHealthScore = 0;
            let topStreak = 0;
            let topHealthScore = 0;
            let activeCount = 0;

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const streak = data.currentStreak || 0;
                const healthScore = data.healthScore || 0;
                const updatedAt = data.updatedAt?.toDate();

                totalStreak += streak;
                totalHealthScore += healthScore;

                if (streak > topStreak) topStreak = streak;
                if (healthScore > topHealthScore) topHealthScore = healthScore;

                // Count as active if updated in last 7 days
                if (updatedAt && updatedAt > sevenDaysAgo) {
                    activeCount++;
                }
            });

            const totalUsers = snapshot.size;
            const stats: CommunityStats = {
                totalUsers,
                activeUsers: activeCount,
                averageStreak: totalUsers > 0 ? Math.round(totalStreak / totalUsers * 10) / 10 : 0,
                averageHealthScore: totalUsers > 0 ? Math.round(totalHealthScore / totalUsers) : 0,
                totalDaysSugarFree: totalStreak,
                topStreak,
                topHealthScore,
                updatedAt: new Date(),
            };

            // Cache the calculated stats
            await this.saveCommunityStats(stats);

            return stats;
        } catch (error) {
            console.error('Error calculating community stats:', error);
            return null;
        }
    },

    /**
     * Save community stats to Firestore cache
     */
    async saveCommunityStats(stats: CommunityStats): Promise<void> {
        try {
            const statsRef = doc(db, 'communityStats', 'latest');
            await setDoc(statsRef, {
                ...stats,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error saving community stats:', error);
        }
    },

    /**
     * Format large numbers for display
     */
    formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },
};

export default communityStatsService;
