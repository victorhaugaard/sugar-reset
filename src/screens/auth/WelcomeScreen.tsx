/**
 * Welcome Screen
 * 
 * Entry point with app branding and auth options.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Button } from '../../components';
import { colors, typography, spacing } from '../../theme';

type WelcomeScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
    return (
        <LinearGradient
            colors={[colors.gradients.warmStart, colors.background.primary]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />

                {/* Logo & Branding */}
                <View style={styles.brandingSection}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>SR</Text>
                    </View>
                    <Text style={styles.appName}>SugarReset</Text>
                    <Text style={styles.slogan}>Quit sugar. Built on habit science.</Text>
                </View>

                {/* Benefits */}
                <View style={styles.benefitsSection}>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>📊</Text>
                        <Text style={styles.benefitText}>Better glucose levels</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>✨</Text>
                        <Text style={styles.benefitText}>Clearer skin</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>😴</Text>
                        <Text style={styles.benefitText}>Improved sleep</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>⚡</Text>
                        <Text style={styles.benefitText}>More energy</Text>
                    </View>
                </View>

                {/* Auth Buttons */}
                <View style={styles.authSection}>
                    <Button
                        title="Get Started"
                        onPress={() => navigation.navigate('SignUp')}
                        fullWidth
                        size="lg"
                    />

                    <Button
                        title="I already have an account"
                        onPress={() => navigation.navigate('Login')}
                        variant="ghost"
                        fullWidth
                        style={styles.loginButton}
                    />
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    By continuing, you agree to our Terms of Service
                </Text>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.screen.horizontal,
        justifyContent: 'space-between',
    },
    brandingSection: {
        alignItems: 'center',
        paddingTop: spacing['5xl'],
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.text.inverse,
    },
    appName: {
        ...typography.styles.h1,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    slogan: {
        ...typography.styles.body,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    benefitsSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.md,
        paddingVertical: spacing['2xl'],
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glass.light,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 20,
        gap: spacing.sm,
    },
    benefitIcon: {
        fontSize: 16,
    },
    benefitText: {
        ...typography.styles.bodySm,
        color: colors.text.primary,
    },
    authSection: {
        gap: spacing.md,
    },
    loginButton: {
        marginTop: spacing.xs,
    },
    footer: {
        ...typography.styles.caption,
        color: colors.text.muted,
        textAlign: 'center',
        paddingVertical: spacing.lg,
    },
});
