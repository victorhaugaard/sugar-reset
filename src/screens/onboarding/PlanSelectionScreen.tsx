/**
 * PlanSelectionScreen
 * 
 * Allows user to choose their reset approach.
 * Sky theme with glassmorphism.
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

type PlanSelectionScreenProps = {
    navigation: NativeStackNavigationProp<any, 'PlanSelection'>;
};

interface PlanOption {
    id: string;
    emoji: string;
    title: string;
    duration: string;
    description: string;
    features: string[];
    recommended?: boolean;
}

const planOptions: PlanOption[] = [
    {
        id: 'cold_turkey',
        emoji: '🚀',
        title: 'Cold Turkey',
        duration: '90 days',
        description: 'Stop all added sugar immediately for faster reset.',
        features: [
            'Fastest dopamine reset',
            'Clear rules, no gray areas',
            'Best for committed individuals',
        ],
        recommended: true,
    },
    {
        id: 'gradual',
        emoji: '🌱',
        title: 'Gradual Reduction',
        duration: '90 days',
        description: 'Phase out sugar over time for a gentler transition.',
        features: [
            'Easier initial adjustment',
            'Weekly reduction targets',
            'Works with busy lifestyles',
        ],
    },
];

export default function PlanSelectionScreen({ navigation }: PlanSelectionScreenProps) {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const { onboardingData, updateOnboardingData } = useUserData();

    const handleContinue = async () => {
        if (selectedPlan) {
            await updateOnboardingData({ plan: selectedPlan as any });
        }
        const nickname = onboardingData?.nickname || 'Friend';
        navigation.navigate('Promise', { nickname });
    };

    const isButtonEnabled = selectedPlan !== null;

    return (
        <LooviBackground variant="blueBottom">
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.stepLabel}>Choose your path</Text>
                        <Text style={styles.title}>Choose your approach</Text>
                        <Text style={styles.subtitle}>
                            How would you like to reset your relationship with sugar?
                        </Text>
                    </View>

                    {/* Plan Options */}
                    <View style={styles.plansContainer}>
                        {planOptions.map((plan) => {
                            const isSelected = selectedPlan === plan.id;
                            return (
                                <TouchableOpacity
                                    key={plan.id}
                                    onPress={() => setSelectedPlan(plan.id)}
                                    activeOpacity={0.8}
                                >
                                    <GlassCard
                                        variant="light"
                                        padding="lg"
                                        style={isSelected ? {
                                            ...styles.planCard,
                                            ...styles.planCardSelected,
                                        } : styles.planCard}
                                    >
                                        {plan.recommended && (
                                            <View style={styles.recommendedBadge}>
                                                <Text style={styles.recommendedText}>Recommended</Text>
                                            </View>
                                        )}
                                        <View style={styles.planHeader}>
                                            <Text style={styles.planEmoji}>{plan.emoji}</Text>
                                            <View style={styles.planTitleContainer}>
                                                <Text style={styles.planTitle}>{plan.title}</Text>
                                                <Text style={styles.planDuration}>{plan.duration}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.planDescription}>{plan.description}</Text>
                                        <View style={styles.featuresContainer}>
                                            {plan.features.map((feature, index) => (
                                                <View key={index} style={styles.featureRow}>
                                                    <Text style={styles.featureCheck}>✓</Text>
                                                    <Text style={styles.featureText}>{feature}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </GlassCard>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={styles.note}>
                        You can change your plan anytime in settings.
                    </Text>
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
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        letterSpacing: -0.5,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 22,
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
    plansContainer: {
        gap: spacing.lg,
        marginBottom: spacing.lg,
    },
    planCard: {
        position: 'relative',
    },
    planCardSelected: {
        borderColor: looviColors.accent.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    recommendedBadge: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.lg,
        backgroundColor: looviColors.accent.success,
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: 10,
    },
    recommendedText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    planEmoji: {
        fontSize: 36,
        marginRight: spacing.md,
    },
    planTitleContainer: {
        flex: 1,
    },
    planTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    planDuration: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.accent.primary,
    },
    planDescription: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    featuresContainer: {
        gap: spacing.xs,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    featureCheck: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.accent.success,
        marginRight: spacing.sm,
        marginTop: 2,
    },
    featureText: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        flex: 1,
    },
    note: {
        fontSize: 12,
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
