/**
 * Login Screen
 * 
 * Email/password sign in form.
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

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const { signIn, isLoading, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const validate = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        if (!email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!password) {
            errors.password = 'Password is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async () => {
        clearError();
        if (!validate()) return;

        const success = await signIn(email, password);
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
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
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
                            error={validationErrors.email}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry
                            autoComplete="password"
                            error={validationErrors.password}
                        />

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotPassword}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            fullWidth
                            style={styles.submitButton}
                        />
                    </GlassCard>

                    {/* Sign Up Link */}
                    <View style={styles.signUpSection}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.signUpLink}>Sign up</Text>
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -spacing.sm,
        marginBottom: spacing.lg,
    },
    forgotPasswordText: {
        ...typography.styles.bodySm,
        color: colors.accent.primary,
    },
    submitButton: {
        marginTop: spacing.sm,
    },
    signUpSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
    },
    signUpText: {
        ...typography.styles.body,
        color: colors.text.secondary,
    },
    signUpLink: {
        ...typography.styles.bodyMedium,
        color: colors.accent.primary,
    },
});
