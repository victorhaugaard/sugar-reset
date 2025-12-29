/**
 * HomeScreen - Main Dashboard (Sky Theme with Live Counters)
 * 
 * Features:
 * - Live timer (days, hours, minutes, seconds)
 * - Money saved counter
 * - Sugar avoided counter
 * - Panic button for cravings
 * - Personal reasons reminder
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { useUserData } from '../context/UserDataContext';
import WeekStrip from '../components/WeekStrip';
import PlanDetailsModal from '../components/PlanDetailsModal';
import { CheckInModal } from '../components/CheckInModal';
import { JournalWidget } from '../components/JournalWidget';
import { SwipeableTabView } from '../components/SwipeableTabView';
import { getTodayGuidance, PlanType, getPlanDetails, getCurrentWeek } from '../utils/planUtils';

function formatDuration(ms: number) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
}

export default function HomeScreen() {
    const [showPanicModal, setShowPanicModal] = useState(false);
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showCheckInStatusModal, setShowCheckInStatusModal] = useState(false);
    const [checkInResult, setCheckInResult] = useState<'success' | 'reset' | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [showPlanDetails, setShowPlanDetails] = useState(false);
    const [showEditSavingsModal, setShowEditSavingsModal] = useState(false);
    const [showEditReasonsModal, setShowEditReasonsModal] = useState(false);
    const [editSavingsGoal, setEditSavingsGoal] = useState('');
    const [editReasons, setEditReasons] = useState<string[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const fallbackDateRef = useRef(new Date().toISOString()); // Stable fallback
    const navigation = useNavigation<any>(); // Type as any to allow navigation to new modal screens
    const {
        onboardingData,
        isLoading,
        recordCheckIn,
        resetStreak,
        todayCheckIn,
        streakData,
        checkInHistory,
        recordCheckInForDate,
        getLatestJournalEntry,
        updateOnboardingData,
    } = useUserData();

    // Get user data from context (with fallbacks)
    // Use ref for stable fallback to prevent infinite loops
    const startDateString = onboardingData.startDate || fallbackDateRef.current;
    const startDate = useMemo(() => new Date(startDateString), [startDateString]);
    const dailySpendingCents = onboardingData.dailySpendingCents || 300;
    const dailySugarGrams = onboardingData.dailySugarGrams || 77;
    const savingsGoal = onboardingData.savingsGoal || 'Something amazing';
    const savingsGoalAmount = onboardingData.savingsGoalAmount || 500;

    // Map user's selected goals to readable reason statements
    const GOAL_TO_REASON: Record<string, string> = {
        cravings: 'Break free from sugar cravings',
        habits: 'Form healthier daily habits',
        energy: 'Better focus and mental clarity',
        health: 'Improved overall health',
        weight: 'Achieve your weight goals',
        skin: 'Clearer, healthier skin',
        focus: 'Enhanced focus and productivity',
        blood_sugar: 'Stable blood sugar levels',
        sleep: 'Improved sleep quality',
        savings: 'Save money for what matters',
    };

    // Get user's personalized reasons from their selected goals
    // Goals can be either goal IDs (from onboarding) or full text strings (from editing)
    const userGoals = onboardingData.goals || [];
    const reasons = userGoals.length > 0
        ? userGoals.map(goalOrText => GOAL_TO_REASON[goalOrText] || goalOrText).filter(Boolean)
        : ['Better focus and mental clarity', 'Stable blood sugar levels', 'Improved sleep quality'];

    useEffect(() => {
        // Calculate initial elapsed time
        const now = new Date();
        const elapsed = now.getTime() - startDate.getTime();
        setTimeElapsed(Math.max(0, elapsed));

        // Update every second
        intervalRef.current = setInterval(() => {
            const now = new Date();
            const elapsed = now.getTime() - startDate.getTime();
            setTimeElapsed(Math.max(0, elapsed));
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [startDate]);

    const duration = formatDuration(timeElapsed);
    const daysSugarFree = duration.days;

    // Calculate savings and sugar avoided
    const moneySavedCents = Math.floor((timeElapsed / (1000 * 60 * 60 * 24)) * dailySpendingCents);
    const moneySaved = (moneySavedCents / 100).toFixed(2);
    const sugarAvoided = Math.floor((timeElapsed / (1000 * 60 * 60 * 24)) * dailySugarGrams);

    const handlePanicButton = () => {
        setShowPanicModal(true);
    };

    const handleCheckIn = () => {
        if (hasCheckedInToday) {
            // Show status modal instead of check-in modal
            setShowCheckInStatusModal(true);
        } else {
            setShowCheckInModal(true);
            setCheckInResult(null);
        }
    };

    const handleResetCheckIn = async () => {
        // Close status modal and open check-in modal to re-do
        setShowCheckInStatusModal(false);
        setShowCheckInModal(true);
        setCheckInResult(null);
    };

    const handleCheckInSubmit = async (sugarFree: boolean, extras?: any) => {
        try {
            const today = new Date();

            // Extract grams from extras if present (for gradual plan)
            const grams = extras?.sugarGrams;

            // Record the check-in with grams
            await recordCheckInForDate(today, sugarFree, grams);

            setShowCheckInModal(false);
            setCheckInResult(sugarFree ? 'success' : 'reset');

            // Auto-hide result after 3 seconds
            setTimeout(() => {
                setCheckInResult(null);
            }, 3000);
        } catch (error) {
            console.error('Failed to submit check-in:', error);
            setShowCheckInModal(false);
        }
    };

    const handleSugarFree = async () => {
        await recordCheckIn(true);
        setCheckInResult('success');
    };

    const handleHadSugar = async () => {
        await resetStreak();
        setCheckInResult('reset');
    };

    const hasCheckedInToday = !!todayCheckIn || !!checkInHistory[new Date().toISOString().split('T')[0]];

    // Get plan guidance
    const planType = (onboardingData.plan || 'cold_turkey') as PlanType;
    const guidance = getTodayGuidance(planType, startDate);

    // Get daily limit for gradual plan  
    const currentWeek = getCurrentWeek(startDate); // Only takes startDate
    const planDetails = getPlanDetails(planType);
    const dailyLimit = planType === 'gradual' && currentWeek <= planDetails.weeklyLimits.length
        ? planDetails.weeklyLimits[currentWeek - 1].dailyGrams
        : 0;

    // Handle check-in for a specific date from calendar
    const handleDayPress = (date: Date) => {
        setSelectedDate(date);
        setShowCheckInModal(true);
        setCheckInResult(null);
    };

    const handleDateCheckIn = async (sugarFree: boolean) => {
        if (selectedDate) {
            await recordCheckInForDate(selectedDate, sugarFree);
            setCheckInResult(sugarFree ? 'success' : 'reset');
        }
    };

    // Open edit savings modal
    const handleEditSavings = () => {
        setEditSavingsGoal(savingsGoal);
        setShowEditSavingsModal(true);
    };

    // Save savings goal
    const handleSaveSavingsGoal = async () => {
        if (editSavingsGoal.trim()) {
            await updateOnboardingData({ savingsGoal: editSavingsGoal.trim() });
            setShowEditSavingsModal(false);
        }
    };

    // Open edit reasons modal
    const handleEditReasons = () => {
        setEditReasons(reasons);
        setShowEditReasonsModal(true);
    };

    // Save reasons
    const handleSaveReasons = async () => {
        const filteredReasons = editReasons.filter(r => r.trim());
        if (filteredReasons.length > 0) {
            await updateOnboardingData({ goals: filteredReasons });
            setShowEditReasonsModal(false);
        }
    };

    // Update a single reason in the edit list
    const updateReason = (index: number, value: string) => {
        const newReasons = [...editReasons];
        newReasons[index] = value;
        setEditReasons(newReasons);
    };

    // Add new reason
    const addReason = () => {
        setEditReasons([...editReasons, '']);
    };

    // Remove reason
    const removeReason = (index: number) => {
        setEditReasons(editReasons.filter((_, i) => i !== index));
    };

    return (
        <SwipeableTabView currentTab="Home">
            <LooviBackground variant="coralTop">
                <SafeAreaView style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Main Timer Section - No card background */}
                        <View style={styles.timerSection}>
                            {/* Streak Badge - Above Number */}
                            <View style={styles.streakBadge}>
                                <Text style={styles.streakText}>🔥 Sugar-free streak</Text>
                            </View>

                            <Text style={styles.daysNumber}>{daysSugarFree}</Text>
                            <Text style={styles.daysLabel}>days</Text>

                            {/* Live Timer */}
                            <View style={styles.liveTimer}>
                                <View style={styles.timerUnit}>
                                    <Text style={styles.timerValue}>
                                        {String(duration.hours).padStart(2, '0')}
                                    </Text>
                                    <Text style={styles.timerLabel}>hrs</Text>
                                </View>
                                <Text style={styles.timerSeparator}>:</Text>
                                <View style={styles.timerUnit}>
                                    <Text style={styles.timerValue}>
                                        {String(duration.minutes).padStart(2, '0')}
                                    </Text>
                                    <Text style={styles.timerLabel}>min</Text>
                                </View>
                                <Text style={styles.timerSeparator}>:</Text>
                                <View style={styles.timerUnit}>
                                    <Text style={styles.timerValue}>
                                        {String(duration.seconds).padStart(2, '0')}
                                    </Text>
                                    <Text style={styles.timerLabel}>sec</Text>
                                </View>
                            </View>

                            {/* Separator Line */}
                            <View style={styles.separatorLine} />
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            {/* Money Saved */}
                            <GlassCard variant="light" padding="md" style={styles.statCard}>
                                <Text style={styles.statEmoji}>💰</Text>
                                <Text style={styles.statValue}>${moneySaved}</Text>
                                <Text style={styles.statLabel}>saved</Text>
                            </GlassCard>

                            {/* Sugar Avoided */}
                            <GlassCard variant="light" padding="md" style={styles.statCard}>
                                <Text style={styles.statEmoji}>🍬</Text>
                                <Text style={styles.statValue}>{sugarAvoided}g</Text>
                                <Text style={styles.statLabel}>avoided</Text>
                            </GlassCard>
                        </View>

                        {/* Week Calendar Strip */}
                        <WeekStrip
                            checkIns={checkInHistory}
                            onDayPress={handleDayPress}
                            startDate={startDate}
                        />

                        {/* Action Row: Check-in + Panic Button */}
                        <View style={styles.actionRow}>
                            {/* Daily Check-in */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleCheckIn}
                                style={styles.actionButton}
                            >
                                <GlassCard
                                    variant="light"
                                    padding="sm"
                                    style={{
                                        ...styles.actionCard,
                                        ...(hasCheckedInToday && styles.checkInCardDone),
                                    }}
                                >
                                    <View style={styles.actionContent}>
                                        <Text style={styles.actionEmoji}>✅</Text>
                                        <View style={styles.actionTextContainer}>
                                            <Text style={styles.actionTitle}>Daily Check-in</Text>
                                            <Text style={styles.actionSubtitle}>
                                                {hasCheckedInToday ? 'Done ✓' : 'Log today'}
                                            </Text>
                                        </View>
                                    </View>
                                </GlassCard>
                            </TouchableOpacity>

                            {/* Panic Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handlePanicButton}
                                style={styles.actionButton}
                            >
                                <GlassCard variant="light" padding="sm" style={styles.actionCard}>
                                    <View style={styles.actionContent}>
                                        <Text style={styles.actionEmoji}>🆘</Text>
                                        <View style={styles.actionTextContainer}>
                                            <Text style={styles.actionTitle}>Craving sugar?</Text>
                                            <Text style={styles.actionSubtitle}>Get support</Text>
                                        </View>
                                    </View>
                                </GlassCard>
                            </TouchableOpacity>
                        </View>

                        {/* Plan Guidance Card */}
                        <GlassCard
                            variant="light"
                            padding="md"
                            style={styles.planGuidanceCard}
                        >
                            <View style={styles.planGuidanceHeader}>
                                <Text style={styles.planGuidanceEmoji}>
                                    {planType === 'cold_turkey' ? '🎯' : '📉'}
                                </Text>
                                <View style={styles.planGuidanceInfo}>
                                    <Text style={styles.planGuidanceTitle}>
                                        {planType === 'cold_turkey' ? 'Cold Turkey' : 'Gradual Reduction'}
                                    </Text>
                                    <Text style={styles.planGuidanceWeek}>
                                        {guidance.isComplete ? 'Maintenance mode' : `Week ${guidance.weekNumber}`}
                                    </Text>
                                </View>
                                {planType === 'gradual' && (
                                    <View style={styles.gramLimit}>
                                        <Text style={styles.gramLimitValue}>{guidance.limit}g</Text>
                                        <Text style={styles.gramLimitLabel}>daily limit</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.planGuidanceTip}>💡 {guidance.tip}</Text>

                            {/* My Plan Button */}
                            <TouchableOpacity
                                style={styles.myPlanButton}
                                onPress={() => setShowPlanDetails(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.myPlanButtonText}>📖 My Plan Details</Text>
                            </TouchableOpacity>
                        </GlassCard>

                        {/* Journal Widget - Always visible */}
                        <JournalWidget
                            entry={getLatestJournalEntry()}
                            onPress={() => navigation.navigate('Journal')}
                        />

                        {/* Your Reasons Section */}
                        <TouchableOpacity activeOpacity={0.8} onPress={handleEditReasons}>
                            <View style={styles.reasonsSection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Why you started</Text>
                                    <Text style={styles.editIcon}>✏️</Text>
                                </View>
                                <View style={styles.reasonsContainer}>
                                    {reasons.map((reason: string, index: number) => (
                                        <GlassCard key={index} variant="light" padding="md" style={styles.reasonCard}>
                                            <Text style={styles.reasonText}>{reason}</Text>
                                        </GlassCard>
                                    ))}
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Savings Goal - Now below Reasons */}
                        <TouchableOpacity activeOpacity={0.8} onPress={handleEditSavings}>
                            <GlassCard variant="light" padding="md" style={styles.goalCard}>
                                <View style={styles.goalHeader}>
                                    <Text style={styles.goalLabel}>Saving for</Text>
                                    <View style={styles.goalHeaderRight}>
                                        <Text style={styles.editIcon}>✏️</Text>
                                        <Text style={styles.goalEmoji}>✈️</Text>
                                    </View>
                                </View>
                                <Text style={styles.goalTitle}>{savingsGoal}</Text>
                                <View style={styles.goalProgress}>
                                    <View style={styles.goalProgressBar}>
                                        <View style={[styles.goalProgressFill, { width: `${Math.min((moneySavedCents / (savingsGoalAmount * 100)) * 100, 100)}%` }]} />
                                    </View>
                                    <Text style={styles.goalProgressText}>${moneySaved} / ${savingsGoalAmount} goal</Text>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Panic Modal */}
                    <Modal
                        visible={showPanicModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowPanicModal(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Take a breath</Text>
                                <Text style={styles.modalText}>
                                    This craving will pass in 15-20 minutes. Remember why you started:
                                </Text>
                                <View style={styles.modalReasons}>
                                    {reasons.slice(0, 2).map((reason: string, index: number) => (
                                        <Text key={index} style={styles.modalReason}>{reason}</Text>
                                    ))}
                                </View>
                                <View style={styles.modalStats}>
                                    <Text style={styles.modalStatText}>
                                        You've already saved <Text style={styles.modalHighlight}>${moneySaved}</Text>
                                    </Text>
                                    <Text style={styles.modalStatText}>
                                        And avoided <Text style={styles.modalHighlight}>{sugarAvoided}g</Text> of sugar
                                    </Text>
                                </View>
                                <Text style={styles.modalTip}>
                                    💡 Choose one of these strategies to help manage your craving:
                                </Text>

                                {/* Action Buttons */}
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.primaryButton]}
                                    onPress={() => {
                                        setShowPanicModal(false);
                                        navigation.navigate('Reasons');
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>💭 Remind Me Why Not</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.secondaryButton]}
                                    onPress={() => {
                                        setShowPanicModal(false);
                                        navigation.navigate('BreathingExercise');
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>🧘 Breathing Exercise</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.successButton]}
                                    onPress={() => setShowPanicModal(false)}
                                >
                                    <Text style={styles.modalButtonText}>I've got this 💪</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* Enhanced Check-in Modal */}
                    <CheckInModal
                        visible={showCheckInModal}
                        onClose={() => {
                            setShowCheckInModal(false);
                            setCheckInResult(null);
                        }}
                        onCheckIn={handleCheckInSubmit}
                        planType={(onboardingData.plan as 'cold_turkey' | 'gradual') || 'cold_turkey'}
                        startDate={startDate}
                    />

                    {/* Plan Details Modal */}
                    <PlanDetailsModal
                        visible={showPlanDetails}
                        planType={planType || 'cold_turkey'}
                        onClose={() => setShowPlanDetails(false)}
                    />

                    {/* Check-in Status Modal (when already checked in) */}
                    <Modal
                        visible={showCheckInStatusModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowCheckInStatusModal(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowCheckInStatusModal(false)}
                        >
                            <TouchableOpacity activeOpacity={1} style={styles.checkInStatusCard}>
                                <Text style={styles.checkInStatusEmoji}>✅</Text>
                                <Text style={styles.checkInStatusTitle}>Today's Check-In Complete</Text>

                                <View style={styles.checkInStatusInfo}>
                                    <Text style={styles.checkInStatusLabel}>You logged:</Text>
                                    <Text style={styles.checkInStatusValue}>
                                        {todayCheckIn?.sugarFree
                                            ? '🌟 Sugar-Free Day!'
                                            : '📊 Had Sugar'}
                                    </Text>
                                    {todayCheckIn?.grams !== undefined && (
                                        <Text style={styles.checkInStatusGrams}>
                                            {todayCheckIn.grams}g consumed
                                        </Text>
                                    )}
                                </View>

                                <Text style={styles.checkInStatusHint}>
                                    💡 Consider adding a journal entry to reflect on your day
                                </Text>

                                <View style={styles.checkInStatusButtons}>
                                    <TouchableOpacity
                                        style={styles.checkInStatusButton}
                                        onPress={() => {
                                            setShowCheckInStatusModal(false);
                                            navigation.navigate('Journal');
                                        }}
                                    >
                                        <Text style={styles.checkInStatusButtonText}>📝 Add Journal</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.checkInStatusButton, styles.checkInStatusButtonSecondary]}
                                        onPress={handleResetCheckIn}
                                    >
                                        <Text style={[styles.checkInStatusButtonText, styles.checkInStatusButtonTextSecondary]}>
                                            🔄 Change Check-In
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.checkInStatusCloseButton}
                                    onPress={() => setShowCheckInStatusModal(false)}
                                >
                                    <Text style={styles.checkInStatusCloseText}>Close</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>

                    {/* Edit Savings Goal Modal */}
                    <Modal
                        visible={showEditSavingsModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowEditSavingsModal(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowEditSavingsModal(false)}
                        >
                            <TouchableOpacity activeOpacity={1} style={styles.editModalContent}>
                                <Text style={styles.editModalTitle}>What are you saving for?</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={editSavingsGoal}
                                    onChangeText={setEditSavingsGoal}
                                    placeholder="e.g., A vacation, New phone..."
                                    placeholderTextColor={looviColors.text.muted}
                                />
                                <View style={styles.editModalButtons}>
                                    <TouchableOpacity
                                        style={styles.editCancelButton}
                                        onPress={() => setShowEditSavingsModal(false)}
                                    >
                                        <Text style={styles.editCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.editSaveButton}
                                        onPress={handleSaveSavingsGoal}
                                    >
                                        <Text style={styles.editSaveText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>

                    {/* Edit Reasons Modal */}
                    <Modal
                        visible={showEditReasonsModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowEditReasonsModal(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowEditReasonsModal(false)}
                        >
                            <TouchableOpacity activeOpacity={1} style={styles.editModalContent}>
                                <Text style={styles.editModalTitle}>Why you started</Text>
                                <ScrollView style={{ maxHeight: 300 }}>
                                    {editReasons.map((reason, index) => (
                                        <View key={index} style={styles.reasonEditRow}>
                                            <TextInput
                                                style={styles.reasonEditInput}
                                                value={reason}
                                                onChangeText={(text) => updateReason(index, text)}
                                                placeholder="Your reason..."
                                                placeholderTextColor={looviColors.text.muted}
                                            />
                                            <TouchableOpacity
                                                style={styles.removeReasonButton}
                                                onPress={() => removeReason(index)}
                                            >
                                                <Text style={styles.removeReasonText}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity style={styles.addReasonButton} onPress={addReason}>
                                    <Text style={styles.addReasonText}>+ Add another reason</Text>
                                </TouchableOpacity>
                                <View style={styles.editModalButtons}>
                                    <TouchableOpacity
                                        style={styles.editCancelButton}
                                        onPress={() => setShowEditReasonsModal(false)}
                                    >
                                        <Text style={styles.editCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.editSaveButton}
                                        onPress={handleSaveReasons}
                                    >
                                        <Text style={styles.editSaveText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    topCheckInWrapper: {
        marginBottom: spacing.md,
    },
    topCheckInCard: {
        borderWidth: 2,
        borderColor: looviColors.accent.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
    },
    timerCard: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    daysNumber: {
        fontSize: 56,
        fontWeight: '800',
        color: looviColors.text.primary,
        letterSpacing: -2,
    },
    daysLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: looviColors.text.secondary,
        marginTop: -spacing.xs,
    },
    liveTimer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    timerUnit: {
        alignItems: 'center',
        minWidth: 50,
    },
    timerValue: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textTransform: 'uppercase',
    },
    timerSeparator: {
        fontSize: 18,
        fontWeight: '300',
        color: looviColors.text.tertiary,
        marginHorizontal: 2,
    },
    timerSection: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        marginBottom: spacing.md,
    },
    streakBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 16,
        marginBottom: spacing.md,
        alignSelf: 'center',
    },
    streakText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#D97706',
    },
    separatorLine: {
        width: '80%',
        height: 1,
        backgroundColor: 'rgba(217, 123, 102, 0.3)',
        marginTop: spacing.lg,
    },
    // Action Row Styles
    actionRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flex: 1,
    },
    actionCard: {
        minHeight: 70,
    },
    checkInCardDone: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 2,
        borderColor: looviColors.accent.success,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    actionEmoji: {
        fontSize: 24,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    actionSubtitle: {
        fontSize: 11,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statEmoji: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    goalCard: {
        marginBottom: spacing.lg,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    goalLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    goalEmoji: {
        fontSize: 20,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.md,
    },
    goalProgress: {
        gap: spacing.xs,
    },
    goalProgressBar: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    goalProgressFill: {
        height: '100%',
        backgroundColor: looviColors.accent.success,
        borderRadius: 4,
    },
    goalProgressText: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    panicCard: {
        marginBottom: spacing.lg,
    },
    panicContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    panicEmoji: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    panicTextContainer: {
        flex: 1,
    },
    panicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    panicSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    reasonsSection: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.md,
    },
    reasonsContainer: {
        gap: spacing.sm,
    },
    reasonCard: {},
    reasonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reasonNumberContainer: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: looviColors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    reasonNumber: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    reasonText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.secondary,
        flex: 1,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.screen.horizontal,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    modalText: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    modalReasons: {
        marginBottom: spacing.md,
    },
    modalReason: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginBottom: spacing.xs,
    },
    modalStats: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    modalStatText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    modalHighlight: {
        fontWeight: '700',
        color: looviColors.accent.success,
    },
    modalTip: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.accent.primary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    modalButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Check-in Button Card Styles
    checkInCard: {
        marginTop: spacing.md,
        borderColor: looviColors.accent.success,
        borderWidth: 1,
    },
    checkInContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkInEmoji: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    checkInTextContainer: {
        flex: 1,
    },
    checkInTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    checkInSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    checkInBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: looviColors.accent.success,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkInBadgeDone: {
        backgroundColor: looviColors.accent.primary,
    },
    checkInBadgeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Check-in Modal Styles
    checkInButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    checkInSuccessButton: {
        flex: 1,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: looviColors.accent.success,
    },
    checkInResetButton: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    checkInButtonEmoji: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    checkInButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.accent.success,
    },
    checkInButtonTextSecondary: {
        fontSize: 15,
        fontWeight: '500',
        color: looviColors.text.secondary,
    },
    checkInCancelButton: {
        padding: spacing.md,
    },
    checkInCancelText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    successEmoji: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    streakMessage: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.accent.success,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    resetMessage: {
        fontSize: 15,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: spacing.xl,
    },
    // Plan Guidance Card Styles
    planGuidanceCard: {
        marginBottom: spacing.lg,
    },
    planGuidanceGradual: {
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
    },
    planGuidanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    planGuidanceEmoji: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    planGuidanceInfo: {
        flex: 1,
    },
    planGuidanceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    planGuidanceWeek: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.accent.primary,
        marginTop: 2,
    },
    gramLimit: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    gramLimitValue: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.accent.primary,
    },
    gramLimitLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    planGuidanceTip: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 18,
    },
    myPlanButton: {
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    myPlanButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.accent.primary,
    },
    primaryButton: {
        backgroundColor: looviColors.accent.primary,
        marginBottom: spacing.md,
    },
    secondaryButton: {
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        marginBottom: spacing.md,
    },
    successButton: {
        backgroundColor: looviColors.accent.success,
    },
    // Check-in Status Modal Styles
    checkInStatusCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: spacing.xl,
        marginHorizontal: spacing.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    checkInStatusEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    checkInStatusTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    checkInStatusInfo: {
        backgroundColor: 'rgba(127, 176, 105, 0.1)',
        borderRadius: 16,
        padding: spacing.md,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    checkInStatusLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginBottom: spacing.xs,
    },
    checkInStatusValue: {
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    checkInStatusGrams: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.secondary,
        marginTop: spacing.xs,
    },
    checkInStatusHint: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontStyle: 'italic',
    },
    checkInStatusButtons: {
        width: '100%',
        gap: spacing.sm,
    },
    checkInStatusButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    checkInStatusButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: looviColors.text.muted,
    },
    checkInStatusButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    checkInStatusButtonTextSecondary: {
        color: looviColors.text.secondary,
    },
    checkInStatusCloseButton: {
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
    },
    checkInStatusCloseText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.muted,
    },
    // Edit functionality styles
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    editIcon: {
        fontSize: 14,
        opacity: 0.6,
    },
    goalHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    // Edit Modal Styles
    editModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: spacing.xl,
        marginHorizontal: spacing.lg,
        maxHeight: '80%',
    },
    editModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    editInput: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        padding: spacing.md,
        fontSize: 16,
        color: looviColors.text.primary,
        marginBottom: spacing.md,
    },
    reasonEditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        gap: spacing.sm,
    },
    reasonEditInput: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        padding: spacing.md,
        fontSize: 15,
        color: looviColors.text.primary,
    },
    removeReasonButton: {
        padding: spacing.sm,
    },
    removeReasonText: {
        fontSize: 18,
        color: looviColors.accent.error,
    },
    addReasonButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        marginBottom: spacing.lg,
    },
    addReasonText: {
        fontSize: 15,
        fontWeight: '500',
        color: looviColors.accent.primary,
    },
    editModalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    editCancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    editCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    editSaveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: looviColors.accent.primary,
    },
    editSaveText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
