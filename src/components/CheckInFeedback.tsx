/**
 * CheckInFeedback
 * 
 * Reusable component that displays neutral feedback after daily log.
 * No judgment, no harsh colors - just calm confirmation.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

type CheckInFeedbackProps = {
    type: 'noSugar' | 'sugarConsumed';
    onDismiss?: () => void;
};

const feedbackContent = {
    noSugar: {
        title: 'Logged',
        message: 'Another day of building healthier habits.',
        insight: 'Consistency matters more than perfection.',
    },
    sugarConsumed: {
        title: 'Logged',
        message: "This doesn't reset your progress.",
        insight: 'It helps us understand your habit.',
    },
};

export default function CheckInFeedback({ type, onDismiss }: CheckInFeedbackProps) {
    const content = feedbackContent[type];

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{content.title}</Text>
                <Text style={styles.message}>{content.message}</Text>
                <Text style={styles.insight}>{content.insight}</Text>

                {onDismiss && (
                    <TouchableOpacity
                        style={styles.dismissButton}
                        onPress={onDismiss}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.dismissButtonText}>Done</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.screen.horizontal,
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    message: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xs,
    },
    insight: {
        fontSize: 13,
        fontWeight: '400',
        color: colors.text.tertiary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    dismissButton: {
        marginTop: spacing.lg,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
    },
    dismissButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.accent.primary,
    },
});
