/**
 * Firebase Cloud Functions for SugarReset
 * 
 * These functions provide a reliable way to fetch data from Firestore
 * when the client SDK has connection issues.
 */

const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin
initializeApp();
// Use 'default' database ID explicitly (this project uses 'default' not '(default)')
const db = getFirestore('default');

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

/**
 * Get community stats
 * This function fetches community stats from Firestore and returns them.
 * Use this as a fallback when the client SDK can't connect.
 */
exports.getCommunityStats = onCall(async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const statsDoc = await db.collection('communityStats').doc('latest').get();

        if (!statsDoc.exists) {
            // Return default stats if document doesn't exist
            return {
                totalUsers: 0,
                activeUsers: 0,
                averageStreak: 0,
                averageHealthScore: 0,
                totalDaysSugarFree: 0,
                topStreak: 0,
                topHealthScore: 0,
                updatedAt: new Date().toISOString(),
            };
        }

        const data = statsDoc.data();
        return {
            totalUsers: data.totalUsers || 0,
            activeUsers: data.activeUsers || 0,
            averageStreak: data.averageStreak || 0,
            averageHealthScore: data.averageHealthScore || 0,
            totalDaysSugarFree: data.totalDaysSugarFree || 0,
            topStreak: data.topStreak || 0,
            topHealthScore: data.topHealthScore || 0,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error fetching community stats:', error);
        throw new HttpsError('internal', 'Failed to fetch community stats');
    }
});

/**
 * Get posts for the community feed
 */
exports.getPosts = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const sortBy = request.data?.sortBy || 'hot';
    const limitCount = request.data?.limit || 20;

    try {
        let query = db.collection('posts');

        if (sortBy === 'new') {
            query = query.orderBy('createdAt', 'desc');
        } else if (sortBy === 'top') {
            query = query.orderBy('upvotes', 'desc');
        } else {
            // Hot - order by recent
            query = query.orderBy('createdAt', 'desc');
        }

        query = query.limit(limitCount);
        const snapshot = await query.get();

        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                authorId: data.authorId,
                authorName: data.authorName,
                authorUsername: data.authorUsername,
                title: data.title,
                content: data.content,
                tags: data.tags || [],
                upvotes: data.upvotes || 0,
                commentCount: data.commentCount || 0,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            };
        });

        return { posts };
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw new HttpsError('internal', 'Failed to fetch posts');
    }
});

/**
 * Get leaderboard data
 */
exports.getLeaderboard = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const limitCount = request.data?.limit || 10;

    try {
        const snapshot = await db.collection('userStats')
            .orderBy('healthScore', 'desc')
            .limit(limitCount)
            .get();

        const entries = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                userId: doc.id,
                healthScore: data.healthScore || 0,
                currentStreak: data.currentStreak || 0,
                rank: index + 1,
            };
        });

        return { entries };
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw new HttpsError('internal', 'Failed to fetch leaderboard');
    }
});
