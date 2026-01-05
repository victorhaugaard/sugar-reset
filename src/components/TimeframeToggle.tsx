/**
 * TimeframeToggle
 * 
 * A segmented control for selecting data timeframe.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';

export type Timeframe = '7d' | '1m' | 'all';

interface TimeframeToggleProps {
    value: Timeframe;
    onChange: (timeframe: Timeframe) => void;
}

const options: { value: Timeframe; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '1m', label: '1 Month' },
    { value: 'all', label: 'All Time' },
];

export function TimeframeToggle({ value, onChange }: TimeframeToggleProps) {
    return (
        <View style={styles.container}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={[
                        styles.option,
                        value === option.value && styles.optionActive,
                    ]}
                    onPress={() => onChange(option.value)}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.optionText,
                            value === option.value && styles.optionTextActive,
                        ]}
                    >
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: borderRadius.lg,
        padding: 4,
        marginBottom: spacing.lg,
    },
    option: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: borderRadius.md,
    },
    optionActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.tertiary,
    },
    optionTextActive: {
        color: looviColors.accent.primary,
    },
});
