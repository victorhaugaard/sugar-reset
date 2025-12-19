/**
 * IntentSelectionScreen
 * 
 * Allows user to select their intentions for quitting sugar.
 * Multi-select with GlassCard components.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius } from '../../theme';

type IntentSelectionScreenProps = {
    navigation: NativeStackNavigationProp<any, 'IntentSelection'>;
};

interface IntentOption {
    id: string;
    label: string;
}

const intentOptions: IntentOption[] = [
    { id: 'cravings', label: 'Reduce sugar cravings' },
    { id: 'habits', label: 'Break daily sugar habits' },
    { id: 'energy', label: 'Improve energy & focus' },
    { id: 'reset', label: 'Reset relationship with sugar' },
];

export default function IntentSelectionScreen({ navigation }: IntentSelectionScreenProps) {
    const [selectedIntents, setSelectedIntents] = useState<Set<string>>(new Set());

    const toggleIntent = (id: string) => {
        setSelectedIntents((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleContinue = () => {
        // Save selected intents and navigate to next screen
        navigation.navigate('SugarDefinition');
    };

    const isButtonEnabled = selectedIntents.size > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>What do you want to change?</Text>
                    <Text style={styles.subtitle}>Select all that apply</Text>
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {intentOptions.map((option) => {
                        const isSelected = selectedIntents.has(option.id);
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionCard,
                                    isSelected && styles.optionCardSelected,
                                ]}
                                onPress={() => toggleIntent(option.id)}
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
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        !isButtonEnabled && styles.continueButtonDisabled,
                    ]}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                    disabled={!isButtonEnabled}
                >
                    <Text
                        style={[
                            styles.continueButtonText,
                            !isButtonEnabled && styles.continueButtonTextDisabled,
                        ]}
                    >
                        Continue
                    </Text>
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
    },
    header: {
        marginBottom: spacing['3xl'],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.secondary,
    },
    optionsContainer: {
        gap: spacing.md,
    },
    optionCard: {
        backgroundColor: colors.glass.light,
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.glass.border,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    optionCardSelected: {
        backgroundColor: colors.glass.medium,
        borderColor: colors.accent.primary + '40', // 25% opacity
    },
    optionLabel: {
        fontSize: 17,
        fontWeight: '500',
        color: colors.text.secondary,
        textAlign: 'center',
    },
    optionLabelSelected: {
        color: colors.text.primary,
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
    continueButtonDisabled: {
        backgroundColor: colors.glass.medium,
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.inverse,
    },
    continueButtonTextDisabled: {
        color: colors.text.muted,
    },
});
