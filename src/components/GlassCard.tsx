/**
 * GlassCard Component
 * 
 * A glassmorphism card with semi-transparent background.
 * Note: BlurView with new architecture can cause issues,
 * so we use a simple semi-transparent background approach.
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface GlassCardProps {
    children: ReactNode;
    style?: ViewStyle;
    intensity?: 'light' | 'medium' | 'strong';
    padding?: 'sm' | 'md' | 'lg';
}

const intensityMap = {
    light: colors.glass.light,
    medium: colors.glass.medium,
    strong: colors.glass.strong,
};

const paddingMap = {
    sm: spacing.card.sm,
    md: spacing.card.md,
    lg: spacing.card.lg,
};

export function GlassCard({
    children,
    style,
    intensity = 'medium',
    padding = 'md',
}: GlassCardProps) {
    return (
        <View
            style={[
                styles.container,
                { padding: paddingMap[padding], backgroundColor: intensityMap[intensity] },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.glass.border,
        overflow: 'hidden',
    },
});

export default GlassCard;
