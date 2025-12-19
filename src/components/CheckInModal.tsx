/**
 * CheckInModal Component
 * 
 * Bottom sheet modal for daily sugar check-in.
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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { colors, typography, spacing, borderRadius } from '../theme';

interface CheckInModalProps {
    visible: boolean;
    onClose: () => void;
    onCheckIn: (sugarFree: boolean, extras?: CheckInExtras) => Promise<void>;
    isLoading?: boolean;
}

interface CheckInExtras {
    notes?: string;
    cravingLevel?: 1 | 2 | 3 | 4 | 5;
    mood?: 1 | 2 | 3 | 4 | 5;
}

export function CheckInModal({
    visible,
    onClose,
    onCheckIn,
    isLoading = false,
}: CheckInModalProps) {
    const [sugarFree, setSugarFree] = useState<boolean | null>(null);
    const [cravingLevel, setCravingLevel] = useState<number>(3);
    const [mood, setMood] = useState<number>(3);
    const [notes, setNotes] = useState('');
    const [step, setStep] = useState<'choice' | 'details' | 'success'>('choice');

    const handleChoice = async (choice: boolean) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSugarFree(choice);
        setStep('details');
    };

    const handleSubmit = async () => {
        if (sugarFree === null) return;

        await onCheckIn(sugarFree, {
            cravingLevel: cravingLevel as 1 | 2 | 3 | 4 | 5,
            mood: mood as 1 | 2 | 3 | 4 | 5,
            notes: notes.trim() || undefined,
        });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep('success');

        // Auto close after success animation
        setTimeout(() => {
            handleClose();
        }, 1500);
    };

    const handleClose = () => {
        // Reset state
        setSugarFree(null);
        setCravingLevel(3);
        setMood(3);
        setNotes('');
        setStep('choice');
        onClose();
    };

    const renderChoice = () => (
        <View style={styles.choiceContainer}>
            <Text style={styles.title}>How was today?</Text>
            <Text style={styles.subtitle}>Be honest with yourself</Text>

            <View style={styles.choiceButtons}>
                <TouchableOpacity
                    style={[styles.choiceButton, styles.sugarFreeButton]}
                    onPress={() => handleChoice(true)}
                >
                    <Text style={styles.choiceEmoji}>✅</Text>
                    <Text style={styles.choiceLabel}>Sugar-Free</Text>
                    <Text style={styles.choiceSubtext}>No added sugar today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.choiceButton, styles.hadSugarButton]}
                    onPress={() => handleChoice(false)}
                >
                    <Text style={styles.choiceEmoji}>🍬</Text>
                    <Text style={styles.choiceLabel}>Had Sugar</Text>
                    <Text style={styles.choiceSubtext}>It happens, reset tomorrow</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDetails = () => (
        <View style={styles.detailsContainer}>
            <Text style={styles.title}>
                {sugarFree ? 'Great job! 🎉' : 'Tomorrow is a new day'}
            </Text>
            <Text style={styles.subtitle}>A few quick questions (optional)</Text>

            {/* Craving Level */}
            <View style={styles.sliderSection}>
                <Text style={styles.sliderLabel}>Craving Level</Text>
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((level) => (
                        <TouchableOpacity
                            key={level}
                            style={[
                                styles.ratingButton,
                                cravingLevel === level && styles.ratingButtonActive,
                            ]}
                            onPress={() => setCravingLevel(level)}
                        >
                            <Text style={[
                                styles.ratingText,
                                cravingLevel === level && styles.ratingTextActive,
                            ]}>
                                {level}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.ratingLabels}>
                    <Text style={styles.ratingLabelText}>None</Text>
                    <Text style={styles.ratingLabelText}>Intense</Text>
                </View>
            </View>

            {/* Mood */}
            <View style={styles.sliderSection}>
                <Text style={styles.sliderLabel}>Overall Mood</Text>
                <View style={styles.ratingRow}>
                    {['😔', '😕', '😐', '🙂', '😊'].map((emoji, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.emojiButton,
                                mood === index + 1 && styles.emojiButtonActive,
                            ]}
                            onPress={() => setMood(index + 1)}
                        >
                            <Text style={styles.emojiText}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Notes */}
            <View style={styles.notesSection}>
                <Text style={styles.sliderLabel}>Notes (optional)</Text>
                <TextInput
                    style={styles.notesInput}
                    placeholder="How are you feeling?"
                    placeholderTextColor={colors.text.muted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    maxLength={200}
                />
            </View>

            <Button
                title="Complete Check-In"
                onPress={handleSubmit}
                loading={isLoading}
                fullWidth
                style={styles.submitButton}
            />
        </View>
    );

    const renderSuccess = () => (
        <View style={styles.successContainer}>
            <Text style={styles.successEmoji}>{sugarFree ? '🎉' : '💪'}</Text>
            <Text style={styles.successTitle}>
                {sugarFree ? 'Streak continues!' : 'Logged!'}
            </Text>
            <Text style={styles.successText}>
                {sugarFree
                    ? 'Keep up the great work!'
                    : 'Every day is a fresh start'}
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.handle} />

                            {step === 'choice' && renderChoice()}
                            {step === 'details' && renderDetails()}
                            {step === 'success' && renderSuccess()}

                            {step !== 'success' && (
                                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                                    <Text style={styles.closeText}>Cancel</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.secondary,
        borderTopLeftRadius: borderRadius['3xl'],
        borderTopRightRadius: borderRadius['3xl'],
        paddingHorizontal: spacing.screen.horizontal,
        paddingBottom: spacing['4xl'],
        paddingTop: spacing.md,
        minHeight: 400,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: colors.glass.strong,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.styles.h2,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.styles.body,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    // Choice step
    choiceContainer: {
        alignItems: 'center',
    },
    choiceButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    choiceButton: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
    },
    sugarFreeButton: {
        backgroundColor: 'rgba(127, 176, 105, 0.15)',
        borderColor: colors.accent.success,
    },
    hadSugarButton: {
        backgroundColor: 'rgba(214, 104, 83, 0.15)',
        borderColor: colors.accent.error,
    },
    choiceEmoji: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    choiceLabel: {
        ...typography.styles.bodyMedium,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    choiceSubtext: {
        ...typography.styles.caption,
        color: colors.text.tertiary,
        textAlign: 'center',
    },
    // Details step
    detailsContainer: {
        flex: 1,
    },
    sliderSection: {
        marginBottom: spacing.xl,
    },
    sliderLabel: {
        ...typography.styles.bodySm,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    ratingButton: {
        flex: 1,
        paddingVertical: spacing.md,
        backgroundColor: colors.glass.light,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    ratingButtonActive: {
        backgroundColor: colors.accent.primary,
        borderColor: colors.accent.primary,
    },
    ratingText: {
        ...typography.styles.bodyMedium,
        color: colors.text.secondary,
    },
    ratingTextActive: {
        color: colors.text.inverse,
    },
    ratingLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    ratingLabelText: {
        ...typography.styles.caption,
        color: colors.text.muted,
    },
    emojiButton: {
        flex: 1,
        paddingVertical: spacing.md,
        backgroundColor: colors.glass.light,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    emojiButtonActive: {
        borderColor: colors.accent.primary,
        backgroundColor: colors.glass.medium,
    },
    emojiText: {
        fontSize: 24,
    },
    notesSection: {
        marginBottom: spacing.xl,
    },
    notesInput: {
        backgroundColor: colors.glass.light,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...typography.styles.body,
        color: colors.text.primary,
        minHeight: 80,
    },
    submitButton: {
        marginTop: spacing.sm,
    },
    // Success step
    successContainer: {
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
    },
    successEmoji: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    successTitle: {
        ...typography.styles.h2,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    successText: {
        ...typography.styles.body,
        color: colors.text.secondary,
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginTop: spacing.md,
    },
    closeText: {
        ...typography.styles.body,
        color: colors.text.tertiary,
    },
});

export default CheckInModal;
