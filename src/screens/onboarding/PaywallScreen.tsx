/**
 * PaywallScreen
 * 
 * Subscription options with sky theme.
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

type PaywallScreenProps = {
    navigation: NativeStackNavigationProp<any, 'Paywall'>;
};

interface PlanOption {
    id: string;
    name: string;
    price: string;
    period: string;
    savings?: string;
    popular?: boolean;
}

const plans: PlanOption[] = [
    {
        id: 'yearly',
        name: 'Annual',
        price: '$29.99',
        period: '/year',
        savings: 'Save 75%',
        popular: true,
    },
    {
        id: 'monthly',
        name: 'Monthly',
        price: '$9.99',
        period: '/month',
    },
];

const features = [
    '✓ Unlimited daily tracking',
    '✓ Science-based insights',
    '✓ Personalized recommendations',
    '✓ Progress analytics',
    '✓ Community support',
];

export default function PaywallScreen({ navigation }: PaywallScreenProps) {
    const [selectedPlan, setSelectedPlan] = useState('yearly');

    const handleSubscribe = () => {
        // TODO: Implement subscription
        navigation.getParent()?.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    const handleRestore = () => {
        // TODO: Implement restore purchases
    };

    const handleSkip = () => {
        navigation.getParent()?.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    return (
        <LooviBackground variant="coralDominant">
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.emoji}>🌟</Text>
                        <Text style={styles.title}>Unlock Your Journey</Text>
                        <Text style={styles.subtitle}>
                            Get full access to all premium features
                        </Text>
                    </View>

                    {/* Features */}
                    <GlassCard variant="light" padding="lg" style={styles.featuresCard}>
                        {features.map((feature, index) => (
                            <Text key={index} style={styles.featureText}>{feature}</Text>
                        ))}
                    </GlassCard>

                    {/* Plans */}
                    <View style={styles.plansContainer}>
                        {plans.map((plan) => {
                            const isSelected = selectedPlan === plan.id;
                            return (
                                <TouchableOpacity
                                    key={plan.id}
                                    onPress={() => setSelectedPlan(plan.id)}
                                    activeOpacity={0.8}
                                    style={styles.planWrapper}
                                >
                                    <GlassCard
                                        variant="light"
                                        padding="md"
                                        style={isSelected ? {
                                            ...styles.planCard,
                                            ...styles.planCardSelected,
                                        } : styles.planCard}
                                    >
                                        {plan.popular && (
                                            <View style={styles.popularBadge}>
                                                <Text style={styles.popularText}>Best Value</Text>
                                            </View>
                                        )}
                                        <Text style={styles.planName}>{plan.name}</Text>
                                        <View style={styles.priceRow}>
                                            <Text style={styles.planPrice}>{plan.price}</Text>
                                            <Text style={styles.planPeriod}>{plan.period}</Text>
                                        </View>
                                        {plan.savings && (
                                            <Text style={styles.planSavings}>{plan.savings}</Text>
                                        )}
                                    </GlassCard>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Trial info */}
                    <Text style={styles.trialInfo}>
                        Start with a 7-day free trial. Cancel anytime.
                    </Text>
                </ScrollView>

                {/* Bottom */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.subscribeButton}
                        onPress={handleSubscribe}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
                    </TouchableOpacity>

                    <View style={styles.linksRow}>
                        <TouchableOpacity onPress={handleRestore}>
                            <Text style={styles.linkText}>Restore Purchases</Text>
                        </TouchableOpacity>
                        <Text style={styles.linkDivider}>•</Text>
                        <TouchableOpacity onPress={handleSkip}>
                            <Text style={styles.linkText}>Skip for now</Text>
                        </TouchableOpacity>
                    </View>
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
        fontSize: 56,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 28,
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
    featuresCard: {
        marginBottom: spacing.xl,
    },
    featureText: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginBottom: spacing.sm,
    },
    plansContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    planWrapper: {
        flex: 1,
        marginTop: 14, // Make room for popular badge
    },
    planCard: {
        alignItems: 'center',
        position: 'relative',
        paddingTop: spacing.md,
        minHeight: 120,
        overflow: 'visible',
        backgroundColor: 'transparent', // Fix iOS transparent box issue
    },
    planCardSelected: {
        borderColor: looviColors.accent.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: looviColors.accent.success,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: 8,
    },
    popularText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    planName: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.tertiary,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    planPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    planPeriod: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    planSavings: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.accent.success,
        marginTop: spacing.xs,
    },
    trialInfo: {
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
    subscribeButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: spacing.lg,
    },
    subscribeButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    linksRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    linkDivider: {
        marginHorizontal: spacing.md,
        color: looviColors.text.muted,
    },
});
