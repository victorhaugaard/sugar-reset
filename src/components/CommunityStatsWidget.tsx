/**
 * CommunityStatsWidget
 * 
 * Displays aggregated community statistics in an attractive card layout.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';
import { GlassCard } from './GlassCard';
import { communityStatsService, CommunityStats } from '../services/communityStatsService';

interface CommunityStatsWidgetProps {
    onStatsLoaded?: (stats: CommunityStats) => void;
}

export function CommunityStatsWidget({ onStatsLoaded }: CommunityStatsWidgetProps) {
    const [stats, setStats] = useState<CommunityStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setIsLoading(true);
        try {
            const communityStats = await communityStatsService.getCommunityStats();
            setStats(communityStats);
            if (communityStats && onStatsLoaded) {
                onStatsLoaded(communityStats);
            }
        } catch (error) {
            console.error('Error loading community stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <GlassCard variant="light" padding="lg" style={styles.card}>
                <ActivityIndicator size="small" color={looviColors.accent.primary} />
            </GlassCard>
        );
    }

    if (!stats) {
        return null;
    }

    const formatNumber = communityStatsService.formatNumber;

    return (
        <GlassCard variant="light" padding="md" style={styles.card}>
            <View style={styles.header}>
                <Ionicons name="globe-outline" size={20} color={looviColors.accent.primary} />
                <Text style={styles.title}>Community Stats</Text>
            </View>

            <View style={styles.statsGrid}>
                {/* Active Users */}
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: `${looviColors.accent.primary}15` }]}>
                        <Ionicons name="people" size={18} color={looviColors.accent.primary} />
                    </View>
                    <Text style={styles.statValue}>{formatNumber(stats.activeUsers)}</Text>
                    <Text style={styles.statLabel}>Active Users</Text>
                </View>

                {/* Average Streak */}
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: `${looviColors.accent.warning}15` }]}>
                        <Ionicons name="flame" size={18} color={looviColors.accent.warning} />
                    </View>
                    <Text style={styles.statValue}>{stats.averageStreak}</Text>
                    <Text style={styles.statLabel}>Avg. Streak</Text>
                </View>

                {/* Average Health Score */}
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: `${looviColors.accent.success}15` }]}>
                        <Ionicons name="heart" size={18} color={looviColors.accent.success} />
                    </View>
                    <Text style={styles.statValue}>{stats.averageHealthScore}</Text>
                    <Text style={styles.statLabel}>Avg. Score</Text>
                </View>

                {/* Total Days Sugar-Free */}
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: `${looviColors.skyBlue}30` }]}>
                        <Ionicons name="calendar" size={18} color={looviColors.skyBlue} />
                    </View>
                    <Text style={styles.statValue}>{formatNumber(stats.totalDaysSugarFree)}</Text>
                    <Text style={styles.statLabel}>Days SF</Text>
                </View>
            </View>

            {/* Top Stats Row */}
            <View style={styles.topStatsRow}>
                <View style={styles.topStat}>
                    <Text style={styles.topStatLabel}>🏆 Top Streak</Text>
                    <Text style={styles.topStatValue}>{stats.topStreak} days</Text>
                </View>
                <View style={styles.topStatDivider} />
                <View style={styles.topStat}>
                    <Text style={styles.topStatLabel}>⭐ Top Score</Text>
                    <Text style={styles.topStatValue}>{stats.topHealthScore}</Text>
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    statLabel: {
        fontSize: 11,
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    topStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    topStat: {
        flex: 1,
        alignItems: 'center',
    },
    topStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
    topStatLabel: {
        fontSize: 12,
        color: looviColors.text.tertiary,
        marginBottom: 4,
    },
    topStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.accent.primary,
    },
});

export default CommunityStatsWidget;
