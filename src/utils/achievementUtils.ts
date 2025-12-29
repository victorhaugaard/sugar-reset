/**
 * Achievement Utilities
 * 
 * Defines milestones and logic for tracking achievements.
 */

export interface Achievement {
    id: string;
    title: string;
    emoji: string;
    description: string;
    milestone: number; // days
    message: string; // Motivational message shown in popup
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'day_1',
        title: 'Fresh Start',
        emoji: '🌱',
        milestone: 1,
        description: 'Complete your first day',
        message: 'Every journey begins with a single step. You took yours today!'
    },
    {
        id: 'day_3',
        title: 'Momentum Building',
        emoji: '💪',
        milestone: 3,
        description: 'Reach 3 days sugar-free',
        message: 'The first 3 days are the hardest. You\'re past the worst!'
    },
    {
        id: 'day_7',
        title: 'One Week Warrior',
        emoji: '⭐',
        milestone: 7,
        description: 'Complete a full week',
        message: 'One week down! Your taste buds are already changing.'
    },
    {
        id: 'day_14',
        title: 'Two Week Champion',
        emoji: '🏆',
        milestone: 14,
        description: 'Reach the 2-week milestone',
        message: '14 days! Your cravings are significantly reduced now.'
    },
    {
        id: 'day_21',
        title: 'Habit Former',
        emoji: '🧠',
        milestone: 21,
        description: 'Complete 21 days',
        message: '21 days - the foundation of habit formation. Your brain is rewiring!'
    },
    {
        id: 'day_30',
        title: 'One Month Master',
        emoji: '🎉',
        milestone: 30,
        description: 'Achieve 1 month sugar-free',
        message: 'A full month! You\'ve proven this isn\'t temporary. You\'re transformed.'
    },
    {
        id: 'day_60',
        title: 'Diamond Strong',
        emoji: '💎',
        milestone: 60,
        description: 'Reach 60 days of freedom',
        message: '60 days! Habits are now deeply ingrained. You\'re unstoppable.'
    },
    {
        id: 'day_90',
        title: 'Neural Rewired',
        emoji: '🚀',
        milestone: 90,
        description: 'Complete the full 90-day journey',
        message: '90 DAYS! Your brain is fully rewired. Sugar addiction is broken. You\'re FREE!'
    },
];

/**
 * Check if any new achievements were unlocked
 * @param currentStreak Current streak in days
 * @param previousStreak Previous streak in days (before update)
 * @returns Array of newly unlocked achievements
 */
export function checkNewAchievements(
    currentStreak: number,
    previousStreak: number
): Achievement[] {
    const newAchievements: Achievement[] = [];

    ACHIEVEMENTS.forEach((achievement) => {
        // Check if this milestone was just reached
        if (currentStreak >= achievement.milestone && previousStreak < achievement.milestone) {
            newAchievements.push(achievement);
        }
    });

    return newAchievements;
}

/**
 * Get achievement by days
 */
export function getAchievementByDays(days: number): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.milestone === days);
}

/**
 * Get all unlocked achievements based on max streak
 */
export function getUnlockedAchievements(maxStreak: number): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.milestone <= maxStreak);
}

/**
 * Get locked achievements based on max streak
 */
export function getLockedAchievements(maxStreak: number): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.milestone > maxStreak);
}

/**
 * Get next achievement to unlock
 */
export function getNextAchievement(currentStreak: number): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.milestone > currentStreak);
}
