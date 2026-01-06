/**
 * HealthScoreTrend
 *
 * Displays a line graph showing health score trend over time.
 * Uses proper date-based positioning on a timeline.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';

interface DataPoint {
    date: string;  // YYYY-MM-DD format
    score: number;
}

interface HealthScoreTrendProps {
    data: DataPoint[];
    timeframeDays: number;  // 7, 30, 90, etc.
}

export function HealthScoreTrend({ data, timeframeDays = 7 }: HealthScoreTrendProps) {
    // Wider graph: reduced horizontal padding
    const width = Dimensions.get('window').width - (spacing.lg * 2.5);
    const height = 150;
    const padding = { top: 20, bottom: 30, left: 30, right: 10 };
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

    // Filter and sort data within timeframe
    const filteredData = useMemo(() => {
        return data
            .filter(point => {
                // point.date is already YYYY-MM-DD
                return point.date >= startDateStr && point.date <= todayStr;
            })
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [data, startDateStr, todayStr]);

    // Calculate x position based on date using SLOT-CENTERED approach
    // This ensures points appear above their date labels, not at edges
    const slotWidth = graphWidth / timeframeDays;

    const getXPosition = (dateStr: string): number => {
        const pointParts = dateStr.split('-').map(Number);
        const startParts = startDateStr.split('-').map(Number);

        const pointDate = new Date(pointParts[0], pointParts[1] - 1, pointParts[2]);
        const startDateObj = new Date(startParts[0], startParts[1] - 1, startParts[2]);

        const dayIndex = Math.round((pointDate.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
        // Center of the slot for this day
        return padding.left + (dayIndex * slotWidth) + (slotWidth / 2);
    };

    // Calculate points with proper date-based positioning
    const points = useMemo(() => {
        const maxScore = 100;
        const minScore = 0;
        const scoreRange = maxScore - minScore;

        return filteredData.map(point => {
            const x = getXPosition(point.date);
            const normalizedScore = (point.score - minScore) / scoreRange;
            const y = padding.top + graphHeight - (normalizedScore * graphHeight);
            return { x, y, score: point.score, date: point.date };
        });
    }, [filteredData, graphWidth, graphHeight]);

    // Generate date labels for x-axis
    const xAxisLabels = useMemo(() => {
        const labels: { date: Date; x: number }[] = [];

        if (timeframeDays <= 7) {
            // Show every day for 7 days - centered in slots
            for (let i = 0; i < timeframeDays; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const x = padding.left + (i * slotWidth) + (slotWidth / 2);
                labels.push({ date, x });
            }
        } else if (timeframeDays <= 30) {
            // Show weekly markers for 30 days
            for (let i = 0; i < timeframeDays; i += 7) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const x = padding.left + (i * slotWidth) + (slotWidth / 2);
                labels.push({ date, x });
            }
            // Always include today (last slot)
            const lastIndex = timeframeDays - 1;
            labels.push({ date: today, x: padding.left + (lastIndex * slotWidth) + (slotWidth / 2) });
        } else {
            // Show monthly or bi-weekly for longer periods
            const interval = timeframeDays > 60 ? 30 : 14;
            for (let i = 0; i < timeframeDays; i += interval) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const x = padding.left + (i * slotWidth) + (slotWidth / 2);
                labels.push({ date, x });
            }
            const lastIndex = timeframeDays - 1;
            labels.push({ date: today, x: padding.left + (lastIndex * slotWidth) + (slotWidth / 2) });
        }

        return labels;
    }, [timeframeDays, startDate, today, graphWidth, slotWidth]);

    const formatShortDate = (date: Date): string => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    };

    // Get color based on latest score
    const latestScore = points.length > 0 ? points[points.length - 1].score : 0;
    const lineColor = latestScore >= 75 ? looviColors.accent.success :
        latestScore >= 50 ? '#F59E0B' : '#EF4444';

    if (filteredData.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No data for this period. Keep logging to see your trend!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Health Score Trend</Text>
                <Text style={styles.subtitle}>Last {timeframeDays} days</Text>
            </View>

            <View style={[styles.graphContainer, { height }]}>
                {/* Y-axis labels */}
                <View style={styles.yAxisLabels}>
                    <Text style={styles.yAxisLabel}>100</Text>
                    <Text style={styles.yAxisLabel}>50</Text>
                    <Text style={styles.yAxisLabel}>0</Text>
                </View>

                {/* Graph area */}
                <View style={[styles.graphArea, { width: graphWidth + padding.left + padding.right }]}>
                    {/* Grid lines */}
                    <View style={[styles.gridLine, { top: padding.top, left: padding.left, right: padding.right }]} />
                    <View style={[styles.gridLine, { top: padding.top + graphHeight / 2, left: padding.left, right: padding.right }]} />
                    <View style={[styles.gridLine, { top: padding.top + graphHeight, left: padding.left, right: padding.right }]} />

                    {/* Connect lines between points */}
                    {points.map((point, index) => {
                        if (index === 0) return null;
                        const prevPoint = points[index - 1];
                        const length = Math.sqrt(
                            Math.pow(point.x - prevPoint.x, 2) +
                            Math.pow(point.y - prevPoint.y, 2)
                        );
                        const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);

                        return (
                            <View
                                key={`line-${index}`}
                                style={[
                                    styles.line,
                                    {
                                        width: length,
                                        left: prevPoint.x,
                                        top: prevPoint.y,
                                        backgroundColor: lineColor,
                                        transform: [{ rotate: `${angle}deg` }],
                                    }
                                ]}
                            />
                        );
                    })}

                    {/* Data points */}
                    {points.map((point, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dataPoint,
                                {
                                    left: point.x - 5,
                                    top: point.y - 5,
                                    backgroundColor: lineColor,
                                }
                            ]}
                        />
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

            {/* Latest score indicator */}
            <View style={styles.latestScoreContainer}>
                <Text style={styles.latestScoreLabel}>Latest:</Text>
                <Text style={[styles.latestScoreValue, { color: lineColor }]}>
                    {latestScore}/100
                </Text>
                <View style={styles.dataPointsInfo}>
                    <Text style={styles.dataPointsCount}>{filteredData.length} data point{filteredData.length !== 1 ? 's' : ''}</Text>
                </View>
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
        paddingVertical: 20,
        width: 30,
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
    },
    gridLine: {
        position: 'absolute',
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    dataPoint: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    line: {
        position: 'absolute',
        height: 2,
        transformOrigin: 'left center',
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
    latestScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    latestScoreLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.secondary,
        marginRight: spacing.xs,
    },
    latestScoreValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    dataPointsInfo: {
        marginLeft: spacing.md,
        paddingLeft: spacing.md,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0, 0, 0, 0.1)',
    },
    dataPointsCount: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
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
