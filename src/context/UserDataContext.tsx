/**
 * User Data Context
 * 
 * Provides global access to user data throughout the app.
 * Combines: onboarding data, streak data, and check-ins.
 * Works offline-first with local storage, syncs to Firebase when authenticated.
 */


import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onboardingService, OnboardingData } from '../services/onboardingService';
import { useAuthContext } from './AuthContext';
import { userService } from '../services/userService';
import { StreakData, DailyCheckIn } from '../types';

export interface JournalEntry {
    id: string;
    date: string; // YYYY-MM-DD
    mood?: 'great' | 'good' | 'okay' | 'struggling' | 'difficult';
    notes: string;
    whatTriggered?: string;
    createdAt: number;
}

interface UserDataContextType {
    // Onboarding data
    onboardingData: OnboardingData;
    hasCompletedOnboarding: boolean;

    // Streak data
    streakData: StreakData | null;

    // Today's check-in
    todayCheckIn: DailyCheckIn | null;

    // Check-in history (for calendar)
    // Key: 'YYYY-MM-DD', Value: { status, grams? }
    checkInHistory: Record<string, { status: 'sugar_free' | 'had_sugar'; grams?: number }>;

    // Achievements
    achievements: string[]; // Array of unlocked achievement IDs

    // Journal entries
    journalEntries: JournalEntry[];

    // Social & Stats (Phase 1)
    latestHealthScore: number;
    updateHealthScore: (score: number) => void;

    // Loading states
    isLoading: boolean;

    // Methods
    updateOnboardingData: (data: Partial<OnboardingData>) => Promise<void>;
    completeOnboarding: () => Promise<void>;
    refreshData: () => Promise<void>;
    recordCheckIn: (sugarFree: boolean, notes?: string) => Promise<void>;
    recordCheckInForDate: (date: Date, sugarFree: boolean, grams?: number) => Promise<void>;
    resetStreak: () => Promise<void>;
    unlockAchievements: (achievementIds: string[]) => Promise<void>;

    // Journal methods
    addJournalEntry: (date: Date, entry: Omit<JournalEntry, 'id' | 'date' | 'createdAt'>) => Promise<void>;
    updateJournalEntry: (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) => Promise<void>;
    deleteJournalEntry: (id: string) => Promise<void>;
    getLatestJournalEntry: () => JournalEntry | null;
    getJournalEntries: (limit?: number) => JournalEntry[];
}

const defaultStreakData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckIn: null,
    startDate: new Date(),
    totalDaysSugarFree: 0,
};

const UserDataContext = createContext<UserDataContextType | null>(null);

export function useUserData(): UserDataContextType {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error('useUserData must be used within UserDataProvider');
    }
    return context;
}

interface UserDataProviderProps {
    children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
    const { user, isAuthenticated } = useAuthContext();
    const userId = user?.id; // Extract stable value

