/**
 * ForgotPasswordScreen
 * 
 * Password reset with sky theme.
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

type ForgotPasswordScreenProps = {
    navigation: NativeStackNavigationProp<any, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        setLoading(true);
        // TODO: Implement password reset
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1000);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const isValid = email.includes('@');

    return (
        <LooviBackground variant="subtle">
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
                        {/* Back Button */}
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={styles.backText}>← Back</Text>
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.emoji}>{sent ? '✉️' : '🔑'}</Text>
                            <Text style={styles.title}>
                                {sent ? 'Check your email' : 'Reset password'}
                            </Text>
                            <Text style={styles.subtitle}>
                                {sent
                                    ? `We sent a reset link to ${email}`
                                    : "Enter your email and we'll send you a reset link"
                                }
                            </Text>
                        </View>

                        {!sent && (
                            <>
                                {/* Form */}
                                <GlassCard variant="light" padding="lg" style={styles.formCard}>
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
                                </GlassCard>

                                {/* Reset Button */}
                                <TouchableOpacity
                                    style={[styles.resetButton, !isValid && styles.resetButtonDisabled]}
                                    onPress={handleReset}
                                    disabled={!isValid || loading}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.resetButtonText}>
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {sent && (
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={handleBack}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.resetButtonText}>Back to Login</Text>
                            </TouchableOpacity>
                        )}
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
        paddingTop: spacing.lg,
        paddingBottom: spacing['2xl'],
    },
    backButton: {
        marginBottom: spacing.xl,
    },
    backText: {
        fontSize: 15,
        fontWeight: '500',
        color: looviColors.accent.primary,
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
        textAlign: 'center',
        lineHeight: 22,
    },
    formCard: {
        marginBottom: spacing.xl,
    },
    inputGroup: {},
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
    resetButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    resetButtonDisabled: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        shadowOpacity: 0,
    },
    resetButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
