/**
 * Input Component
 * 
 * Styled text input with label, validation, and error states.
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

export function Input({
    label,
    error,
    containerStyle,
    leftIcon,
    rightIcon,
    onRightIconPress,
    secureTextEntry,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    const getBorderColor = () => {
        if (error) return colors.accent.error;
        if (isFocused) return colors.border.focus;
        return colors.border.subtle;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[styles.inputWrapper, { borderColor: getBorderColor() }]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        !!leftIcon && styles.inputWithLeftIcon,
                        !!(rightIcon || secureTextEntry) && styles.inputWithRightIcon,
                    ].filter(Boolean)}
                    placeholderTextColor={colors.text.muted}
                    selectionColor={colors.accent.primary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isSecure}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={() => setIsSecure(!isSecure)}
                    >
                        <Text style={styles.toggleText}>{isSecure ? 'Show' : 'Hide'}</Text>
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.base,
    },
    label: {
        ...typography.styles.bodySm,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glass.light,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        minHeight: 52,
    },
    input: {
        flex: 1,
        ...typography.styles.body,
        color: colors.text.primary,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    inputWithLeftIcon: {
        paddingLeft: spacing.sm,
    },
    inputWithRightIcon: {
        paddingRight: spacing.sm,
    },
    leftIcon: {
        paddingLeft: spacing.base,
    },
    rightIcon: {
        paddingRight: spacing.base,
        paddingVertical: spacing.sm,
    },
    toggleText: {
        ...typography.styles.bodySm,
        color: colors.accent.primary,
    },
    error: {
        ...typography.styles.caption,
        color: colors.accent.error,
        marginTop: spacing.xs,
        paddingHorizontal: spacing.xs,
    },
});

export default Input;
