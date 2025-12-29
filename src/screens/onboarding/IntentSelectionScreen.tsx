/**
 * IntentSelectionScreen
 * 
 * Multi-select screen for choosing intentions.
 * Sky theme with glassmorphism cards.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, borderRadius } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';
import { useUserData } from '../../context/UserDataContext';
import ProgressBar from '../../components/ProgressBar';

type IntentSelectionScreenProps = {
    navigation: NativeStackNavigationProp<any, 'IntentSelection'>;
};

interface IntentOption {
    id: string;
    emoji: string;
    label: string;
}

const intentOptions: IntentOption[] = [
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

export default function IntentSelectionScreen({ navigation }: IntentSelectionScreenProps) {
    const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
    const { updateOnboardingData } = useUserData();

    const toggleIntent = (id: string) => {
        setSelectedIntents(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleContinue = async () => {
        await updateOnboardingData({ goals: selectedIntents });
        navigation.navigate('BaselineSetup');
    };

    const isButtonEnabled = selectedIntents.length > 0;

    return (
        <LooviBackground variant="coralLeft">
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <ProgressBar current={1} total={8} />
                        <Text style={styles.stepLabel}>Personalize your journey</Text>
                        <Text style={styles.title}>What are your goals?</Text>
                        <Text style={styles.subtitle}>Select all that apply to you</Text>
                    </View>

                    {/* Options Grid */}
                    <View style={styles.optionsGrid}>
                        {intentOptions.map((option) => {
                            const isSelected = selectedIntents.includes(option.id);
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    style={styles.optionWrapper}
                                    onPress={() => toggleIntent(option.id)}
                                    activeOpacity={0.7}
                                >
                                    <GlassCard
                                        variant="light"
                                        padding="md"
                                        style={isSelected ? {
                                            ...styles.optionCard,
                                            ...styles.optionCardSelected,
                                        } : styles.optionCard}
                                    >
                                        <Text style={styles.optionEmoji}>{option.emoji}</Text>
                                        <Text style={[
                                            styles.optionLabel,
                                            isSelected && styles.optionLabelSelected,
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

                {/* Bottom Button */}
                <View style={styles.bottomContainer}>
                    <Text style={styles.selectionCount}>
                        {selectedIntents.length} selected
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            !isButtonEnabled && styles.continueButtonDisabled,
                        ]}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                        disabled={!isButtonEnabled}
                    >
                        <Text style={[
                            styles.continueButtonText,
                            !isButtonEnabled && styles.continueButtonTextDisabled,
                        ]}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LooviBackground>
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
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
    },
    stepLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.accent.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        letterSpacing: -0.5,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
    },
    optionsGrid: {
        flexDirection: 'column',
        gap: spacing.sm,
    },
    optionWrapper: {
        width: '100%',
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        position: 'relative',
    },
    optionCardSelected: {
        borderColor: looviColors.accent.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    optionEmoji: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: looviColors.text.secondary,
        flex: 1,
    },
    optionLabelSelected: {
        color: looviColors.text.primary,
        fontWeight: '600',
    },
    checkmark: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: looviColors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    bottomContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.md,
        paddingBottom: spacing['2xl'],
        alignItems: 'center',
    },
    selectionCount: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginBottom: spacing.md,
    },
    continueButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        paddingHorizontal: spacing['3xl'],
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    continueButtonDisabled: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        shadowOpacity: 0,
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    continueButtonTextDisabled: {
        color: looviColors.text.muted,
    },
});