    const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
    const [checkInHistory, setCheckInHistory] = useState<Record<string, { status: 'sugar_free' | 'had_sugar'; grams?: number }>>({});
    const [achievements, setAchievements] = useState<string[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [latestHealthScore, setLatestHealthScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    // Load initial data
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Load onboarding data from local storage
            const localOnboarding = await onboardingService.getOnboardingData();
            setOnboardingData(localOnboarding);

            const completed = await onboardingService.hasCompletedOnboarding();
            setHasCompletedOnboarding(completed);

            // If authenticated, also load from Firebase
            if (isAuthenticated && userId) {
                const profile = await userService.getUserProfile(userId);
                if (profile) {
                    setStreakData(profile.streak);
                }

                const checkIn = await userService.getTodayCheckIn(userId);
                setTodayCheckIn(checkIn);
            } else {
                // Use local streak data from onboarding
                if (localOnboarding.startDate) {
                    const startDate = new Date(localOnboarding.startDate);
                    const now = new Date();
                    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                    setStreakData({
                        currentStreak: daysDiff,
                        longestStreak: daysDiff,
                        lastCheckIn: null,
                        startDate,
                        totalDaysSugarFree: daysDiff,
                    });
                } else {
                    setStreakData(defaultStreakData);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, userId]);

    // Load data once on mount and when auth changes
    useEffect(() => {
        if (!hasLoadedOnce) {
            loadData();
            setHasLoadedOnce(true);
        }
    }, [loadData, hasLoadedOnce]);

    // Update onboarding data
    const updateOnboardingData = useCallback(async (data: Partial<OnboardingData>) => {
        await onboardingService.saveOnboardingData(data);
        setOnboardingData(prev => ({ ...prev, ...data }));
    }, []);

    // Complete onboarding
    const completeOnboarding = useCallback(async () => {
        await onboardingService.completeOnboarding();
        setHasCompletedOnboarding(true);

        // Update streak data with start date
        const updated = await onboardingService.getOnboardingData();
        setOnboardingData(updated);

        if (updated.startDate) {
            setStreakData({
                ...defaultStreakData,
                startDate: new Date(updated.startDate),
            });
        }
    }, []);

    // Refresh all data
    const refreshData = useCallback(async () => {
        setHasLoadedOnce(false); // Allow reload
    }, []);

    // Record a check-in
    const recordCheckIn = useCallback(async (sugarFree: boolean, notes?: string) => {
        const today = new Date().toISOString().split('T')[0];

        // Allow updating today's check-in if it already exists (user can change their mind)
        // We'll just overwrite it
        const wasAlreadyCheckedIn = !!checkInHistory[today];

        if (wasAlreadyCheckedIn) {
            console.log('Updating today\'s check-in');
        }

        // Update check-in history (will overwrite if exists)
        setCheckInHistory(prev => ({
            ...prev,
            [today]: { status: sugarFree ? 'sugar_free' : 'had_sugar' },
        }));

        if (isAuthenticated && userId) {
            // Save to Firebase
            await userService.recordCheckIn(userId, {
                date: today,
                sugarFree,
                notes,
            });

            // Refresh data
            setHasLoadedOnce(false);
        } else {
            // Update local streak
            if (streakData) {
                if (sugarFree) {
                    // Only increment if this is a new check-in, not an update
                    const streakIncrement = wasAlreadyCheckedIn && checkInHistory[today]?.status === 'sugar_free' ? 0 : 1;
                    setStreakData({
                        ...streakData,
                        currentStreak: streakData.currentStreak + streakIncrement,
                        longestStreak: Math.max(streakData.longestStreak, streakData.currentStreak + streakIncrement),
                        lastCheckIn: new Date(),
                        totalDaysSugarFree: streakData.totalDaysSugarFree + streakIncrement,
                    });
                } else {
                    // Reset streak when had sugar
                    setStreakData({
                        ...streakData,
                        currentStreak: 0,
                        lastCheckIn: new Date(),
                    });
                }
            }
        }
    }, [isAuthenticated, userId, streakData, checkInHistory]);

    // Reset streak (after breaking it)
    const resetStreak = useCallback(async () => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        // Allow updating today's check-in (user can change their answer)
        const wasAlreadyCheckedIn = !!checkInHistory[today];
        if (wasAlreadyCheckedIn) {
            console.log('Updating today\'s check-in to had_sugar');
        }

        // Update check-in history (will overwrite if exists)
        setCheckInHistory(prev => ({
            ...prev,
            [today]: { status: 'had_sugar' },
        }));

        if (isAuthenticated && userId) {
            await userService.updateStreak(userId, {
                currentStreak: 0,
                startDate: now,
                lastCheckIn: now,
            });
            setHasLoadedOnce(false);
        } else {
            // Update locally - reset currentStreak to 0
            await onboardingService.saveOnboardingData({
                startDate: now.toISOString(),
            });
            setStreakData({
                ...defaultStreakData,
                currentStreak: 0,
                startDate: now,
                lastCheckIn: now,
            });
        }
    }, [isAuthenticated, userId, checkInHistory]);

    // Record check-in for a specific date (retroactive)
    const recordCheckInForDate = useCallback(async (date: Date, sugarFree: boolean, grams?: number) => {
        // Use local date components to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        const status = sugarFree ? 'sugar_free' : 'had_sugar';

        // Update local state immediately
        setCheckInHistory(prev => ({ ...prev, [dateKey]: { status, grams } }));

        // If it's today, also update todayCheckIn
        const now = new Date();
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (dateKey === todayKey) {
            // Update local todayCheckIn state
            setTodayCheckIn({
                id: `local-${dateKey}`,
                userId: userId || 'local',
                date: dateKey,
                sugarFree,
                grams,
                createdAt: now,
            });

            if (isAuthenticated && userId) {
                await userService.recordCheckIn(userId, {
                    date: dateKey,
                    sugarFree,
                    grams,
                });
            }
        }

        // Recalculate streak based on history
        // For now, we'll handle this locally
    }, [isAuthenticated, userId]);

    // Unlock achievements
    const unlockAchievements = useCallback(async (achievementIds: string[]) => {
        setAchievements(prev => {
            const newAchievements = [...new Set([...prev, ...achievementIds])];
            return newAchievements;
        });
        // TODO: Persist to AsyncStorage and sync to Firebase
    }, []);

    // Journal methods
    const addJournalEntry = useCallback(async (date: Date, entry: Omit<JournalEntry, 'id' | 'date' | 'createdAt'>) => {
        const newEntry: JournalEntry = {
            id: `journal_${Date.now()}_${Math.random()}`,
            date: date.toISOString().split('T')[0],
            ...entry,
            createdAt: Date.now(),
        };

        setJournalEntries(prev => [newEntry, ...prev].sort((a, b) => b.createdAt - a.createdAt));

        // TODO: Persist to AsyncStorage and sync to Firebase
    }, []);

    const getLatestJournalEntry = useCallback(() => {
        if (journalEntries.length === 0) return null;
        return journalEntries[0];
    }, [journalEntries]);

    const getJournalEntries = useCallback((limit?: number) => {
        if (!limit) return journalEntries;
        return journalEntries.slice(0, limit);
    }, [journalEntries]);

    const updateJournalEntry = useCallback(async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) => {
        setJournalEntries(prev => prev.map(entry =>
            entry.id === id ? { ...entry, ...updates } : entry
        ));
        // TODO: Persist to AsyncStorage and sync to Firebase
    }, []);

