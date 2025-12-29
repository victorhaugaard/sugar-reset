/**
 * BreathingExerciseScreen
 * 
 * Guided box breathing exercise (4-4-4-4) to manage cravings.
 * Animated circle expands/contracts with breathing rhythm.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';

type BreathingExerciseScreenProps = {
    navigation: NativeStackNavigationProp<any, 'BreathingExercise'>;
};

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_DURATION = 4000; // 4 seconds
const PHASE_INSTRUCTIONS = {
    inhale: 'Breathe In',
    hold1: 'Hold',
    exhale: 'Breathe Out',
    hold2: 'Hold',
};

export default function BreathingExerciseScreen({ navigation }: BreathingExerciseScreenProps) {
    const [phase, setPhase] = useState<Phase>('inhale');
    const [countdown, setCountdown] = useState(4);
    const [cycleCount, setCycleCount] = useState(0);

    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        // Start animation based on current phase
        const targetScale = (phase === 'inhale' || phase === 'hold1') ? 1 : 0.5;
        const targetOpacity = (phase === 'inhale' || phase === 'hold1') ? 0.9 : 0.6;

        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: targetScale,
                duration: phase.includes('hold') ? 0 : PHASE_DURATION,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: targetOpacity,
                duration: phase.includes('hold') ? 0 : PHASE_DURATION,
                useNativeDriver: true,
            }),
        ]).start();
    }, [phase]);

    useEffect(() => {
        // Reset countdown when phase changes
        setCountdown(4);

        // Countdown timer
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return 1; // Stay at 1 until phase changes
                }
                return prev - 1;
            });
        }, 1000);

        // Phase progression
        const phaseTimeout = setTimeout(() => {
            setPhase((currentPhase) => {
                const phases: Phase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
                const currentIndex = phases.indexOf(currentPhase);
                const nextIndex = (currentIndex + 1) % phases.length;

                if (nextIndex === 0) {
                    setCycleCount((prev) => prev + 1);
                }

                return phases[nextIndex];
            });
        }, PHASE_DURATION);

        return () => {
            clearInterval(countdownInterval);
            clearTimeout(phaseTimeout);
        };
    }, [phase]);

    const instruction = PHASE_INSTRUCTIONS[phase];

    return (
        <LooviBackground variant="blueTop">
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Box Breathing</Text>
                        <Text style={styles.subtitle}>
                            Cravings typically pass in 3-5 minutes
                        </Text>
                    </View>

                    {/* Animated Circle */}
                    <View style={styles.circleContainer}>
                        <Animated.View
                            style={[
                                styles.circle,
                                {
                                    transform: [{ scale: scaleAnim }],
                                    opacity: opacityAnim,
                                },
                            ]}
                        />
                        <View style={styles.instructionContainer}>
                            <Text style={styles.instruction}>{instruction}</Text>
                            <Text style={styles.countdown}>{countdown}</Text>
                        </View>
                    </View>

                    {/* Progress */}
                    <View style={styles.progressContainer}>
                        <Text style={styles.cycleText}>Cycle {cycleCount + 1}</Text>
                        <Text style={styles.tipText}>
                            💡 Focus on the rhythm. Let thoughts pass like clouds.
                        </Text>
                    </View>
                </View>

                {/* Done Button */}
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.doneText}>I'm Calm Now</Text>
                </TouchableOpacity>

                {/* Exit Button */}
                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.exitText}>✕</Text>
                </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
    },
    header: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
    },
    circleContainer: {
        width: 300,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: looviColors.accent.primary,
    },
    instructionContainer: {
        alignItems: 'center',
    },
    instruction: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: spacing.sm,
    },
    countdown: {
        fontSize: 48,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    progressContainer: {
        alignItems: 'center',
    },
    cycleText: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.md,
    },
    tipText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    doneButton: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: looviColors.accent.success,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    exitButton: {
        position: 'absolute',
        top: spacing.xl,
        right: spacing.xl,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exitText: {
        fontSize: 24,
        fontWeight: '300',
        color: '#FFFFFF',
    },
});
