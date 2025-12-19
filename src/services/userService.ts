/**
 * User Service
 * 
 * Firestore operations for user profiles and data.
 */

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    addDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, UserPreferences, StreakData, DailyCheckIn } from '../types';

/**
 * Convert Firestore timestamp to Date
 */
const toDate = (timestamp: Timestamp | null): Date | null => {
    return timestamp ? timestamp.toDate() : null;
};

/**
 * User profile operations
 */
export const userService = {
    /**
     * Get user profile by ID
     */
    async getUserProfile(userId: string): Promise<User | null> {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            createdAt: toDate(data.createdAt) as Date,
            updatedAt: toDate(data.updatedAt) as Date,
            preferences: data.preferences,
            streak: {
                ...data.streak,
                lastCheckIn: toDate(data.streak?.lastCheckIn),
                startDate: toDate(data.streak?.startDate) as Date,
            },
        };
    },

    /**
     * Create new user profile on sign up
     */
    async createUserProfile(
        userId: string,
        email: string,
        displayName?: string
    ): Promise<User> {
        const now = new Date();
        const defaultPreferences: UserPreferences = {
            notifications: true,
            dailyReminderTime: '09:00',
            weeklyReportDay: 0,
            theme: 'dark',
        };

        const defaultStreak: StreakData = {
            currentStreak: 0,
            longestStreak: 0,
            lastCheckIn: null,
            startDate: now,
            totalDaysSugarFree: 0,
        };

        const newUser: Omit<User, 'id'> = {
            email,
            displayName,
            createdAt: now,
            updatedAt: now,
            preferences: defaultPreferences,
            streak: defaultStreak,
        };

        await setDoc(doc(db, 'users', userId), {
            ...newUser,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            streak: {
                ...defaultStreak,
                startDate: serverTimestamp(),
            },
        });

        return { id: userId, ...newUser };
    },

    /**
     * Update user preferences
     */
    async updatePreferences(
        userId: string,
        preferences: Partial<UserPreferences>
    ): Promise<void> {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, {
            preferences,
            updatedAt: serverTimestamp(),
        });
    },

    /**
     * Update streak data
     */
    async updateStreak(userId: string, streak: Partial<StreakData>): Promise<void> {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, {
            streak,
            updatedAt: serverTimestamp(),
        });
    },

    /**
     * Record a daily check-in
     */
    async recordCheckIn(
        userId: string,
        checkIn: Omit<DailyCheckIn, 'id' | 'userId' | 'createdAt'>
    ): Promise<string> {
        const checkInsRef = collection(db, 'users', userId, 'checkIns');

        // Check if already checked in today
        const todayQuery = query(
            checkInsRef,
            where('date', '==', checkIn.date),
            limit(1)
        );
        const existing = await getDocs(todayQuery);

        if (!existing.empty) {
            // Update existing check-in
            const existingDoc = existing.docs[0];
            await updateDoc(existingDoc.ref, {
                ...checkIn,
                updatedAt: serverTimestamp(),
            });
            return existingDoc.id;
        }

        // Create new check-in
        const docRef = await addDoc(checkInsRef, {
            ...checkIn,
            userId,
            createdAt: serverTimestamp(),
        });

        return docRef.id;
    },

    /**
     * Get check-ins for a date range
     */
    async getCheckIns(
        userId: string,
        startDate: string,
        endDate: string
    ): Promise<DailyCheckIn[]> {
        const checkInsRef = collection(db, 'users', userId, 'checkIns');
        const q = query(
            checkInsRef,
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                date: data.date,
                sugarFree: data.sugarFree,
                notes: data.notes,
                cravingLevel: data.cravingLevel,
                mood: data.mood,
                energyLevel: data.energyLevel,
                sleepQuality: data.sleepQuality,
                createdAt: toDate(data.createdAt) as Date,
            };
        });
    },

    /**
     * Get today's check-in if exists
     */
    async getTodayCheckIn(userId: string): Promise<DailyCheckIn | null> {
        const today = new Date().toISOString().split('T')[0];
        const checkInsRef = collection(db, 'users', userId, 'checkIns');
        const q = query(checkInsRef, where('date', '==', today), limit(1));

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            date: data.date,
            sugarFree: data.sugarFree,
            notes: data.notes,
            cravingLevel: data.cravingLevel,
            mood: data.mood,
            energyLevel: data.energyLevel,
            sleepQuality: data.sleepQuality,
            createdAt: toDate(data.createdAt) as Date,
        };
    },
};

export default userService;
