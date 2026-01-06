/**
 * TrackingScreen
 * 
 * Redesigned tracking screen focused on food and wellness logging.
 * Features:
 * - Two big action buttons (Food & Feelings)
 * - Food calendar with color-coded days
 * - Selected day's food list + journal entries
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, Feather } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { AppIcon } from '../components/OnboardingIcon';
import FoodScannerModal from '../components/FoodScannerModal';
import { FoodCalendar } from '../components/FoodCalendar';
import { FoodLogList } from '../components/FoodLogList';
import { FoodItemModal } from '../components/FoodItemModal';
import JournalEntryModal from '../components/JournalEntryModal';
import {
    getScannedItems,
    getFoodCountsByDate,
    getScannedItemsForDate,
    saveScannedItem,
    generateScanId,
    ScannedItem,
} from '../services/scannerService';
import { useUserData, JournalEntry } from '../context/UserDataContext';
import { SwipeableTabView } from '../components/SwipeableTabView';
import { healthService } from '../services/healthService';

const WELLNESS_LOGS_KEY = 'wellness_logs';

interface WellnessLog {
    date: string;
    mood: number;
    energy: number;
    focus: number;
    sleepHours: number;
}

// Wellness Modal Component
function WellnessModal({
    visible,
    onClose,
    onSave,
    selectedDate,
    existingData
}: {
    visible: boolean;
    onClose: () => void;
    onSave: (log: WellnessLog) => void;
    selectedDate: string;
    existingData?: WellnessLog | null;
}) {
    const [mood, setMood] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [focus, setFocus] = useState(3);
    const [sleepHours, setSleepHours] = useState(7);

    // Reset or prefill values when modal opens
    useEffect(() => {
        if (visible) {
            if (existingData) {
                // Editing existing data - prefill with existing values
                setMood(existingData.mood);
                setEnergy(existingData.energy);
                setFocus(existingData.focus);
                setSleepHours(existingData.sleepHours);
            } else {
                // Adding new data - reset to defaults
                setMood(3);
                setEnergy(3);
                setFocus(3);
                setSleepHours(7);
            }
        }
    }, [visible, existingData]);

    const handleSave = () => {
        onSave({
            date: selectedDate,
            mood,
            energy,
            focus,
            sleepHours,
        });
        onClose();
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const isFutureDate = selectedDate > new Date().toISOString().split('T')[0];
    const dateFormatted = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    // Generate sleep hour options (4 to 11 in 0.5 increments)
    const sleepOptions: number[] = [];
    for (let h = 4; h <= 11; h += 0.5) {
        sleepOptions.push(h);
    }

    const ScaleSelector = ({
        label,
        value,
        onChange,
        iconName
    }: {
        label: string;
        value: number;
        onChange: (v: number) => void;
        iconName: keyof typeof Ionicons.glyphMap;
    }) => (
        <View style={wellnessStyles.scaleContainer}>
            <View style={wellnessStyles.scaleHeader}>
                <Ionicons name={iconName} size={20} color={looviColors.accent.primary} style={wellnessStyles.scaleIcon} />
                <Text style={wellnessStyles.scaleLabel}>{label}</Text>
            </View>
            <View style={wellnessStyles.scaleButtons}>
                {[1, 2, 3, 4, 5].map(n => (
                    <TouchableOpacity
                        key={n}
                        style={[
                            wellnessStyles.scaleButton,
                            value === n && wellnessStyles.scaleButtonActive
                        ]}
                        onPress={() => onChange(n)}
                    >
                        <Text style={[
                            wellnessStyles.scaleButtonText,
                            value === n && wellnessStyles.scaleButtonTextActive
                        ]}>{n}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    if (!visible) return null;

    return (
        <View style={wellnessStyles.overlay}>
            <View style={wellnessStyles.modal}>
                <TouchableOpacity style={wellnessStyles.closeButton} onPress={onClose}>
                    <Text style={wellnessStyles.closeText}>✕</Text>
                </TouchableOpacity>

                <Text style={wellnessStyles.title}>How are you feeling?</Text>
                <Text style={wellnessStyles.subtitle}>
                    {isFutureDate
                        ? "⚠️ Can't log for future dates"
                        : isToday
                            ? 'Rate your wellness today'
                            : `Logging for ${dateFormatted}`}
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <ScaleSelector label="Mood" value={mood} onChange={setMood} iconName="happy-outline" />
                    <ScaleSelector label="Energy" value={energy} onChange={setEnergy} iconName="flash-outline" />
                    <ScaleSelector label="Focus" value={focus} onChange={setFocus} iconName="bulb-outline" />

                    <View style={wellnessStyles.sleepSection}>
                        <View style={wellnessStyles.sleepHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="bed-outline" size={20} color={looviColors.accent.primary} style={wellnessStyles.scaleIcon} />
                                <Text style={wellnessStyles.scaleLabel}>Hours of Sleep</Text>
                            </View>
                            <TouchableOpacity
                                onPress={async () => {
                                    try {
                                        const sleepHrs = await healthService.getTodaySleep();
                                        if (sleepHrs > 0) {
                                            const rounded = Math.round(sleepHrs * 2) / 2;
                                            setSleepHours(rounded);
                                            Alert.alert('Synced', `Updated sleep to ${rounded} hours from Health data.`);
                                        } else {
                                            Alert.alert('No Data', 'No sleep data found in Health app.');
                                        }
                                    } catch (e) {
                                        Alert.alert('Error', 'Failed to sync from Health.');
                                    }
                                }}
                                style={wellnessStyles.syncButton}
                            >
                                <Feather name="refresh-cw" size={12} color={looviColors.accent.primary} />
                                <Text style={wellnessStyles.syncButtonText}>Sync Health</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={wellnessStyles.sleepButtons}>
                            {sleepOptions.map(h => (
                                <TouchableOpacity
                                    key={h}
                                    style={[
                                        wellnessStyles.sleepButton,
                                        sleepHours === h && wellnessStyles.sleepButtonActive
                                    ]}
                                    onPress={() => setSleepHours(h)}
                                >
                                    <Text style={[
                                        wellnessStyles.sleepButtonText,
                                        sleepHours === h && wellnessStyles.sleepButtonTextActive
                                    ]}>{h % 1 === 0 ? `${h}h` : `${h}`}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity
                    style={[wellnessStyles.saveButton, isFutureDate && wellnessStyles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isFutureDate}
                >
                    <Text style={wellnessStyles.saveButtonText}>
                        {isFutureDate ? "Can't Save Future Data" : 'Save How I\'m Feeling'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function TrackingScreen() {
    const route = useRoute<any>();
    const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useUserData();

    // State
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [showWellnessModal, setShowWellnessModal] = useState(false);
    const [showJournalModal, setShowJournalModal] = useState(false);
    const [showFoodItemModal, setShowFoodItemModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ScannedItem | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [foodCounts, setFoodCounts] = useState<Record<string, number>>({});
    const [selectedDayFoods, setSelectedDayFoods] = useState<ScannedItem[]>([]);
    const [selectedDayWellness, setSelectedDayWellness] = useState<any | null>(null);
    const [wellnessDates, setWellnessDates] = useState<string[]>([]);
    const [todayFoods, setTodayFoods] = useState<ScannedItem[]>([]);

    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate today's sugar total
    const todaySugarTotal = todayFoods.reduce((sum, food) => sum + (food.addedSugar || food.sugar || 0), 0);

    // Load food counts for calendar
    const loadFoodCounts = useCallback(async () => {
        const counts = await getFoodCountsByDate();
        setFoodCounts(counts);
    }, []);

    // Load foods for selected date
    const loadSelectedDayFoods = useCallback(async () => {
        const foods = await getScannedItemsForDate(selectedDate);
        setSelectedDayFoods(foods);
    }, [selectedDate]);

    // Load today's foods for badge indicator
    const loadTodayFoods = useCallback(async () => {
        const foods = await getScannedItemsForDate(todayStr);
        setTodayFoods(foods);
    }, [todayStr]);

    // Load wellness for selected date and track all wellness dates
    const loadSelectedDayWellness = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem('wellness_logs');
            if (stored) {
                const logs = JSON.parse(stored);
                const dayLog = logs.find((log: any) => log.date === selectedDate);
                setSelectedDayWellness(dayLog || null);
                // Extract all dates with wellness data
                const dates = logs.map((log: any) => log.date);
                setWellnessDates(dates);
            } else {
                setSelectedDayWellness(null);
                setWellnessDates([]);
            }
        } catch (error) {
            console.error('Error loading wellness:', error);
            setSelectedDayWellness(null);
        }
    }, [selectedDate]);

    useFocusEffect(useCallback(() => {
        loadFoodCounts();
        loadSelectedDayFoods();
        loadSelectedDayWellness();
        loadTodayFoods();
    }, [loadFoodCounts, loadSelectedDayFoods, loadSelectedDayWellness, loadTodayFoods]));

    useEffect(() => {
        loadSelectedDayFoods();
        loadSelectedDayWellness();
    }, [selectedDate, loadSelectedDayFoods, loadSelectedDayWellness]);

    // Reload wellness when modal closes
    useEffect(() => {
        if (!showWellnessModal) {
            loadSelectedDayWellness();
        }
    }, [showWellnessModal, loadSelectedDayWellness]);

    // Get journal entries for selected date
    const selectedDayJournals = journalEntries.filter(
        entry => entry.date.split('T')[0] === selectedDate
    );

    const handleScanComplete = () => {
        loadFoodCounts();
        loadSelectedDayFoods();
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    const handleFoodItemPress = (item: ScannedItem) => {
        setSelectedItem(item);
        setShowFoodItemModal(true);
    };

    const handleFoodItemUpdate = () => {
        loadFoodCounts();
        loadSelectedDayFoods();
    };

    const handleWellnessSave = async (log: WellnessLog) => {
        try {
            const stored = await AsyncStorage.getItem(WELLNESS_LOGS_KEY);
            const logs: WellnessLog[] = stored ? JSON.parse(stored) : [];
            const existingIndex = logs.findIndex(l => l.date === log.date);

            if (existingIndex >= 0) {
                logs[existingIndex] = log;
            } else {
                logs.unshift(log);
            }

            await AsyncStorage.setItem(WELLNESS_LOGS_KEY, JSON.stringify(logs));
            // Refresh the displayed wellness data
            loadSelectedDayWellness();
            Alert.alert('Saved!', 'Your wellness log has been saved.');
        } catch (error) {
            Alert.alert('Error', 'Failed to save wellness log.');
        }
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const selectedDateFormatted = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    return (
        <SwipeableTabView currentTab="Track">
            <LooviBackground variant="coralTop">
                <SafeAreaView style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Track</Text>
                            <Text style={styles.subtitle}>Log your food & feelings</Text>
                        </View>

                        {/* Two Big Action Buttons - ALWAYS reference TODAY */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    // Set date to today then open scanner
                                    handleDateSelect(todayStr);
                                    setShowScannerModal(true);
                                }}
                                activeOpacity={0.8}
                            >
                                <GlassCard variant="light" padding="lg" style={styles.actionCard}>
                                    <View style={styles.actionIconContainer}>
                                        <Ionicons name="nutrition" size={40} color={looviColors.accent.primary} />
                                        {todayFoods.length > 0 && (
                                            <View style={[styles.loggedBadge, { backgroundColor: todaySugarTotal > 50 ? '#EF4444' : '#22C55E' }]}>
                                                <Text style={styles.sugarBadgeText}>{Math.round(todaySugarTotal)}g</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.actionTitle}>What have you eaten?</Text>
                                    <Text style={styles.actionSubtitle}>Scan or log your food</Text>
                                </GlassCard>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    // Select today, then open wellness modal for today
                                    handleDateSelect(todayStr);
                                    setShowWellnessModal(true);
                                }}
                                activeOpacity={0.8}
                            >
                                <GlassCard variant="light" padding="lg" style={styles.actionCard}>
                                    <View style={styles.actionIconContainer}>
                                        <Ionicons name="fitness" size={40} color={looviColors.accent.primary} />
                                        {wellnessDates.includes(todayStr) && (
                                            <View style={styles.loggedBadge}>
                                                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.actionTitle}>How are you feeling?</Text>
                                    <Text style={styles.actionSubtitle}>
                                        {wellnessDates.includes(todayStr) ? "Edit today's wellness" : "Log today's wellness"}
                                    </Text>
                                </GlassCard>
                            </TouchableOpacity>
                        </View>

                        {/* Food Calendar with Wellness Indicators */}
                        <GlassCard variant="light" padding="md" style={styles.calendarCard}>
                            <FoodCalendar
                                foodCounts={foodCounts}
                                wellnessDates={wellnessDates}
                                selectedDate={selectedDate}
                                onSelectDate={handleDateSelect}
                            />
                        </GlassCard>

                        {/* Selected Day's Content */}
                        <View style={styles.selectedDayHeader}>
                            <Text style={styles.selectedDayTitle}>
                                {isToday ? 'Today' : selectedDateFormatted}
                            </Text>
                        </View>

                        {/* Wellness Status - Shows data if exists, or Add button if missing */}
                        <GlassCard variant="light" padding="md" style={styles.wellnessCard}>
                            <View style={styles.wellnessHeader}>
                                <Ionicons name="heart" size={18} color={looviColors.accent.primary} />
                                <Text style={styles.wellnessTitle}>Wellness</Text>
                                {selectedDayWellness && (
                                    <TouchableOpacity
                                        style={styles.wellnessEditButton}
                                        onPress={() => setShowWellnessModal(true)}
                                    >
                                        <Text style={styles.wellnessEditText}>Edit</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {selectedDayWellness ? (
                                <View style={styles.wellnessMetrics}>
                                    <View style={styles.wellnessMetric}>
                                        <View style={[styles.wellnessIconBg, { backgroundColor: `${looviColors.accent.primary}15` }]}>
                                            <Ionicons name="happy-outline" size={18} color={looviColors.accent.primary} />
                                        </View>
                                        <Text style={styles.wellnessLabel}>Mood</Text>
                                        <Text style={styles.wellnessValue}>{selectedDayWellness.mood}/5</Text>
                                    </View>
                                    <View style={styles.wellnessMetric}>
                                        <View style={[styles.wellnessIconBg, { backgroundColor: `${looviColors.accent.warning}15` }]}>
                                            <Ionicons name="flash-outline" size={18} color={looviColors.accent.warning} />
                                        </View>
                                        <Text style={styles.wellnessLabel}>Energy</Text>
                                        <Text style={styles.wellnessValue}>{selectedDayWellness.energy}/5</Text>
                                    </View>
                                    <View style={styles.wellnessMetric}>
                                        <View style={[styles.wellnessIconBg, { backgroundColor: `${looviColors.skyBlue}15` }]}>
                                            <Ionicons name="bulb-outline" size={18} color={looviColors.skyBlue} />
                                        </View>
                                        <Text style={styles.wellnessLabel}>Focus</Text>
                                        <Text style={styles.wellnessValue}>{selectedDayWellness.focus}/5</Text>
                                    </View>
                                    <View style={styles.wellnessMetric}>
                                        <View style={[styles.wellnessIconBg, { backgroundColor: `${looviColors.accent.success}15` }]}>
                                            <Ionicons name="bed-outline" size={18} color={looviColors.accent.success} />
                                        </View>
                                        <Text style={styles.wellnessLabel}>Sleep</Text>
                                        <Text style={styles.wellnessValue}>{selectedDayWellness.sleepHours}h</Text>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.addWellnessButton}
                                    onPress={() => setShowWellnessModal(true)}
                                >
                                    <Ionicons name="add-circle-outline" size={20} color={looviColors.accent.primary} />
                                    <Text style={styles.addWellnessText}>
                                        Add wellness data for {isToday ? 'today' : 'this day'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </GlassCard>

                        {/* Food List */}
                        <GlassCard variant="light" padding="md" style={styles.listCard}>
                            <View style={styles.listHeader}>
                                <View style={styles.listTitleContainer}>
                                    <Ionicons name="restaurant" size={18} color={looviColors.accent.primary} />
                                    <Text style={styles.listTitle}>Food Log</Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowScannerModal(true)}>
                                    <Text style={styles.addButton}>+ Add</Text>
                                </TouchableOpacity>
                            </View>
                            <FoodLogList
                                items={selectedDayFoods}
                                onItemPress={handleFoodItemPress}
                                emptyMessage={isToday ? "No food logged yet today" : "No food logged this day"}
                            />
                        </GlassCard>

                        {/* Journal Entries */}
                        <GlassCard variant="light" padding="md" style={styles.listCard}>
                            <View style={styles.listHeader}>
                                <View style={styles.listTitleContainer}>
                                    <Ionicons name="book" size={18} color={looviColors.accent.primary} />
                                    <Text style={styles.listTitle}>Journal</Text>
                                </View>
                                {isToday && (
                                    <TouchableOpacity onPress={() => setShowJournalModal(true)}>
                                        <Text style={styles.addButton}>+ Add</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {selectedDayJournals.length > 0 ? (
                                <View style={styles.journalList}>
                                    {selectedDayJournals.map((entry, index) => (
                                        <View key={entry.id || index} style={styles.journalEntry}>
                                            <Text style={styles.journalMood}>
                                                {entry.mood === 'great' ? '😊' :
                                                    entry.mood === 'good' ? '🙂' :
                                                        entry.mood === 'okay' ? '😐' :
                                                            entry.mood === 'struggling' ? '😔' : '😣'}
                                            </Text>
                                            <View style={styles.journalContent}>
                                                <Text style={styles.journalNote} numberOfLines={2}>
                                                    {entry.notes || 'No notes'}
                                                </Text>
                                                <Text style={styles.journalTime}>
                                                    {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    })}
                                                </Text>
                                            </View>
                                            <View style={styles.journalActions}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        // TODO: Open edit modal with entry data
                                                        Alert.alert('Edit', 'Edit functionality coming soon');
                                                    }}
                                                    style={styles.journalActionButton}
                                                >
                                                    <Ionicons name="pencil" size={16} color={looviColors.accent.primary} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        Alert.alert(
                                                            'Delete Entry',
                                                            'Are you sure you want to delete this journal entry?',
                                                            [
                                                                { text: 'Cancel', style: 'cancel' },
                                                                {
                                                                    text: 'Delete',
                                                                    style: 'destructive',
                                                                    onPress: () => deleteJournalEntry(entry.id)
                                                                }
                                                            ]
                                                        );
                                                    }}
                                                    style={styles.journalActionButton}
                                                >
                                                    <Ionicons name="trash" size={16} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyJournal}>
                                    <Text style={styles.emptyEmoji}>📝</Text>
                                    <Text style={styles.emptyText}>
                                        {isToday ? "How are you feeling today?" : "No journal entries this day"}
                                    </Text>
                                </View>
                            )}
                        </GlassCard>
                    </ScrollView>

                    {/* Modals */}
                    <FoodScannerModal
                        visible={showScannerModal}
                        onClose={() => setShowScannerModal(false)}
                        onScanComplete={handleScanComplete}
                        selectedDate={selectedDate}
                    />

                    <WellnessModal
                        visible={showWellnessModal}
                        onClose={() => setShowWellnessModal(false)}
                        onSave={handleWellnessSave}
                        selectedDate={selectedDate}
                        existingData={selectedDayWellness}
                    />

                    <JournalEntryModal
                        visible={showJournalModal}
                        onClose={() => setShowJournalModal(false)}
                        onSave={(entry) => addJournalEntry(new Date(), entry)}
                    />

                    <FoodItemModal
                        visible={showFoodItemModal}
                        item={selectedItem}
                        onClose={() => setShowFoodItemModal(false)}
                        onUpdate={handleFoodItemUpdate}
                    />
                </SafeAreaView>
            </LooviBackground>
        </SwipeableTabView>
    );
}

