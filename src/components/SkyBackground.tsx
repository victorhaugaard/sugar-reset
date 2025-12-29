/**
 * SkyBackground
 * 
 * Sky background with AI-generated clouds image,
 * gradient overlay, and floating particles.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sky theme colors
export const skyColors = {
    gradientTop: 'rgba(135, 206, 235, 0.3)',    // Light sky blue overlay
    gradientBottom: 'rgba(255, 255, 255, 0.4)', // White overlay at bottom
    particle: 'rgba(255, 255, 255, 0.9)',
    // Glassmorphism card styles
    glass: {
        background: 'rgba(255, 255, 255, 0.25)',
        border: 'rgba(255, 255, 255, 0.5)',
        borderLight: 'rgba(255, 255, 255, 0.3)',
    },
    text: {
        primary: '#1A1A2E',
        secondary: '#374151',
        tertiary: '#6B7280',
        muted: '#9CA3AF',
        onDark: '#FFFFFF',
    },
    accent: {
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
    },
};

// Generate floating particles (bright/white)
const generateParticles = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        startTop: Math.random() * SCREEN_HEIGHT,
        startLeft: Math.random() * SCREEN_WIDTH,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 12000 + 8000,
        delay: Math.random() * 4000,
    }));
};

const PARTICLE_COUNT = 12;
const particleData = generateParticles(PARTICLE_COUNT);

// Animated Particle Component
function FloatingParticle({ particle }: { particle: typeof particleData[0] }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            translateY.setValue(0);
            translateX.setValue(0);
            opacity.setValue(0);

            Animated.sequence([
                Animated.delay(particle.delay),
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -SCREEN_HEIGHT * 0.3,
                        duration: particle.duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateX, {
                        toValue: (Math.random() - 0.5) * 60,
                        duration: particle.duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(opacity, {
                            toValue: 0.8,
                            duration: particle.duration * 0.25,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: particle.duration * 0.75,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start(() => startAnimation());
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
                    opacity,
                    transform: [{ translateY }, { translateX }],
                },
            ]}
        />
    );
}

interface SkyBackgroundProps {
    children?: React.ReactNode;
    showParticles?: boolean;
}

export default function SkyBackground({
    children,
    showParticles = true
}: SkyBackgroundProps) {
    return (
        <View style={styles.container}>
            {/* Cloud Background Image */}
            <ImageBackground
                source={require('../../assets/images/sky_clouds.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                {/* Gradient Overlay for smoother blend */}
                <LinearGradient
                    colors={[
                        'rgba(135, 206, 235, 0.1)',
                        'rgba(255, 255, 255, 0.05)',
                        'rgba(255, 255, 255, 0.15)',
                    ]}
                    locations={[0, 0.5, 1]}
                    style={styles.gradient}
                />
            </ImageBackground>

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
        backgroundColor: '#87CEEB',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    particle: {
        position: 'absolute',
        backgroundColor: skyColors.particle,
        borderRadius: 999,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
});
