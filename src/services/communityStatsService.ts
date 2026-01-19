/**
 * Community Stats Service
 * 
 * Handles fetching and displaying community-wide statistics.
 * Stats can be aggregated by a Cloud Function or calculated client-side for smaller communities.
 */

import {
    doc,
    getDoc,
    getDocFromServer,
    getDocFromCache,
    setDoc,
    collection,
    getDocs,
    query,
    limit,
    serverTimestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, isFirebaseReady, app } from '../config/firebase';

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

            // Try to get from server first (bypasses flaky offline detection)
            let statsSnap;
            try {
                console.log('📊 Trying server fetch...');
                statsSnap = await getDocFromServer(statsRef);
                console.log('✅ Got community stats from server');
            } catch (serverError: any) {
                // If server fails, try cache
                console.log('⚠️ Server fetch failed, trying cache...', serverError?.code);
                try {
                    statsSnap = await getDocFromCache(statsRef);
                    console.log('✅ Got community stats from cache');
                } catch (cacheError: any) {
                    // Neither server nor cache worked, throw the original server error
                    console.log('❌ Cache also failed:', cacheError?.code);
                    throw serverError;
                }
            }

            if (!statsSnap.exists()) {
                console.log('📊 No community stats document found, creating initial stats...');
                // Create initial stats document
                const initialStats = this.getDefaultStats();
                // Try to save, but don't fail if it doesn't work
                try {
                    await this.saveCommunityStats(initialStats);
                    console.log('✅ Created initial community stats document');
                } catch (writeError: any) {
                    console.warn('⚠️ Could not create community stats document:', writeError?.code || writeError?.message);
                    console.log('📊 Returning default stats (document will be created on next successful write)');
                }
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
            // Enhanced error logging for debugging
            console.error('❌ Community stats error details:', {
                code: error?.code,
                message: error?.message,
                name: error?.name,
            });

            // Retry once on network errors
            if (retryCount < 1 && (error?.code === 'unavailable' || error?.message?.includes('offline'))) {
                console.log('🔄 Retrying community stats after network error (attempt 2)...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.getCommunityStats(retryCount + 1);
            }

            // Try Cloud Function as first fallback (most reliable)
            if (error?.code === 'unavailable') {
                console.log('📊 SDK unavailable, trying Cloud Function fallback...');
                try {
                    const cfStats = await this.fetchViaCloudFunction();
                    if (cfStats) {
                        console.log('✅ Got community stats via Cloud Function!');
                        return cfStats;
                    }
                } catch (cfError) {
                    console.log('⚠️ Cloud Function failed:', cfError);
                }

                // Try REST API as second fallback
                console.log('📊 Trying REST API fallback...');
                try {
                    const restStats = await this.fetchViaRestApi();
                    if (restStats) {
                        console.log('✅ Got community stats via REST API!');
                        return restStats;
                    }
                } catch (restError) {
                    console.log('❌ REST API also failed:', restError);
                }

                console.log('📊 All fallbacks failed - using defaults');
            } else if (error?.code === 'permission-denied') {
                console.log('🔒 Permission denied - check Firestore rules are deployed');
            } else if (error?.message?.includes('offline')) {
                console.log('📊 Device appears to be offline');
            } else {
                console.warn('⚠️ Community stats fetch failed:', error?.code, '-', error?.message);
            }
            // Return defaults instead of null to prevent UI errors
            return this.getDefaultStats();
        }
    },

    /**
     * Fetch community stats via Cloud Function (most reliable fallback)
     */
    async fetchViaCloudFunction(): Promise<CommunityStats | null> {
        if (!isFirebaseReady()) {
            return null;
        }

        const functions = getFunctions(app, 'us-central1');
        const getCommunityStatsFunc = httpsCallable(functions, 'getCommunityStats');

        const result = await getCommunityStatsFunc();
        const data = result.data as any;

        if (!data) {
            return null;
        }

        return {
            totalUsers: data.totalUsers || 0,
            activeUsers: data.activeUsers || 0,
            averageStreak: data.averageStreak || 0,
            averageHealthScore: data.averageHealthScore || 0,
            totalDaysSugarFree: data.totalDaysSugarFree || 0,
            topStreak: data.topStreak || 0,
            topHealthScore: data.topHealthScore || 0,
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        };
    },

    /**
     * Fetch community stats via Firestore REST API (bypasses SDK network issues)
     */
    async fetchViaRestApi(): Promise<CommunityStats | null> {
        const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId || projectId === 'YOUR_PROJECT_ID') {
            return null;
        }

        // Get auth token from current user
        const { auth } = await import('../config/firebase');
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('❌ No authenticated user for REST API');
            return null;
        }

        let idToken: string;
        try {
            idToken = await currentUser.getIdToken();
        } catch (tokenError) {
            console.log('❌ Failed to get ID token:', tokenError);
            return null;
        }

        // Use 'default' (literal) database ID, matching the project configuration
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/default/documents/communityStats/latest`;

        console.log('🌐 Fetching via REST API with auth token (db: default)...');

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ REST API error response:', errorText.slice(0, 200));
            throw new Error(`REST API failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 REST API response:', JSON.stringify(data).slice(0, 200));

        if (!data.fields) {
            return null;
        }

        // Parse Firestore REST API format
        const fields = data.fields;
        return {
            totalUsers: parseInt(fields.totalUsers?.integerValue || '0', 10),
            activeUsers: parseInt(fields.activeUsers?.integerValue || '0', 10),
            averageStreak: parseFloat(fields.averageStreak?.doubleValue || fields.averageStreak?.integerValue || '0'),
            averageHealthScore: parseFloat(fields.averageHealthScore?.doubleValue || fields.averageHealthScore?.integerValue || '0'),
            totalDaysSugarFree: parseInt(fields.totalDaysSugarFree?.integerValue || '0', 10),
            topStreak: parseInt(fields.topStreak?.integerValue || '0', 10),
            topHealthScore: parseInt(fields.topHealthScore?.integerValue || '0', 10),
            updatedAt: fields.updatedAt?.timestampValue ? new Date(fields.updatedAt.timestampValue) : new Date(),
        };
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
