/**
 * PaywallScreen
 * 
 * Calm, non-aggressive paywall shown after onboarding.
 * Allows starting a free trial or skipping for later.
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../../theme';

type PaywallScreenProps = {
    navigation: NativeStackNavigationProp<any, 'Paywall'>;
};

const benefits = [
    'Tree-based progress visualization',
    'Science-backed insights',
    'Habit tracking without guilt',
    'Data-driven approach',
];

export default function PaywallScreen({ navigation }: PaywallScreenProps) {
    // Fade-in animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleStartTrial = () => {
        // In a real app, this would initiate the subscription flow
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as never }],
        });
    };

    const handleMaybeLater = () => {
        // Skip paywall for now - can reappear later
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as never }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Start your reset</Text>
                        <Text style={styles.description}>
                            SugarReset uses habit science and consistency to help reduce sugar cravings.
                        </Text>
                    </View>

                    {/* Benefits */}
                    <View style={styles.benefitsContainer}>
                        {benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>
                                <View style={styles.checkmark}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                                <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Pricing Card */}
                    <View style={styles.pricingCard}>
                        <Text style={styles.trialText}>3-day free trial</Text>
                        <Text style={styles.priceText}>Then $4.99 / month</Text>
                        <Text style={styles.cancelText}>Cancel anytime</Text>
                    </View>
                </ScrollView>

                {/* Bottom Actions */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleStartTrial}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Start free trial</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleMaybeLater}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryButtonText}>Maybe later</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing['3xl'],
        paddingBottom: spacing.lg,
    },
    header: {
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
        marginBottom: spacing.md,
    },
    description: {
        fontSize: 17,
        fontWeight: '400',
        color: colors.text.secondary,
        lineHeight: 24,
    },
    benefitsContainer: {
        marginBottom: spacing['2xl'],
        gap: spacing.md,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.accent.success + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    checkmarkText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.accent.success,
    },
    benefitText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.secondary,
    },
    pricingCard: {
        backgroundColor: colors.glass.light,
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.glass.border,
        padding: spacing.xl,
        alignItems: 'center',
    },
    trialText: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    priceText: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    cancelText: {
        fontSize: 13,
        fontWeight: '400',
        color: colors.text.tertiary,
    },
    bottomContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.lg,
        paddingBottom: spacing['2xl'],
        gap: spacing.md,
    },
    primaryButton: {
        backgroundColor: colors.accent.primary,
        paddingVertical: spacing.lg,
        borderRadius: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.inverse,
    },
    secondaryButton: {
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text.tertiary,
    },
});
