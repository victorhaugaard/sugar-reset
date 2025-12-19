/**
 * Type Definitions for SugarReset
 */

// User profile
export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
    preferences: UserPreferences;
    streak: StreakData;
}

export interface UserPreferences {
    notifications: boolean;
    dailyReminderTime?: string; // HH:mm format
    weeklyReportDay?: number; // 0-6 (Sunday-Saturday)
    theme: 'dark' | 'system'; // Currently only dark mode
}

// Streak and progress tracking
export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastCheckIn: Date | null;
    startDate: Date;
    totalDaysSugarFree: number;
}

// Daily check-in
export interface DailyCheckIn {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD format
    sugarFree: boolean;
    notes?: string;
    cravingLevel?: 1 | 2 | 3 | 4 | 5; // 1 = none, 5 = intense
    mood?: 1 | 2 | 3 | 4 | 5; // 1 = poor, 5 = excellent
    energyLevel?: 1 | 2 | 3 | 4 | 5;
    sleepQuality?: 1 | 2 | 3 | 4 | 5;
    createdAt: Date;
}

// Science-backed benefits (for UI facts)
export interface Benefit {
    id: string;
    category: 'glucose' | 'skin' | 'sleep' | 'energy' | 'weight';
    title: string;
    description: string;
    dayToUnlock: number; // Days sugar-free before this benefit appears
    icon: string;
    source?: string; // Scientific source
}

// Milestone achievements
export interface Milestone {
    id: string;
    title: string;
    description: string;
    daysRequired: number;
    icon: string;
    unlockedAt?: Date;
}

// Navigation types
export type RootStackParamList = {
    Onboarding: undefined;
    Auth: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
    Launch: undefined;
    IntentSelection: undefined;
    SugarDefinition: undefined;
    ScienceFraming: undefined;
    BaselineSetup: undefined;
    Paywall: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Progress: undefined;
    Science: undefined;
    Profile: undefined;
};

// App state
export interface AppState {
    isLoading: boolean;
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    user: User | null;
}
