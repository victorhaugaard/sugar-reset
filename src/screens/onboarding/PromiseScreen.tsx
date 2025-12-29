/**
 * PromiseScreen
 * 
 * User makes a personal promise/commitment to themselves.
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { spacing, borderRadius } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';
import { useUserData } from '../../context/UserDataContext';

type PromiseScreenProps = {
    navigation: NativeStackNavigationProp<any, 'Promise'>;
    route: RouteProp<{ Promise: { nickname?: string } }, 'Promise'>;
};

export default function PromiseScreen({ navigation, route }: PromiseScreenProps) {
    const nickname = route.params?.nickname || 'Friend';
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const { updateOnboardingData, completeOnboarding } = useUserData();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleMakePromise = async () => {
        // Mark promise as confirmed and complete onboarding
        await updateOnboardingData({ promiseConfirmed: true });
        await completeOnboarding();
        navigation.navigate('Paywall');
    };

    return (
        <LooviBackground variant="blueDominant">
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.emoji}>🤝</Text>
                            <Text style={styles.title}>Make a promise, {nickname}</Text>
                        </View>

                        {/* Promise Card */}
                        <GlassCard variant="light" padding="lg" style={styles.promiseCard}>
                            <Text style={styles.promiseTitle}>My Promise</Text>

                            <Text style={styles.promiseText}>
                                I, <Text style={styles.highlight}>{nickname}</Text>, promise to choose{' '}
                                <Text style={styles.highlight}>health</Text> over quick fixes.
                            </Text>

                            <Text style={styles.promiseText}>
                                I choose <Text style={styles.highlight}>energy and clarity</Text> over
                                sugar crashes and brain fog.
                            </Text>

                            <Text style={styles.promiseText}>
                                I choose my <Text style={styles.highlight}>future self</Text> over
                                momentary temptations.
                            </Text>

                            <Text style={styles.promiseText}>
                                I choose <Text style={styles.highlight}>healthy habits</Text> that
                                serve my goals and dreams.
                            </Text>

                            <View style={styles.divider} />

                            <Text style={styles.promiseFooter}>
                                One day at a time. No judgment. Just progress.
                            </Text>
                        </GlassCard>

                        {/* Motivation */}
                        <Text style={styles.motivation}>
                            This is between you and yourself. {'\n'}
                            We're just here to help you succeed.
                        </Text>
                    </Animated.View>
                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.promiseButton}
                        onPress={handleMakePromise}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.promiseButtonText}>I Promise 💪</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LooviBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    content: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    emoji: {
        fontSize: 56,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    promiseCard: {
        marginBottom: spacing.xl,
    },
    promiseTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.accent.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    promiseText: {
        fontSize: 17,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    highlight: {
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    divider: {
        width: 60,
        height: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignSelf: 'center',
        marginVertical: spacing.lg,
    },
    promiseFooter: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    motivation: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.md,
        paddingBottom: spacing['2xl'],
    },
    promiseButton: {
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
    promiseButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
