/**
 * BaselineSetupScreen
 * 
 * Asks about current sugar consumption habits. Sky theme.
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

type BaselineSetupScreenProps = {
    navigation: NativeStackNavigationProp<any, 'BaselineSetup'>;
};

interface FrequencyOption {
    id: string;
    emoji: string;
    label: string;
    description: string;
}

const frequencyOptions: FrequencyOption[] = [
    { id: 'rarely', emoji: '🌱', label: 'Few times a week', description: 'Occasional treats' },
    { id: 'daily', emoji: '📆', label: 'Daily', description: 'Once or twice a day' },
    { id: 'multiple', emoji: '🔄', label: 'Multiple times daily', description: 'Throughout the day' },
    { id: 'constant', emoji: '🌊', label: 'Constantly', description: 'Almost every hour' },
];

export default function BaselineSetupScreen({ navigation }: BaselineSetupScreenProps) {
    const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
    const { updateOnboardingData } = useUserData();

    const handleContinue = async () => {
        if (selectedFrequency) {
            await updateOnboardingData({ sugarFrequency: selectedFrequency as any });
        }
        navigation.navigate('PlanSelection');
    };

    const isButtonEnabled = selectedFrequency !== null;

    return (
        <LooviBackground variant="mixed">
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <ProgressBar current={2} total={8} />
                        <Text style={styles.stepLabel}>Understanding your baseline</Text>
                        <Text style={styles.title}>How often do you consume sugar?</Text>
                        <Text style={styles.subtitle}>
                            Being honest is a big step — no judgment here
                        </Text>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {frequencyOptions.map((option) => {
                            const isSelected = selectedFrequency === option.id;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => setSelectedFrequency(option.id)}
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
                                        <View style={styles.optionInfo}>
                                            <Text style={[
                                                styles.optionLabel,
                                                isSelected && styles.optionLabelSelected,
                                            ]}>
                                                {option.label}
                                            </Text>
                                            <Text style={styles.optionDescription}>
                                                {option.description}
                                            </Text>
                                        </View>
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

                    {/* Note */}
                    <Text style={styles.note}>
                        🔒 Your data stays private. We use this only to personalize your experience.
                    </Text>
                </ScrollView>

                {/* Bottom */}
                <View style={styles.bottomContainer}>
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
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    emoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textAlign: 'center',
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    optionsContainer: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionCardSelected: {
        borderColor: looviColors.accent.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    optionEmoji: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    optionLabelSelected: {
        color: looviColors.text.primary,
    },
    optionDescription: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: looviColors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    note: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        textAlign: 'center',
    },
    bottomContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.md,
        paddingBottom: spacing['2xl'],
    },
    continueButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
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
