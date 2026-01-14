/**
 * WellnessTracker Component
 * 
 * Displays 7-day average progress bars for wellness metrics:
 * Mood, Energy, Focus, Sleep
 * 
 * Features bar progress visualization with matching colors.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';
import { GlassCard } from './GlassCard';

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
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    value: number;  // 0-100 percentage
    displayValue: string;
    color: string;
    bgColor: string;
}

function MetricBar({ label, iconName, iconColor, value, displayValue, color, bgColor }: MetricBarProps) {
    return (
        <View style={styles.metricRow}>
            <View style={styles.metricLabelContainer}>
                <View style={[styles.metricIconBg, { backgroundColor: `${iconColor}15` }]}>
                    <Ionicons name={iconName} size={14} color={iconColor} />
                </View>
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
            <Text style={styles.metricValue}>{displayValue}</Text>
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
                <View style={styles.headerLeft}>
                    <Ionicons name="heart" size={18} color={looviColors.accent.primary} />
                    <Text style={styles.title}>7-Day Wellness</Text>
                </View>
                <Text style={styles.subtitle}>Your averages</Text>
            </View>

            <View style={styles.metricsContainer}>
                <MetricBar
                    label="Mood"
                    iconName="happy-outline"
                    iconColor={looviColors.accent.primary}
                    value={moodPercent}
                    displayValue={averages.mood.toFixed(1)}
                    color={looviColors.accent.primary}
                    bgColor={`${looviColors.accent.primary}15`}
                />
                <MetricBar
                    label="Energy"
                    iconName="flash-outline"
                    iconColor={looviColors.coralOrange}
                    value={energyPercent}
                    displayValue={averages.energy.toFixed(1)}
                    color={looviColors.coralOrange}
                    bgColor={`${looviColors.coralOrange}15`}
                />
                <MetricBar
                    label="Focus"
                    iconName="bulb-outline"
                    iconColor={looviColors.coralDark}
                    value={focusPercent}
                    displayValue={averages.focus.toFixed(1)}
                    color={looviColors.coralDark}
                    bgColor={`${looviColors.coralDark}15`}
                />
                <MetricBar
                    label="Sleep"
                    iconName="bed-outline"
                    iconColor={looviColors.skyBlueDark}
                    value={sleepPercent}
                    displayValue={`${averages.sleep.toFixed(1)}h`}
                    color={looviColors.skyBlueDark}
                    bgColor={`${looviColors.skyBlueDark}15`}
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
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
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
        width: 90,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metricIconBg: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
        width: 35,
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.secondary,
        textAlign: 'right',
    },
});

export default WellnessTracker;
