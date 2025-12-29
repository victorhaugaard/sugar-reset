/**
 * JournalWidget Component
 * 
 * Compact card showing latest journal entry on HomeScreen
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { GlassCard } from './GlassCard';
import { spacing, borderRadius } from '../theme';
import { skyColors } from './SkyBackground';

export interface JournalEntry {
    id: string;
    date: string; // YYYY-MM-DD
    mood?: 'great' | 'good' | 'okay' | 'struggling' | 'difficult';
    notes: string;
    whatTriggered?: string;
    createdAt: number;
}

interface JournalWidgetProps {
    entry: JournalEntry | null;
    onPress: () => void;
}

const MOOD_EMOJIS = {
    great: '😊',
    good: '🙂',
    okay: '😐',
    struggling: '😔',
    difficult: '😢',
};

export function JournalWidget({ entry, onPress }: JournalWidgetProps) {
    // Empty state when no entries
    if (!entry) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <GlassCard variant="light" padding="md" style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.icon}>📝</Text>
                            <View>
                                <Text style={styles.title}>Journal</Text>
                                <Text style={styles.date}>No entries yet</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.emptyText}>
                        Document your journey and reflect on your progress
                    </Text>

                    <View style={styles.footer}>
                        <Text style={styles.viewMore}>Start Journaling →</Text>
                    </View>
                </GlassCard>
            </TouchableOpacity>
        );
    }

    // Normal state with entry
    const truncatedNotes = entry.notes.length > 80
        ? entry.notes.substring(0, 80) + '...'
        : entry.notes;

    const entryDate = new Date(entry.date);
    const dateString = entryDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <GlassCard variant="light" padding="md" style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.icon}>📝</Text>
                        <View>
                            <Text style={styles.title}>Latest Journal Entry</Text>
                            <Text style={styles.date}>{dateString}</Text>
                        </View>
                    </View>
                    {entry.mood && (
                        <Text style={styles.moodEmoji}>{MOOD_EMOJIS[entry.mood]}</Text>
                    )}
                </View>

                <Text style={styles.notes} numberOfLines={2}>
                    {truncatedNotes}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.viewMore}>View All Entries →</Text>
                </View>
            </GlassCard>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    icon: {
        fontSize: 24,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: skyColors.text.primary,
    },
    date: {
        fontSize: 11,
        fontWeight: '400',
        color: skyColors.text.tertiary,
        marginTop: 2,
    },
    moodEmoji: {
        fontSize: 32,
    },
    notes: {
        fontSize: 14,
        fontWeight: '400',
        color: skyColors.text.secondary,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: 13,
        fontWeight: '400',
        color: skyColors.text.tertiary,
        lineHeight: 18,
        marginBottom: spacing.sm,
        fontStyle: 'italic',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: spacing.sm,
    },
    viewMore: {
        fontSize: 13,
        fontWeight: '500',
        color: skyColors.accent.primary,
    },
});

export default JournalWidget;
