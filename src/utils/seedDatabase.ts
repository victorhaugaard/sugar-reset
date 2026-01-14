/**
 * Database Seed Script
 * 
 * Creates sample data for testing the Social features.
 * Run this from a component or console to populate the database.
 * 
 * Usage:
 * 1. Import this in your app temporarily
 * 2. Call seedDatabase(currentUserId)
 * 3. Remove after seeding
 */

import {
    collection,
    doc,
    setDoc,
    addDoc,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

export async function seedDatabase(currentUserId: string) {
    console.log('🌱 Starting database seed...');

    try {
        const batch = writeBatch(db);

        // Sample usernames and names
        const sampleUsers = [
            { id: 'sample_user_1', name: 'Emma Rose', username: 'emma_sf', email: 'emma@example.com' },
            { id: 'sample_user_2', name: 'Sarah Miller', username: 'sarah_wellness', email: 'sarah@example.com' },
            { id: 'sample_user_3', name: 'Jessica Taylor', username: 'jess_t', email: 'jess@example.com' },
            { id: 'sample_user_4', name: 'Rachel Wright', username: 'rachel_w', email: 'rachel@example.com' },
            { id: 'sample_user_5', name: 'Maria Kim', username: 'maria_k', email: 'maria@example.com' },
        ];

        // Create sample users
        for (const user of sampleUsers) {
            const userRef = doc(db, 'users', user.id);
            batch.set(userRef, {
                id: user.id,
                email: user.email,
                displayName: user.name,
                username: user.username,
                createdAt: serverTimestamp(),
            });

            // Create user stats for leaderboard
            const statsRef = doc(db, 'userStats', user.id);
            batch.set(statsRef, {
                userId: user.id,
                healthScore: Math.floor(Math.random() * 30) + 70, // 70-100
                currentStreak: Math.floor(Math.random() * 30) + 5, // 5-35
                goalAchieved: Math.random() > 0.5,
                updatedAt: serverTimestamp(),
            });
        }

        await batch.commit();
        console.log('✅ Created sample users and stats');

        // Create sample posts
        const samplePosts = [
            {
                authorId: 'sample_user_1',
                authorName: 'Emma Rose',
                authorUsername: 'emma_sf',
                title: 'One Week Sugar-Free! 🎉',
                content: 'Finally hit my first week milestone! The cravings are getting easier. For anyone struggling, drinking herbal tea really helps when I want something sweet. Keep pushing!',
                tags: ['milestone', 'tips'],
                upvotes: 24,
                commentCount: 8,
            },
            {
                authorId: 'sample_user_2',
                authorName: 'Sarah Miller',
                authorUsername: 'sarah_wellness',
                title: 'Struggling with hormone-related cravings',
                content: 'Anyone else notice intense sugar cravings during certain times of the month? I\'m doing great most of the time but PMS hits differently. Looking for advice from others who\'ve dealt with this.',
                tags: ['question', 'support'],
                upvotes: 18,
                commentCount: 12,
            },
            {
                authorId: 'sample_user_3',
                authorName: 'Jessica Taylor',
                authorUsername: 'jess_t',
                title: 'Day 21 and feeling amazing!',
                content: 'Three weeks in and I can\'t believe the difference. More energy, better sleep, clearer skin. If you\'re on the fence about starting, just do it! 💪',
                tags: ['victory', 'motivation'],
                upvotes: 42,
                commentCount: 5,
            },
            {
                authorId: 'sample_user_4',
                authorName: 'Rachel Wright',
                authorUsername: 'rachel_w',
                title: 'Best sugar-free snacks?',
                content: 'Looking for recommendations! I need some go-to snacks for when cravings hit. What are your favorites that actually taste good?',
                tags: ['question', 'tips'],
                upvotes: 31,
                commentCount: 22,
            },
        ];

        const postsRef = collection(db, 'posts');
        for (const post of samplePosts) {
            await addDoc(postsRef, {
                ...post,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
        console.log('✅ Created sample posts');

        // Create community stats
        const communityStatsRef = doc(db, 'communityStats', 'latest');
        await setDoc(communityStatsRef, {
            totalUsers: sampleUsers.length + 1, // +1 for current user
            activeUsers: sampleUsers.length,
            averageStreak: 14.5,
            averageHealthScore: 82,
            totalDaysSugarFree: 157,
            topStreak: 45,
            topHealthScore: 98,
            updatedAt: serverTimestamp(),
        });
        console.log('✅ Created community stats');

        console.log('🎉 Database seeding complete!');
        return { success: true, message: 'Database seeded successfully!' };

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        return { success: false, error };
    }
}

/**
 * Quick test to check Firestore connection
 */
export async function testFirestoreConnection(): Promise<boolean> {
    try {
        const testRef = doc(db, '_connection_test', 'test');
        await setDoc(testRef, {
            timestamp: serverTimestamp(),
            message: 'Connection test successful'
        });
        console.log('✅ Firestore connection successful');
        return true;
    } catch (error) {
        console.error('❌ Firestore connection failed:', error);
        return false;
    }
}