// Wellness Modal Styles
const wellnessStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeText: {
        fontSize: 20,
        color: looviColors.text.tertiary,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    scaleContainer: {
        marginBottom: spacing.lg,
    },
    scaleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    scaleIcon: {
        marginRight: spacing.sm,
    },
    scaleLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    scaleButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    scaleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
    },
    scaleButtonActive: {
        backgroundColor: looviColors.accent.primary,
    },
    scaleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    scaleButtonTextActive: {
        color: '#FFFFFF',
    },
    sleepSection: {
        marginBottom: spacing.lg,
    },
    sleepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
    },
    syncButtonText: {
        fontSize: 10,
        color: looviColors.accent.primary,
        fontWeight: '600',
    },
    sleepButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    sleepButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    sleepButtonActive: {
        backgroundColor: looviColors.accent.primary,
    },
    sleepButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    sleepButtonTextActive: {
        color: '#FFFFFF',
    },
    saveButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 14,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    saveButtonDisabled: {
        backgroundColor: looviColors.text.muted,
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

// Main Styles
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
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flex: 1,
    },
    actionCard: {
        alignItems: 'center',
        minHeight: 140,
        justifyContent: 'center',
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    actionSubtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
        textAlign: 'center',
    },
    actionIconContainer: {
        position: 'relative',
    },
    loggedBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        minWidth: 24,
        height: 24,
        paddingHorizontal: 6,
        borderRadius: 12,
        backgroundColor: looviColors.accent.success,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    sugarBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    calendarCard: {
        marginBottom: spacing.lg,
    },
    selectedDayHeader: {
        marginBottom: spacing.md,
    },
    selectedDayTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    listCard: {
        marginBottom: spacing.lg,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    listTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    addButton: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.accent.primary,
    },
    journalList: {
        gap: spacing.sm,
    },
    journalEntry: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    journalMood: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    journalContent: {
        flex: 1,
    },
    journalActions: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginLeft: spacing.sm,
    },
    journalActionButton: {
        padding: spacing.xs,
    },
    journalNote: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.primary,
        lineHeight: 20,
    },
    journalTime: {
        fontSize: 11,
        fontWeight: '400',
        color: looviColors.text.muted,
        marginTop: 4,
    },
    emptyJournal: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    emptyEmoji: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textAlign: 'center',
    },
    wellnessCard: {
        marginBottom: spacing.md,
    },
    wellnessHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    wellnessTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    wellnessMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: spacing.sm,
    },
    wellnessMetric: {
        alignItems: 'center',
        flex: 1,
    },
    wellnessIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    wellnessLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginBottom: 2,
    },
    wellnessValue: {
        fontSize: 15,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    wellnessEditButton: {
        marginLeft: 'auto',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
    },
    wellnessEditText: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.accent.primary,
    },
    addWellnessButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: `${looviColors.accent.primary}10`,
        borderWidth: 1,
        borderColor: `${looviColors.accent.primary}30`,
        borderStyle: 'dashed',
    },
    addWellnessText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.accent.primary,
    },
});
