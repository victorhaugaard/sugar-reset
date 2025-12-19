/**
 * Forgot Password Screen
 * 
 * Password reset request form.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Button, Input, GlassCard } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing } from '../../theme';

type ForgotPasswordScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
    const { resetPassword, isLoading, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const validate = (): boolean => {
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleReset = async () => {
        clearError();
        if (!validate()) return;

        const success = await resetPassword(email);
        if (success) {
            setEmailSent(true);
        }
    };

    if (emailSent) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Text style={styles.successEmoji}>✉️</Text>
                    </View>
                    <Text style={styles.successTitle}>Check your email</Text>
                    <Text style={styles.successText}>
                        We've sent password reset instructions to {email}
                    </Text>
                    <Button
                        title="Back to Login"
                        onPress={() => navigation.navigate('Login')}
                        fullWidth
                        style={styles.successButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.backButton}>← Back</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Reset password</Text>
                        <Text style={styles.subtitle}>
                            Enter your email and we'll send you instructions to reset your password
                        </Text>
                    </View>

                    {/* Form */}
                    <GlassCard style={styles.formCard} padding="lg">
                        {error && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>{error.message}</Text>
                            </View>
                        )}

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="your@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            error={emailError}
                        />

                        <Button
                            title="Send Reset Link"
                            onPress={handleReset}
                            loading={isLoading}
                            fullWidth
                            style={styles.submitButton}
                        />
                    </GlassCard>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.screen.horizontal,
    },
    header: {
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    backButton: {
        ...typography.styles.body,
        color: colors.accent.primary,
    },
    titleSection: {
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.styles.h1,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.styles.body,
        color: colors.text.secondary,
        lineHeight: 22,
    },
    formCard: {
        marginBottom: spacing.xl,
    },
    errorBanner: {
        backgroundColor: 'rgba(214, 104, 83, 0.15)',
        borderRadius: 8,
        padding: spacing.md,
        marginBottom: spacing.base,
    },
    errorText: {
        ...typography.styles.bodySm,
        color: colors.accent.error,
    },
    submitButton: {
        marginTop: spacing.md,
    },
    // Success state
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.screen.horizontal,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.glass.medium,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    successEmoji: {
        fontSize: 36,
    },
    successTitle: {
        ...typography.styles.h2,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    successText: {
        ...typography.styles.body,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing['2xl'],
    },
    successButton: {
        marginTop: spacing.md,
    },
});
