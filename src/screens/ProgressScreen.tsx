/**
 * ProgressScreen
 * 
 * Data-driven progress view with metrics tiles and minimal charts.
 * No trophies, no animations, just calm data visualization.
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

// Placeholder data - in real app, this would come from state/database
const progressData = {
    totalSugarFreeDays: 47,
    currentStreak: 12,
    longestStreak: 18,
    daysLogged: 52,
    weeklyData: [1, 1, 1, 0, 1, 1, 1], // 1 = sugar-free, 0 = sugar consumed
    monthlyData: [5, 6, 7, 4, 6, 7, 6, 5], // sugar-free days per week
};

// Metric Tile Component
function MetricTile({ label, value }: { label: string; value: number | string }) {
    return (
        <View style={styles.metricTile}>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
        </View>
    );
}

// Simple Bar Chart Component
function SimpleBarChart({ data, label }: { data: number[]; label: string }) {
    const maxValue = Math.max(...data, 1);

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartLabel}>{label}</Text>
            <View style={styles.chartBars}>
                {data.map((value, index) => (
                    <View key={index} style={styles.barContainer}>
                        <View
                            style={[
                                styles.bar,
                                { height: (value / maxValue) * 60 || 4 }
                            ]}
                        />
                    </View>
                ))}
            </View>
            <View style={styles.chartLabels}>
                {data.map((_, index) => (
                    <Text key={index} style={styles.chartAxisLabel}>
                        W{index + 1}
                    </Text>
                ))}
            </View>
        </View>
    );
}

// Week View Component
function WeekView({ data }: { data: number[] }) {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <View style={styles.weekContainer}>
            <Text style={styles.chartLabel}>This week</Text>
            <View style={styles.weekDays}>
                {data.map((value, index) => (
                    <View key={index} style={styles.dayContainer}>
                        <View
                            style={[
                                styles.dayDot,
                                value === 1 ? styles.dayDotFilled : styles.dayDotEmpty,
                            ]}
                        />
                        <Text style={styles.dayLabel}>{days[index]}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default function ProgressScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Progress</Text>
                    <Text style={styles.subtitle}>Your journey in numbers</Text>
                </View>

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                    <MetricTile label="Sugar-free days" value={progressData.totalSugarFreeDays} />
                    <MetricTile label="Current streak" value={progressData.currentStreak} />
                    <MetricTile label="Longest streak" value={progressData.longestStreak} />
                    <MetricTile label="Days logged" value={progressData.daysLogged} />
                </View>

                {/* Week View */}
                <WeekView data={progressData.weeklyData} />

                {/* Monthly Chart */}
                <SimpleBarChart
                    data={progressData.monthlyData}
                    label="Weekly sugar-free days"
                />
            </ScrollView>
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
    // Metrics Grid
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    metricTile: {
        width: '47%',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
    },
    metricValue: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    metricLabel: {
        fontSize: 13,
        fontWeight: '400',
        color: colors.text.tertiary,
    },
    // Week View
    weekContainer: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing['2xl'],
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    dayContainer: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    dayDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    dayDotFilled: {
        backgroundColor: colors.text.tertiary,
    },
    dayDotEmpty: {
        backgroundColor: colors.glass.light,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    dayLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.text.muted,
    },
    // Chart
    chartContainer: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
    },
    chartLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text.secondary,
        marginBottom: spacing.md,
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 60,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
    },
    bar: {
        width: 24,
        backgroundColor: colors.text.tertiary,
        borderRadius: 4,
        minHeight: 4,
    },
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    chartAxisLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '400',
        color: colors.text.muted,
    },
});
