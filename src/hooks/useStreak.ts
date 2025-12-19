/**
 * useStreak Hook
 * 
 * Manages streak data and daily check-ins.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { userService } from '../services/userService';
import { StreakData, DailyCheckIn } from '../types';

interface UseStreakReturn {
    streak: StreakData | null;
    todayCheckIn: DailyCheckIn | null;
    isLoading: boolean;
    error: string | null;
    checkIn: (sugarFree: boolean, extras?: CheckInExtras) => Promise<boolean>;
    refreshStreak: () => Promise<void>;
    hasCheckedInToday: boolean;
}

interface CheckInExtras {
    notes?: string;
    cravingLevel?: 1 | 2 | 3 | 4 | 5;
    mood?: 1 | 2 | 3 | 4 | 5;
    energyLevel?: 1 | 2 | 3 | 4 | 5;
    sleepQuality?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Check if a date is yesterday
 */
const isYesterday = (date: Date | null): boolean => {
    if (!date) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        date.getFullYear() === yesterday.getFullYear() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getDate() === yesterday.getDate()
    );
};

/**
 * Check if a date is today
 */
const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
};

export function useStreak(): UseStreakReturn {
    const { user, firebaseUser } = useAuthContext();
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load streak data from user profile
    useEffect(() => {
        if (user?.streak) {
            setStreak(user.streak);
        }
        setIsLoading(false);
    }, [user]);

    // Check for today's check-in
    useEffect(() => {
        const loadTodayCheckIn = async () => {
            if (!firebaseUser) return;

            try {
                const checkIn = await userService.getTodayCheckIn(firebaseUser.uid);
                setTodayCheckIn(checkIn);
            } catch (err) {
                console.error('Error loading today check-in:', err);
            }
        };

        loadTodayCheckIn();
    }, [firebaseUser]);

    /**
     * Refresh streak data from server
     */
    const refreshStreak = useCallback(async () => {
        if (!firebaseUser) return;

        setIsLoading(true);
        try {
            const profile = await userService.getUserProfile(firebaseUser.uid);
            if (profile?.streak) {
                setStreak(profile.streak);
            }

            const checkIn = await userService.getTodayCheckIn(firebaseUser.uid);
            setTodayCheckIn(checkIn);
        } catch (err) {
            console.error('Error refreshing streak:', err);
            setError('Failed to refresh streak data');
        } finally {
            setIsLoading(false);
        }
    }, [firebaseUser]);

    /**
     * Record a daily check-in
     */
    const checkIn = useCallback(async (
        sugarFree: boolean,
        extras?: CheckInExtras
    ): Promise<boolean> => {
        if (!firebaseUser || !streak) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const today = getTodayDate();

            // Record the check-in
            await userService.recordCheckIn(firebaseUser.uid, {
                date: today,
                sugarFree,
                ...extras,
            });

            // Calculate new streak values
            let newCurrentStreak = streak.currentStreak;
            let newLongestStreak = streak.longestStreak;
            let newTotalDays = streak.totalDaysSugarFree;

            if (sugarFree) {
                // If sugar-free, continue or start streak
                const lastCheckIn = streak.lastCheckIn;

                if (isToday(lastCheckIn)) {
                    // Already checked in today, no change
                } else if (isYesterday(lastCheckIn) || streak.currentStreak === 0) {
                    // Continue streak or start new one
                    newCurrentStreak = streak.currentStreak + 1;
                    newTotalDays = streak.totalDaysSugarFree + 1;
                } else {
                    // Streak broken, start new one
                    newCurrentStreak = 1;
                    newTotalDays = streak.totalDaysSugarFree + 1;
                }

                // Update longest streak if needed
                if (newCurrentStreak > newLongestStreak) {
                    newLongestStreak = newCurrentStreak;
                }
            } else {
                // Had sugar, reset streak
                newCurrentStreak = 0;
            }

            // Update streak in Firestore
            const newStreak: StreakData = {
                currentStreak: newCurrentStreak,
                longestStreak: newLongestStreak,
                lastCheckIn: new Date(),
                startDate: streak.startDate,
                totalDaysSugarFree: newTotalDays,
            };

            await userService.updateStreak(firebaseUser.uid, newStreak);
            setStreak(newStreak);

            // Update today's check-in state
            const newCheckIn = await userService.getTodayCheckIn(firebaseUser.uid);
            setTodayCheckIn(newCheckIn);

            return true;
        } catch (err) {
            console.error('Error recording check-in:', err);
            setError('Failed to record check-in');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [firebaseUser, streak]);

    return {
        streak,
        todayCheckIn,
        isLoading,
        error,
        checkIn,
        refreshStreak,
        hasCheckedInToday: !!todayCheckIn,
    };
}

export default useStreak;
