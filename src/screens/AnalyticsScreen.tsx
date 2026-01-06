/**
 * AnalyticsScreen
 * 
 * Redesigned analytics page with:
 * - Timeframe toggle (7 days, 1 month, all time)
 * - Overall health score ring
 * - Sugar consumption graph
 * - Nutrition section (placeholder)
 * - Qualitative advice
 * - CTA buttons
 */

import React, { useState, useMemo, useEffect } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { useUserData } from '../context/UserDataContext';
import { TimeframeToggle, Timeframe } from '../components/TimeframeToggle';
import { HealthScoreRing } from '../components/HealthScoreRing';
import { HealthScoreTrend } from '../components/HealthScoreTrend';
import { SugarConsumptionTrend } from '../components/SugarConsumptionTrend';
import { SwipeableTabView } from '../components/SwipeableTabView';
import JournalEntryModal from '../components/JournalEntryModal';
import { PlanType } from '../utils/planUtils';
import { AppIcon } from '../components/OnboardingIcon';
import { getScannedItems, ScannedItem } from '../services/scannerService';
import {
    aggregateHealthData,
    calculateComprehensiveScore,
    DailyNutritionProfile,
    WellnessMetrics,
    getNutritionInsights,
} from '../services/healthScoringService';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WellnessLog {
    date: string;
    mood: number;
    energy: number;
    focus: number;
    sleepHours: number;
}

