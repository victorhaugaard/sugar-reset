/**
 * LaunchScreen
 * 
 * Entry point with calm, science-based tone.
 * Minimal design with organic gradient and subtle fade-in animation.
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing } from '../../theme';

// Type for navigation - will be part of onboarding stack
type LaunchScreenProps = {
    navigation: NativeStackNavigationProp<any, 'Launch'>;
};

export default function LaunchScreen({ navigation }: LaunchScreenProps) {
    // Fade-in animation using React Native's Animated API
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGetStarted = () => {
        navigation.navigate('IntentSelection');
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <LinearGradient
            colors={[colors.gradients.warmStart, colors.background.primary, colors.background.primary]}
            locations={[0, 0.4, 1]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Spacer for vertical centering */}
                    <View style={styles.topSpacer} />

                    {/* App Branding */}
                    <View style={styles.brandingSection}>
                        <Text style={styles.appName}>SugarReset</Text>
                        <Text style={styles.subtitle}>
                            Quit sugar using habit science
                        </Text>
                    </View>

                    {/* Spacer */}
                    <View style={styles.middleSpacer} />

                    {/* Bottom Actions */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleGetStarted}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>Get started</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleLogin}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryButtonText}>
                                I already have an account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
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
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.screen.horizontal,
    },
    topSpacer: {
        flex: 2,
    },
    brandingSection: {
        alignItems: 'center',
    },
    appName: {
        fontSize: 42,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -1,
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: 17,
        fontWeight: '400',
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    middleSpacer: {
        flex: 3,
    },
    actionSection: {
        paddingBottom: spacing['2xl'],
        gap: spacing.lg,
    },
    primaryButton: {
        backgroundColor: colors.accent.primary,
        paddingVertical: spacing.lg,
        borderRadius: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.inverse,
    },
    secondaryButton: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text.tertiary,
    },
});
