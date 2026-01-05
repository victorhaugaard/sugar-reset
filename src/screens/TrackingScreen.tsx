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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
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
    ScannedItem
} from '../services/scannerService';
import { useUserData, JournalEntry } from '../context/UserDataContext';
import { SwipeableTabView } from '../components/SwipeableTabView';

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
    onSave
}: {
    visible: boolean;
    onClose: () => void;
    onSave: (log: WellnessLog) => void;
}) {
    const [mood, setMood] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [focus, setFocus] = useState(3);
    const [sleepHours, setSleepHours] = useState(7);

    const handleSave = () => {
        onSave({
            date: new Date().toISOString().split('T')[0],
            mood,
            energy,
            focus,
            sleepHours,
        });
        onClose();
    };

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
                <Text style={wellnessStyles.subtitle}>Rate your wellness today</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <ScaleSelector label="Mood" value={mood} onChange={setMood} iconName="happy-outline" />
                    <ScaleSelector label="Energy" value={energy} onChange={setEnergy} iconName="flash-outline" />
                    <ScaleSelector label="Focus" value={focus} onChange={setFocus} iconName="bulb-outline" />

                    <View style={wellnessStyles.sleepSection}>
                        <Ionicons name="bed-outline" size={20} color={looviColors.accent.primary} style={wellnessStyles.scaleIcon} />
                        <Text style={wellnessStyles.scaleLabel}>Hours of Sleep</Text>
                        <View style={wellnessStyles.sleepButtons}>
                            {[5, 6, 7, 8, 9, 10].map(h => (
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
                                    ]}>{h}h</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity style={wellnessStyles.saveButton} onPress={handleSave}>
                    <Text style={wellnessStyles.saveButtonText}>Save How I'm Feeling</Text>
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

    // Load wellness for selected date
    const loadSelectedDayWellness = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem('wellness_logs');
            if (stored) {
                const logs = JSON.parse(stored);
                const dayLog = logs.find((log: any) => log.date === selectedDate);
                setSelectedDayWellness(dayLog || null);
            } else {
                setSelectedDayWellness(null);
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
    }, [loadFoodCounts, loadSelectedDayFoods, loadSelectedDayWellness]));

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

                        {/* Two Big Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setShowScannerModal(true)}
                                activeOpacity={0.8}
                            >
                                <GlassCard variant="light" padding="lg" style={styles.actionCard}>
                                    <Ionicons name="nutrition" size={40} color={looviColors.accent.primary} />
                                    <Text style={styles.actionTitle}>What have you eaten?</Text>
                                    <Text style={styles.actionSubtitle}>Scan or log your food</Text>
                                </GlassCard>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setShowWellnessModal(true)}
                                activeOpacity={0.8}
                            >
                                <GlassCard variant="light" padding="lg" style={styles.actionCard}>
                                    <Ionicons name="fitness" size={40} color={looviColors.accent.primary} />
                                    <Text style={styles.actionTitle}>How are you feeling?</Text>
                                    <Text style={styles.actionSubtitle}>Log your wellness</Text>
                                </GlassCard>
                            </TouchableOpacity>
                        </View>

                        {/* Food Calendar */}
                        <GlassCard variant="light" padding="md" style={styles.calendarCard}>
                            <FoodCalendar
                                foodCounts={foodCounts}
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

                        {/* Wellness for selected day */}
                        {selectedDayWellness && (
                            <GlassCard variant="light" padding="md" style={styles.wellnessCard}>
                                <View style={styles.wellnessHeader}>
                                    <Ionicons name="heart" size={18} color={looviColors.accent.primary} />
                                    <Text style={styles.wellnessTitle}>Wellness</Text>
                                </View>
                                <View style={styles.wellnessMetrics}>
                                    <View style={styles.wellnessMetric}>
                                        <Text style={styles.wellnessEmoji}>😊</Text>
                                        <Text style={styles.wellnessLabel}>Mood</Text>
                                        <Text style={styles.wellnessValue}>{selectedDayWellness.mood}/5</Text>
                                    </View>
                                    <View style={styles.wellnessMetric}>
                                        <Text style={styles.wellnessEmoji}>⚡</Text>
                                        <Text style={styles.wellnessLabel}>Energy</Text>
                                        <Text style={styles.wellnessValue}>{selectedDayWellness.energy}/5</Text>
                                    </View>
                                    <View style={styles.wellnessMetric}>
                                        <Text style={styles.wellnessEmoji}>🧠</Text>
                                        <Text style={styles.wellnessLabel}>Focus</Text>
                                        <Text style={styles.wellnessValue}>{selectedDayWellness.focus}/5</Text>
                                    </View>
                                    <View style={styles.wellnessMetric}>
                                        <Text style={styles.wellnessEmoji}>😴</Text>
                                        <Text style={styles.wellnessLabel}>Sleep</Text>
                                        <Text style={styles.wellnessValue}>{selectedDayWellness.sleepHours}h</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        )}

                        {/* Food List */}
                        <GlassCard variant="light" padding="md" style={styles.listCard}>
                            <View style={styles.listHeader}>
                                <View style={styles.listTitleContainer}>
                                    <Ionicons name="restaurant" size={18} color={looviColors.accent.primary} />
                                    <Text style={styles.listTitle}>Food Log</Text>
                                </View>
                                {isToday && (
                                    <TouchableOpacity onPress={() => setShowScannerModal(true)}>
                                        <Text style={styles.addButton}>+ Add</Text>
                                    </TouchableOpacity>
                                )}
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
                    />

                    <WellnessModal
                        visible={showWellnessModal}
                        onClose={() => setShowWellnessModal(false)}
                        onSave={handleWellnessSave}
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
    wellnessEmoji: {
        fontSize: 24,
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
});
