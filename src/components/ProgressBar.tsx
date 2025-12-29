/**
 * ProgressBar Component
 * 
 * Simple progress indicator for onboarding flow
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme';
import { skyColors } from './SkyBackground';

interface ProgressBarProps {
    current: number;
    total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
    const percentage = (current / total) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${percentage}%` }]} />
            </View>
            <Text style={styles.label}>
                {current} of {total}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    barBackground: {
        height: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    },
    barFill: {
        height: '100%',
        backgroundColor: skyColors.accent.primary,
        borderRadius: 3,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
        color: skyColors.text.tertiary,
        textAlign: 'right',
    },
});
