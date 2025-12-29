/**
 * UniverseBackground
 * 
 * Global background component creating a deep space atmosphere.
 * Features gradient, stars, and animated floating particles.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

// Generate static stars
const generateStars = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        top: Math.random() * height,
        left: Math.random() * width,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
    }));
};

// Generate floating particles with animation parameters
const generateParticles = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        startTop: Math.random() * height,
        startLeft: Math.random() * width,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 8000 + 6000, // 6-14 seconds
        delay: Math.random() * 3000, // staggered start
        color: Math.random() > 0.5 ? colors.accent.primary : colors.accent.success,
    }));
};

const STAR_COUNT = 60;
const PARTICLE_COUNT = 12;
const stars = generateStars(STAR_COUNT);
const particleData = generateParticles(PARTICLE_COUNT);

// Animated Particle Component
function FloatingParticle({ particle }: { particle: typeof particleData[0] }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            // Reset values
            translateY.setValue(0);
            translateX.setValue(0);
            opacity.setValue(0);

            Animated.sequence([
                Animated.delay(particle.delay),
                Animated.parallel([
                    // Float upward
                    Animated.timing(translateY, {
                        toValue: -height * 0.3,
                        duration: particle.duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    // Gentle horizontal drift
                    Animated.timing(translateX, {
                        toValue: (Math.random() - 0.5) * 60,
                        duration: particle.duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    // Fade in and out
                    Animated.sequence([
                        Animated.timing(opacity, {
                            toValue: 0.6,
                            duration: particle.duration * 0.3,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: particle.duration * 0.7,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start(() => startAnimation()); // Loop
        };

        startAnimation();
    }, []);

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    top: particle.startTop,
                    left: particle.startLeft,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    opacity,
                    transform: [{ translateY }, { translateX }],
                },
            ]}
        />
    );
}

interface UniverseBackgroundProps {
    children?: React.ReactNode;
    showParticles?: boolean;
}

export default function UniverseBackground({
    children,
    showParticles = true
}: UniverseBackgroundProps) {
    return (
        <View style={styles.container}>
            {/* Deep Space Gradient */}
            <LinearGradient
                colors={[
                    '#0a0a1a',           // Top - slightly lighter
                    colors.gradients.universeStart,
                    colors.gradients.universeEnd,
                    '#030308',           // Bottom - deepest
                ]}
                locations={[0, 0.3, 0.7, 1]}
                style={styles.background}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* Purple/Cyan glow accents */}
            <View style={styles.glowContainer}>
                <View style={[styles.glow, styles.glowPurple]} />
                <View style={[styles.glow, styles.glowCyan]} />
            </View>

            {/* Stars */}
            {stars.map((star) => (
                <View
                    key={star.id}
                    style={[
                        styles.star,
                        {
                            top: star.top,
                            left: star.left,
                            width: star.size,
                            height: star.size,
                            opacity: star.opacity,
                        },
                    ]}
                />
            ))}

            {/* Floating Particles */}
            {showParticles && particleData.map((particle) => (
                <FloatingParticle key={particle.id} particle={particle} />
            ))}

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        borderRadius: 999,
    },
    glowPurple: {
        width: 300,
        height: 300,
        top: -50,
        right: -100,
        backgroundColor: colors.accent.primary,
        opacity: 0.08,
    },
    glowCyan: {
        width: 250,
        height: 250,
        bottom: 100,
        left: -80,
        backgroundColor: colors.accent.success,
        opacity: 0.06,
    },
    star: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
    },
    particle: {
        position: 'absolute',
        borderRadius: 999,
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
});