export default function AnalyticsScreen() {
    const navigation = useNavigation<any>();
    const [timeframe, setTimeframe] = useState<Timeframe>('7d');
    const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>([]);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [healthScore, setHealthScore] = useState({ overall: 0, nutrition: 0, wellness: 0 });
    const [nutritionInsights, setNutritionInsights] = useState<ReturnType<typeof getNutritionInsights> | null>(null);
    const [trendData, setTrendData] = useState<{ date: string; score: number }[]>([]);
    const [showJournalModal, setShowJournalModal] = useState(false);
    const { onboardingData, checkInHistory, recordCheckInForDate, streakData, addJournalEntry } = useUserData();

    const startDateString = onboardingData.startDate;
    const startDate = useMemo(() => startDateString ? new Date(startDateString) : new Date(), [startDateString]);
    const planTypeRaw = (onboardingData.plan || 'cold_turkey') as PlanType;

    // Load wellness logs and food data - reload when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                    const [storedWellness, foodItems] = await Promise.all([
                        AsyncStorage.getItem('wellness_logs'),
                        getScannedItems(),
                    ]);

                    if (storedWellness) {
                        setWellnessLogs(JSON.parse(storedWellness));
                    } else {
                        setWellnessLogs([]);
                    }
                    setScannedItems(foodItems);
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            };
            loadData();
        }, [])
    );

    // Filter data based on timeframe
    const getTimeframeDays = (tf: Timeframe): number => {
        switch (tf) {
            case '7d': return 7;
            case '1m': return 30;
            case 'all': return 365; // Max 1 year for "all"
        }
    };

    const filteredWellnessLogs = useMemo(() => {
        const days = getTimeframeDays(timeframe);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return wellnessLogs.filter(log => new Date(log.date) >= cutoff);
    }, [wellnessLogs, timeframe]);

    // Calculate averages for the timeframe
    const wellnessAverages = useMemo(() => {
        if (filteredWellnessLogs.length === 0) {
            return { mood: 0, energy: 0, focus: 0, sleep: 0 };
        }

        const sum = filteredWellnessLogs.reduce(
            (acc, log) => ({
                mood: acc.mood + log.mood,
                energy: acc.energy + log.energy,
                focus: acc.focus + log.focus,
                sleep: acc.sleep + log.sleepHours,
            }),
            { mood: 0, energy: 0, focus: 0, sleep: 0 }
        );

        const count = filteredWellnessLogs.length;
        return {
            mood: sum.mood / count,
            energy: sum.energy / count,
            focus: sum.focus / count,
            sleep: sum.sleep / count,
        };
    }, [filteredWellnessLogs]);

    // Calculate comprehensive health score and nutrition insights
    useEffect(() => {
        const calculateScore = () => {
            const days = getTimeframeDays(timeframe);
            const wellnessMetrics: WellnessMetrics[] = filteredWellnessLogs.map(log => ({
                mood: log.mood,
                energy: log.energy,
                focus: log.focus,
                sleepHours: log.sleepHours,
            }));

            const aggregated = aggregateHealthData(scannedItems, wellnessMetrics, days);
            setHealthScore({
                overall: aggregated.avgOverallScore,
                nutrition: aggregated.avgNutritionScore,
                wellness: aggregated.avgWellnessScore,
            });

            // Calculate nutrition insights
            const insights = getNutritionInsights(scannedItems, days);
            setNutritionInsights(insights);

            // Calculate daily trend data
            const dailyScores: { date: string; score: number }[] = [];
            const dateMap = new Map<string, { food: ScannedItem[]; wellness: WellnessLog | null }>();

            // Group food by date
            scannedItems.forEach(item => {
                const date = item.timestamp.split('T')[0];
                if (!dateMap.has(date)) {
                    dateMap.set(date, { food: [], wellness: null });
                }
                dateMap.get(date)!.food.push(item);
            });

            // Add wellness data
            filteredWellnessLogs.forEach(log => {
                if (!dateMap.has(log.date)) {
                    dateMap.set(log.date, { food: [], wellness: null });
                }
                dateMap.get(log.date)!.wellness = log;
            });

            // Calculate score for each day
            Array.from(dateMap.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .forEach(([date, data]) => {
                    if (data.food.length > 0 || data.wellness) {
                        const dayWellness = data.wellness ? [{
                            mood: data.wellness.mood,
                            energy: data.wellness.energy,
                            focus: data.wellness.focus,
                            sleepHours: data.wellness.sleepHours,
                        }] : [];

                        const dayAggregated = aggregateHealthData(data.food, dayWellness, 1);
                        dailyScores.push({
                            date,
                            score: dayAggregated.avgOverallScore,
                        });
                    }
                });

            setTrendData(dailyScores);
        };

        calculateScore();
    }, [scannedItems, filteredWellnessLogs, timeframe]);

    const handleTimeframeChange = (newTimeframe: Timeframe) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTimeframe(newTimeframe);
    };

    const daysToShow = getTimeframeDays(timeframe);

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
                            <Text style={styles.subtitle}>Track your progress</Text>
                        </View>

                        {/* Timeframe Toggle */}
                        <TimeframeToggle
                            value={timeframe}
                            onChange={handleTimeframeChange}
                        />

                        {/* Overall Health Score */}
                        <GlassCard variant="light" padding="lg" style={styles.healthCard}>
                            <HealthScoreRing
                                mood={wellnessAverages.mood}
                                energy={wellnessAverages.energy}
                                focus={wellnessAverages.focus}
                                sleep={wellnessAverages.sleep}
                                overallScore={healthScore.overall}
                            />
                            <View style={styles.scoreBreakdown}>
                                <View style={styles.scoreItem}>
                                    <Text style={styles.scoreItemLabel}>Nutrition</Text>
                                    <Text style={styles.scoreItemValue}>{healthScore.nutrition}</Text>
                                </View>
                                <View style={styles.scoreItem}>
                                    <Text style={styles.scoreItemLabel}>Wellness</Text>
                                    <Text style={styles.scoreItemValue}>{healthScore.wellness}</Text>
                                </View>
                            </View>
                        </GlassCard>

                        {/* Health Score Trend */}
                        {trendData.length > 0 && (
                            <GlassCard variant="light" padding="lg" style={styles.trendCard}>
                                <HealthScoreTrend
                                    data={trendData}
                                    timeframeDays={timeframe === '7d' ? 7 : timeframe === '1m' ? 30 : 90}
                                />
                            </GlassCard>
                        )}

                        {/* Sugar Consumption Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Sugar Consumption</Text>
                        </View>
                        <GlassCard variant="light" padding="lg" style={styles.chartCard}>
                            {scannedItems.length > 0 ? (
                                <SugarConsumptionTrend
                                    data={scannedItems.map(item => ({
                                        date: item.timestamp.split('T')[0],
                                        sugar: item.sugar || 0,
                                    }))}
                                    timeframeDays={timeframe === '7d' ? 7 : timeframe === '1m' ? 30 : 90}
                                    targetGrams={25}
                                />
                            ) : (
                                <View style={styles.emptyChart}>
                                    <Text style={styles.emptyChartEmoji}>📊</Text>
                                    <Text style={styles.emptyChartTitle}>No Food Logged Yet</Text>
                                    <Text style={styles.emptyChartText}>
                                        Start logging your meals to track sugar consumption
                                    </Text>
                                </View>
                            )}
                        </GlassCard>

                        {/* CTA: Log Food */}
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={() => navigation.navigate('Track', { tab: 'scan' })}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="nutrition" size={20} color="#FFFFFF" />
                            <Text style={styles.ctaButtonText}>Log Today's Food</Text>
                        </TouchableOpacity>

                        {/* Nutrition Insights */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Nutrition Insights</Text>
                        </View>
                        <GlassCard variant="light" padding="lg" style={styles.nutritionCard}>
                            {nutritionInsights && nutritionInsights.avgCalories > 0 ? (
                                <>
                                    <View style={styles.nutritionHeader}>
                                        <Ionicons name="nutrition" size={32} color={looviColors.accent.primary} />
                                        <View style={styles.nutritionHeaderText}>
                                            <Text style={styles.nutritionTitle}>Daily Averages</Text>
                                            <Text style={styles.nutritionSubtitle}>Based on your logged food</Text>
                                        </View>
                                    </View>

                                    {/* Macros Grid */}
                                    <View style={styles.macroGrid}>
                                        <View style={styles.macroItem}>
                                            <Text style={styles.macroValue}>{nutritionInsights.avgCalories}</Text>
                                            <Text style={styles.macroLabel}>Calories</Text>
                                        </View>
                                        <View style={styles.macroItem}>
                                            <Text style={styles.macroValue}>{nutritionInsights.avgProtein}g</Text>
                                            <Text style={styles.macroLabel}>Protein</Text>
                                        </View>
                                        <View style={styles.macroItem}>
                                            <Text style={styles.macroValue}>{nutritionInsights.avgCarbs}g</Text>
                                            <Text style={styles.macroLabel}>Carbs</Text>
                                        </View>
                                        <View style={styles.macroItem}>
                                            <Text style={styles.macroValue}>{nutritionInsights.avgFat}g</Text>
                                            <Text style={styles.macroLabel}>Fat</Text>
                                        </View>
                                    </View>

                                    {/* Macro Balance */}
                                    <View style={styles.macroBalanceSection}>
                                        <Text style={styles.macroBalanceTitle}>Macro Balance</Text>
                                        <View style={styles.macroBalanceBar}>
                                            <View style={[styles.macroBalanceSegment, { flex: nutritionInsights.macroBalance.protein, backgroundColor: '#3B82F6' }]} />
                                            <View style={[styles.macroBalanceSegment, { flex: nutritionInsights.macroBalance.carbs, backgroundColor: '#22C55E' }]} />
                                            <View style={[styles.macroBalanceSegment, { flex: nutritionInsights.macroBalance.fat, backgroundColor: '#F59E0B' }]} />
                                        </View>
                                        <View style={styles.macroBalanceLegend}>
                                            <View style={styles.macroBalanceLegendItem}>
                                                <View style={[styles.macroBalanceDot, { backgroundColor: '#3B82F6' }]} />
                                                <Text style={styles.macroBalanceLegendText}>Protein {nutritionInsights.macroBalance.protein}%</Text>
                                            </View>
                                            <View style={styles.macroBalanceLegendItem}>
                                                <View style={[styles.macroBalanceDot, { backgroundColor: '#22C55E' }]} />
                                                <Text style={styles.macroBalanceLegendText}>Carbs {nutritionInsights.macroBalance.carbs}%</Text>
                                            </View>
                                            <View style={styles.macroBalanceLegendItem}>
                                                <View style={[styles.macroBalanceDot, { backgroundColor: '#F59E0B' }]} />
                                                <Text style={styles.macroBalanceLegendText}>Fat {nutritionInsights.macroBalance.fat}%</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Sugar Status */}
                                    <View style={styles.sugarStatusSection}>
                                        <Text style={styles.sugarStatusLabel}>Added Sugar Intake</Text>
                                        <View style={styles.sugarStatusRow}>
                                            <Text style={styles.sugarStatusValue}>{nutritionInsights.avgAddedSugar}g</Text>
                                            <View style={[
                                                styles.sugarStatusBadge,
                                                {
                                                    backgroundColor:
                                                        nutritionInsights.sugarStatus === 'excellent' ? 'rgba(34, 197, 94, 0.1)' :
                                                            nutritionInsights.sugarStatus === 'good' ? 'rgba(245, 158, 11, 0.1)' :
                                                                'rgba(239, 68, 68, 0.1)'
                                                }
                                            ]}>
                                                <Text style={[
                                                    styles.sugarStatusBadgeText,
                                                    {
                                                        color:
                                                            nutritionInsights.sugarStatus === 'excellent' ? '#22C55E' :
                                                                nutritionInsights.sugarStatus === 'good' ? '#F59E0B' :
                                                                    '#EF4444'
                                                    }
                                                ]}>
                                                    {nutritionInsights.sugarStatus === 'excellent' ? 'Excellent!' :
                                                        nutritionInsights.sugarStatus === 'good' ? 'Good' :
                                                            nutritionInsights.sugarStatus === 'high' ? 'High' : 'Very High'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.sugarStatusHint}>
                                            {nutritionInsights.sugarStatus === 'excellent' ? 'Keep up the great work staying below 25g!' :
                                                nutritionInsights.sugarStatus === 'good' ? 'Try to stay below 50g per day' :
                                                    'WHO recommends less than 50g of added sugar per day'}
                                        </Text>
                                    </View>

                                    {/* Recommendations */}
                                    <View style={styles.recommendationsSection}>
                                        <Text style={styles.recommendationsTitle}>Recommendations</Text>
                                        {nutritionInsights.recommendations.map((rec, index) => (
                                            <View key={index} style={styles.recommendationItem}>
                                                <Ionicons name="checkmark-circle" size={16} color={looviColors.accent.primary} />
                                                <Text style={styles.recommendationText}>{rec}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="leaf" size={40} color={looviColors.accent.primary} />
                                    <Text style={styles.placeholderTitle}>Start Logging Food</Text>
                                    <Text style={styles.placeholderText}>
                                        Log your meals to see detailed nutrition insights and personalized recommendations.
                                    </Text>
                                </>
                            )}
                        </GlassCard>

                        {/* Qualitative Advice */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Personalized Tips</Text>
                        </View>
                        <GlassCard variant="light" padding="lg" style={styles.adviceCard}>
                            <Ionicons name="bulb" size={28} color={looviColors.accent.primary} />
                            <View style={styles.adviceContent}>
                                {filteredWellnessLogs.length === 0 ? (
                                    <>
                                        <Text style={styles.adviceTitle}>Start Tracking Your Wellness</Text>
                                        <Text style={styles.adviceText}>
                                            Log your daily wellness metrics to receive personalized tips based on your mood, energy, focus, and sleep patterns.
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.adviceTitle}>
                                            {wellnessAverages.mood < 3
                                                ? 'Focus on mood-boosting activities'
                                                : wellnessAverages.energy < 3
                                                    ? 'Consider improving your energy levels'
                                                    : wellnessAverages.sleep < 7
                                                        ? 'Prioritize getting more sleep'
                                                        : 'Keep up the great work!'}
                                        </Text>
                                        <Text style={styles.adviceText}>
                                            {wellnessAverages.mood < 3
                                                ? 'Low mood can trigger sugar cravings. Try exercise, socializing, or journaling to boost your spirits.'
                                                : wellnessAverages.energy < 3
                                                    ? 'Stable blood sugar helps maintain energy. Focus on protein and complex carbs throughout the day.'
                                                    : wellnessAverages.sleep < 7
                                                        ? 'Poor sleep increases sugar cravings. Aim for 7-9 hours and avoid screens before bed.'
                                                        : 'Your wellness metrics look balanced. Keep tracking to maintain your progress.'}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </GlassCard>

                        {/* Connection Section */}
                        <GlassCard variant="light" padding="lg" style={styles.connectionCard}>
                            <Text style={styles.connectionTitle}>Mind-Body Connection</Text>
                            <Text style={styles.connectionText}>
                                Your wellness data shows how your body responds to your choices.
                                {filteredWellnessLogs.length > 0
                                    ? ` Based on ${filteredWellnessLogs.length} entries this period.`
                                    : ' Start logging to see patterns.'}
                            </Text>
                            <TouchableOpacity
                                style={styles.journalButton}
                                onPress={() => setShowJournalModal(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="book" size={18} color="#8B5CF6" />
                                <Text style={styles.journalButtonText}>Reflect in Journal</Text>
                            </TouchableOpacity>
                        </GlassCard>

                    </ScrollView>

                    {/* Journal Modal */}
                    <JournalEntryModal
                        visible={showJournalModal}
                        onClose={() => setShowJournalModal(false)}
                        onSave={async (entry) => {
                            await addJournalEntry(new Date(), entry);
                            setShowJournalModal(false);
                        }}
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    sectionBadge: {
        marginLeft: spacing.sm,
        fontSize: 11,
        fontWeight: '600',
        color: looviColors.accent.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 10,
    },
    healthCard: {
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    trendCard: {
        marginBottom: spacing.lg,
    },
    scoreBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingTop: spacing.lg,
        marginTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    scoreItem: {
        alignItems: 'center',
    },
    scoreItemLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginBottom: spacing.xs,
    },
    scoreItemValue: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    chartCard: {
        marginBottom: spacing.md,
    },
    chartScrollContent: {
        minWidth: '100%',
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 14,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.lg,
    },
    ctaButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    nutritionCard: {
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    placeholderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    placeholderText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    adviceCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    adviceContent: {
        flex: 1,
    },
    adviceTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    adviceText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 20,
    },
    connectionCard: {
        marginBottom: spacing.lg,
    },
    connectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
    },
    connectionText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    journalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        paddingVertical: 12,
        borderRadius: borderRadius.lg,
    },
    journalButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    statsCard: {
        marginTop: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    // Nutrition Insights Styles
    nutritionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    nutritionHeaderText: {
        flex: 1,
    },
    nutritionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    nutritionSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginTop: 2,
    },
    macroGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    macroItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    macroValue: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    macroLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: 4,
    },
    macroBalanceSection: {
        marginBottom: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    macroBalanceTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
    },
    macroBalanceBar: {
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    macroBalanceSegment: {
        height: '100%',
    },
    macroBalanceLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    macroBalanceLegendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    macroBalanceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    macroBalanceLegendText: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.secondary,
    },
    sugarStatusSection: {
        marginBottom: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    sugarStatusLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
    },
    sugarStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xs,
    },
    sugarStatusValue: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    sugarStatusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.md,
    },
    sugarStatusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sugarStatusHint: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    recommendationsSection: {
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    recommendationsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginBottom: spacing.sm,
        width: '100%',
    },
    recommendationText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 18,
    },
    sugarSummary: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    sugarSummaryValue: {
        fontSize: 48,
        fontWeight: '800',
        color: looviColors.accent.primary,
        marginTop: spacing.md,
    },
    sugarSummaryLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginTop: spacing.xs,
    },
    sugarSummarySubtext: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
    emptyChart: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    emptyChartEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyChartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    emptyChartText: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        textAlign: 'center',
    },
});
