/**
 * SugarestWelcomeScreen
 * 
 * Welcome screen after the Learn About Sugar section.
 * Introduces Sugarest with captivating text.
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SugarestWelcomeScreenProps = {
    navigation: NativeStackNavigationProp<any, 'SugarestWelcome'>;
};

export default function SugarestWelcomeScreen({ navigation }: SugarestWelcomeScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleContinue = () => {
        navigation.navigate('FeatureShowcase');
    };

    return (
        <LooviBackground variant="coralTop">
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
                    {/* Logo with fade animation */}
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{
                                    scale: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1]
                                    })
                                }]
                            }
                        ]}
                    >
                        <Animated.Image
                            source={require('../../public/sugarestlogo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    {/* Welcome Message */}
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <GlassCard variant="light" padding="lg" style={styles.welcomeCard}>
                            <Text style={styles.welcomeTitle}>Welcome to Sugarest</Text>
                            <Text style={styles.welcomeSubtitle}>Your journey to sugar freedom starts here</Text>

                            <View style={styles.divider} />

                            <Text style={styles.welcomeText}>
                                You've taken the first step by understanding how sugar affects you.
                                Now, let us show you how thousands of people just like you have
                                transformed their relationship with sugar.
                            </Text>

                            <View style={styles.features}>
                                <View style={styles.featureRow}>
                                    <Text style={styles.featureEmoji}>🎯</Text>
                                    <Text style={styles.featureText}>Personalized to your triggers</Text>
                                </View>
                                <View style={styles.featureRow}>
                                    <Text style={styles.featureEmoji}>📊</Text>
                                    <Text style={styles.featureText}>Science-backed approach</Text>
                                </View>
                                <View style={styles.featureRow}>
                                    <Text style={styles.featureEmoji}>💪</Text>
                                    <Text style={styles.featureText}>Daily support & motivation</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </Animated.View>

                    {/* Tagline */}
                    <Text style={styles.tagline}>
                        Break free from sugar. Feel amazing. Live better.
                    </Text>

                    {/* Spacer */}
                    <View style={styles.spacer} />

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueButtonText}>See Success Stories →</Text>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </LooviBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.lg,
        paddingBottom: spacing['2xl'],
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    logo: {
        width: SCREEN_WIDTH * 0.4,
        height: SCREEN_WIDTH * 0.25,
    },
    welcomeCard: {
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    welcomeSubtitle: {
        fontSize: 15,
        fontWeight: '500',
        color: looviColors.accent.primary,
        marginBottom: spacing.md,
    },
    divider: {
        width: 60,
        height: 3,
        backgroundColor: looviColors.accent.primary,
        borderRadius: 2,
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    features: {
        alignSelf: 'stretch',
        gap: spacing.sm,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    featureEmoji: {
        fontSize: 20,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.primary,
    },
    tagline: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginTop: spacing.xl,
        fontStyle: 'italic',
    },
    spacer: {
        flex: 1,
    },
    continueButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.coralOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 5,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
