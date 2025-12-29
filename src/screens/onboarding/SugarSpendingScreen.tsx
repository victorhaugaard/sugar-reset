/**
 * SugarSpendingScreen
 * 
 * Asks user how much they spend on sweets/sugar per day.
 * Shows daily amounts for more accurate calculation.
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
import { RouteProp } from '@react-navigation/native';
import { spacing, borderRadius } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';
import { useUserData } from '../../context/UserDataContext';
import ProgressBar from '../../components/ProgressBar';

type SugarSpendingScreenProps = {
    navigation: NativeStackNavigationProp<any, 'SugarSpending'>;
    route: RouteProp<{ SugarSpending: { dailySugarGrams?: number } }, 'SugarSpending'>;
};

interface SpendingOption {
    id: string;
    label: string;
    dailyAmount: number; // cents per day
    displayDaily: string;
}

const spendingOptions: SpendingOption[] = [
    { id: 'none', label: 'Less than $1', dailyAmount: 50, displayDaily: '~$0.50' },
    { id: 'low', label: '$1 - $2', dailyAmount: 150, displayDaily: '~$1.50' },
    { id: 'medium', label: '$2 - $4', dailyAmount: 300, displayDaily: '~$3' },
    { id: 'high', label: '$4 - $7', dailyAmount: 550, displayDaily: '~$5.50' },
    { id: 'very_high', label: 'More than $7', dailyAmount: 1000, displayDaily: '~$10' },
];

export default function SugarSpendingScreen({ navigation, route }: SugarSpendingScreenProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const dailySugarGrams = route.params?.dailySugarGrams || 50;
    const { updateOnboardingData } = useUserData();

    const handleContinue = async () => {
        const selected = spendingOptions.find(o => o.id === selectedOption);
        const dailySpending = selected?.dailyAmount || 0;
        await updateOnboardingData({ dailySpendingCents: dailySpending });
        navigation.navigate('SavingsGoal', {
            dailySpendingCents: dailySpending,
            dailySugarGrams,
        });
    };

    const isButtonEnabled = selectedOption !== null;

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
                        <ProgressBar current={5} total={8} />
                        <Text style={styles.stepLabel}>Financial impact</Text>
                        <Text style={styles.title}>How much do you spend on sweets daily?</Text>
                        <Text style={styles.subtitle}>
                            Be honest – this helps track your savings
                        </Text>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {spendingOptions.map((option) => {
                            const isSelected = selectedOption === option.id;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => setSelectedOption(option.id)}
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
                                        <View style={styles.optionContent}>
                                            <Text style={[
                                                styles.optionLabel,
                                                isSelected && styles.optionLabelSelected,
                                            ]}>
                                                {option.label}
                                            </Text>
                                            <Text style={styles.optionDaily}>
                                                {option.displayDaily}/day
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

                    {/* Yearly projection */}
                    {selectedOption && (
                        <View style={styles.projectionContainer}>
                            <Text style={styles.projectionText}>
                                That's approximately{' '}
                                <Text style={styles.projectionHighlight}>
                                    ${Math.round((spendingOptions.find(o => o.id === selectedOption)?.dailyAmount || 0) * 365 / 100)}
                                </Text>
                                {' '}per year on sugar!
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Button */}
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
        paddingTop: spacing['2xl'],
        paddingBottom: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
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
        letterSpacing: -0.5,
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
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionCardSelected: {
        borderColor: looviColors.accent.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    optionContent: {
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
    optionDaily: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.accent.success,
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
    projectionContainer: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    projectionText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        textAlign: 'center',
    },
    projectionHighlight: {
        fontWeight: '700',
        color: looviColors.accent.warning,
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
