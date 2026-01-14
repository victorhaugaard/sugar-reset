/**
 * PanicScreen (Craving Support)
 * 
 * Redesigned SOS/Cravings support screen with:
 * - Darker, calming theme for focus
 * - Three central buttons for main actions
 * - Each button leads to dedicated screen
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calming messages that rotate
const calmingMessages = [
    { title: "You've got this", subtitle: "Take a breath. Choose your next step." },
    { title: "Stay strong", subtitle: "This moment will pass. You're in control." },
    { title: "You're not alone", subtitle: "Reach out. Find your calm. Stay focused." },
    { title: "One moment at a time", subtitle: "Choose what helps you most right now." },
];

// Calming dark theme colors
const calmColors = {
    darkBg: '#1A1A2E',
    darkerBg: '#0F0F1E',
    text: '#E8E8F0',
    textSecondary: '#B0B0C8',
    accent1: '#88A4D6', // Calm blue - Inner Circle (swapped)
    accent2: '#F5B461', // Warm amber - Distract Me
    accent3: '#7FB069', // Natural green - Alternatives (swapped)
    cardBg: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
};

// Floating particle component
const PARTICLE_COUNT = 20;

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

const generateParticles = (): Particle[] => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 10000 + 8000,
        delay: Math.random() * 4000,
    }));
};

const particles = generateParticles();

function FloatingParticle({ particle }: { particle: Particle }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            translateY.setValue(0);
            translateX.setValue(0);
            opacity.setValue(0);

            Animated.sequence([
                Animated.delay(particle.delay),
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -100 - Math.random() * 80,
                        duration: particle.duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateX, {
                        toValue: (Math.random() - 0.5) * 100,
                        duration: particle.duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(opacity, {
                            toValue: 0.4,
                            duration: particle.duration * 0.2,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0.4,
                            duration: particle.duration * 0.5,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: particle.duration * 0.3,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start(() => animate());
        };

        animate();
    }, []);

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: particle.x,
                    top: particle.y,
                    width: particle.size,
                    height: particle.size,
                    opacity,
                    transform: [{ translateY }, { translateX }],
                },
            ]}
        />
    );
}

export default function PanicScreen() {
    const navigation = useNavigation<any>();
    const [messageIndex, setMessageIndex] = useState(0);
    const fadeAnim = useState(new Animated.Value(1))[0];
    const tabBarFadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        // Fade in tab bar to dark on mount
        Animated.timing(tabBarFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
        }).start();

        // Fade out tab bar to normal on unmount
        return () => {
            Animated.timing(tabBarFadeAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: false,
            }).start();
        };
    }, []);

    useEffect(() => {
        // Rotate messages every 8 seconds
        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
            setTimeout(() => {
                setMessageIndex((prev) => (prev + 1) % calmingMessages.length);
            }, 400);
        }, 8000);

        return () => clearInterval(interval);
    }, [fadeAnim]);

    const currentMessage = calmingMessages[messageIndex];

    return (
        <View style={styles.container}>
            {/* Simple solid dark background - no edge issues */}
            <View style={styles.solidBackground} />

            {/* Floating particles */}
            {particles.map((particle) => (
                <FloatingParticle key={particle.id} particle={particle} />
            ))}

            {/* Animated dark overlay for tab bar */}
            <Animated.View
                style={[
                    styles.tabBarOverlay,
                    {
                        opacity: tabBarFadeAnim,
                        backgroundColor: tabBarFadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['rgba(15, 15, 30, 0)', 'rgba(15, 15, 30, 0.95)'],
                        }),
                    },
                ]}
                pointerEvents="none"
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                {/* Calming message - positioned at top, independent of buttons */}
                <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.messageTitle}>{currentMessage.title}</Text>
                    <Text style={styles.messageSubtitle}>{currentMessage.subtitle}</Text>
                </Animated.View>

                {/* Main content - centered buttons */}
                <View style={styles.content}>
                    {/* Three round buttons in a row - centered */}
                    <View style={styles.mainButtonsRow}>
                        {/* Talk to Inner Circle */}
                        <TouchableOpacity
                            style={[styles.floatingButton, { backgroundColor: 'rgba(136, 164, 214, 0.75)' }]}
                            onPress={() => navigation.navigate('InnerCircle')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.roundButtonIcon}>
                                <Feather name="users" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.roundButtonText}>Inner{'\n'}Circle</Text>
                        </TouchableOpacity>

                        {/* Distract Me */}
                        <TouchableOpacity
                            style={[styles.floatingButton, { backgroundColor: 'rgba(245, 180, 97, 0.75)' }]}
                            onPress={() => navigation.navigate('DistractMe')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.roundButtonIcon}>
                                <Feather name="target" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.roundButtonText}>Distract{'\n'}Me</Text>
                        </TouchableOpacity>

                        {/* Alternatives */}
                        <TouchableOpacity
                            style={[styles.floatingButton, { backgroundColor: 'rgba(127, 176, 105, 0.75)' }]}
                            onPress={() => navigation.navigate('Alternatives')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.roundButtonIcon}>
                                <Feather name="refresh-cw" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.roundButtonText}>Alter-{'\n'}natives</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Secondary buttons - smaller */}
                    <View style={styles.secondaryButtonsRow}>
                        {/* Breathe */}
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('BreathingExercise')}
                            activeOpacity={0.85}
                        >
                            <Feather name="wind" size={20} color={calmColors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.secondaryButtonText}>Breathe</Text>
                        </TouchableOpacity>

                        {/* My Why */}
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('Reasons')}
                            activeOpacity={0.85}
                        >
                            <Feather name="heart" size={20} color={calmColors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.secondaryButtonText}>My Why</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Subtle reminder */}
                    <View style={styles.reminderContainer}>
                        <View style={styles.reminderDot} />
                        <Text style={styles.reminderText}>
                            This craving will pass. You're stronger than you think.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F1E',
    },
    solidBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0F0F1E',
        zIndex: 0,
    },
    particle: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 999,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        zIndex: 2,
    },
    safeArea: {
        flex: 1,
        zIndex: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginTop: -60, // Offset to keep buttons centered despite message taking top space
    },
    // Tab Bar Overlay
    tabBarOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        zIndex: 100,
    },
    // Message Section - fixed position at top
    messageContainer: {
        alignItems: 'center',
        paddingTop: spacing.xl,
        paddingHorizontal: spacing.xl,
        height: 120, // Fixed height so it doesn't affect layout below
    },
    messageTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: calmColors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
        letterSpacing: -0.5,
    },
    messageSubtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: calmColors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: SCREEN_WIDTH * 0.85,
    },
    // Main Buttons Row - Round buttons
    mainButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    floatingButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    roundButtonIcon: {
        marginBottom: spacing.xs,
    },
    roundButtonText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 14,
        letterSpacing: 0.2,
    },
    // Secondary Buttons Row - Smaller horizontal buttons
    secondaryButtonsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: calmColors.cardBg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: calmColors.cardBorder,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: calmColors.text,
    },
    // Reminder
    reminderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    reminderDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: calmColors.accent1,
        marginRight: spacing.sm,
        opacity: 0.6,
    },
    reminderText: {
        fontSize: 13,
        fontWeight: '500',
        color: calmColors.textSecondary,
        textAlign: 'center',
        flex: 1,
        opacity: 0.8,
    },
});
