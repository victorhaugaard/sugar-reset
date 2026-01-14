/**
 * ReasonsScreen - "My Why" 
 * 
 * Instagram stories-style experience for browsing motivational reasons.
 * Features:
 * - Progress indicator at top (stories style)
 * - Mix of facts, user data, and social pressure
 * - Personalized based on streak and goals
 * - Tap to navigate
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { useUserData } from '../context/UserDataContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ReasonsScreenProps = {
    navigation: NativeStackNavigationProp<any, 'Reasons'>;
};

// Colors for dark calming theme
const colors = {
    bg: '#0F0F1E',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    accent: '#E8A87C', // Warm coral
    progressActive: '#E8A87C',
    progressInactive: 'rgba(255, 255, 255, 0.2)',
    factBg: 'rgba(136, 164, 214, 0.15)',
    dataBg: 'rgba(127, 176, 105, 0.15)',
    socialBg: 'rgba(245, 180, 97, 0.15)',
};

type ReasonType = 'fact' | 'personal' | 'social';

interface Reason {
    emoji: string;
    title: string;
    message: string;
    type: ReasonType;
    source?: string; // For facts
}

// Generate personalized reasons based on user data
const generateReasons = (streakDays: number, goals: string[]): Reason[] => {
    const reasons: Reason[] = [];

    // Always start with user's streak progress
    if (streakDays > 0) {
        reasons.push({
            emoji: '🔥',
            title: `${streakDays} Day${streakDays > 1 ? 's' : ''} Strong`,
            message: streakDays < 7 
                ? `You're building momentum! Just ${7 - streakDays} more days to your first week.`
                : streakDays < 30
                    ? `Amazing progress! ${30 - streakDays} days until your one-month milestone.`
                    : `Incredible! You've proven you can do this. Don't stop now.`,
            type: 'personal',
        });
    }

    // Scientific facts with sources
    reasons.push({
        emoji: '🧠',
        title: 'Break the Cycle',
        message: 'Cravings are temporary - usually lasting only 3-5 minutes. This too shall pass.',
        type: 'fact',
        source: 'Neuroscience research',
    });

    reasons.push({
        emoji: '⏱️',
        title: 'The 15-Minute Rule',
        message: 'If you wait 15 minutes, most cravings will significantly reduce or disappear completely.',
        type: 'fact',
        source: 'Behavioral psychology',
    });

    // Goal-based personalization
    if (goals.includes('energy')) {
        reasons.push({
            emoji: '⚡',
            title: 'Stable Energy Awaits',
            message: 'Sugar causes energy spikes followed by crashes. Your body is learning to burn fat for steady fuel.',
            type: 'personal',
        });
    }

    if (goals.includes('weight')) {
        reasons.push({
            emoji: '⚖️',
            title: 'Your Body is Transforming',
            message: 'Every sugar-free day reduces inflammation and helps your metabolism reset. The scale will follow.',
            type: 'personal',
        });
    }

    if (goals.includes('skin')) {
        reasons.push({
            emoji: '✨',
            title: 'Skin is Clearing',
            message: 'Sugar accelerates aging through glycation. Your skin thanks you for every day without it.',
            type: 'personal',
        });
    }

    // Social pressure / community
    reasons.push({
        emoji: '👥',
        title: 'You\'re Not Alone',
        message: 'Thousands of people are on this journey with you right now. Your strength inspires others.',
        type: 'social',
    });

    // More facts
    reasons.push({
        emoji: '💪',
        title: 'Building Willpower',
        message: 'Research shows willpower is like a muscle. Each time you resist, you get stronger.',
        type: 'fact',
        source: 'Stanford research',
    });

    reasons.push({
        emoji: '🔄',
        title: 'Rewiring Your Brain',
        message: 'It takes 21-66 days to form new neural pathways. You\'re literally changing your brain.',
        type: 'fact',
        source: 'European Journal of Social Psychology',
    });

    // Personalized encouragement based on streak
    if (streakDays >= 3) {
        reasons.push({
            emoji: '🌟',
            title: 'Past the Hardest Part',
            message: 'Days 2-3 are the toughest. You\'ve already conquered them. It only gets easier from here.',
            type: 'personal',
        });
    }

    if (streakDays >= 7) {
        reasons.push({
            emoji: '🎯',
            title: 'One Week Warrior',
            message: 'A full week! Your taste buds are resetting. Food will start tasting better naturally.',
            type: 'personal',
        });
    }

    // More universal reasons
    reasons.push({
        emoji: '💰',
        title: 'Saving Money',
        message: `You've saved money by not buying sugary snacks. Put it toward something meaningful.`,
        type: 'personal',
    });

    reasons.push({
        emoji: '😴',
        title: 'Better Sleep Coming',
        message: 'Sugar disrupts sleep cycles. Your sleep quality is improving even if you don\'t notice yet.',
        type: 'fact',
        source: 'Sleep Foundation',
    });

    reasons.push({
        emoji: '❤️',
        title: 'Self-Love in Action',
        message: 'Saying no to sugar is saying yes to yourself. This is what caring for yourself looks like.',
        type: 'personal',
    });

    reasons.push({
        emoji: '🧘',
        title: 'Freedom Over Addiction',
        message: 'Every "no" is a step toward freedom. You\'re proving you control your choices, not cravings.',
        type: 'personal',
    });

    return reasons;
};

export default function ReasonsScreen({ navigation }: ReasonsScreenProps) {
    const { onboardingData, streakData } = useUserData();
    const [currentIndex, setCurrentIndex] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const streakDays = streakData?.currentStreak || 0;
    const goals = onboardingData.goals || [];
    const reasons = React.useMemo(() => generateReasons(streakDays, goals), [streakDays, goals]);

    // Auto-advance timer (optional - can be removed for pure tap navigation)
    useEffect(() => {
        progressAnim.setValue(0);
        
        // Animate progress bar
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 8000, // 8 seconds per reason
            useNativeDriver: false,
        }).start();

        const timer = setTimeout(() => {
            handleNext();
        }, 8000);

        return () => clearTimeout(timer);
    }, [currentIndex]);

    const handleNext = () => {
        if (currentIndex < reasons.length - 1) {
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            setCurrentIndex(prev => prev + 1);
        } else {
            navigation.goBack();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleTap = (event: any) => {
        const { locationX } = event.nativeEvent;
        if (locationX < SCREEN_WIDTH / 3) {
            handlePrev();
        } else {
            handleNext();
        }
    };

    const currentReason = reasons[currentIndex];

    const getTypeColor = (type: ReasonType) => {
        switch (type) {
            case 'fact': return colors.factBg;
            case 'personal': return colors.dataBg;
            case 'social': return colors.socialBg;
        }
    };

    const getTypeLabel = (type: ReasonType) => {
        switch (type) {
            case 'fact': return '📊 Research';
            case 'personal': return '💪 Your Progress';
            case 'social': return '👥 Community';
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Stories-style Progress Indicator */}
                <View style={styles.progressContainer}>
                    {reasons.map((_, index) => (
                        <View key={index} style={styles.progressBarWrapper}>
                            <View style={styles.progressBarBg}>
                                {index < currentIndex ? (
                                    <View style={[styles.progressBarFill, { width: '100%' }]} />
                                ) : index === currentIndex ? (
                                    <Animated.View 
                                        style={[
                                            styles.progressBarFill, 
                                            { 
                                                width: progressAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%'],
                                                })
                                            }
                                        ]} 
                                    />
                                ) : null}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>

                {/* Main Content - Tap Area */}
                <Pressable style={styles.tapArea} onPress={handleTap}>
                    <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                        {/* Type Badge */}
                        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(currentReason.type) }]}>
                            <Text style={styles.typeBadgeText}>{getTypeLabel(currentReason.type)}</Text>
                        </View>

                        {/* Emoji */}
                        <Text style={styles.emoji}>{currentReason.emoji}</Text>

                        {/* Title */}
                        <Text style={styles.title}>{currentReason.title}</Text>

                        {/* Message */}
                        <Text style={styles.message}>{currentReason.message}</Text>

                        {/* Source (for facts) */}
                        {currentReason.source && (
                            <Text style={styles.source}>— {currentReason.source}</Text>
                        )}
                    </Animated.View>

                    {/* Navigation hints */}
                    <View style={styles.navHints}>
                        <View style={styles.navHintLeft}>
                            {currentIndex > 0 && (
                                <Feather name="chevron-left" size={20} color={colors.textMuted} />
                            )}
                        </View>
                        <Text style={styles.counter}>{currentIndex + 1} / {reasons.length}</Text>
                        <View style={styles.navHintRight}>
                            <Feather name="chevron-right" size={20} color={colors.textMuted} />
                        </View>
                    </View>
                </Pressable>

                {/* Tap instruction */}
                <Text style={styles.instruction}>Tap to continue</Text>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    safeArea: {
        flex: 1,
    },
    // Stories Progress Indicator
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        gap: 4,
    },
    progressBarWrapper: {
        flex: 1,
        height: 3,
    },
    progressBarBg: {
        flex: 1,
        backgroundColor: colors.progressInactive,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.progressActive,
        borderRadius: 2,
    },
    // Close Button
    closeButton: {
        position: 'absolute',
        top: 60,
        right: spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    // Tap Area
    tapArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    // Content
    content: {
        alignItems: 'center',
        maxWidth: 340,
    },
    typeBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginBottom: spacing.xl,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
        letterSpacing: 0.5,
    },
    emoji: {
        fontSize: 72,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.md,
        lineHeight: 34,
    },
    message: {
        fontSize: 18,
        fontWeight: '400',
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    source: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textMuted,
        marginTop: spacing.lg,
        fontStyle: 'italic',
    },
    // Navigation
    navHints: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: spacing.lg,
        marginTop: spacing['3xl'],
    },
    navHintLeft: {
        width: 40,
        alignItems: 'flex-start',
    },
    navHintRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    counter: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textMuted,
    },
    instruction: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textMuted,
        textAlign: 'center',
        paddingBottom: spacing.xl,
    },
});
