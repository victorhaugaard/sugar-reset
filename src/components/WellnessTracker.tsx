/**
 * WellnessTracker Component
 * 
 * Displays 7-day average progress bars for wellness metrics:
 * Mood, Energy, Focus, Sleep
 * 
 * Redesigned with coral/peach theme colors and modern styling.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';
import { GlassCard } from './GlassCard';
import { AppIcon } from './OnboardingIcon';

export interface WellnessData {
    mood: number;      // 1-5 scale
    energy: number;    // 1-5 scale
    focus: number;     // 1-5 scale
    sleep: number;     // hours (0-12 mapped to 0-100%)
}

interface WellnessTrackerProps {
    /** 7-day average data */
    averages: WellnessData;
}

interface MetricBarProps {
    label: string;
    emoji: string;
    value: number;  // 0-100 percentage
    color: string;
    bgColor: string;
}

function MetricBar({ label, emoji, value, color, bgColor }: MetricBarProps) {
    return (
        <View style={styles.metricRow}>
            <View style={styles.metricLabelContainer}>
                <AppIcon emoji={emoji} size={16} />
                <Text style={styles.metricLabelText}>{label}</Text>
            </View>
            <View style={[styles.metricTrack, { backgroundColor: bgColor }]}>
                <View
                    style={[
                        styles.metricFill,
                        { width: `${Math.max(5, value)}%`, backgroundColor: color }
                    ]}
                />
            </View>
            <Text style={styles.metricValue}>{Math.round(value)}%</Text>
        </View>
    );
}

export function WellnessTracker({ averages }: WellnessTrackerProps) {
    // Convert 1-5 scale to percentage (1=20%, 5=100%)
    const moodPercent = (averages.mood / 5) * 100;
    const energyPercent = (averages.energy / 5) * 100;
    const focusPercent = (averages.focus / 5) * 100;
    // Sleep: assume 8 hours = 100%
    const sleepPercent = Math.min(100, (averages.sleep / 8) * 100);

    return (
        <GlassCard variant="light" padding="lg" style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>7-Day Wellness</Text>
                <Text style={styles.subtitle}>Your averages</Text>
            </View>

            <View style={styles.metricsContainer}>
                <MetricBar
                    label="Mood"
                    emoji="😊"
                    value={moodPercent}
                    color={looviColors.coralOrange}
                    bgColor="rgba(217, 123, 102, 0.15)"
                />
                <MetricBar
                    label="Energy"
                    emoji="⚡"
                    value={energyPercent}
                    color="#F59E0B"
                    bgColor="rgba(245, 158, 11, 0.15)"
                />
                <MetricBar
                    label="Focus"
                    emoji="🎯"
                    value={focusPercent}
                    color="#8B5CF6"
                    bgColor="rgba(139, 92, 246, 0.15)"
                />
                <MetricBar
                    label="Sleep"
                    emoji="😴"
                    value={sleepPercent}
                    color="#3B82F6"
                    bgColor="rgba(59, 130, 246, 0.15)"
                />
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    subtitle: {
        fontSize: 12,
        color: looviColors.text.tertiary,
    },
    metricsContainer: {
        gap: spacing.sm,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    metricLabelContainer: {
        width: 80,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metricLabelText: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.primary,
    },
    metricTrack: {
        flex: 1,
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    metricFill: {
        height: '100%',
        borderRadius: 5,
    },
    metricValue: {
        width: 40,
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.secondary,
        textAlign: 'right',
    },
});

export default WellnessTracker;
