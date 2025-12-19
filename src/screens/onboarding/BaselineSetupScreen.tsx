/**
 * BaselineSetupScreen
 * 
 * Light personalization - asks about current sugar consumption frequency.
 * Single selection with large tap targets.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../../theme';

type BaselineSetupScreenProps = {
    navigation: NativeStackNavigationProp<any, 'BaselineSetup'>;
};

interface FrequencyOption {
    id: string;
    label: string;
}

const frequencyOptions: FrequencyOption[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Several times per week' },
    { id: 'occasionally', label: 'Occasionally' },
];

export default function BaselineSetupScreen({ navigation }: BaselineSetupScreenProps) {
    const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);

    const handleStartReset = () => {
        // Navigate to paywall before going to main app
        navigation.navigate('Paywall');
    };

    const isButtonEnabled = selectedFrequency !== null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>How often do you currently consume sugar?</Text>
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {frequencyOptions.map((option) => {
                        const isSelected = selectedFrequency === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionButton,
                                    isSelected && styles.optionButtonSelected,
                                ]}
                                onPress={() => setSelectedFrequency(option.id)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.optionLabel,
                                        isSelected && styles.optionLabelSelected,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Start Button */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={[
                            styles.startButton,
                            !isButtonEnabled && styles.startButtonDisabled,
                        ]}
                        onPress={handleStartReset}
                        activeOpacity={0.8}
                        disabled={!isButtonEnabled}
                    >
                        <Text
                            style={[
                                styles.startButtonText,
                                !isButtonEnabled && styles.startButtonTextDisabled,
                            ]}
                        >
                            Start reset
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing['3xl'],
    },
    header: {
        marginBottom: spacing['3xl'],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
        lineHeight: 36,
    },
    optionsContainer: {
        gap: spacing.md,
    },
    optionButton: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        borderWidth: 2,
        borderColor: 'transparent',
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    optionButtonSelected: {
        borderColor: colors.accent.primary,
        backgroundColor: colors.background.tertiary,
    },
    optionLabel: {
        fontSize: 17,
        fontWeight: '500',
        color: colors.text.secondary,
    },
    optionLabelSelected: {
        color: colors.text.primary,
    },
    spacer: {
        flex: 1,
    },
    bottomContainer: {
        paddingBottom: spacing['2xl'],
    },
    startButton: {
        backgroundColor: colors.accent.primary,
        paddingVertical: spacing.lg,
        borderRadius: 14,
        alignItems: 'center',
    },
    startButtonDisabled: {
        backgroundColor: colors.glass.medium,
    },
    startButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.inverse,
    },
    startButtonTextDisabled: {
        color: colors.text.muted,
    },
});
