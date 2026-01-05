/**
 * PlanProgressBar Component
 * 
 * Shows plan completion progress with phase information.
 * Displays: percentage, phase labels, and phase description.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme';
import { looviColors } from './LooviBackground';

// Phase definitions based on plan progress
const PHASES = [
    {
        minPercent: 0,
        maxPercent: 25,
        name: 'Phase 1: Detox',
        feeling: 'experiencing cravings and adjustment',
        endFeeling: 'cravings will start to decrease',
    },
    {
        minPercent: 25,
        maxPercent: 50,
        name: 'Phase 2: Adaptation',
        feeling: 'adapting to lower sugar intake',
        endFeeling: 'energy levels will stabilize',
    },
    {
        minPercent: 50,
        maxPercent: 75,
        name: 'Phase 3: Momentum',
        feeling: 'building healthy habits',
        endFeeling: 'taste preferences will change',
    },
    {
        minPercent: 75,
        maxPercent: 100,
        name: 'Phase 4: Mastery',
        feeling: 'mastering your sugar-free lifestyle',
        endFeeling: 'feel in complete control',
    },
];

interface PlanProgressBarProps {
    /** Days since start */
    daysSinceStart: number;
    /** Total plan duration in days */
    planDuration: number;
    /** Plan end date */
    endDate?: Date;
}

export function PlanProgressBar({
    daysSinceStart,
    planDuration,
    endDate,
}: PlanProgressBarProps) {
    // Calculate progress percentage (capped at 100%)
    const progressPercent = Math.min(100, Math.round((daysSinceStart / planDuration) * 100));

    // Find current phase
    const currentPhase = PHASES.find(
        phase => progressPercent >= phase.minPercent && progressPercent < phase.maxPercent
    ) || PHASES[PHASES.length - 1];

    // Format end date
    const endDateFormatted = endDate
        ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '';

    return (
        <View style={styles.container}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <Text style={styles.percentText}>{progressPercent}%</Text>
                <View style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progressPercent}%` }
                        ]}
                    />
                </View>
            </View>

            {/* Phase Labels Row */}
            <View style={styles.phaseLabelsRow}>
                <Text style={styles.phaseLabel}>{currentPhase.name}</Text>
                {endDateFormatted && (
                    <Text style={styles.endDateLabel}>Complete at {endDateFormatted}</Text>
                )}
            </View>

            {/* Phase Description */}
            <View style={styles.phaseDescription}>
                <Text style={styles.phaseDescriptionText}>
                    You are now probably {currentPhase.feeling}.
                </Text>
                <Text style={styles.phaseDescriptionText}>
                    At the end of this phase, {currentPhase.endFeeling}.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingVertical: spacing.md,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    percentText: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
        minWidth: 45,
    },
    progressTrack: {
        flex: 1,
        height: 12,
        backgroundColor: 'rgba(0,0,0,0.08)',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: looviColors.coralOrange,
        borderRadius: 6,
    },
    phaseLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    phaseLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    endDateLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    phaseDescription: {
        marginTop: spacing.sm,
        alignItems: 'center',
    },
    phaseDescriptionText: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.secondary,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 20,
    },
});

export default PlanProgressBar;
