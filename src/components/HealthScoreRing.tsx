/**
 * HealthScoreRing
 * 
 * A circular progress ring showing overall health score (0-100).
 * Based on wellness averages: mood, energy, focus, sleep.
 * Features floating animation and glow effect.
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme';
import { looviColors } from './LooviBackground';

interface HealthScoreRingProps {
    mood: number;      // 1-5
    energy: number;    // 1-5
    focus: number;     // 1-5
    sleep: number;     // hours (target: 7-9)
    overallScore?: number; // Optional: comprehensive health score (0-100) from analytics
}

function calculateHealthScore(mood: number, energy: number, focus: number, sleep: number): number {
    // Normalize each metric to 0-100
    const moodScore = ((mood - 1) / 4) * 100;      // 1-5 -> 0-100
    const energyScore = ((energy - 1) / 4) * 100; // 1-5 -> 0-100
    const focusScore = ((focus - 1) / 4) * 100;   // 1-5 -> 0-100

    // Sleep score: optimal is 7-9 hours
    let sleepScore = 0;
    if (sleep >= 7 && sleep <= 9) {
        sleepScore = 100;
    } else if (sleep >= 6 && sleep < 7) {
        sleepScore = 70;
    } else if (sleep > 9 && sleep <= 10) {
        sleepScore = 80;
    } else if (sleep >= 5 && sleep < 6) {
        sleepScore = 50;
    } else {
        sleepScore = 30;
    }

    // Weighted average
    const weights = { mood: 0.3, energy: 0.25, focus: 0.25, sleep: 0.2 };
    const score =
        moodScore * weights.mood +
        energyScore * weights.energy +
        focusScore * weights.focus +
        sleepScore * weights.sleep;

    return Math.round(score);
}

function getScoreColor(score: number): string {
    if (score >= 75) return looviColors.accent.success;
    if (score >= 50) return looviColors.accent.warning;
    return '#EF4444'; // Red
}

function getScoreGradient(score: number): { start: string; end: string } {
    if (score >= 75) return { start: '#22C55E', end: '#16A34A' };
    if (score >= 50) return { start: looviColors.accent.primary, end: looviColors.coralDark };
    return { start: '#EF4444', end: '#DC2626' };
}

function getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
}

export function HealthScoreRing({ mood, energy, focus, sleep, overallScore }: HealthScoreRingProps) {
    // Check if there's any data
    const hasData = mood > 0 || energy > 0 || focus > 0 || sleep > 0 || (overallScore !== undefined && overallScore > 0);

    // Use overallScore if provided (from Analytics), otherwise calculate from wellness metrics
    const score = overallScore !== undefined ? overallScore : calculateHealthScore(mood, energy, focus, sleep);
    const color = getScoreColor(score);
    const gradient = getScoreGradient(score);
    const label = getScoreLabel(score);

    const size = 160;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const offset = circumference - progress;

    // Floating animation
    const floatAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        // Floating animation
        const floating = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -8,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        // Glow pulsing animation
        const glowing = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.8,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.4,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        floating.start();
        glowing.start();

        return () => {
            floating.stop();
            glowing.stop();
        };
    }, [floatAnim, glowAnim]);

    if (!hasData) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Ionicons name="analytics-outline" size={48} color={looviColors.text.muted} />
                    <Text style={styles.emptyTitle}>No Data Yet</Text>
                    <Text style={styles.emptyText}>Start logging your wellness and food to see your health score</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Glow effect behind the ring */}
            <Animated.View
                style={[
                    styles.glowContainer,
                    {
                        opacity: glowAnim,
                        shadowColor: color,
                        transform: [{ translateY: floatAnim }]
                    }
                ]}
            >
                <View style={[styles.glowCircle, { backgroundColor: color }]} />
            </Animated.View>

            {/* Floating ring container */}
            <Animated.View
                style={[
                    styles.ringContainer,
                    { transform: [{ translateY: floatAnim }] }
                ]}
            >
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={gradient.start} />
                            <Stop offset="100%" stopColor={gradient.end} />
                        </LinearGradient>
                    </Defs>
                    {/* Background circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(0, 0, 0, 0.06)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress circle with gradient */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#scoreGradient)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>
                <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreValue, { color }]}>{score}</Text>
                    <Text style={styles.scoreUnit}>/ 100</Text>
                </View>
            </Animated.View>

            <Text style={[styles.label, { color }]}>{label}</Text>
            <Text style={styles.subtitle}>Overall Health Score</Text>

            {/* Breakdown with icons */}
            <View style={styles.breakdown}>
                <View style={styles.metric}>
                    <View style={[styles.metricIconBg, { backgroundColor: `${looviColors.accent.primary}15` }]}>
                        <Ionicons name="happy-outline" size={18} color={looviColors.accent.primary} />
                    </View>
                    <Text style={styles.metricLabel}>Mood</Text>
                    <Text style={styles.metricValue}>{mood.toFixed(1)}</Text>
                </View>
                <View style={styles.metric}>
                    <View style={[styles.metricIconBg, { backgroundColor: `${looviColors.accent.warning}15` }]}>
                        <Ionicons name="flash-outline" size={18} color={looviColors.accent.warning} />
                    </View>
                    <Text style={styles.metricLabel}>Energy</Text>
                    <Text style={styles.metricValue}>{energy.toFixed(1)}</Text>
                </View>
                <View style={styles.metric}>
                    <View style={[styles.metricIconBg, { backgroundColor: `${looviColors.skyBlue}15` }]}>
                        <Ionicons name="bulb-outline" size={18} color={looviColors.skyBlue} />
                    </View>
                    <Text style={styles.metricLabel}>Focus</Text>
                    <Text style={styles.metricValue}>{focus.toFixed(1)}</Text>
                </View>
                <View style={styles.metric}>
                    <View style={[styles.metricIconBg, { backgroundColor: `${looviColors.accent.success}15` }]}>
                        <Ionicons name="bed-outline" size={18} color={looviColors.accent.success} />
                    </View>
                    <Text style={styles.metricLabel}>Sleep</Text>
                    <Text style={styles.metricValue}>{sleep.toFixed(1)}h</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    glowContainer: {
        position: 'absolute',
        top: spacing.md,
    },
    glowCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.2,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
        elevation: 10,
    },
    ringContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    scoreContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: -1,
    },
    scoreUnit: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: -4,
    },
    label: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: spacing.md,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    breakdown: {
        flexDirection: 'row',
        marginTop: spacing.xl,
        gap: spacing.lg,
    },
    metric: {
        alignItems: 'center',
    },
    metricIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    metricValue: {
        fontSize: 15,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        textAlign: 'center',
        maxWidth: 200,
    },
});
