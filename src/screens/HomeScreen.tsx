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
import JournalEntryModal from '../components/JournalEntryModal';
import FoodScannerModal from '../components/FoodScannerModal';
import { getTodayGuidance, PlanType, getPlanDetails, getCurrentWeek } from '../utils/planUtils';
import { PlanProgressBar } from '../components/PlanProgressBar';
import { WellnessTracker, WellnessData } from '../components/WellnessTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppIcon } from '../components/OnboardingIcon';
import { getScannedItems, ScannedItem } from '../services/scannerService';
import {
    aggregateHealthData,
    WellnessMetrics as HealthWellnessMetrics,
} from '../services/healthScoringService';

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
    const [showPledgeModal, setShowPledgeModal] = useState(false);
    const [hasPledgedToday, setHasPledgedToday] = useState(false);
    const [wellnessAverages, setWellnessAverages] = useState<WellnessData | null>(null);
    const [hasFoodLoggedToday, setHasFoodLoggedToday] = useState(false);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [showJournalModal, setShowJournalModal] = useState(false);
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [showFoodScannerModal, setShowFoodScannerModal] = useState(false);
    const [showWellnessModal, setShowWellnessModal] = useState(false);
    const [wellnessMood, setWellnessMood] = useState(3);
    const [wellnessEnergy, setWellnessEnergy] = useState(3);
    const [wellnessFocus, setWellnessFocus] = useState(3);
    const [wellnessSleep, setWellnessSleep] = useState(7);
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
        addJournalEntry,
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

    // Load 7-day wellness averages with real date-based filtering
    // Refresh when wellness modal is closed
    useEffect(() => {
        const loadWellnessAverages = async () => {
            try {
                const [stored, foodItems] = await Promise.all([
                    AsyncStorage.getItem('wellness_logs'),
                    getScannedItems(),
                ]);

                setScannedItems(foodItems);

                if (stored) {
                    const logs = JSON.parse(stored);

                    // Filter last 7 days by actual date
                    const cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - 7);

                    const recentLogs = logs.filter((log: any) =>
                        new Date(log.date) >= cutoffDate
                    );

                    if (recentLogs.length > 0) {
                        const avgMood = recentLogs.reduce((sum: number, l: any) => sum + l.mood, 0) / recentLogs.length;
                        const avgEnergy = recentLogs.reduce((sum: number, l: any) => sum + l.energy, 0) / recentLogs.length;
                        const avgFocus = recentLogs.reduce((sum: number, l: any) => sum + l.focus, 0) / recentLogs.length;
                        const avgSleep = recentLogs.reduce((sum: number, l: any) => sum + l.sleepHours, 0) / recentLogs.length;
                        setWellnessAverages({
                            mood: avgMood,
                            energy: avgEnergy,
                            focus: avgFocus,
                            sleep: avgSleep,
                        });
                    } else {
                        setWellnessAverages(null);
                    }
                } else {
                    setWellnessAverages(null);
                }
            } catch (error) {
                console.error('Error loading wellness averages:', error);
                setWellnessAverages(null);
            }
        };
        loadWellnessAverages();
    }, [showWellnessModal]); // Reload when wellness modal closes

    // Check if food has been logged today
    useEffect(() => {
        const checkFoodLogged = async () => {
            try {
                const items = await getScannedItems();
                const today = new Date().toISOString().split('T')[0];
                const hasLoggedToday = items.some(item =>
                    item.timestamp.split('T')[0] === today
                );
                setHasFoodLoggedToday(hasLoggedToday);
            } catch (error) {
                console.error('Error checking food log:', error);
            }
        };
        checkFoodLogged();
    }, []);

    const duration = formatDuration(timeElapsed);
    const daysSugarFree = duration.days;

    // Calculate savings and sugar avoided
    const moneySavedCents = Math.floor((timeElapsed / (1000 * 60 * 60 * 24)) * dailySpendingCents);
    const moneySaved = (moneySavedCents / 100).toFixed(2);
    const sugarAvoided = Math.floor((timeElapsed / (1000 * 60 * 60 * 24)) * dailySugarGrams);

    const handlePanicButton = () => {
        setShowPanicModal(true);
    };

    const handleWellnessSave = async () => {
        try {
            const log = {
                date: new Date().toISOString().split('T')[0],
                mood: wellnessMood,
                energy: wellnessEnergy,
                focus: wellnessFocus,
                sleepHours: wellnessSleep,
            };
            const stored = await AsyncStorage.getItem('wellness_logs');
            const logs = stored ? JSON.parse(stored) : [];
            const existingIndex = logs.findIndex((l: any) => l.date === log.date);

            if (existingIndex >= 0) {
                logs[existingIndex] = log;
            } else {
                logs.unshift(log);
            }

            await AsyncStorage.setItem('wellness_logs', JSON.stringify(logs));
            setShowWellnessModal(false);
        } catch (error) {
            console.error('Failed to save wellness log:', error);
        }
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
                                <View style={styles.streakRow}>
                                    <AppIcon emoji="🔥" size={16} />
                                    <Text style={styles.streakText}> Sugar-free streak</Text>
                                </View>
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

                        {/* Plan Progress Bar */}
                        <PlanProgressBar
                            daysSinceStart={daysSugarFree}
                            planDuration={planType === 'cold_turkey' ? 30 : 42}
                            endDate={new Date(startDate.getTime() + (planType === 'cold_turkey' ? 30 : 42) * 24 * 60 * 60 * 1000)}
                        />

                        {/* Action Buttons: Pledge, Logging, Journal */}
                        <View style={styles.actionRow}>
                            {/* Pledge Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setShowPledgeModal(true)}
                                style={styles.tripleActionButton}
                            >
                                <GlassCard variant="light" padding="sm" style={[styles.tripleActionCard, { backgroundColor: hasPledgedToday ? 'rgba(34, 197, 94, 0.15)' : 'rgba(217, 123, 102, 0.15)' }]}>
                                    <AppIcon emoji={hasPledgedToday ? "✅" : "🤝"} size={24} />
                                    <Text style={[styles.tripleActionLabel, hasPledgedToday && { color: '#22C55E' }]}>
                                        {hasPledgedToday ? 'Pledged' : 'Pledge'}
                                    </Text>
                                </GlassCard>
                            </TouchableOpacity>

                            {/* Track Button - Quick Log access */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setShowTrackModal(true)}
                                style={styles.tripleActionButton}
                            >
                                <GlassCard variant="light" padding="sm" style={[styles.tripleActionCard, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                                    <AppIcon emoji="📊" size={24} />
                                    <Text style={styles.tripleActionLabel}>Track</Text>
                                </GlassCard>
                            </TouchableOpacity>

                            {/* Journal Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setShowJournalModal(true)}
                                style={styles.tripleActionButton}
                            >
                                <GlassCard variant="light" padding="sm" style={[styles.tripleActionCard, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                    <AppIcon emoji="📓" size={24} />
                                    <Text style={styles.tripleActionLabel}>Journal</Text>
                                </GlassCard>
                            </TouchableOpacity>
                        </View>

                        {/* 7-Day Wellness Averages */}
                        {wellnessAverages && <WellnessTracker averages={wellnessAverages} />}


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
                                            navigation.navigate('Track', { tab: 'journal' });
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



                    {/* Pledge Modal */}
                    <Modal
                        visible={showPledgeModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowPledgeModal(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowPledgeModal(false)}
                        >
                            <TouchableOpacity activeOpacity={1} style={styles.pledgeModalContent}>
                                <View style={styles.pledgeEmojiContainer}>
                                    <AppIcon emoji="🤝" size={48} />
                                </View>
                                <Text style={styles.pledgeTitle}>Make Your Pledge</Text>
                                <Text style={styles.pledgeDescription}>
                                    Today, I commit to being sugar-free. One day at a time, I'm building a healthier future for myself.
                                </Text>

                                {hasPledgedToday ? (
                                    <View style={styles.pledgeCompletedContainer}>
                                        <AppIcon emoji="✅" size={24} />
                                        <Text style={styles.pledgeCompletedText}>You've made your pledge today!</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.pledgeButton}
                                        onPress={() => {
                                            setHasPledgedToday(true);
                                            setTimeout(() => setShowPledgeModal(false), 1000);
                                        }}
                                    >
                                        <Text style={styles.pledgeButtonText}>I Pledge to Stay Sugar-Free</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={styles.pledgeSecondaryButton}
                                    onPress={() => navigation.navigate('Reasons')}
                                >
                                    <Text style={styles.pledgeSecondaryText}>View My Reasons</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>

                    {/* Journal Entry Modal */}
                    <JournalEntryModal
                        visible={showJournalModal}
                        onClose={() => setShowJournalModal(false)}
                        onSave={async (entry) => {
                            await addJournalEntry(new Date(), entry);
                            setShowJournalModal(false);
                        }}
                    />

                    {/* Track Options Modal */}
                    <Modal
                        visible={showTrackModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowTrackModal(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowTrackModal(false)}
                        >
                            <TouchableOpacity activeOpacity={1} style={styles.trackModalContent}>
                                <Text style={styles.trackModalTitle}>Quick Track</Text>
                                <Text style={styles.trackModalSubtitle}>What would you like to log?</Text>

                                <TouchableOpacity
                                    style={styles.trackOptionButton}
                                    onPress={() => {
                                        setShowTrackModal(false);
                                        setShowFoodScannerModal(true);
                                    }}
                                >
                                    <AppIcon emoji="🍎" size={32} />
                                    <View style={styles.trackOptionText}>
                                        <Text style={styles.trackOptionTitle}>What have you eaten?</Text>
                                        <Text style={styles.trackOptionSubtitle}>Scan or log your food</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.trackOptionButton}
                                    onPress={() => {
                                        setShowTrackModal(false);
                                        setShowWellnessModal(true);
                                    }}
                                >
                                    <AppIcon emoji="💭" size={32} />
                                    <View style={styles.trackOptionText}>
                                        <Text style={styles.trackOptionTitle}>How are you feeling?</Text>
                                        <Text style={styles.trackOptionSubtitle}>Log your wellness</Text>
                                    </View>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>

                    {/* Food Scanner Modal */}
                    <FoodScannerModal
                        visible={showFoodScannerModal}
                        onClose={() => setShowFoodScannerModal(false)}
                        onScanComplete={() => {
                            setShowFoodScannerModal(false);
                            // Refresh food logged status
                            getScannedItems().then(items => {
                                const today = new Date().toISOString().split('T')[0];
                                const hasLoggedToday = items.some(item =>
                                    item.timestamp.split('T')[0] === today
                                );
                                setHasFoodLoggedToday(hasLoggedToday);
                            });
                        }}
                    />

                    {/* Wellness Modal */}
                    <Modal
                        visible={showWellnessModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowWellnessModal(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.wellnessModalContent}>
                                <TouchableOpacity
                                    style={styles.wellnessCloseButton}
                                    onPress={() => setShowWellnessModal(false)}
                                >
                                    <Text style={styles.wellnessCloseText}>✕</Text>
                                </TouchableOpacity>

                                <Text style={styles.wellnessTitle}>How are you feeling?</Text>
                                <Text style={styles.wellnessSubtitle}>Rate your wellness today</Text>

                                <ScrollView showsVerticalScrollIndicator={false} style={styles.wellnessScrollView}>
                                    {/* Mood */}
                                    <View style={styles.wellnessScaleContainer}>
                                        <View style={styles.wellnessScaleHeader}>
                                            <AppIcon emoji="😊" size={20} />
                                            <Text style={styles.wellnessScaleLabel}>Mood</Text>
                                        </View>
                                        <View style={styles.wellnessScaleButtons}>
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <TouchableOpacity
                                                    key={n}
                                                    style={[
                                                        styles.wellnessScaleButton,
                                                        wellnessMood === n && styles.wellnessScaleButtonActive
                                                    ]}
                                                    onPress={() => setWellnessMood(n)}
                                                >
                                                    <Text style={[
                                                        styles.wellnessScaleButtonText,
                                                        wellnessMood === n && styles.wellnessScaleButtonTextActive
                                                    ]}>{n}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Energy */}
                                    <View style={styles.wellnessScaleContainer}>
                                        <View style={styles.wellnessScaleHeader}>
                                            <AppIcon emoji="⚡" size={20} />
                                            <Text style={styles.wellnessScaleLabel}>Energy</Text>
                                        </View>
                                        <View style={styles.wellnessScaleButtons}>
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <TouchableOpacity
                                                    key={n}
                                                    style={[
                                                        styles.wellnessScaleButton,
                                                        wellnessEnergy === n && styles.wellnessScaleButtonActive
                                                    ]}
                                                    onPress={() => setWellnessEnergy(n)}
                                                >
                                                    <Text style={[
                                                        styles.wellnessScaleButtonText,
                                                        wellnessEnergy === n && styles.wellnessScaleButtonTextActive
                                                    ]}>{n}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Focus */}
                                    <View style={styles.wellnessScaleContainer}>
                                        <View style={styles.wellnessScaleHeader}>
                                            <AppIcon emoji="🧠" size={20} />
                                            <Text style={styles.wellnessScaleLabel}>Focus</Text>
                                        </View>
                                        <View style={styles.wellnessScaleButtons}>
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <TouchableOpacity
                                                    key={n}
                                                    style={[
                                                        styles.wellnessScaleButton,
                                                        wellnessFocus === n && styles.wellnessScaleButtonActive
                                                    ]}
                                                    onPress={() => setWellnessFocus(n)}
                                                >
                                                    <Text style={[
                                                        styles.wellnessScaleButtonText,
                                                        wellnessFocus === n && styles.wellnessScaleButtonTextActive
                                                    ]}>{n}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Sleep */}
                                    <View style={styles.wellnessScaleContainer}>
                                        <View style={styles.wellnessScaleHeader}>
                                            <AppIcon emoji="😴" size={20} />
                                            <Text style={styles.wellnessScaleLabel}>Hours of Sleep</Text>
                                        </View>
                                        <View style={styles.wellnessSleepButtons}>
                                            {[5, 6, 7, 8, 9, 10].map(h => (
                                                <TouchableOpacity
                                                    key={h}
                                                    style={[
                                                        styles.wellnessSleepButton,
                                                        wellnessSleep === h && styles.wellnessSleepButtonActive
                                                    ]}
                                                    onPress={() => setWellnessSleep(h)}
                                                >
                                                    <Text style={[
                                                        styles.wellnessSleepButtonText,
                                                        wellnessSleep === h && styles.wellnessSleepButtonTextActive
                                                    ]}>{h}h</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </ScrollView>

                                <TouchableOpacity
                                    style={styles.wellnessSaveButton}
                                    onPress={handleWellnessSave}
                                >
                                    <Text style={styles.wellnessSaveButtonText}>Save How I'm Feeling</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    // Triple Action Buttons (Pledge, Logging, Journal)
    tripleActionButton: {
        flex: 1,
    },
    tripleActionCard: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    tripleActionEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    tripleActionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    // Pledge Modal styles
    pledgeModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    pledgeEmojiContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(217, 123, 102, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    pledgeTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    pledgeDescription: {
        fontSize: 15,
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    pledgeCompletedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    pledgeCompletedText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22C55E',
    },
    pledgeButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 16,
        paddingHorizontal: spacing.xl,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.md,
        shadowColor: looviColors.coralOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    pledgeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    pledgeSecondaryButton: {
        paddingVertical: spacing.sm,
    },
    pledgeSecondaryText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.accent.primary,
    },
    // Track Modal Styles
    trackModalContent: {
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
    trackModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    trackModalSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    trackOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
    },
    trackOptionText: {
        marginLeft: spacing.md,
        flex: 1,
    },
    trackOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    trackOptionSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    // Wellness Modal Styles
    wellnessModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    wellnessCloseButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    wellnessCloseText: {
        fontSize: 20,
        color: looviColors.text.tertiary,
    },
    wellnessTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    wellnessSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    wellnessScrollView: {
        maxHeight: 400,
    },
    wellnessScaleContainer: {
        marginBottom: spacing.lg,
    },
    wellnessScaleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    wellnessScaleLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginLeft: spacing.sm,
    },
    wellnessScaleButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    wellnessScaleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
    },
    wellnessScaleButtonActive: {
        backgroundColor: looviColors.accent.primary,
    },
    wellnessScaleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    wellnessScaleButtonTextActive: {
        color: '#FFFFFF',
    },
    wellnessSleepButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    wellnessSleepButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    wellnessSleepButtonActive: {
        backgroundColor: looviColors.accent.primary,
    },
    wellnessSleepButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    wellnessSleepButtonTextActive: {
        color: '#FFFFFF',
    },
    wellnessSaveButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 14,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    wellnessSaveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
