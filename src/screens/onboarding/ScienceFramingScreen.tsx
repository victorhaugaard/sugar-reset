/**
 * ScienceFramingScreen
 * 
 * Brief science-backed motivation. Sky theme.
 */

import React from 'react';
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

type ScienceFramingScreenProps = {
    navigation: NativeStackNavigationProp<any, 'ScienceFraming'>;
};

const benefits = [
    { emoji: '🧠', title: 'Clearer thinking', days: '3-7 days' },
    { emoji: '⚡', title: 'Stable energy', days: '1-2 weeks' },
    { emoji: '😴', title: 'Better sleep', days: '2-3 weeks' },
    { emoji: '💪', title: 'Reduced cravings', days: '3-4 weeks' },
];

export default function ScienceFramingScreen({ navigation }: ScienceFramingScreenProps) {
    const handleContinue = () => {
        navigation.navigate('BaselineSetup');
    };

    return (
        <LooviBackground variant="subtle">
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.emoji}>🔬</Text>
                        <Text style={styles.title}>What to expect</Text>
                        <Text style={styles.subtitle}>
                            Science-backed timeline of benefits
                        </Text>
                    </View>

                    {/* Benefits Timeline */}
                    <View style={styles.benefitsContainer}>
                        {benefits.map((benefit, index) => (
                            <GlassCard key={index} variant="light" padding="md" style={styles.benefitCard}>
                                <View style={styles.benefitContent}>
                                    <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
                                    <View style={styles.benefitInfo}>
                                        <Text style={styles.benefitTitle}>{benefit.title}</Text>
                                        <Text style={styles.benefitDays}>{benefit.days}</Text>
                                    </View>
                                    {index < benefits.length - 1 && (
                                        <View style={styles.connector} />
                                    )}
                                </View>
                            </GlassCard>
                        ))}
                    </View>

                    {/* Motivation */}
                    <GlassCard variant="light" padding="lg" style={styles.motivationCard}>
                        <Text style={styles.motivationTitle}>Remember</Text>
                        <Text style={styles.motivationText}>
                            The first few days are the hardest. Your brain is literally
                            rewiring itself. Every day without sugar makes the next day easier.
                        </Text>
                    </GlassCard>
                </ScrollView>

                {/* Bottom */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueButtonText}>Let's set up my plan</Text>
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
        fontSize: 26,
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
    benefitsContainer: {
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    benefitCard: {},
    benefitContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    benefitEmoji: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    benefitInfo: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    benefitDays: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.accent.success,
        marginTop: 2,
    },
    connector: {
        position: 'absolute',
        left: 20,
        bottom: -spacing.sm - 2,
        width: 2,
        height: spacing.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    motivationCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    motivationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.accent.primary,
        marginBottom: spacing.sm,
    },
    motivationText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 22,
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
    continueButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
