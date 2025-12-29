/**
 * AchievementPopup
 * 
 * Celebratory modal shown when user unlocks an achievement.
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius } from '../theme';
import { skyColors } from '../components/SkyBackground';
import { Achievement } from '../utils/achievementUtils';

interface AchievementPopupProps {
    visible: boolean;
    achievement: Achievement | null;
    onClose: () => void;
}

export default function AchievementPopup({ visible, achievement, onClose }: AchievementPopupProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible && achievement) {
            // Entrance animation
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset for next time
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
        }
    }, [visible, achievement]);

    if (!achievement) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <SafeAreaView style={styles.safeArea}>
                    <Animated.View
                        style={[
                            styles.container,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
                        {/* Celebration Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerText}>🎉 ACHIEVEMENT UNLOCKED! 🎉</Text>
                        </View>

                        {/* Achievement Content */}
                        <View style={styles.content}>
                            <Text style={styles.emoji}>{achievement.emoji}</Text>
                            <Text style={styles.title}>{achievement.title}</Text>
                            <Text style={styles.description}>{achievement.description}</Text>
                            <View style={styles.messageContainer}>
                                <Text style={styles.message}>{achievement.message}</Text>
                            </View>
                        </View>

                        {/* Milestone Badge */}
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{achievement.milestone} DAYS</Text>
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Awesome! 🚀</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeArea: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        backgroundColor: skyColors.accent.primary,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    content: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: skyColors.text.primary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        fontWeight: '500',
        color: skyColors.text.tertiary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    messageContainer: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: skyColors.accent.primary,
    },
    message: {
        fontSize: 16,
        fontWeight: '400',
        color: skyColors.text.secondary,
        lineHeight: 24,
        textAlign: 'center',
    },
    badge: {
        backgroundColor: skyColors.accent.success,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        alignSelf: 'center',
        borderRadius: borderRadius.full,
        marginBottom: spacing.lg,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    button: {
        backgroundColor: skyColors.accent.primary,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
