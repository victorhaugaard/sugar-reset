/**
 * Plan Utilities
 * 
 * Provides calculations and guidance for sugar reduction plans.
 */

export type PlanType = 'cold_turkey' | 'gradual';

export interface WeeklyLimit {
    week: number;
    dailyGrams: number;
    title: string;
    description: string;
}

export interface PlanDetails {
    type: PlanType;
    name: string;
    tagline: string;
    description: string;
    weeklyLimits: WeeklyLimit[];
}

// Gradual reduction plan - 13 weeks (90 days) to sugar-free
// Based on habit science: 66 days average for habit formation (Lally 2009)
// 90 days ensures neural pathways are fully rewired
// Starts at 50g, reduces by 5g weekly, jumps to 0g from 20g at week 8
const GRADUAL_PLAN: PlanDetails = {
    type: 'gradual',
    name: 'Gradual Reduction',
    tagline: '90 days to lasting change',
    description: 'Reduce sugar intake progressively over 13 weeks, starting at 50g and reaching zero at week 8. This science-backed approach minimizes cravings.',
    weeklyLimits: [
        {
            week: 1,
            dailyGrams: 50,
            title: 'Starting Point',
            description: 'Begin at 50g/day. Most people consume 70-100g, so this is already a reduction.',
        },
        {
            week: 2,
            dailyGrams: 45,
            title: 'First Step Down',
            description: 'Down to 45g. Your body is beginning to adjust to less sugar.',
        },
        {
            week: 3,
            dailyGrams: 40,
            title: 'Building Momentum',
            description: 'Down to 40g. Cravings are starting to decrease noticeably.',
        },
        {
            week: 4,
            dailyGrams: 35,
            title: 'Taste Bud Reset',
            description: 'Your taste buds are becoming more sensitive to sweetness.',
        },
        {
            week: 5,
            dailyGrams: 30,
            title: 'WHO Recommended',
            description: 'At 30g, you\'re at the WHO recommended limit for added sugar.',
        },
        {
            week: 6,
            dailyGrams: 25,
            title: 'Getting Close',
            description: '25g daily. Your dependency on sugar is breaking down.',
        },
        {
            week: 7,
            dailyGrams: 20,
            title: 'Final Step Before Zero',
            description: 'Just 20g left. Next week you make the jump to zero!',
        },
        {
            week: 8,
            dailyGrams: 0,
            title: 'Sugar-Free!',
            description: 'Zero added sugar! From 20g to 0g. Now maintain for full neural rewiring.',
        },
        {
            week: 9,
            dailyGrams: 0,
            title: 'Maintaining Zero',
            description: 'Staying at zero. Your brain is rewiring its reward pathways.',
        },
        {
            week: 10,
            dailyGrams: 0,
            title: 'New Normal',
            description: 'Sugar-free is becoming automatic. Processed sugar seems too sweet.',
        },
        {
            week: 11,
            dailyGrams: 0,
            title: 'Habit Locked In',
            description: '66+ days sugar-free - habit formation complete (Lally 2009).',
        },
        {
            week: 12,
            dailyGrams: 0,
            title: 'Almost Complete',
            description: 'Neural pathways fully rewired. Sugar freedom is permanent.',
        },
        {
            week: 13,
            dailyGrams: 0,
            title: '90 Days Complete!',
            description: '90 days sugar-free! You\'ve achieved lasting freedom. The habit is now automatic.',
        },
    ],
};

