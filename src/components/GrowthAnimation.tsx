/**
 * GrowthAnimation Component
 *
 * A "Headspace-style" animated illustration that shows organic growth and blooming
 * based on the user's sugar-free streak.
 * 
 * Uses standard React Native Animated API to ensure compatibility 
 * (avoiding Reanimated version Mismatches).
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import { looviColors } from './LooviBackground';
import { spacing } from '../theme';

interface GrowthAnimationProps {
    daysSugarFree: number;
}

// Plant Palette - Soft, organic colors
const COLORS = {
    soil: '#8D7B68',
    soilLight: '#A4907C',
    stem: '#86EFAC',
    stemDark: '#4ADE80',
    leaf: '#4ADE80',
    leafDark: '#22C55E',
    center: '#FCD34D',
    pot: '#E5E7EB',
    bud: '#FCA5A5',
    petal: '#FDA4AF',
    petalDark: '#FB7185',
};

export function GrowthAnimation({ daysSugarFree }: GrowthAnimationProps) {
    // Standard Animated Values
    const growthAnim = useRef(new Animated.Value(0)).current;
    const swayAnim = useRef(new Animated.Value(0)).current;
    const bloomScaleAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;

    // Determine target growth based on days (0 to 1)
    const getTargetGrowth = () => {
        if (daysSugarFree <= 7) return 0.3;     // Sprout
        if (daysSugarFree <= 14) return 0.55;   // Sapling
        if (daysSugarFree <= 21) return 0.8;    // Budding
        return 1.0;                             // Bloom
    };

    useEffect(() => {
        const target = getTargetGrowth();

        // 1. Growth Animation (Scale Y)
        Animated.timing(growthAnim, {
            toValue: target,
            duration: 2000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
        }).start();

        // 2. Sway Animation (Rotation) - Loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(swayAnim, {
                    toValue: 1,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(swayAnim, {
                    toValue: -1,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // 3. Bloom Animation
        if (target >= 0.8) {
            Animated.spring(bloomScaleAnim, {
                toValue: target >= 1.0 ? 1 : 0.4, // 1 for bloom, 0.4 for bud
                friction: 7,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }

        // 4. Glow Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.5, duration: 1500, useNativeDriver: true }),
            ])
        ).start();

    }, [daysSugarFree]);


    // Interpolations
    const swayRotation = swayAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-3deg', '3deg'],
    });

    const stemScaleY = growthAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 1],
    });

    const getLeafStyle = (threshold: number, side: 'left' | 'right') => {
        const opacity = growthAnim.interpolate({
            inputRange: [threshold - 0.1, threshold],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        const scale = growthAnim.interpolate({
            inputRange: [threshold - 0.1, threshold],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        const rotateBase = side === 'left' ? '-45deg' : '45deg';

        return {
            opacity,
            transform: [
                { scale },
                { rotate: rotateBase }
            ]
        };
    };

    return (
        <View style={styles.container}>
            <View style={styles.svgContainer}>
                <Svg height="200" width="200" viewBox="0 -20 200 200">
                    <Defs>
                        <LinearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={COLORS.soilLight} stopOpacity="1" />
                            <Stop offset="1" stopColor={COLORS.soil} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>

                    {/* Soil Base (Static) */}
                    <G transform="translate(100, 185)">
                        <Ellipse rx="40" ry="10" fill="url(#soilGradient)" />
                        <Ellipse rx="25" ry="6" fill="#6B5B45" opacity={0.3} />
                    </G>
                </Svg>

                {/* Animated Plant Container (Overlaid) */}
                <Animated.View style={[
                    styles.plantContainer,
                    { transform: [{ rotate: swayRotation }] }
                ]}>
                    <Svg height="200" width="200" viewBox="0 0 200 200" style={styles.plantSvg}>

                        {/* Stem: Modeled as a path that we scale vertically */}
                        <Animated.View style={[
                            styles.stemWrapper,
                            {
                                transform: [
                                    { translateY: 90 }, // Move pivot to bottom (approx)
                                    { scaleY: stemScaleY },
                                    { translateY: -90 } // Move back
                                ]
                            }
                        ]}>
                            <Svg height="200" width="200" viewBox="0 0 200 200">
                                <Defs>
                                    <LinearGradient id="stemGradient" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={COLORS.stem} stopOpacity="1" />
                                        <Stop offset="1" stopColor={COLORS.stemDark} stopOpacity="1" />
                                    </LinearGradient>
                                </Defs>
                                {/* Fixed Curve Stem */}
                                <Path
                                    d="M100,180 Q105,140 100,100 T102,20"
                                    stroke="url(#stemGradient)"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            </Svg>
                        </Animated.View>

                        {/* Leaves */}
                        <Animated.View style={[styles.leafContainer, { top: 130, left: 100 }, getLeafStyle(0.3, 'left')]}>
                            <Svg height="30" width="30" viewBox="0 0 30 30">
                                <Path d="M0,0 Q-15,-5 -20,-15 Q-10,-25 0,-20 Z" fill={COLORS.leaf} />
                            </Svg>
                        </Animated.View>

                        <Animated.View style={[styles.leafContainer, { top: 100, left: 100 }, getLeafStyle(0.5, 'right')]}>
                            <Svg height="30" width="30" viewBox="0 0 30 30" style={{ transform: [{ scaleX: -1 }] }}>
                                <Path d="M0,0 Q-15,-5 -20,-15 Q-10,-25 0,-20 Z" fill={COLORS.leaf} />
                            </Svg>
                        </Animated.View>

                        <Animated.View style={[styles.leafContainer, { top: 70, left: 100 }, getLeafStyle(0.65, 'left')]}>
                            <Svg height="30" width="30" viewBox="0 0 30 30">
                                <Path d="M0,0 Q-15,-5 -20,-15 Q-10,-25 0,-20 Z" fill={COLORS.leaf} />
                            </Svg>
                        </Animated.View>

                        {/* Flower / Bud */}
                        <Animated.View style={[
                            styles.flowerContainer,
                            {
                                transform: [{ scale: bloomScaleAnim }]
                            }
                        ]}>
                            <Svg height="80" width="80" viewBox="0 0 80 80">
                                <G transform="translate(40, 40)">
                                    {/* Petals */}
                                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                                        <G key={i} rotation={angle}>
                                            <Path
                                                d="M0,0 Q5,-15 0,-25 Q-5,-15 0,0"
                                                fill={i % 2 === 0 ? COLORS.petal : COLORS.petalDark}
                                            />
                                        </G>
                                    ))}
                                    <Circle r="6" fill={COLORS.center} />
                                    <Circle r="3" fill="#FFF" opacity={0.3} />
                                </G>
                            </Svg>
                        </Animated.View>

                    </Svg>
                </Animated.View>

                {/* Particles */}
                {daysSugarFree > 21 && (
                    <Animated.View style={{ opacity: glowAnim, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <Svg height="200" width="200" viewBox="0 0 200 200">
                            <Circle cx="130" cy="50" r="2" fill="#FCD34D" />
                            <Circle cx="70" cy="80" r="1.5" fill="#FCD34D" />
                            <Circle cx="150" cy="100" r="1" fill="#FFF" />
                        </Svg>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 180,
        marginVertical: 0,
        paddingTop: 0,
        marginTop: -10,
    },
    svgContainer: {
        width: 200,
        height: 180,
        position: 'relative',
        overflow: 'hidden',
    },
    plantContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 200,
        height: 200,
    },
    plantSvg: {
        width: 200,
        height: 200,
    },
    stemWrapper: {
        position: 'absolute',
        width: 200,
        height: 200,
    },
    leafContainer: {
        position: 'absolute',
        width: 30,
        height: 30,
        marginLeft: -2,
    },
    flowerContainer: {
        position: 'absolute',
        top: 0,
        left: 60,
        width: 80,
        height: 80,
    }
});
