/**
 * HealthScoreTrend
 *
 * Displays a simple line graph showing health score trend over time
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { spacing } from '../theme';
import { looviColors } from './LooviBackground';

interface DataPoint {
    date: string;
    score: number;
}

interface HealthScoreTrendProps {
    data: DataPoint[];
    maxDataPoints?: number;
}

export function HealthScoreTrend({ data, maxDataPoints = 14 }: HealthScoreTrendProps) {
    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No data yet. Keep logging to see your trend!</Text>
            </View>
        );
    }

    // Limit data points
    const limitedData = data.slice(-maxDataPoints);
    const width = Dimensions.get('window').width - (spacing.screen.horizontal * 2) - (spacing.xl * 2);
    const height = 150;
    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Calculate scales
    const maxScore = 100;
    const minScore = 0;
    const scoreRange = maxScore - minScore;

    // Calculate points
    const points: { x: number; y: number; score: number }[] = limitedData.map((point, index) => {
        const x = padding.left + (index / (limitedData.length - 1 || 1)) * graphWidth;
        const normalizedScore = (point.score - minScore) / scoreRange;
        const y = padding.top + graphHeight - (normalizedScore * graphHeight);
        return { x, y, score: point.score };
    });

    // Generate path string for the line
    const pathData = points.map((point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        return `L ${point.x} ${point.y}`;
    }).join(' ');

    // Get color based on latest score
    const latestScore = limitedData[limitedData.length - 1]?.score || 0;
    const lineColor = latestScore >= 75 ? looviColors.accent.success :
                      latestScore >= 50 ? '#F59E0B' : '#EF4444';

    // Format date labels (show first, middle, last)
    const firstDate = new Date(limitedData[0].date);
    const lastDate = new Date(limitedData[limitedData.length - 1].date);
    const formatShortDate = (date: Date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Health Score Trend</Text>
                <Text style={styles.subtitle}>{limitedData.length} day{limitedData.length !== 1 ? 's' : ''}</Text>
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
                    <View style={[styles.gridLine, { top: padding.top }]} />
                    <View style={[styles.gridLine, { top: padding.top + graphHeight / 2 }]} />
                    <View style={[styles.gridLine, { top: padding.top + graphHeight }]} />

                    {/* Data points */}
                    {points.map((point, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dataPoint,
                                {
                                    left: point.x - 4,
                                    top: point.y - 4,
                                    backgroundColor: lineColor,
                                }
                            ]}
                        />
                    ))}

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
                </View>
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
                <Text style={styles.xAxisLabel}>{formatShortDate(firstDate)}</Text>
                <Text style={styles.xAxisLabel}>{formatShortDate(lastDate)}</Text>
            </View>

            {/* Latest score indicator */}
            <View style={styles.latestScoreContainer}>
                <Text style={styles.latestScoreLabel}>Latest:</Text>
                <Text style={[styles.latestScoreValue, { color: lineColor }]}>
                    {latestScore}/100
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
        paddingVertical: 20,
        marginRight: spacing.xs,
    },
    yAxisLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    graphArea: {
        flex: 1,
        position: 'relative',
    },
    gridLine: {
        position: 'absolute',
        left: 10,
        right: 10,
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    dataPoint: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    line: {
        position: 'absolute',
        height: 2,
        transformOrigin: 'left center',
    },
    xAxisLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
        paddingHorizontal: 40,
    },
    xAxisLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: looviColors.text.tertiary,
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
