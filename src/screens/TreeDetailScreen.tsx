/**
 * TreeDetailScreen
 * 
 * Full-screen tree visualization representing cumulative consistency.
 * Calm, ambient design with slow movement.
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme';

const { width, height } = Dimensions.get('window');

// Placeholder tree visualization with ambient animation
function TreeVisualization() {
    // Slow ambient sway animation
    const swayAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startSway = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(swayAnim, {
                        toValue: 1,
                        duration: 4000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(swayAnim, {
                        toValue: -1,
                        duration: 4000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(swayAnim, {
                        toValue: 0,
                        duration: 4000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        startSway();
    }, []);

    const rotate = swayAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-2deg', '0deg', '2deg'],
    });

    return (
        <View style={styles.treeWrapper}>
            <Animated.View
                style={[
                    styles.treeContainer,
                    { transform: [{ rotate }] },
                ]}
            >
                {/* Tree representation - placeholder */}
                <Text style={styles.treeEmoji}>🌳</Text>
            </Animated.View>
        </View>
    );
}

export default function TreeDetailScreen() {
    return (
        <LinearGradient
            colors={[colors.gradients.warmStart, colors.background.primary, colors.background.primary]}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container}>
                {/* Tree Visualization */}
                <View style={styles.treeSection}>
                    <TreeVisualization />
                </View>

                {/* Bottom Caption */}
                <View style={styles.captionSection}>
                    <Text style={styles.caption}>
                        This reflects time and consistency.
                    </Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    treeSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    treeWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    treeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    treeEmoji: {
        fontSize: 200,
    },
    captionSection: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingBottom: spacing['3xl'],
        alignItems: 'center',
    },
    caption: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.tertiary,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});
