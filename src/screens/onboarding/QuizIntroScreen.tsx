/**
 * QuizIntroScreen
 * 
 * Welcome screen after "Get Started" that introduces the quiz.
 * Shows Sugarest logo and explains we'll identify sugar habits.
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import GradientText from '../../components/GradientText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type QuizIntroScreenProps = {
    navigation: NativeStackNavigationProp<any, 'QuizIntro'>;
};

export default function QuizIntroScreen({ navigation }: QuizIntroScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleStart = () => {
        navigation.navigate('SugarDefinition');
    };

    const handleSkip = () => {
        navigation.navigate('ComprehensiveQuiz', { skip: true });
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
                    {/* Brand */}
                    <View style={styles.brandContainer}>
                        <Text style={styles.brandText}>sugarest.</Text>
                    </View>

                    {/* Content Area */}
                    <View style={styles.mainContent}>
                        {/* Eyebrow Label */}
                        <Text style={styles.eyebrow}>EAT BETTER. FEEL BETTER.</Text>

                        {/* Primary Headline */}
                        <Text style={styles.headline}>
                            Take Control Of Your Eating Habits
                        </Text>

                        {/* Emotional Reassurance */}
                        <Text style={styles.reassurance}>
                            A personalised plan is waiting for you, designed to make you feel better, more in control, and aligned with your goals.
                        </Text>

                        {/* Value Line Section */}
                        <View style={styles.valueSection}>
                            <GradientText 
                                text="Discover how sugar affects your:"
                                colors={['#FF8C42', '#FF6B6B']} // Orange gradient
                                fontSize={14}
                                fontWeight="700"
                                fontStyle="italic"
                                style={styles.gradientTitle}
                            />
                            <View style={styles.valueGrid}>
                                <View style={styles.valueItem}>
                                    <View style={[styles.iconCircle, { backgroundColor: '#FFF5F5' }]}>
                                        <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FF6B6B" />
                                    </View>
                                    <Text style={styles.valueLabel}>Energy</Text>
                                </View>
                                <View style={styles.valueItem}>
                                    <View style={[styles.iconCircle, { backgroundColor: '#F5F9FF' }]}>
                                        <Ionicons name="happy" size={24} color="#4DABF7" />
                                    </View>
                                    <Text style={styles.valueLabel}>Mood</Text>
                                </View>
                                <View style={styles.valueItem}>
                                    <View style={[styles.iconCircle, { backgroundColor: '#F2F9F2' }]}>
                                        <MaterialCommunityIcons name="sprout" size={24} color="#51CF66" />
                                    </View>
                                    <Text style={styles.valueLabel}>Health</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Spacer */}
                    <View style={styles.spacer} />

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        {/* Start Button */}
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={handleStart}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.startButtonText}>Start Now</Text>
                        </TouchableOpacity>

                        {/* Skip Link */}
                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={handleSkip}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.skipText}>skip</Text>
                        </TouchableOpacity>
                    </View>
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
        paddingTop: spacing['5xl'],
        paddingBottom: spacing['2xl'],
    },
    brandContainer: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    brandText: {
        fontSize: 18,
        fontWeight: '300',
        color: looviColors.text.primary,
        opacity: 0.8,
    },
    mainContent: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    eyebrow: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.primary,
        letterSpacing: 3,
        opacity: 0.5,
        marginBottom: spacing.md,
    },
    headline: {
        fontSize: 32,
        fontWeight: '800',
        color: looviColors.text.primary,
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: spacing.lg,
    },
    reassurance: {
        fontSize: 16,
        fontWeight: '500',
        color: looviColors.text.primary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.sm,
        marginBottom: spacing['2xl'],
    },
    valueSection: {
        width: '100%',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    gradientTitle: {
        marginBottom: spacing.xl,
    },
    valueGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: spacing.sm,
    },
    valueItem: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    valueLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.tertiary,
    },
    spacer: {
        flex: 1,
    },
    actionsContainer: {
        width: '100%',
        gap: spacing.md,
    },
    startButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.coralOrange,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        opacity: 0.6,
    },
});
