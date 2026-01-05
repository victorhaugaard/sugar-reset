/**
 * DailyActionCard
 * 
 * A dynamic CTA component that suggests the highest-priority action for the day.
 * Priority: Check-in > Food Log > Habit Checklist
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';
import { GlassCard } from './GlassCard';
import { AppIcon } from './OnboardingIcon';

interface DailyActionCardProps {
    hasCheckedInToday: boolean;
    hasFoodLoggedToday: boolean;
    onCheckIn: () => void;
}

interface ActionConfig {
    emoji: string;
    title: string;
    description: string;
    buttonText: string;
    onPress: () => void;
    bgColor: string;
}

export function DailyActionCard({
    hasCheckedInToday,
    hasFoodLoggedToday,
    onCheckIn,
}: DailyActionCardProps) {
    const navigation = useNavigation<any>();

    // Determine the current action based on priority
    const getActionConfig = (): ActionConfig | null => {
        // Priority 1: Daily Check-in
        if (!hasCheckedInToday) {
            return {
                emoji: '✅',
                title: 'Daily Check-in',
                description: 'How did today go? Log your progress to keep your streak alive.',
                buttonText: 'Check In Now',
                onPress: onCheckIn,
                bgColor: 'rgba(16, 185, 129, 0.12)',
            };
        }

        // Priority 2: Food Logging
        if (!hasFoodLoggedToday) {
            return {
                emoji: '🍎',
                title: 'Track Your Food',
                description: 'Scan a product or log what you ate to stay aware of your sugar intake.',
                buttonText: 'Log Food',
                onPress: () => navigation.navigate('Track', { tab: 'scan' }),
                bgColor: 'rgba(245, 158, 11, 0.12)',
            };
        }

        // Priority 3: Habit Checklist (placeholder for now)
        // This will be enhanced when we build the habit checklist feature
        return {
            emoji: '🎯',
            title: 'Build Better Habits',
            description: 'Explore healthy alternatives and tips to resist sugar cravings.',
            buttonText: 'Learn More',
            onPress: () => navigation.navigate('Track', { tab: 'learn' }),
            bgColor: 'rgba(139, 92, 246, 0.12)',
        };
    };

    const action = getActionConfig();

    // If all done, show a celebratory state
    if (!action) {
        return (
            <GlassCard variant="light" padding="md" style={[styles.card, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <View style={styles.allDoneContent}>
                    <AppIcon emoji="🌟" size={32} />
                    <View style={styles.allDoneTextContainer}>
                        <Text style={styles.allDoneTitle}>You're all set for today!</Text>
                        <Text style={styles.allDoneDescription}>Great work staying on track.</Text>
                    </View>
                </View>
            </GlassCard>
        );
    }

    return (
        <GlassCard variant="light" padding="md" style={[styles.card, { backgroundColor: action.bgColor }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <AppIcon emoji={action.emoji} size={36} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{action.title}</Text>
                    <Text style={styles.description}>{action.description}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={action.onPress}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>{action.buttonText}</Text>
            </TouchableOpacity>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.lg,
    },
    content: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    iconContainer: {
        marginRight: spacing.md,
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 20,
    },
    button: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 12,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // All done state
    allDoneContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    allDoneTextContainer: {
        marginLeft: spacing.md,
        flex: 1,
    },
    allDoneTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.accent.success,
    },
    allDoneDescription: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginTop: 2,
    },
});
