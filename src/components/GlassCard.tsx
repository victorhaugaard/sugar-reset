/**
 * GlassCard Component
 * 
 * Glassmorphism card with thin border and transparent center.
 * Supports both sky theme (light) and universe theme (dark).
 * Cross-platform glassmorphism with matching transparency.
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '../theme';

interface GlassCardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'dark' | 'light';
    padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingMap = {
    sm: spacing.card.sm,
    md: spacing.card.md,
    lg: spacing.card.lg,
    none: 0,
};

export function GlassCard({
    children,
    style,
    variant = 'dark',
    padding = 'md',
}: GlassCardProps) {
    const isLight = variant === 'light';

    return (
        <View
            style={[
                styles.container,
                isLight ? styles.containerLight : styles.containerDark,
                { padding: paddingMap[padding] },
                style,
            ]}
        >
            {/* Gradient overlay for subtle glass effect - positioned absolutely */}
            <LinearGradient
                colors={
                    isLight
                        ? [
                            'rgba(255, 255, 255, 0.30)',
                            'rgba(255, 255, 255, 0.20)',
                            'rgba(255, 255, 255, 0.25)',
                        ]
                        : [
                            'rgba(255, 255, 255, 0.12)',
                            'rgba(255, 255, 255, 0.05)',
                            'rgba(255, 255, 255, 0.08)',
                        ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            />
            {/* Content renders directly */}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
        // Remove all shadows/elevation to prevent dark edges on Android
        elevation: 0,
        shadowOpacity: 0,
    },
    containerDark: {
        borderColor: colors.glass.border,
    },
    containerLight: {
        // Same transparency on both platforms
        borderColor: 'rgba(255, 255, 255, 0.5)',
        // Only iOS gets shadows - Android elevation causes dark edges with transparency
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                // No elevation - it causes gray/dark edges on transparent views
                elevation: 0,
            },
        }),
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default GlassCard;
