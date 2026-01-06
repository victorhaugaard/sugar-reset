/**
 * JournalEntryModal Component
 * 
 * Modal for creating/editing daily journal entries
 * Appears after slip-ups or can be opened manually
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    ScrollView,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { spacing, borderRadius } from '../theme';
import { skyColors } from './SkyBackground';

interface JournalEntryModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (entry: JournalEntryData) => Promise<void>;
    date?: Date;
    existingEntry?: JournalEntryData;
    /** If true, shows the "What triggered this?" question (for slip-up context) */
    isAfterSlipUp?: boolean;
}

export interface JournalEntryData {
    mood?: 'great' | 'good' | 'okay' | 'struggling' | 'difficult';
    notes: string;
    whatTriggered?: string;
}

const MOOD_OPTIONS = [
    { value: 'great', icon: 'happy' as const, label: 'Great', color: '#22C55E' },
    { value: 'good', icon: 'happy-outline' as const, label: 'Good', color: '#84CC16' },
    { value: 'okay', icon: 'remove-circle-outline' as const, label: 'Okay', color: '#F59E0B' },
    { value: 'struggling', icon: 'sad-outline' as const, label: 'Struggling', color: '#F97316' },
    { value: 'difficult', icon: 'sad' as const, label: 'Difficult', color: '#EF4444' },
] as const;

export function JournalEntryModal({
    visible,
    onClose,
    onSave,
    date = new Date(),
    existingEntry,
    isAfterSlipUp = false,
}: JournalEntryModalProps) {
    const [mood, setMood] = useState<JournalEntryData['mood']>(existingEntry?.mood);
    const [notes, setNotes] = useState(existingEntry?.notes || '');
    const [whatTriggered, setWhatTriggered] = useState(existingEntry?.whatTriggered || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!notes.trim()) return;

        setIsSaving(true);
        try {
            await onSave({
                mood,
                notes: notes.trim(),
                whatTriggered: whatTriggered.trim() || undefined,
            });
            handleClose();
        } catch (error) {
            console.error('Failed to save journal entry:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setMood(undefined);
        setNotes('');
        setWhatTriggered('');
        onClose();
    };

    const dateString = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalContent}>
                                <ScrollView
                                    style={styles.scrollView}
                                    contentContainerStyle={styles.scrollContent}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {/* Header */}
                                    <View style={styles.header}>
                                        <Text style={styles.title}>📝 Journal Entry</Text>
                                        <Text style={styles.dateText}>{dateString}</Text>
                                    </View>

                                    {/* Mood Selector */}
                                    <View style={styles.section}>
                                        <Text style={styles.sectionLabel}>How are you feeling?</Text>
                                        <View style={styles.moodButtons}>
                                            {MOOD_OPTIONS.map((option) => (
                                                <TouchableOpacity
                                                    key={option.value}
                                                    style={[
                                                        styles.moodButton,
                                                        mood === option.value && [
                                                            styles.moodButtonActive,
                                                            { borderColor: option.color, backgroundColor: `${option.color}15` }
                                                        ],
                                                    ]}
                                                    onPress={() => setMood(option.value)}
                                                >
                                                    <Ionicons
                                                        name={option.icon}
                                                        size={22}
                                                        color={mood === option.value ? option.color : 'rgba(0,0,0,0.4)'}
                                                    />
                                                    <Text style={[
                                                        styles.moodLabel,
                                                        mood === option.value && { color: option.color, fontWeight: '600' },
                                                    ]}>
                                                        {option.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* What triggered it? - Only show for slip-ups */}
                                    {isAfterSlipUp && (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionLabel}>What triggered this? (optional)</Text>
                                            <TextInput
                                                style={styles.triggerInput}
                                                placeholder="e.g., Stress at work, social event..."
                                                placeholderTextColor="rgba(0,0,0,0.4)"
                                                value={whatTriggered}
                                                onChangeText={setWhatTriggered}
                                                multiline
                                                returnKeyType="done"
                                                blurOnSubmit={true}
                                            />
                                        </View>
                                    )}

                                    {/* Notes */}
                                    <View style={styles.section}>
                                        <Text style={styles.sectionLabel}>Your thoughts *</Text>
                                        <TextInput
                                            style={styles.notesInput}
                                            placeholder={isAfterSlipUp
                                                ? "How did it make you feel? What would you do differently?"
                                                : "How was your day? Any wins or challenges?"
                                            }
                                            placeholderTextColor="rgba(0,0,0,0.4)"
                                            value={notes}
                                            onChangeText={setNotes}
                                            multiline
                                            textAlignVertical="top"
                                            returnKeyType="done"
                                            blurOnSubmit={true}
                                        />
                                    </View>

                                    {/* Buttons */}
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={[styles.button, styles.saveButton]}
                                            onPress={handleSave}
                                            disabled={!notes.trim() || isSaving}
                                        >
                                            <Text style={styles.saveButtonText}>
                                                {isSaving ? 'Saving...' : 'Save Entry'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.button, styles.cancelButton]}
                                            onPress={handleClose}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        width: '100%',
        maxWidth: 360,
        maxHeight: '80%',
    },
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        paddingBottom: spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: spacing.xs,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(0,0,0,0.5)',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: spacing.sm,
    },
    moodButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
    },
    moodButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    moodButtonActive: {
        borderWidth: 2,
    },
    moodLabel: {
        fontSize: 9,
        fontWeight: '500',
        color: 'rgba(0,0,0,0.5)',
        marginTop: 2,
    },
    triggerInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: 15,
        color: '#1a1a2e',
        minHeight: 60,
    },
    notesInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: 15,
        color: '#1a1a2e',
        minHeight: 100,
    },
    buttonContainer: {
        gap: spacing.md,
        marginTop: spacing.md,
    },
    button: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#3B82F6',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    cancelButton: {
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0,0,0,0.5)',
    },
});

export default JournalEntryModal;
