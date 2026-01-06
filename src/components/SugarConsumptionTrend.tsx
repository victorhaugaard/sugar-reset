/**
 * SugarConsumptionTrend
 *
 * Displays a bar chart showing daily sugar consumption over time
 * with a WHO target line (25g added sugar per day for women).
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';

interface DailySugar {
    date: string;  // YYYY-MM-DD format
    sugar: number;  // grams of added sugar
}

interface SugarConsumptionTrendProps {
    data: DailySugar[];
    timeframeDays: number;
    targetGrams?: number;  // WHO recommendation: 25g for women, 37.5g for men
}

// WHO recommends <25g added sugar per day for women
const WHO_TARGET_WOMEN = 25;

export function SugarConsumptionTrend({
    data,
    timeframeDays = 7,
    targetGrams = WHO_TARGET_WOMEN
}: SugarConsumptionTrendProps) {
    // Wider graph: reduced horizontal padding
    const width = Dimensions.get('window').width - (spacing.lg * 2.5);
    const height = 180;
    const padding = { top: 30, bottom: 40, left: 35, right: 10 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Calculate date range for timeline
    // Use local date strings (YYYY-MM-DD) for consistent comparison
    const getLocalDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - timeframeDays + 1);
    const startDateStr = getLocalDateString(startDate);

    // Aggregate sugar by date within timeframe
    const dailySugar = useMemo(() => {
        const sugarByDate: Record<string, number> = {};

        data.forEach(item => {
            // item.date is YYYY-MM-DD, compare directly
            if (item.date >= startDateStr && item.date <= todayStr) {
                if (!sugarByDate[item.date]) {
                    sugarByDate[item.date] = 0;
                }
                sugarByDate[item.date] += item.sugar;
            }
        });

        return sugarByDate;
    }, [data, startDateStr, todayStr]);

    // Calculate max value for Y-axis scaling
    const maxSugar = useMemo(() => {
        const values = Object.values(dailySugar);
        if (values.length === 0) return targetGrams * 2;
        return Math.max(targetGrams * 1.5, ...values);
    }, [dailySugar, targetGrams]);

    // Round up maxSugar to nice number
    const yAxisMax = Math.ceil(maxSugar / 25) * 25;
    const yAxisMid = yAxisMax / 2;

    // Calculate bar positions - ensure bars fit within graph
    const barSpacing = 2;
    const barWidth = Math.max(4, Math.min(20, (graphWidth / timeframeDays) - barSpacing));

    const bars = useMemo(() => {
        const result: { x: number; height: number; value: number; date: string; overTarget: boolean }[] = [];

        for (let i = 0; i < timeframeDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const value = dailySugar[dateStr] || 0;
            const barHeight = (value / yAxisMax) * graphHeight;
            // Position bars centered in their time slot
            const slotWidth = graphWidth / timeframeDays;
            const x = padding.left + (i * slotWidth) + (slotWidth / 2) - (barWidth / 2);

            result.push({
                x,
                height: Math.max(value > 0 ? 2 : 0, barHeight),
                value,
                date: dateStr,
                overTarget: value > targetGrams,
            });
        }

        return result;
    }, [dailySugar, timeframeDays, yAxisMax, graphHeight, graphWidth, barWidth, startDate, targetGrams]);

    // Calculate target line Y position
    const targetLineY = padding.top + graphHeight - (targetGrams / yAxisMax) * graphHeight;

    // Generate x-axis labels
    const xAxisLabels = useMemo(() => {
        const labels: { date: Date; x: number }[] = [];
        const slotWidth = graphWidth / timeframeDays;

        // Label alignment helper: x is the center of the slot
        const getLabelX = (i: number) => padding.left + (i * slotWidth) + (slotWidth / 2);

        if (timeframeDays <= 7) {
            for (let i = 0; i < timeframeDays; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                labels.push({ date, x: getLabelX(i) });
            }
        } else if (timeframeDays <= 30) {
            // Show weekly markers
            for (let i = 0; i < timeframeDays; i += 7) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                labels.push({ date, x: getLabelX(i) });
            }
            // Ensure today is shown if not close to last marker
            const lastIndex = timeframeDays - 1;
            if (lastIndex % 7 !== 0) {
                labels.push({ date: today, x: getLabelX(lastIndex) });
            }
        } else {
            // Show bi-weekly for longer periods
            for (let i = 0; i < timeframeDays; i += 14) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                labels.push({ date, x: getLabelX(i) });
            }
            // Ensure today is shown
            labels.push({ date: today, x: getLabelX(timeframeDays - 1) });
        }

        return labels;
    }, [timeframeDays, startDate, today, graphWidth]);

    const formatShortDate = (date: Date): string => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    };

    // Calculate average
    const daysWithData = Object.values(dailySugar).filter(v => v > 0).length;
    const totalSugar = Object.values(dailySugar).reduce((sum, v) => sum + v, 0);
    const averageSugar = daysWithData > 0 ? totalSugar / daysWithData : 0;

    if (Object.keys(dailySugar).length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No sugar data for this period. Log your food to see trends!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sugar Intake</Text>
                <Text style={styles.subtitle}>Last {timeframeDays} days</Text>
            </View>

            <View style={[styles.graphContainer, { height }]}>
                {/* Y-axis labels */}
                <View style={[styles.yAxisLabels, { height: graphHeight, marginTop: padding.top }]}>
                    <Text style={styles.yAxisLabel}>{yAxisMax}g</Text>
                    <Text style={styles.yAxisLabel}>{yAxisMid}g</Text>
                    <Text style={styles.yAxisLabel}>0g</Text>
                </View>

                {/* Graph area */}
                <View style={[styles.graphArea, { width: graphWidth + padding.left + padding.right }]}>
                    {/* Grid lines */}
                    <View style={[styles.gridLine, { top: padding.top, left: padding.left, right: padding.right }]} />
                    <View style={[styles.gridLine, { top: padding.top + graphHeight / 2, left: padding.left, right: padding.right }]} />
                    <View style={[styles.gridLine, { top: padding.top + graphHeight, left: padding.left, right: padding.right }]} />

                    {/* Target line */}
                    <View style={[
                        styles.targetLine,
                        {
                            top: targetLineY,
                            left: padding.left - 5,
                            right: padding.right - 5,
                        }
                    ]}>
                        <View style={styles.targetLineInner} />
                    </View>
                    <View style={[styles.targetLabel, { top: targetLineY - 8, left: padding.left - 35 }]}>
                        <Text style={styles.targetLabelText}>{targetGrams}g</Text>
                    </View>

                    {/* Bars */}
                    {bars.map((bar, index) => (
                        bar.value > 0 && (
                            <View
                                key={index}
                                style={[
                                    styles.bar,
                                    {
                                        left: bar.x,
                                        top: padding.top + graphHeight - bar.height,
                                        height: bar.height,
                                        width: barWidth,
                                        backgroundColor: bar.overTarget ? '#EF4444' : looviColors.accent.primary,
                                    }
                                ]}
                            />
                        )
                    ))}
                </View>
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxisLabelsContainer}>
                {xAxisLabels.map((label, index) => (
                    <Text
                        key={index}
                        style={[
                            styles.xAxisLabel,
                            {
                                position: 'absolute',
                                left: label.x,
                                transform: [{ translateX: -15 }],
                            }
                        ]}
                    >
                        {formatShortDate(label.date)}
                    </Text>
                ))}
            </View>

            {/* Legend and Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Average</Text>
                    <Text style={[
                        styles.statValue,
                        { color: averageSugar > targetGrams ? '#EF4444' : looviColors.accent.success }
                    ]}>
                        {averageSugar.toFixed(1)}g/day
                    </Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: looviColors.accent.primary }]} />
                    <Text style={styles.legendText}>Under target</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>Over target</Text>
                </View>
            </View>

            <View style={styles.whoNote}>
                <Text style={styles.whoNoteText}>
                    WHO recommends less than {targetGrams}g of added sugar per day for women
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    graphContainer: {
        flexDirection: 'row',
        position: 'relative',
    },
    yAxisLabels: {
        justifyContent: 'space-between',
        width: 35,
    },
    yAxisLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textAlign: 'right',
    },
    graphArea: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    gridLine: {
        position: 'absolute',
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    targetLine: {
        position: 'absolute',
        height: 2,
    },
    targetLineInner: {
        flex: 1,
        height: 2,
        backgroundColor: '#22C55E',
        opacity: 0.7,
    },
    targetLabel: {
        position: 'absolute',
    },
    targetLabelText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#22C55E',
    },
    bar: {
        position: 'absolute',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    xAxisLabelsContainer: {
        height: 20,
        marginTop: spacing.xs,
        position: 'relative',
    },
    xAxisLabel: {
        fontSize: 9,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        width: 30,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    whoNote: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
    },
    whoNoteText: {
        fontSize: 10,
        fontWeight: '400',
        color: looviColors.text.muted,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        textAlign: 'center',
    },
});
