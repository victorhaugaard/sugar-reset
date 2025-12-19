/**
 * HomeScreen
 * 
 * Core hub of the app. Displays day counter, tree visualization,
 * and binary check-in selector.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../theme';

// Placeholder for tree visualization - will be replaced with actual component
function TreeVisualization({ dayCount }: { dayCount: number }) {
    // Simple placeholder tree that grows based on day count
    const treeSize = Math.min(100 + dayCount * 5, 200);

    return (
        <View style={styles.treeContainer}>
            <Text style={[styles.treeEmoji, { fontSize: treeSize }]}>🌳</Text>
        </View>
    );
}

export default function HomeScreen() {
    const [currentStreak, setCurrentStreak] = useState(12); // Placeholder
    const [hasLoggedToday, setHasLoggedToday] = useState(false);

    const handleNoSugar = () => {
        if (!hasLoggedToday) {
            setCurrentStreak(prev => prev + 1);
            setHasLoggedToday(true);
            // In real app: save to database, show feedback
        }
    };

    const handleSugarConsumed = () => {
        if (!hasLoggedToday) {
            setCurrentStreak(0);
            setHasLoggedToday(true);
            // In real app: save to database, show neutral feedback
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Day Counter */}
                <View style={styles.counterSection}>
                    <Text style={styles.dayNumber}>Day {currentStreak}</Text>
                    <Text style={styles.counterLabel}>Sugar-free streak</Text>
                </View>

                {/* Tree Visualization Card */}
                <View style={styles.treeCard}>
                    <TreeVisualization dayCount={currentStreak} />
                </View>
                <Text style={styles.treeCaption}>Growth reflects consistency.</Text>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Binary Selector */}
                <View style={styles.selectorSection}>
                    <TouchableOpacity
                        style={[
                            styles.selectorButton,
                            styles.noSugarButton,
                            hasLoggedToday && styles.selectorButtonDisabled,
                        ]}
                        onPress={handleNoSugar}
                        activeOpacity={0.8}
                        disabled={hasLoggedToday}
                    >
                        <Text
                            style={[
                                styles.selectorButtonText,
                                styles.noSugarButtonText,
                                hasLoggedToday && styles.selectorButtonTextDisabled,
                            ]}
                        >
                            No sugar today
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.selectorButton,
                            styles.sugarButton,
                            hasLoggedToday && styles.selectorButtonDisabled,
                        ]}
                        onPress={handleSugarConsumed}
                        activeOpacity={0.8}
                        disabled={hasLoggedToday}
                    >
                        <Text
                            style={[
                                styles.selectorButtonText,
                                hasLoggedToday && styles.selectorButtonTextDisabled,
                            ]}
                        >
                            Sugar consumed
                        </Text>
                    </TouchableOpacity>
                </View>

                {hasLoggedToday && (
                    <Text style={styles.loggedText}>Today logged</Text>
                )}
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
        paddingTop: spacing.xl,
    },
    counterSection: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    dayNumber: {
        fontSize: 48,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -1,
    },
    counterLabel: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    treeCard: {
        backgroundColor: colors.glass.light,
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.glass.border,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
    },
    treeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    treeEmoji: {
        // Size set dynamically
    },
    treeCaption: {
        fontSize: 13,
        fontWeight: '400',
        color: colors.text.tertiary,
        textAlign: 'center',
        marginTop: spacing.md,
        fontStyle: 'italic',
    },
    spacer: {
        flex: 1,
    },
    selectorSection: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    selectorButton: {
        flex: 1,
        paddingVertical: spacing.lg,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 2,
    },
    noSugarButton: {
        backgroundColor: colors.accent.success + '15',
        borderColor: colors.accent.success,
    },
    sugarButton: {
        backgroundColor: colors.background.secondary,
        borderColor: colors.border.light,
    },
    selectorButtonDisabled: {
        opacity: 0.5,
    },
    selectorButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    noSugarButtonText: {
        color: colors.accent.success,
    },
    selectorButtonTextDisabled: {
        color: colors.text.muted,
    },
    loggedText: {
        fontSize: 13,
        fontWeight: '400',
        color: colors.text.tertiary,
        textAlign: 'center',
        marginBottom: spacing['2xl'],
    },
});
