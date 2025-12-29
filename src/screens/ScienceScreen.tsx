/**
 * ScienceScreen (Insights)
 * 
 * Scrollable list of science-based insights with universe background.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../theme';
import { UniverseBackground } from '../components';

interface Insight {
    id: string;
    title: string;
    description: string;
}

const insights: Insight[] = [
    {
        id: '1',
        title: 'Cravings peak around day 3',
        description: 'Sugar withdrawal symptoms typically intensify around 72 hours before gradually subsiding.',
    },
    {
        id: '2',
        title: 'Dopamine adapts over time',
        description: 'Your brain recalibrates its reward system when you reduce sugar, making natural foods more satisfying.',
    },
    {
        id: '3',
        title: 'Habits form through repetition',
        description: 'Research suggests it takes an average of 66 days for a new behavior to become automatic.',
    },
    {
        id: '4',
        title: 'Stress triggers old patterns',
        description: 'Cortisol increases sugar cravings. Recognizing this helps you respond rather than react.',
    },
    {
        id: '5',
        title: 'Sleep affects cravings',
        description: 'Poor sleep increases ghrelin and decreases leptin, making you crave high-energy foods.',
    },
    {
        id: '6',
        title: 'Progress is non-linear',
        description: 'Setbacks are part of habit change. What matters is the overall trend, not individual days.',
    },
    {
        id: '7',
        title: 'Hydration reduces cravings',
        description: 'Thirst is often mistaken for hunger or sugar cravings. Staying hydrated helps regulate appetite.',
    },
    {
        id: '8',
        title: 'Context shapes behavior',
        description: 'Changing your environment—removing triggers—is more effective than relying on willpower alone.',
    },
];

function InsightCard({ insight }: { insight: Insight }) {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{insight.title}</Text>
            <Text style={styles.cardDescription}>{insight.description}</Text>
        </View>
    );
}

export default function ScienceScreen() {
    return (
        <UniverseBackground showParticles={false}>
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Insights</Text>
                        <Text style={styles.subtitle}>Science-based habit knowledge</Text>
                    </View>

                    {/* Insight Cards */}
                    <View style={styles.cardsContainer}>
                        {insights.map((insight) => (
                            <InsightCard key={insight.id} insight={insight} />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </UniverseBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.xl,
        paddingBottom: spacing['3xl'],
    },
    header: {
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.secondary,
    },
    cardsContainer: {
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.glass.light,
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.glass.border,
        padding: spacing.lg,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    cardDescription: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text.secondary,
        lineHeight: 20,
    },
});
