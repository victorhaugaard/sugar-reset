/**
 * ConsumptionChart Component
 * 
 * A simple line chart showing sugar consumption over time for the gradual plan.
 * Includes a scrollable popup for viewing all-time data.
 */

import React, { useState, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Modal,
    TouchableOpacity,
    ScrollView,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';

// Chart color theme using coral/orange from app theme
const CHART_COLORS = {
    line: looviColors.coralOrange,
    gradient: looviColors.coralSoft,
    success: looviColors.accent.success,
    error: looviColors.accent.error,
};

interface ConsumptionChartProps {
    /** Check-in history with grams data */
    checkInHistory: Record<string, { status: 'sugar_free' | 'had_sugar'; grams?: number }>;
    /** Daily limit to show as reference line */
    dailyLimit?: number;
    /** Number of days to show (default: 14) */
    daysToShow?: number;
}

const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 25, right: 30, bottom: 45, left: 50 };
const MODAL_CHART_HEIGHT = 250;

export function ConsumptionChart({
    checkInHistory,
    dailyLimit = 50,
    daysToShow = 14,
}: ConsumptionChartProps) {
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyPage, setHistoryPage] = useState(0);
    const screenWidth = Dimensions.get('window').width - 60;
    const modalWidth = Dimensions.get('window').width - 40;
    const chartWidth = screenWidth - CHART_PADDING.left - CHART_PADDING.right;
    const chartHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

    // Prepare data points - start from first entry, show 14 days forward
    // Only slide to show latest 14 days after 14+ days of data exist
    const dataPoints = useMemo(() => {
        const points: { date: string; grams: number | null; isWithinLimit: boolean }[] = [];
        const allDates = Object.keys(checkInHistory).sort();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If we have data, start from first entry date
        // Otherwise start from today
        let startDate: Date;
        if (allDates.length > 0) {
            const firstEntryDate = new Date(allDates[0]);
            const daysSinceFirst = Math.floor((today.getTime() - firstEntryDate.getTime()) / (1000 * 60 * 60 * 24));

            // If 14+ days have passed since first entry, show latest 14 days
            // Otherwise, show from first entry date (entries grow from left)
            if (daysSinceFirst >= daysToShow) {
                // Slide to show latest 14 days
                startDate = new Date(today);
                startDate.setDate(today.getDate() - (daysToShow - 1));
            } else {
                // Show from first entry date (data starts from left)
                startDate = firstEntryDate;
            }
        } else {
            // No data - just show today forward
            startDate = today;
        }

        // Generate points for 14 days starting from startDate
        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            const entry = checkInHistory[dateKey];

            points.push({
                date: dateKey,
                grams: entry?.grams ?? null,
                isWithinLimit: entry?.status === 'sugar_free',
            });
        }

        return points;
    }, [checkInHistory, daysToShow]);

    // Get all historical data grouped by 14-day periods
    const historyData = useMemo(() => {
        const allDates = Object.keys(checkInHistory).sort();
        if (allDates.length === 0) return [];

        const periods: { startDate: string; endDate: string; data: typeof dataPoints }[] = [];
        const today = new Date();

        // Calculate number of 14-day periods needed
        const firstDate = new Date(allDates[0]);
        const daysDiff = Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
        const numPeriods = Math.ceil(daysDiff / 14);

        for (let period = 0; period < Math.max(numPeriods, 1); period++) {
            const periodPoints: typeof dataPoints = [];
            const endOffset = period * 14;

            for (let i = 13 + endOffset; i >= endOffset; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateKey = date.toISOString().split('T')[0];
                const entry = checkInHistory[dateKey];

                periodPoints.push({
                    date: dateKey,
                    grams: entry?.grams ?? null,
                    isWithinLimit: entry?.status === 'sugar_free',
                });
            }

            if (periodPoints.some(p => p.grams !== null)) {
                periods.push({
                    startDate: periodPoints[0].date,
                    endDate: periodPoints[periodPoints.length - 1].date,
                    data: periodPoints,
                });
            }
        }

        return periods;
    }, [checkInHistory]);

    // Calculate Y axis range
    const maxGrams = useMemo(() => {
        const gramsValues = dataPoints
            .map(p => p.grams)
            .filter((g): g is number => g !== null);
        const maxData = Math.max(...gramsValues, dailyLimit);
        return Math.ceil(maxData / 20) * 20 + 20;
    }, [dataPoints, dailyLimit]);

    // Convert data to SVG coordinates
    const getX = (index: number, width: number = chartWidth) => {
        return CHART_PADDING.left + (index / (daysToShow - 1)) * width;
    };

    const getY = (grams: number, height: number = chartHeight) => {
        return CHART_PADDING.top + height - (grams / maxGrams) * height;
    };

    // Generate path for the line
    const linePath = useMemo(() => {
        const validPoints = dataPoints
            .map((p, i) => (p.grams !== null ? { x: getX(i), y: getY(p.grams) } : null))
            .filter((p): p is { x: number; y: number } => p !== null);

        if (validPoints.length < 2) return '';

        return validPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');
    }, [dataPoints, daysToShow, maxGrams]);

    // Generate filled area path
    const areaPath = useMemo(() => {
        const validPoints = dataPoints
            .map((p, i) => (p.grams !== null ? { x: getX(i), y: getY(p.grams), index: i } : null))
            .filter((p): p is { x: number; y: number; index: number } => p !== null);

        if (validPoints.length < 2) return '';

        const firstPoint = validPoints[0];
        const lastPoint = validPoints[validPoints.length - 1];
        const baseY = CHART_PADDING.top + chartHeight;

        let path = `M ${firstPoint.x} ${baseY}`;
        validPoints.forEach(p => {
            path += ` L ${p.x} ${p.y}`;
        });
        path += ` L ${lastPoint.x} ${baseY} Z`;

        return path;
    }, [dataPoints, daysToShow, maxGrams]);

    // Y axis labels
    const yLabels = [0, Math.round(maxGrams / 2), maxGrams];

    // Check if there's any data with grams
    const hasGramsData = dataPoints.some(p => p.grams !== null);

    const handleModalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const page = Math.round(event.nativeEvent.contentOffset.x / modalWidth);
        setHistoryPage(page);
    };

    if (!hasGramsData) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Sugar Consumption</Text>
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>
                        No consumption data yet.
                    </Text>
                    <Text style={styles.noDataSubtext}>
                        Start logging your daily grams to see trends here.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => setShowHistoryModal(true)}
                activeOpacity={0.8}
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Sugar Consumption</Text>
                        <Text style={styles.subtitle}>Last {daysToShow} days • Tap for history</Text>
                    </View>
                    <Text style={styles.expandIcon}>📊</Text>
                </View>

                <Svg width={screenWidth} height={CHART_HEIGHT}>
                    <Defs>
                        <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor={CHART_COLORS.line} stopOpacity="0.3" />
                            <Stop offset="100%" stopColor={CHART_COLORS.line} stopOpacity="0.05" />
                        </LinearGradient>
                    </Defs>

                    {/* Grid lines */}
                    {yLabels.map((label, i) => (
                        <Line
                            key={`grid-${i}`}
                            x1={CHART_PADDING.left}
                            y1={getY(label)}
                            x2={screenWidth - CHART_PADDING.right}
                            y2={getY(label)}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={1}
                        />
                    ))}

                    {/* Daily limit reference line */}
                    <Line
                        x1={CHART_PADDING.left}
                        y1={getY(dailyLimit)}
                        x2={screenWidth - CHART_PADDING.right}
                        y2={getY(dailyLimit)}
                        stroke={CHART_COLORS.line}
                        strokeWidth={1.5}
                        strokeDasharray="5,5"
                    />
                    <SvgText
                        x={CHART_PADDING.left + 5}
                        y={getY(dailyLimit) - 5}
                        fill={CHART_COLORS.line}
                        fontSize={10}
                        textAnchor="start"
                    >
                        Limit: {dailyLimit}g
                    </SvgText>

                    {/* Filled area under line */}
                    {areaPath && (
                        <Path
                            d={areaPath}
                            fill="url(#areaGradient)"
                        />
                    )}

                    {/* Line connecting data points */}
                    {linePath && (
                        <Path
                            d={linePath}
                            stroke={CHART_COLORS.line}
                            strokeWidth={2.5}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Data points */}
                    {dataPoints.map((point, i) => {
                        if (point.grams === null) return null;
                        return (
                            <Circle
                                key={`point-${i}`}
                                cx={getX(i)}
                                cy={getY(point.grams)}
                                r={5}
                                fill={point.isWithinLimit ? CHART_COLORS.success : CHART_COLORS.error}
                                stroke="#FFFFFF"
                                strokeWidth={2}
                            />
                        );
                    })}

                    {/* Y axis labels */}
                    {yLabels.map((label, i) => (
                        <SvgText
                            key={`y-label-${i}`}
                            x={CHART_PADDING.left - 10}
                            y={getY(label) + 4}
                            fill={colors.text.secondary}
                            fontSize={11}
                            textAnchor="end"
                        >
                            {label}g
                        </SvgText>
                    ))}

                    {/* X axis labels */}
                    {dataPoints.map((point, i) => {
                        if (i % Math.ceil(daysToShow / 5) !== 0 && i !== daysToShow - 1) return null;
                        const date = new Date(point.date);
                        const label = `${date.getDate()}/${date.getMonth() + 1}`;
                        return (
                            <SvgText
                                key={`x-label-${i}`}
                                x={getX(i)}
                                y={CHART_HEIGHT - 10}
                                fill={colors.text.tertiary}
                                fontSize={10}
                                textAnchor="middle"
                            >
                                {label}
                            </SvgText>
                        );
                    })}
                </Svg>
            </TouchableOpacity>

            {/* History Modal */}
            <Modal
                visible={showHistoryModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowHistoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Consumption History</Text>
                            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Swipe to see previous periods
                        </Text>

                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={handleModalScroll}
                            style={styles.modalScrollView}
                        >
                            {historyData.map((period, periodIndex) => {
                                const periodMaxGrams = Math.max(
                                    ...period.data.filter(p => p.grams !== null).map(p => p.grams!),
                                    dailyLimit
                                ) + 20;

                                return (
                                    <View key={periodIndex} style={[styles.modalPage, { width: modalWidth }]}>
                                        <Text style={styles.periodLabel}>
                                            {new Date(period.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            {' - '}
                                            {new Date(period.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </Text>

                                        <View style={styles.periodStats}>
                                            {period.data.filter(p => p.grams !== null).map((p, i) => (
                                                <View key={i} style={styles.periodStat}>
                                                    <Text style={[
                                                        styles.periodGrams,
                                                        p.isWithinLimit ? styles.gramsGood : styles.gramsBad
                                                    ]}>
                                                        {p.grams}g
                                                    </Text>
                                                    <Text style={styles.periodDate}>
                                                        {new Date(p.date).getDate()}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>

                        {/* Page indicator */}
                        <View style={styles.pageIndicator}>
                            {historyData.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.pageDot,
                                        i === historyPage && styles.pageDotActive
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    title: {
        ...typography.styles.h3,
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.styles.bodySm,
        color: looviColors.text.secondary,
    },
    expandIcon: {
        fontSize: 20,
    },
    noDataContainer: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    noDataText: {
        ...typography.styles.body,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    noDataSubtext: {
        ...typography.styles.bodySm,
        color: colors.text.tertiary,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        paddingTop: spacing.lg,
        paddingBottom: spacing['2xl'],
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    modalTitle: {
        ...typography.styles.h2,
        color: colors.text.primary,
    },
    modalClose: {
        fontSize: 24,
        color: colors.text.tertiary,
        padding: spacing.sm,
    },
    modalSubtitle: {
        ...typography.styles.bodySm,
        color: colors.text.secondary,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    modalScrollView: {
        flexGrow: 0,
    },
    modalPage: {
        paddingHorizontal: spacing.lg,
    },
    periodLabel: {
        ...typography.styles.body,
        color: colors.text.primary,
        fontWeight: '600',
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    periodStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        justifyContent: 'center',
    },
    periodStat: {
        alignItems: 'center',
        padding: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: borderRadius.md,
        minWidth: 50,
    },
    periodGrams: {
        ...typography.styles.body,
        fontWeight: '600',
    },
    gramsGood: {
        color: colors.accent.success,
    },
    gramsBad: {
        color: colors.accent.error,
    },
    periodDate: {
        ...typography.styles.bodySm,
        color: colors.text.tertiary,
        marginTop: 2,
    },
    pageIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: spacing.lg,
        gap: spacing.sm,
    },
    pageDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    pageDotActive: {
        backgroundColor: colors.accent.primary,
    },
});

export default ConsumptionChart;
