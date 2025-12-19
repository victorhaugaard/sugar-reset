/**
 * Button Component
 * 
 * Primary/secondary button with haptic feedback and loading state.
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    haptic?: boolean;
}

const sizeStyles = {
    sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        fontSize: typography.sizes.sm,
    },
    md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        fontSize: typography.sizes.base,
    },
    lg: {
        paddingVertical: spacing.base,
        paddingHorizontal: spacing['2xl'],
        fontSize: typography.sizes.md,
    },
};

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    haptic = true,
}: ButtonProps) {
    const handlePress = async () => {
        if (haptic) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress();
    };

    const getBackgroundColor = () => {
        if (disabled) return colors.text.muted;
        switch (variant) {
            case 'primary':
                return colors.accent.primary;
            case 'secondary':
                return colors.glass.medium;
            case 'ghost':
                return 'transparent';
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.text.tertiary;
        switch (variant) {
            case 'primary':
                return colors.text.inverse;
            case 'secondary':
                return colors.text.primary;
            case 'ghost':
                return colors.accent.primary;
        }
    };

    const getBorderStyle = () => {
        if (variant === 'secondary') {
            return {
                borderWidth: 1,
                borderColor: colors.glass.border,
            };
        }
        if (variant === 'ghost') {
            return {
                borderWidth: 1,
                borderColor: colors.accent.primary,
            };
        }
        return {};
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    paddingVertical: sizeStyles[size].paddingVertical,
                    paddingHorizontal: sizeStyles[size].paddingHorizontal,
                },
                getBorderStyle(),
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <Text
                    style={[
                        styles.text,
                        {
                            color: getTextColor(),
                            fontSize: sizeStyles[size].fontSize,
                        },
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    fullWidth: {
        width: '100%',
    },
    text: {
        fontWeight: typography.weights.semibold,
        letterSpacing: 0.3,
    },
});

export default Button;
