/**
 * SavingsGoalScreen
 * 
 * Asks what the user wants to save money for based on their spending.
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

type SavingsGoalScreenProps = {
    navigation: NativeStackNavigationProp<any, 'SavingsGoal'>;
    route: RouteProp<{ SavingsGoal: { dailySpendingCents?: number; dailySugarGrams?: number } }, 'SavingsGoal'>;
};

interface GoalOption {
    id: string;
    emoji: string;
    label: string;
}

const goalOptions: GoalOption[] = [
    { id: 'vacation', emoji: '✈️', label: 'A vacation or trip' },
    { id: 'gadget', emoji: '📱', label: 'New tech or gadgets' },
    { id: 'experience', emoji: '🎭', label: 'Experiences & events' },
    { id: 'savings', emoji: '🏦', label: 'Emergency fund' },
    { id: 'fitness', emoji: '💪', label: 'Gym or fitness gear' },
    { id: 'hobby', emoji: '🎨', label: 'A hobby or passion' },
    { id: 'gift', emoji: '🎁', label: 'Gifts for loved ones' },
    { id: 'other', emoji: '✨', label: 'Something else' },
];

export default function SavingsGoalScreen({ navigation, route }: SavingsGoalScreenProps) {
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const dailySpendingCents = route.params?.dailySpendingCents || 300;
    const monthlyTotal = Math.round((dailySpendingCents * 30) / 100);
    const { updateOnboardingData } = useUserData();

    const handleContinue = async () => {
        if (selectedGoal) {
            const goal = goalOptions.find(g => g.id === selectedGoal);
            await updateOnboardingData({
                savingsGoal: goal?.label || selectedGoal,
                savingsGoalAmount: monthlyTotal * 6, // 6-month goal
            });
        }
        navigation.navigate('Nickname');
    };

    const isButtonEnabled = selectedGoal !== null;

    return (
        <LooviBackground variant="blueDominant">
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.savingsHighlight}>
                            You could save ${monthlyTotal}/month
                        </Text>
                        <Text style={styles.title}>What would you save for?</Text>
                        <Text style={styles.subtitle}>
                            Visualizing your goal makes it more achievable
                        </Text>
                    </View>

                    {/* Options Grid */}
                    <View style={styles.optionsGrid}>
                        {goalOptions.map((option) => {
                            const isSelected = selectedGoal === option.id;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => setSelectedGoal(option.id)}
                                    activeOpacity={0.7}
                                    style={styles.optionWrapper}
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
                                    </GlassCard>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
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
    savingsHighlight: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.accent.success,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 20,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    title: {
        fontSize: 26,
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
    },
    optionCardSelected: {
        borderColor: looviColors.accent.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    optionEmoji: {
        fontSize: 28,
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
