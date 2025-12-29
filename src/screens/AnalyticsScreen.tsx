/**
 * AnalyticsScreen
 * 
 * Shows streak statistics, science-based insights,
 * plan details, reset date, and collapsible science info.
 * Uses Sky theme with glassmorphism.
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { useUserData } from '../context/UserDataContext';
import WeekStrip from '../components/WeekStrip';
import { PlanProgressCircle } from '../components/PlanProgressCircle';
import { ConsumptionChart } from '../components/ConsumptionChart';
import { SwipeableTabView } from '../components/SwipeableTabView';
import { getPlanDetails, getCurrentWeek, getCurrentDayLimit, PlanType } from '../utils/planUtils';
import PlanDetailsModal from '../components/PlanDetailsModal';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Daily insights based on streak length
const getDailyInsight = (days: number): { title: string; text: string } => {
    if (days <= 3) {
        return {
            title: 'The hardest days',
            text: 'Days 1-3 are when cravings peak. Your dopamine system is adjusting. This is completely normal and will pass.',
        };
    } else if (days <= 7) {
        return {
            title: 'Building momentum',
            text: 'Your taste buds are beginning to reset. Foods will start tasting sweeter naturally.',
        };
    } else if (days <= 14) {
        return {
            title: 'Neural rewiring',
            text: 'Your brain is creating new neural pathways. Old sugar habits are weakening with each passing day.',
        };
    } else if (days <= 30) {
        return {
            title: 'Habit formation',
            text: 'Research shows 21-66 days creates lasting habits. You\'re well on your way to making this permanent.',
        };
    } else {
        return {
            title: 'The new normal',
            text: 'Sugar-free living is becoming your default. Your reward system has recalibrated significantly.',
        };
    }
};

const scienceSections = [
    {
        title: 'How SugarReset works',
        content: 'SugarReset offers two evidence-based approaches: Cold Turkey (0g from day 1) or Gradual Reduction (50g → 0g over 90 days). Both plans are built on 90-day neuroscience—the time needed to fully rewire dopamine pathways and form lasting habits.',
    },
    {
        title: 'Why we avoid streak punishment',
        content: 'Traditional streak apps create anxiety by resetting progress to zero after a single slip. Research shows this approach leads to shame spirals and abandonment. SugarReset tracks your journey differently—one day of sugar consumption is simply data, not failure.',
    },
    {
        title: 'The neuroscience',
        content: 'Habit formation research suggests that consistency over time matters more than perfection. Sugar cravings are driven by dopamine pathways that adapt gradually. By logging daily without judgment, you build awareness and allow your brain to naturally recalibrate its reward system.',
    },
];

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysUntil(date: Date): number {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AnalyticsScreen() {
    const [scienceExpanded, setScienceExpanded] = useState(false);
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const [showPlanDetails, setShowPlanDetails] = useState(false);
    const { onboardingData, streakData, checkInHistory, recordCheckInForDate } = useUserData();

    // Get real data from context
    const currentStreak = streakData?.currentStreak || 0;
    const longestStreak = streakData?.longestStreak || 0;
    const totalSugarFreeDays = streakData?.totalDaysSugarFree || 0;
    const planTypeRaw = (onboardingData.plan || 'cold_turkey') as PlanType;
    const planType = planTypeRaw === 'cold_turkey' ? 'Cold Turkey' : 'Gradual Reduction';
    const startDateString = onboardingData.startDate;
    const startDate = useMemo(() => startDateString ? new Date(startDateString) : new Date(), [startDateString]);

    // Plan progress
    const planDetails = getPlanDetails(planTypeRaw);
    const currentWeek = getCurrentWeek(startDate);

    // Calculate 90-day reset goal
    const resetDate = useMemo(() => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + 90);
        return date;
    }, [startDate]);

    const insight = getDailyInsight(currentStreak);
    const daysUntilReset = getDaysUntil(resetDate);

    const toggleScience = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setScienceExpanded(!scienceExpanded);
    };

    const handleDayPress = async (date: Date) => {
        // Toggle to sugar-free by default
        await recordCheckInForDate(date, true);
    };

    return (
        <SwipeableTabView currentTab="Analytics">
            <LooviBackground variant="blueBottom">
                <SafeAreaView style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Analytics</Text>
                            <Text style={styles.subtitle}>Your habit data</Text>
                        </View>

                        {/* Circular Progress + Stats Row */}
                        <GlassCard variant="light" padding="lg" style={styles.progressCard}>
                            <View style={styles.progressContainer}>
                                <PlanProgressCircle
                                    daysCompleted={totalSugarFreeDays}
                                    totalDays={90}
                                    size={120}
                                    strokeWidth={10}
                                />
                                <View style={styles.statsColumn}>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statValueSmall}>{currentStreak}</Text>
                                        <Text style={styles.statLabelSmall}>Current</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statValueSmall}>{longestStreak}</Text>
                                        <Text style={styles.statLabelSmall}>Longest</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statValueSmall}>{totalSugarFreeDays}</Text>
                                        <Text style={styles.statLabelSmall}>Total days</Text>
                                    </View>
                                </View>
                            </View>
                        </GlassCard>

                        {/* Today's Insight */}
                        <GlassCard variant="light" padding="lg" style={styles.insightCard}>
                            <Text style={styles.insightLabel}>Day {currentStreak} insight</Text>
                            <Text style={styles.insightTitle}>{insight.title}</Text>
                            <Text style={styles.insightText}>{insight.text}</Text>
                        </GlassCard>

                        {/* Week Calendar - Same as Home page */}
                        <WeekStrip
                            checkIns={checkInHistory}
                            onDayPress={handleDayPress}
                            startDate={startDate}
                        />

                        {/* Consumption Chart (for gradual plan) */}
                        {planTypeRaw === 'gradual' && (
                            <GlassCard variant="light" padding="lg" style={styles.chartCard}>
                                <ConsumptionChart
                                    checkInHistory={checkInHistory}
                                    dailyLimit={getCurrentDayLimit(planTypeRaw, startDate)?.dailyGrams || 50}
                                    daysToShow={14}
                                />
                            </GlassCard>
                        )}

                        {/* Plan Details with Nested Plan Progress */}
                        <GlassCard variant="light" padding="lg" style={styles.planCard}>
                            <Text style={styles.planLabel}>Your Plan</Text>
                            <Text style={styles.planType}>{planType}</Text>
                            <View style={styles.planDivider} />

                            {/* Nested Plan Progress */}
                            {planTypeRaw === 'gradual' && currentWeek <= planDetails.weeklyLimits.length && (
                                <View style={styles.internalPlanProgress}>
                                    <Text style={styles.planProgressTitle}>Progress</Text>
                                    <View style={styles.planProgressGrid}>
                                        {planDetails.weeklyLimits.map((week, index) => (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.planProgressWeek,
                                                    currentWeek > index + 1 && styles.planProgressComplete,
                                                    currentWeek === index + 1 && styles.planProgressCurrent,
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.planProgressWeekNum,
                                                    currentWeek > index + 1 && styles.planProgressTextComplete,
                                                    currentWeek === index + 1 && styles.planProgressTextCurrent,
                                                ]}>
                                                    {currentWeek > index + 1 ? '✓' : `W${index + 1}`}
                                                </Text>
                                                <Text style={[
                                                    styles.planProgressGrams,
                                                    currentWeek > index + 1 && styles.planProgressTextComplete,
                                                ]}>
                                                    {week.dailyGrams}g
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <Text style={styles.resetLabel}>Sugar reset complete on</Text>
                            <Text style={styles.resetDate}>
                                {resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </Text>
                            <Text style={styles.daysUntilReset}>{daysUntilReset} days to go</Text>

                            {/* My Plan Details Button */}
                            <TouchableOpacity
                                style={styles.viewPlanButton}
                                onPress={() => setShowPlanDetails(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.viewPlanButtonText}>📖 My Plan Details</Text>
                            </TouchableOpacity>
                        </GlassCard>

                        {/* Collapsible Science Section */}
                        <TouchableOpacity onPress={toggleScience} activeOpacity={0.8}>
                            <GlassCard variant="light" padding="md" style={styles.scienceHeader}>
                                <View style={styles.scienceHeaderContent}>
                                    <View style={styles.scienceHeaderLeft}>
                                        <Text style={styles.scienceIcon}>🧬</Text>
                                        <View>
                                            <Text style={styles.scienceTitle}>Science-Based Approach</Text>
                                            <Text style={styles.scienceSubtitle}>Learn how the app works</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.chevron}>{scienceExpanded ? '▲' : '▼'}</Text>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>

                        {scienceExpanded && (
                            <View style={styles.scienceContent}>
                                {scienceSections.map((section, index) => (
                                    <GlassCard key={index} variant="light" padding="md" style={styles.scienceSection}>
                                        <Text style={styles.scienceSectionTitle}>{section.title}</Text>
                                        <Text style={styles.scienceSectionText}>{section.content}</Text>
                                    </GlassCard>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {/* Plan Details Modal */}
                    <PlanDetailsModal
                        visible={showPlanDetails}
                        planType={planTypeRaw}
                        onClose={() => setShowPlanDetails(false)}
                    />
                </SafeAreaView>
            </LooviBackground>
        </SwipeableTabView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.lg,
        paddingBottom: spacing['3xl'],
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginTop: spacing.xs,
    },
    insightCard: {
        marginBottom: spacing.xl,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    insightLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.accent.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    insightTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
    },
    insightText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 22,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        width: '47%',
    },
    progressCard: {
        marginBottom: spacing.lg,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xl,
    },
    statsColumn: {
        gap: spacing.sm,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing.sm,
    },
    statValueSmall: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
        minWidth: 32,
    },
    statLabelSmall: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    chartCard: {
        marginBottom: spacing.xl,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
    planCard: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    planLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    planType: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.accent.primary,
        marginTop: spacing.xs,
    },
    planDivider: {
        width: 40,
        height: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginVertical: spacing.lg,
    },
    resetLabel: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    resetDate: {
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginTop: spacing.xs,
    },
    countdownBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 20,
        marginTop: spacing.md,
    },
    countdownText: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.accent.success,
    },
    scienceHeader: {
        marginBottom: spacing.sm,
    },
    scienceHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    scienceHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scienceIcon: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    scienceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    scienceSubtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    chevron: {
        fontSize: 12,
        color: looviColors.text.tertiary,
    },
    scienceContent: {
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    scienceSection: {
        // Additional styling if needed
    },
    scienceSectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
    },
    scienceSectionText: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 20,
    },
    // Plan Progress Styles
    planProgressCard: {
        marginBottom: spacing.xl,
    },
    planProgressTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.md,
    },
    planProgressGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        justifyContent: 'center',
    },
    planProgressWeek: {
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
    },
    planProgressComplete: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    planProgressCurrent: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderWidth: 1,
        borderColor: looviColors.accent.primary,
    },
    planProgressWeekNum: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.tertiary,
    },
    planProgressGrams: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    planProgressTextComplete: {
        color: looviColors.accent.success,
    },
    planProgressTextCurrent: {
        color: looviColors.accent.primary,
    },
    // Calendar Unified Card Styles
    calendarContainer: {
        marginBottom: spacing.xl,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    calendarTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    calendarContent: {
        marginTop: spacing.sm,
    },
    internalPlanProgress: {
        width: '100%',
        marginBottom: spacing.xl,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    daysUntilReset: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
    viewPlanButton: {
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    viewPlanButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.accent.primary,
    },
});
