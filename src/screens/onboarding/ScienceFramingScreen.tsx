/**
 * ScienceFramingScreen
 * 
 * Establishes scientific credibility with brief habit science explanation.
 * Text-focused, calm layout.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../../theme';

type ScienceFramingScreenProps = {
    navigation: NativeStackNavigationProp<any, 'ScienceFraming'>;
};

const sciencePoints = [
    'Sugar cravings are habit-driven, not character flaws.',
    'Dopamine pathways adapt over time with consistent behavior.',
    "Progress is cumulative—setbacks don't erase your work.",
];

export default function ScienceFramingScreen({ navigation }: ScienceFramingScreenProps) {
    const handleContinue = () => {
        navigation.navigate('BaselineSetup');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>The science of change</Text>
                </View>

                {/* Intro paragraph */}
                <Text style={styles.paragraph}>
                    Changing your relationship with sugar isn't about willpower.
                    It's about understanding how habits form and giving your brain
                    time to adapt.
                </Text>

                {/* Key points */}
                <View style={styles.pointsContainer}>
                    {sciencePoints.map((point, index) => (
                        <View key={index} style={styles.pointItem}>
                            <View style={styles.pointNumber}>
                                <Text style={styles.pointNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.pointText}>{point}</Text>
                        </View>
                    ))}
                </View>

                {/* Closing note */}
                <Text style={styles.closingNote}>
                    SugarReset tracks your consistency, not perfection.
                </Text>
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing['3xl'],
        paddingBottom: spacing.xl,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    paragraph: {
        fontSize: 17,
        fontWeight: '400',
        color: colors.text.secondary,
        lineHeight: 26,
        marginBottom: spacing['2xl'],
    },
    pointsContainer: {
        gap: spacing.lg,
        marginBottom: spacing['2xl'],
    },
    pointItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    pointNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.glass.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    pointNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.tertiary,
    },
    pointText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.secondary,
        lineHeight: 22,
        paddingTop: 3,
    },
    closingNote: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text.tertiary,
        fontStyle: 'italic',
    },
    bottomContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.lg,
        paddingBottom: spacing['2xl'],
    },
    continueButton: {
        backgroundColor: colors.accent.primary,
        paddingVertical: spacing.lg,
        borderRadius: 14,
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.inverse,
    },
});