    const deleteJournalEntry = useCallback(async (id: string) => {
        setJournalEntries(prev => prev.filter(entry => entry.id !== id));
        // TODO: Persist to AsyncStorage and sync to Firebase
    }, []);

    const value: UserDataContextType = {
        onboardingData,
        hasCompletedOnboarding,
        streakData,
        todayCheckIn,
        checkInHistory,
        achievements,
        journalEntries,
        isLoading,
        updateOnboardingData,
        completeOnboarding,
        refreshData,
        recordCheckIn,
        recordCheckInForDate,
        resetStreak,
        unlockAchievements,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        getLatestJournalEntry,
        getJournalEntries,
        latestHealthScore,
        updateHealthScore: setLatestHealthScore,
    };

    // Sync stats to Firestore when they change (Phase 1)
    useEffect(() => {
        if (isAuthenticated && userId && streakData) {
            // Debounce sync slightly or just sync on change (firestore handles merge)
            // We only sync if we have meaningful data
            userService.syncUserStats(userId, {
                currentStreak: streakData.currentStreak,
                healthScore: latestHealthScore,
                goalAchieved: streakData.currentStreak > 0, // Simplified for now
                feeling: todayCheckIn?.mood === 5 ? 'great' : todayCheckIn?.mood === 4 ? 'good' : todayCheckIn?.mood === 3 ? 'okay' : todayCheckIn?.mood ? 'struggling' : null,
                updatedAt: new Date(),
            }).catch(err => {
                console.error('Failed to sync user stats:', err);
            });
        }
    }, [isAuthenticated, userId, streakData, latestHealthScore, todayCheckIn?.mood]);

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
}

export default UserDataContext;
