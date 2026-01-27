/**
 * Onboarding Service
 * 
 * Manages onboarding data collection and persistence.
 * Stores locally first, syncs to Firebase when authenticated.
 */

import { storageService } from './storageService';

/**
 * Onboarding data collected during the flow
 */
export interface OnboardingData {
    // Comprehensive Quiz fields
    gender?: 'male' | 'female' | 'other';
    sugarFrequency?: string; // 'rarely', 'weekly', 'daily', 'multiple'
    consumptionShift?: string;
    dailySugarGrams?: number;
    hardToGoWithout?: number; // 1-4 scale
    moodDifference?: string;
    monthlySpending?: string;
    reasons?: string[];
    otherReason?: string;
    stressEating?: number; // 1-4 scale
    boredomEating?: number; // 1-4 scale
    sugarDependencyScore?: number; // calculated total
    goals?: string[];
    triggers?: string[]; // stress, boredom, tired, emotional, social, reward, habit, menstrual
    nickname?: string;
    age?: string;

    // Plan screen
    plan?: 'cold_turkey' | 'gradual';

    // Legacy fields (kept for backwards compatibility)
    sugarConsumption?: string;
    sugarSources?: string[];
    motivation?: string;
    dailySpendingCents?: number;
    savingsGoal?: string;
    savingsGoalAmount?: number;

    // Promise screen - completion marker
    promiseConfirmed?: boolean;

    // Journey start
    startDate?: string; // ISO string

    // Metadata
    completedAt?: string; // ISO string
}

/**
 * Save partial onboarding data (for progressive save during flow)
 */
async function saveOnboardingData(data: Partial<OnboardingData>): Promise<void> {
    const existing = await getOnboardingData();
    const updated: OnboardingData = { ...existing, ...data };
    await storageService.save(storageService.KEYS.ONBOARDING_DATA, updated);
}

/**
 * Get all onboarding data
 */
async function getOnboardingData(): Promise<OnboardingData> {
    const data = await storageService.load<OnboardingData>(storageService.KEYS.ONBOARDING_DATA);
    return data || {};
}

/**
 * Clear onboarding data (for testing or reset)
 */
async function clearOnboardingData(): Promise<void> {
    await storageService.remove(storageService.KEYS.ONBOARDING_DATA);
}

/**
 * Mark onboarding as complete
 */
async function completeOnboarding(): Promise<void> {
    await saveOnboardingData({
        completedAt: new Date().toISOString(),
        startDate: new Date().toISOString(),
    });
    await storageService.save(storageService.KEYS.HAS_COMPLETED_ONBOARDING, true);
}

/**
 * Check if user has completed onboarding
 */
async function hasCompletedOnboarding(): Promise<boolean> {
    const completed = await storageService.load<boolean>(storageService.KEYS.HAS_COMPLETED_ONBOARDING);
    return completed === true;
}

export const onboardingService = {
    saveOnboardingData,
    getOnboardingData,
    clearOnboardingData,
    completeOnboarding,
    hasCompletedOnboarding,
};

export default onboardingService;
