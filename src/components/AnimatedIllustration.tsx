/**
 * AnimatedIllustration Component
 * 
 * Displays AI-generated illustrations with subtle floating/breathing animations
 * inspired by Headspace's calming visual style.
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Animated,
    Easing,
    ImageSourcePropType,
    ViewStyle,
} from 'react-native';

// Available illustration mappings
const illustrations = {
    blood_sugar: require('../../assets/images/illustrations/blood_sugar.png'),
    brain: require('../../assets/images/illustrations/brain.png'),
    heart_health: require('../../assets/images/illustrations/heart_health.png'),
    sleep: require('../../assets/images/illustrations/sleep.png'),
    target_goals: require('../../assets/images/illustrations/target_goals.png'),
    cancer_awareness: require('../../assets/images/illustrations/cancer_awareness.png'),
};

export type IllustrationType = keyof typeof illustrations;

// Emoji to illustration mapping
const emojiToIllustration: Record<string, IllustrationType> = {
    '📈': 'blood_sugar',
    '🧠': 'brain',
    '💔': 'heart_health',
    '❤️': 'heart_health',
    '😴': 'sleep',
    '🎯': 'target_goals',
    '🎗️': 'cancer_awareness',
};

interface AnimatedIllustrationProps {
    /** Illustration name or emoji */
    name: IllustrationType | string;
    /** Size of the illustration */
    size?: number;
    /** Animation type */
    animation?: 'float' | 'pulse' | 'breathe' | 'none';
    /** Custom style */
    style?: ViewStyle;
}

export function AnimatedIllustration({
    name,
    size = 150,
    animation = 'float',
    style,
}: AnimatedIllustrationProps) {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Determine the illustration source
    const illustrationName = emojiToIllustration[name] || (name as IllustrationType);
    const source = illustrations[illustrationName];

    // If no matching illustration, return null
    if (!source) {
        return null;
    }

    useEffect(() => {
        // Fade in
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        // Start the selected animation
        if (animation === 'float') {
            // Gentle floating up and down
            Animated.loop(
                Animated.sequence([
                    Animated.timing(floatAnim, {
                        toValue: -8,
                        duration: 2000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(floatAnim, {
                        toValue: 8,
                        duration: 2000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else if (animation === 'pulse') {
            // Subtle pulsing
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.05,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else if (animation === 'breathe') {
            // Combined float and pulse for breathing effect
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(floatAnim, {
                            toValue: -5,
                            duration: 3000,
                            easing: Easing.inOut(Easing.sin),
                            useNativeDriver: true,
                        }),
                        Animated.timing(floatAnim, {
                            toValue: 5,
                            duration: 3000,
                            easing: Easing.inOut(Easing.sin),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(scaleAnim, {
                            toValue: 1.03,
                            duration: 3000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleAnim, {
                            toValue: 1,
                            duration: 3000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        }
    }, [animation]);

    return (
        <View style={[styles.container, style]}>
            <Animated.Image
                source={source}
                style={[
                    styles.image,
                    {
                        width: size,
                        height: size,
                        opacity: opacityAnim,
                        transform: [
                            { translateY: floatAnim },
                            { scale: scaleAnim },
                        ],
                    },
                ]}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        // Default size will be overridden
    },
});

export default AnimatedIllustration;