// Cold turkey plan - 0g from day 1 for 90 days
// Faster results but requires strong discipline
const COLD_TURKEY_PLAN: PlanDetails = {
    type: 'cold_turkey',
    name: 'Cold Turkey',
    tagline: 'Complete commitment for 90 days',
    description: 'Zero added sugar from day one. This requires discipline but produces faster results. The 90-day journey rewires your brain completely.',
    weeklyLimits: [
        {
            week: 1,
            dailyGrams: 0,
            title: 'The Hardest Week',
            description: 'Days 1-3 are when cravings peak. Your dopamine system is adjusting.',
        },
        {
            week: 2,
            dailyGrams: 0,
            title: 'Taste Reset',
            description: 'Cravings diminish. Natural foods start tasting sweeter.',
        },
        {
            week: 3,
            dailyGrams: 0,
            title: 'New Normal',
            description: 'Sugar-free is becoming your default state.',
        },
        {
            week: 4,
            dailyGrams: 0,
            title: '21-Day Mark',
            description: 'Traditional habit formation milestone reached.',
        },
        {
            week: 5,
            dailyGrams: 0,
            title: 'Mental Clarity',
            description: 'Energy levels stabilize. Brain fog lifts.',
        },
        {
            week: 6,
            dailyGrams: 0,
            title: 'Halfway There',
            description: '42 days complete! Sugar cravings rare now.',
        },
        {
            week: 7,
            dailyGrams: 0,
            title: 'Steady State',
            description: 'Your body has adapted to zero sugar.',
        },
        {
            week: 8,
            dailyGrams: 0,
            title: 'Auto-Pilot',
            description: 'Avoiding sugar is automatic now.',
        },
        {
            week: 9,
            dailyGrams: 0,
            title: '66-Day Mark',
            description: 'Scientific habit formation complete (Lally 2009).',
        },
        {
            week: 10,
            dailyGrams: 0,
            title: 'Deep Rewiring',
            description: 'Neural pathways firmly established.',
        },
        {
            week: 11,
            dailyGrams: 0,
            title: 'Almost There',
            description: 'Just 2 weeks to full 90-day reset.',
        },
        {
            week: 12,
            dailyGrams: 0,
            title: 'Final Stretch',
            description: 'The finish line is in sight!',
        },
        {
            week: 13,
            dailyGrams: 0,
            title: 'Champion',
            description: '90 days sugar-free! Your brain is fully rewired.',
        },
    ],
};

export function getPlanDetails(planType: PlanType): PlanDetails {
    return planType === 'cold_turkey' ? COLD_TURKEY_PLAN : GRADUAL_PLAN;
}

export function getCurrentWeek(startDate: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
}

export function getCurrentDayLimit(planType: PlanType, startDate: Date): WeeklyLimit {
    const plan = getPlanDetails(planType);
    const currentWeek = getCurrentWeek(startDate);

    // Find the applicable week (cap at last defined week)
    const weekIndex = Math.min(currentWeek - 1, plan.weeklyLimits.length - 1);
    return plan.weeklyLimits[Math.max(0, weekIndex)];
}

export function getTodayGuidance(planType: PlanType, startDate: Date): {
    limit: number;
    title: string;
    tip: string;
    weekNumber: number;
    isComplete: boolean;
} {
    const plan = getPlanDetails(planType);
    const currentWeek = getCurrentWeek(startDate);
    const weekLimit = getCurrentDayLimit(planType, startDate);

    const isComplete = currentWeek > plan.weeklyLimits.length;

    const tips = planType === 'cold_turkey'
        ? [
            'Drink water when cravings hit.',
            'Go for a short walk to reset.',
            'Remember: cravings pass in 15-20 minutes.',
            'Focus on protein-rich snacks.',
            'Check nutrition labels carefully.',
        ]
        : [
            'Track your intake to stay within limits.',
            'Front-load your sugar allowance if needed.',
            'Choose whole fruits over processed sweets.',
            'Read labels - sugar hides in unexpected places.',
            'Each gram you save is progress.',
        ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    return {
        limit: weekLimit.dailyGrams,
        title: weekLimit.title,
        tip: randomTip,
        weekNumber: Math.min(currentWeek, plan.weeklyLimits.length),
        isComplete,
    };
}

export function formatPlanProgress(planType: PlanType, startDate: Date): string {
    const plan = getPlanDetails(planType);
    const currentWeek = getCurrentWeek(startDate);

    if (currentWeek > plan.weeklyLimits.length) {
        return 'Plan complete! Maintaining sugar-free lifestyle.';
    }

    return `Week ${currentWeek} of ${plan.weeklyLimits.length}`;
}
