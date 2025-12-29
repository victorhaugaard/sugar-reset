/**
 * EditGoalsModal
 * 
 * Modal for editing user's goals/reasons.
 * Uses same options as IntentSelectionScreen from onboarding.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius } from '../theme';
import { skyColors } from '../components/SkyBackground';
import { GlassCard } from '../components/GlassCard';

interface EditGoalsModalProps {
    visible: boolean;
    currentGoals: string[];
    onSave: (goals: string[]) => void;
    onClose: () => void;
}

interface GoalOption {
    id: string;
    emoji: string;
    label: string;
}

const goalOptions: GoalOption[] = [
    { id: 'cravings', emoji: '🍭', label: 'Reduce sugar cravings' },
    { id: 'habits', emoji: '🔄', label: 'Break daily sugar habits' },
    { id: 'energy', emoji: '⚡', label: 'Improve energy levels' },
    { id: 'health', emoji: '💚', label: 'Better overall health' },
    { id: 'weight', emoji: '⚖️', label: 'Support weight goals' },
    { id: 'skin', emoji: '✨', label: 'Clearer skin' },
    { id: 'focus', emoji: '🧠', label: 'Better focus and clarity' },
    { id: 'blood_sugar', emoji: '📉', label: 'Stable blood sugar' },
    { id: 'sleep', emoji: '😴', label: 'Improved sleep' },
    { id: 'savings', emoji: '💰', label: 'Financial savings' },
];

export default function EditGoalsModal({ visible, currentGoals, onSave, onClose }: EditGoalsModalProps) {
    const [selectedGoals, setSelectedGoals] = useState<string[]>(currentGoals);

    // Update local state when currentGoals changes
    useEffect(() => {
        setSelectedGoals(currentGoals);
    }, [currentGoals, visible]);

    const toggleGoal = (id: string) => {
        setSelectedGoals(prev =>
            prev.includes(id)
                ? prev.filter(g => g !== id)
                : [...prev, id]
        );
    };

    const handleSave = () => {
        onSave(selectedGoals);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>My Goals</Text>
                        <TouchableOpacity
                            onPress={handleSave}
                            style={styles.saveButton}
                            disabled={selectedGoals.length === 0}
                        >
                            <Text style={[
                                styles.saveText,
                                selectedGoals.length === 0 && styles.saveTextDisabled
                            ]}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.subtitle}>
                            Select all that apply to you. These will appear as your personal reminders.
                        </Text>

                        <View style={styles.optionsGrid}>
                            {goalOptions.map((option) => {
                                const isSelected = selectedGoals.includes(option.id);
                                return (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => toggleGoal(option.id)}
                                        activeOpacity={0.7}
                                    >
                                        <GlassCard
                                            variant={isSelected ? 'dark' : 'light'}
                                            padding="md"
                                            style={{
                                                ...styles.optionCard,
                                                ...(isSelected ? styles.optionCardSelected : {}),
                                            }}
                                        >
                                            <Text style={styles.optionEmoji}>{option.emoji}</Text>
                                            <Text style={[
                                                styles.optionLabel,
                                                isSelected && styles.optionLabelSelected
                                            ]}>
                                                {option.label}
                                            </Text>
                                            {isSelected && (
                                                <View style={styles.checkmark}>
                                                    <Text style={styles.checkmarkText}>✓</Text>
                                                </View>
                                            )}
                                        </GlassCard>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: '#E0F2FE',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    cancelButton: {
        padding: spacing.xs,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '400',
        color: skyColors.text.secondary,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: skyColors.text.primary,
    },
    saveButton: {
        padding: spacing.xs,
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        color: skyColors.accent.primary,
    },
    saveTextDisabled: {
        color: skyColors.text.muted,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: skyColors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 20,
    },
    optionsGrid: {
        gap: spacing.md,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 60,
    },
    optionCardSelected: {
        borderWidth: 2,
        borderColor: skyColors.accent.primary,
    },
    optionEmoji: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: skyColors.text.primary,
        flex: 1,
    },
    optionLabelSelected: {
        fontWeight: '600',
        color: skyColors.accent.primary,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: skyColors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
