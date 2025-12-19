/**
 * StreakRing Component
 * 
 * Circular progress ring showing current streak.
 * Simple version without SVG animation for compatibility.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface StreakRingProps {
    currentStreak: number;
    size?: number;
    strokeWidth?: number;
    progressColor?: string;
    backgroundColor?: string;
}

export function StreakRing({
    currentStreak,
    size = 180,
    strokeWidth = 6,
    progressColor = colors.accent.primary,
    backgroundColor = colors.progress.ringBg,
}: StreakRingProps) {
    // Calculate progress (cap at 30 days for full ring)
    const maxDays = 30;
    const progress = Math.min(currentStreak / maxDays, 1);

    const dayLabel = currentStreak === 1 ? 'day' : 'days';

    // For the visual ring, we'll use a simple border approach
    // A more complex implementation could use react-native-svg for a proper arc

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Background ring */}
            <View
                style={[
                    styles.ring,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: strokeWidth,
                        borderColor: backgroundColor,
                    },
                ]}
            />

            {/* Progress indicator (simplified as a glowing border) */}
            <View
                style={[
                    styles.progressRing,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: strokeWidth,
                        borderColor: progressColor,
                        opacity: progress > 0 ? 0.8 + (progress * 0.2) : 0.3,
                    },
                ]}
            />

            {/* Center content */}
            <View style={styles.centerContent}>
                <Text style={styles.streakNumber}>{currentStreak}</Text>
                <Text style={styles.streakLabel}>{dayLabel}</Text>
                {progress >= 1 && (
                    <Text style={styles.achievementText}>🏆 30-day goal!</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ring: {
        position: 'absolute',
    },
    progressRing: {
        position: 'absolute',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakNumber: {
        ...typography.styles.display,
        color: colors.text.primary,
    },
    streakLabel: {
        ...typography.styles.label,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    achievementText: {
        ...typography.styles.caption,
        color: colors.accent.warning,
        marginTop: spacing.sm,
    },
});

export default StreakRing;
