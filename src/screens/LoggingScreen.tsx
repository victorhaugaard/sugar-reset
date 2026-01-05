/**
 * LoggingScreen
 * 
 * Comprehensive daily logging screen for tracking:
 * - Sugar intake (yes/no + grams if yes)
 * - Mood (1-5 scale)
 * - Energy (1-5 scale)
 * - Focus (1-5 scale)
 * - Sleep (hours)
 * - Cravings count
 * - Water intake
 * - Notes
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { AppIcon } from '../components/OnboardingIcon';

const LOGGING_KEY = 'wellness_logs';

type LoggingScreenProps = {
    navigation: NativeStackNavigationProp<any, 'Logging'>;
};

interface WellnessLog {
    date: string;
    sugarFree: boolean;
    sugarGrams?: number;
    mood: number;
    energy: number;
    focus: number;
    sleepHours: number;
    cravingsCount: number;
    waterGlasses: number;
    notes: string;
}

// Scale selector component
function ScaleSelector({
    label,
    value,
    onChange,
    emoji,
}: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    emoji: string;
}) {
    return (
        <View style={styles.scaleContainer}>
            <View style={styles.scaleLabelRow}>
                <AppIcon emoji={emoji} size={18} />
                <Text style={styles.scaleLabel}> {label}</Text>
            </View>
            <View style={styles.scaleButtons}>
                {[1, 2, 3, 4, 5].map((num) => (
                    <TouchableOpacity
                        key={num}
                        style={[
                            styles.scaleButton,
                            value === num && styles.scaleButtonSelected,
                        ]}
                        onPress={() => onChange(num)}
                    >
                        <Text
                            style={[
                                styles.scaleButtonText,
                                value === num && styles.scaleButtonTextSelected,
                            ]}
                        >
                            {num}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.scaleLabels}>
                <Text style={styles.scaleLowLabel}>Low</Text>
                <Text style={styles.scaleHighLabel}>High</Text>
            </View>
        </View>
    );
}

export default function LoggingScreen({ navigation }: LoggingScreenProps) {
    const today = new Date().toISOString().split('T')[0];

    // Form state
    const [sugarFree, setSugarFree] = useState(true);
    const [sugarGrams, setSugarGrams] = useState('');
    const [mood, setMood] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [focus, setFocus] = useState(3);
    const [sleepHours, setSleepHours] = useState('7');
    const [cravings, setCravings] = useState(0);
    const [water, setWater] = useState(4);
    const [notes, setNotes] = useState('');
    const [hasExistingLog, setHasExistingLog] = useState(false);

    // Load existing log for today
    useEffect(() => {
        loadTodayLog();
    }, []);

    const loadTodayLog = async () => {
        try {
            const stored = await AsyncStorage.getItem(LOGGING_KEY);
            if (stored) {
                const logs: WellnessLog[] = JSON.parse(stored);
                const todayLog = logs.find(log => log.date === today);
                if (todayLog) {
                    setHasExistingLog(true);
                    setSugarFree(todayLog.sugarFree);
                    setSugarGrams(todayLog.sugarGrams?.toString() || '');
                    setMood(todayLog.mood);
                    setEnergy(todayLog.energy);
                    setFocus(todayLog.focus);
                    setSleepHours(todayLog.sleepHours.toString());
                    setCravings(todayLog.cravingsCount);
                    setWater(todayLog.waterGlasses);
                    setNotes(todayLog.notes);
                }
            }
        } catch (error) {
            console.error('Error loading today log:', error);
        }
    };

    const handleSave = async () => {
        try {
            const newLog: WellnessLog = {
                date: today,
                sugarFree,
                sugarGrams: sugarFree ? undefined : parseInt(sugarGrams) || 0,
                mood,
                energy,
                focus,
                sleepHours: parseFloat(sleepHours) || 7,
                cravingsCount: cravings,
                waterGlasses: water,
                notes,
            };

            // Load existing logs
            const stored = await AsyncStorage.getItem(LOGGING_KEY);
            let logs: WellnessLog[] = stored ? JSON.parse(stored) : [];

            // Update or add today's log
            const existingIndex = logs.findIndex(log => log.date === today);
            if (existingIndex >= 0) {
                logs[existingIndex] = newLog;
            } else {
                logs.push(newLog);
            }

            // Keep only last 30 days
            logs = logs.slice(-30);

            await AsyncStorage.setItem(LOGGING_KEY, JSON.stringify(logs));

            Alert.alert('Logged!', 'Your daily wellness has been recorded.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error saving log:', error);
            Alert.alert('Error', 'Failed to save your log. Please try again.');
        }
    };

    return (
        <LooviBackground variant="blueBottom">
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Daily Log</Text>
                    <View style={{ width: 50 }} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Date Badge */}
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                        {hasExistingLog && (
                            <Text style={styles.updateText}>Updating existing log</Text>
                        )}
                    </View>

                    {/* Sugar Intake */}
                    <GlassCard variant="light" padding="lg" style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <AppIcon emoji="🍭" size={18} />
                            <Text style={styles.sectionTitle}> Sugar Intake</Text>
                        </View>
                        <View style={styles.toggleRow}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    sugarFree && styles.toggleButtonSelected,
                                ]}
                                onPress={() => setSugarFree(true)}
                            >
                                <Text
                                    style={[
                                        styles.toggleText,
                                        sugarFree && styles.toggleTextSelected,
                                    ]}
                                >
                                    Sugar-Free ✓
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    !sugarFree && styles.toggleButtonSelectedRed,
                                ]}
                                onPress={() => setSugarFree(false)}
                            >
                                <Text
                                    style={[
                                        styles.toggleText,
                                        !sugarFree && styles.toggleTextSelected,
                                    ]}
                                >
                                    Had Sugar
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {!sugarFree && (
                            <View style={styles.gramsInput}>
                                <Text style={styles.gramsLabel}>Approx grams:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={sugarGrams}
                                    onChangeText={setSugarGrams}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={looviColors.text.tertiary}
                                />
                            </View>
                        )}
                    </GlassCard>

                    {/* Wellness Scales */}
                    <GlassCard variant="light" padding="lg" style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <AppIcon emoji="📊" size={18} />
                            <Text style={styles.sectionTitle}> How Do You Feel?</Text>
                        </View>
                        <ScaleSelector
                            label="Mood"
                            value={mood}
                            onChange={setMood}
                            emoji="😊"
                        />
                        <ScaleSelector
                            label="Energy"
                            value={energy}
                            onChange={setEnergy}
                            emoji="⚡"
                        />
                        <ScaleSelector
                            label="Focus"
                            value={focus}
                            onChange={setFocus}
                            emoji="🎯"
                        />
                    </GlassCard>

                    {/* Sleep */}
                    <GlassCard variant="light" padding="lg" style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <AppIcon emoji="😴" size={18} />
                            <Text style={styles.sectionTitle}> Sleep Last Night</Text>
                        </View>
                        <View style={styles.sleepRow}>
                            <TextInput
                                style={[styles.textInput, styles.sleepInput]}
                                value={sleepHours}
                                onChangeText={setSleepHours}
                                keyboardType="decimal-pad"
                                placeholder="7"
                                placeholderTextColor={looviColors.text.tertiary}
                            />
                            <Text style={styles.sleepLabel}>hours</Text>
                        </View>
                    </GlassCard>

                    {/* Cravings & Water */}
                    <View style={styles.twoColumn}>
                        <GlassCard variant="light" padding="md" style={styles.halfSection}>
                            <View style={styles.miniTitleRow}>
                                <AppIcon emoji="🆘" size={14} />
                                <Text style={styles.miniTitle}> Cravings</Text>
                            </View>
                            <View style={styles.counterRow}>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => setCravings(Math.max(0, cravings - 1))}
                                >
                                    <Text style={styles.counterButtonText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>{cravings}</Text>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => setCravings(cravings + 1)}
                                >
                                    <Text style={styles.counterButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </GlassCard>

                        <GlassCard variant="light" padding="md" style={styles.halfSection}>
                            <View style={styles.miniTitleRow}>
                                <AppIcon emoji="💧" size={14} />
                                <Text style={styles.miniTitle}> Water</Text>
                            </View>
                            <View style={styles.counterRow}>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => setWater(Math.max(0, water - 1))}
                                >
                                    <Text style={styles.counterButtonText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>{water}</Text>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => setWater(water + 1)}
                                >
                                    <Text style={styles.counterButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.glassesLabel}>glasses</Text>
                        </GlassCard>
                    </View>

                    {/* Notes */}
                    <GlassCard variant="light" padding="lg" style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <AppIcon emoji="📝" size={18} />
                            <Text style={styles.sectionTitle}> Notes (Optional)</Text>
                        </View>
                        <TextInput
                            style={[styles.textInput, styles.notesInput]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="How was your day? Any triggers or wins?"
                            placeholderTextColor={looviColors.text.tertiary}
                            multiline
                            numberOfLines={3}
                        />
                    </GlassCard>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>
                            {hasExistingLog ? 'Update Log' : 'Save Log'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LooviBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.screen.horizontal,
        paddingVertical: spacing.md,
    },
    backButton: {
        fontSize: 16,
        color: looviColors.accent.primary,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingBottom: 40,
    },
    dateBadge: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    updateText: {
        fontSize: 12,
        color: looviColors.accent.primary,
        marginTop: 4,
    },
    section: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    toggleRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    },
    toggleButtonSelected: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderWidth: 2,
        borderColor: '#22C55E',
    },
    toggleButtonSelectedRed: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 2,
        borderColor: '#EF4444',
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    toggleTextSelected: {
        color: looviColors.text.primary,
    },
    gramsInput: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    gramsLabel: {
        fontSize: 14,
        color: looviColors.text.secondary,
    },
    textInput: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 16,
        color: looviColors.text.primary,
        minWidth: 60,
        textAlign: 'center',
    },
    scaleContainer: {
        marginBottom: spacing.lg,
    },
    scaleLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    scaleEmoji: {
        fontSize: 18,
        marginRight: spacing.xs,
    },
    scaleLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    scaleButtons: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    scaleButton: {
        flex: 1,
        height: 44,
        borderRadius: borderRadius.md,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scaleButtonSelected: {
        backgroundColor: looviColors.accent.primary,
    },
    scaleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    scaleButtonTextSelected: {
        color: '#fff',
    },
    scaleLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    scaleLowLabel: {
        fontSize: 11,
        color: looviColors.text.tertiary,
    },
    scaleHighLabel: {
        fontSize: 11,
        color: looviColors.text.tertiary,
    },
    sleepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    sleepInput: {
        width: 80,
    },
    sleepLabel: {
        fontSize: 16,
        color: looviColors.text.secondary,
    },
    twoColumn: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    halfSection: {
        flex: 1,
    },
    miniTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    miniTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    counterButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: looviColors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    counterValue: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
        minWidth: 40,
        textAlign: 'center',
    },
    glassesLabel: {
        fontSize: 11,
        color: looviColors.text.tertiary,
        textAlign: 'center',
        marginTop: 4,
    },
    notesInput: {
        textAlign: 'left',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: spacing.md,
        shadowColor: looviColors.coralOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 5,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
