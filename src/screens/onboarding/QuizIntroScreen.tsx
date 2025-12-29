/**
 * QuizIntroScreen
 * 
 * Welcome screen after "Get Started" that introduces the quiz.
 * Shows Sugarest logo and explains we'll identify sugar habits.
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type QuizIntroScreenProps = {
    navigation: NativeStackNavigationProp<any, 'QuizIntro'>;
};

export default function QuizIntroScreen({ navigation }: QuizIntroScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleStart = () => {
        navigation.navigate('SugarDefinition');
    };

    return (
        <LooviBackground variant="coralTop">
            <SafeAreaView style={styles.container}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../public/sugarestlogo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Welcome Text */}
                    <View style={styles.textContainer}>
                        <Text style={styles.welcomeText}>Welcome!</Text>
                        <Text style={styles.title}>
                            Let's identify if you have a problem with sugar
                        </Text>
                        <Text style={styles.subtitle}>
                            Answer a few quick questions to personalize your experience and create the perfect plan for you.
                        </Text>
                    </View>

                    {/* Stats Preview */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>9</Text>
                            <Text style={styles.statLabel}>Questions</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>2 min</Text>
                            <Text style={styles.statLabel}>To complete</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>100%</Text>
                            <Text style={styles.statLabel}>Private</Text>
                        </View>
                    </View>

                    {/* Spacer */}
                    <View style={styles.spacer} />

                    {/* Start Button */}
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStart}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.startButtonText}>Start Quiz →</Text>
                    </TouchableOpacity>
                </Animated.View>
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
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.xl,
        paddingBottom: spacing['2xl'],
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    logo: {
        width: SCREEN_WIDTH * 0.5,
        height: SCREEN_WIDTH * 0.3,
    },
    textContainer: {
        alignItems: 'center',
        marginTop: spacing['2xl'],
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.accent.primary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.md,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing['2xl'],
        paddingVertical: spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    spacer: {
        flex: 1,
    },
    startButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.coralOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 5,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
