/**
 * SignUpScreen
 * 
 * User registration with sky theme.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, borderRadius } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../context/UserDataContext';

type SignUpScreenProps = {
    navigation: NativeStackNavigationProp<any, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
    const { signUp } = useAuth();
    const { onboardingData } = useUserData();

    // Prefill name if available from onboarding
    const [name, setName] = useState(onboardingData?.nickname || '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async () => {
        setLoading(true);
        setError('');

        try {
            const success = await signUp(email.trim(), password, name.trim());
            if (success) {
                // Navigate to Main app after successful signup
                console.log('Sign up successful - navigating to Main');
                navigation.getParent()?.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            } else {
                setError('Failed to create account');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Sign up error:', err);
            const errorMessage = err?.message || 'Failed to sign up';
            if (errorMessage.includes('email-already-in-use')) {
                setError('This email is already registered');
            } else if (errorMessage.includes('weak-password')) {
                setError('Password is too weak');
            } else if (errorMessage.includes('invalid-email')) {
                setError('Invalid email address');
            } else {
                setError('Sign up failed. Please try again.');
            }
            setLoading(false);
        }
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const isValid = name.length >= 2 && email.includes('@') && password.length >= 6;

    return (
        <LooviBackground variant="blueTop">
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.emoji}>🌱</Text>
                            <Text style={styles.title}>Create account</Text>
                            <Text style={styles.subtitle}>Start your sugar-free journey</Text>
                        </View>

                        {/* Form */}
                        <GlassCard variant="light" padding="lg" style={styles.formCard}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Your name"
                                    placeholderTextColor={looviColors.text.muted}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="your@email.com"
                                    placeholderTextColor={looviColors.text.muted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="At least 6 characters"
                                    placeholderTextColor={looviColors.text.muted}
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>

                            {error ? (
                                <Text style={styles.errorText}>{error}</Text>
                            ) : null}
                        </GlassCard>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            style={[styles.signUpButton, !isValid && styles.signUpButtonDisabled]}
                            onPress={handleSignUp}
                            disabled={!isValid || loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signUpButtonText}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        {/* Terms */}
                        <Text style={styles.terms}>
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </Text>

                        {/* Login Link */}
                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={handleLogin}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LooviBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing['2xl'],
        paddingBottom: spacing['2xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    emoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
    },
    formCard: {
        marginBottom: spacing.xl,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.secondary,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 16,
        fontWeight: '400',
        color: looviColors.text.primary,
    },
    signUpButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: spacing.lg,
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    signUpButtonDisabled: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        shadowOpacity: 0,
    },
    signUpButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    terms: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.accent.primary,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.accent.error,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});
