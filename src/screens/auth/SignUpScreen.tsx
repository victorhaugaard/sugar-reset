/**
 * Sign Up Screen
 * 
 * New user registration form.
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
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Button, Input, GlassCard } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing } from '../../theme';

type SignUpScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
    const { signUp, isLoading, error, clearError } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        displayName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validate = (): boolean => {
        const errors: typeof validationErrors = {};

        if (!displayName.trim()) {
            errors.displayName = 'Name is required';
        }

        if (!email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSignUp = async () => {
        clearError();
        if (!validate()) return;

        const success = await signUp(email, password, displayName.trim());
        if (success) {
            // Navigation will be handled by auth state change
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.backButton}>← Back</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Create account</Text>
                        <Text style={styles.subtitle}>Start your sugar-free journey</Text>
                    </View>

                    {/* Form */}
                    <GlassCard style={styles.formCard} padding="lg">
                        {error && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>{error.message}</Text>
                            </View>
                        )}

                        <Input
                            label="Your name"
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Enter your name"
                            autoComplete="name"
                            error={validationErrors.displayName}
                        />

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="your@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            error={validationErrors.email}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
                            secureTextEntry
                            autoComplete="password-new"
                            error={validationErrors.password}
                        />

                        <Input
                            label="Confirm password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            secureTextEntry
                            autoComplete="password-new"
                            error={validationErrors.confirmPassword}
                        />

                        <Button
                            title="Create Account"
                            onPress={handleSignUp}
                            loading={isLoading}
                            fullWidth
                            style={styles.submitButton}
                        />
                    </GlassCard>

                    {/* Sign In Link */}
                    <View style={styles.signInSection}>
                        <Text style={styles.signInText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.signInLink}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
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
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.styles.body,
        color: colors.text.secondary,
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
    signInSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
    },
    signInText: {
        ...typography.styles.body,
        color: colors.text.secondary,
    },
    signInLink: {
        ...typography.styles.bodyMedium,
        color: colors.accent.primary,
    },
});
