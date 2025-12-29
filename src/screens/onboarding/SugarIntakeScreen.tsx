/**
 * SugarIntakeScreen
 * 
 * Asks user to estimate daily sugar intake with a draggable slider.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { spacing, borderRadius } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';
import { useUserData } from '../../context/UserDataContext';
import ProgressBar from '../../components/ProgressBar';

type SugarIntakeScreenProps = {
    navigation: NativeStackNavigationProp<any, 'SugarIntake'>;
};

// Reference data for context
const sugarReference = [
    { grams: 25, label: 'WHO recommended max (women)' },
    { grams: 36, label: 'WHO recommended max (men)' },
    { grams: 77, label: 'Average American intake' },
];

export default function SugarIntakeScreen({ navigation }: SugarIntakeScreenProps) {
    const [sugarGrams, setSugarGrams] = useState(50);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const { updateOnboardingData } = useUserData();

    const handleSliderChange = (value: number) => {
        setSugarGrams(Math.round(value));
        if (value < 300) {
            setShowCustomInput(false);
        }
    };

    const handleSliderComplete = (value: number) => {
        if (value >= 300) {
            setShowCustomInput(true);
        }
    };

    const handleCustomValueChange = (text: string) => {
        const num = parseInt(text, 10);
        if (!isNaN(num) && num > 0) {
            setSugarGrams(num);
        }
        setCustomValue(text);
    };

    const handleContinue = async () => {
        const finalValue = showCustomInput && customValue ? parseInt(customValue, 10) || sugarGrams : sugarGrams;
        await updateOnboardingData({ dailySugarGrams: finalValue });
        navigation.navigate('SugarSpending', { dailySugarGrams: finalValue });
    };

    const displayValue = showCustomInput && customValue ? parseInt(customValue, 10) || sugarGrams : sugarGrams;

    return (
        <LooviBackground variant="coralBottom">
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <ProgressBar current={4} total={8} />
                        <Text style={styles.stepLabel}>Track your baseline</Text>
                        <Text style={styles.title}>How much sugar do you consume daily?</Text>
                        <Text style={styles.subtitle}>
                            Estimate your average added sugar intake
                        </Text>
                    </View>

                    {/* Large Display */}
                    <GlassCard variant="light" padding="lg" style={styles.displayCard}>
                        <Text style={styles.gramsValue}>
                            {displayValue >= 300 && !showCustomInput ? '300+' : displayValue}
                        </Text>
                        <Text style={styles.gramsLabel}>grams per day</Text>
                    </GlassCard>

                    {/* Slider */}
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={300}
                            value={sugarGrams > 300 ? 300 : sugarGrams}
                            onValueChange={handleSliderChange}
                            onSlidingComplete={handleSliderComplete}
                            minimumTrackTintColor={looviColors.accent.primary}
                            maximumTrackTintColor="rgba(0, 0, 0, 0.1)"
                            thumbTintColor={looviColors.accent.primary}
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>0g</Text>
                            <Text style={styles.sliderLabel}>150g</Text>
                            <Text style={styles.sliderLabel}>300g+</Text>
                        </View>
                    </View>

                    {/* Custom Input */}
                    {showCustomInput && (
                        <GlassCard variant="light" padding="md" style={styles.customInputCard}>
                            <Text style={styles.customInputLabel}>Enter exact amount:</Text>
                            <TextInput
                                style={styles.customInput}
                                value={customValue}
                                onChangeText={handleCustomValueChange}
                                keyboardType="numeric"
                                placeholder="e.g. 350"
                                placeholderTextColor={looviColors.text.muted}
                                maxLength={4}
                            />
                        </GlassCard>
                    )}

                    {/* Reference */}
                    <View style={styles.referenceContainer}>
                        <Text style={styles.referenceTitle}>For reference:</Text>
                        {sugarReference.map((ref, index) => (
                            <View key={index} style={styles.referenceRow}>
                                <View style={[
                                    styles.referenceDot,
                                    displayValue >= ref.grams && styles.referenceDotActive,
                                ]} />
                                <Text style={styles.referenceText}>
                                    {ref.grams}g - {ref.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom Button */}
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
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    emoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textAlign: 'center',
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    displayCard: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    gramsValue: {
        fontSize: 64,
        fontWeight: '800',
        color: looviColors.text.primary,
        letterSpacing: -2,
    },
    gramsLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: looviColors.text.secondary,
        marginTop: spacing.xs,
    },
    sliderContainer: {
        marginBottom: spacing.xl,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xs,
    },
    sliderLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    customInputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    customInputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.secondary,
        marginRight: spacing.md,
    },
    customInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
        textAlign: 'center',
        paddingVertical: spacing.sm,
    },
    referenceContainer: {
        marginTop: 'auto',
        marginBottom: spacing.lg,
    },
    referenceTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.tertiary,
        marginBottom: spacing.sm,
    },
    referenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    referenceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginRight: spacing.sm,
    },
    referenceDotActive: {
        backgroundColor: looviColors.accent.warning,
    },
    referenceText: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    bottomContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.md,
        paddingBottom: spacing['2xl'],
    },
    continueButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
