/**
 * JournalScreen
 * 
 * Full-page view of all journal entries
 * Features: chronological list, filter options, add new entry
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { useUserData, JournalEntry } from '../context/UserDataContext';
import JournalEntryModal from '../components/JournalEntryModal';

type JournalScreenProps = {
    navigation: NativeStackNavigationProp<any, 'Journal'>;
};

const MOOD_EMOJIS = {
    great: '😊',
    good: '🙂',
    okay: '😐',
    struggling: '😔',
    difficult: '😢',
};

export default function JournalScreen({ navigation }: JournalScreenProps) {
    const { journalEntries, addJournalEntry } = useUserData();
    const [showEntryModal, setShowEntryModal] = useState(false);

    const handleAddEntry = async (entryData: any) => {
        await addJournalEntry(new Date(), entryData);
        setShowEntryModal(false);
    };

    const renderEntry = ({ item }: { item: JournalEntry }) => {
        const entryDate = new Date(item.date);
        const dateString = entryDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

        return (
            <GlassCard variant="light" padding="md" style={styles.entryCard}>
                <View style={styles.entryHeader}>
                    <View style={styles.entryHeaderLeft}>
                        <Text style={styles.entryDate}>{dateString}</Text>
                    </View>
                    {item.mood && (
                        <Text style={styles.entryMood}>{MOOD_EMOJIS[item.mood]}</Text>
                    )}
                </View>

                {item.whatTriggered && (
                    <View style={styles.triggerSection}>
                        <Text style={styles.triggerLabel}>Trigger:</Text>
                        <Text style={styles.triggerText}>{item.whatTriggered}</Text>
                    </View>
                )}

                <Text style={styles.entryNotes}>{item.notes}</Text>
            </GlassCard>
        );
    };

    return (
        <LooviBackground variant="subtle">
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Journal</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowEntryModal(true)}
                    >
                        <Text style={styles.addButtonText}>+ New</Text>
                    </TouchableOpacity>
                </View>

                {/* Entries List */}
                {journalEntries.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📝</Text>
                        <Text style={styles.emptyTitle}>No journal entries yet</Text>
                        <Text style={styles.emptyText}>
                            Start writing about your journey to track your thoughts and progress
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => setShowEntryModal(true)}
                        >
                            <Text style={styles.emptyButtonText}>Create First Entry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={journalEntries}
                        renderItem={renderEntry}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Entry Modal */}
                <JournalEntryModal
                    visible={showEntryModal}
                    onClose={() => setShowEntryModal(false)}
                    onSave={handleAddEntry}
                />
            </SafeAreaView>
        </LooviBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        paddingVertical: spacing.sm,
        paddingRight: spacing.md,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.accent.primary,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    addButton: {
        paddingVertical: spacing.sm,
        paddingLeft: spacing.md,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.accent.primary,
    },
    listContent: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    entryCard: {
        marginBottom: spacing.md,
    },
    entryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    entryHeaderLeft: {
        flex: 1,
    },
    entryDate: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    entryMood: {
        fontSize: 32,
    },
    triggerSection: {
        marginBottom: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    triggerLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: looviColors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    triggerText: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
        fontStyle: 'italic',
    },
    entryNotes: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.primary,
        lineHeight: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    emptyButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.xl,
    },
    emptyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
