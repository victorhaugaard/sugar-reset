/**
 * WeekStrip Component
 * 
 * Shows the last 7 days as interactive checkboxes.
 * Collapsible to expand into full month view.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { spacing, borderRadius } from '../theme';
import { skyColors } from './SkyBackground';
import { GlassCard } from './GlassCard';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type DayStatus = 'sugar_free' | 'had_sugar' | 'not_logged';

interface DayData {
    date: Date;
    status: DayStatus;
}

interface WeekStripProps {
    checkIns: Record<string, { status: 'sugar_free' | 'had_sugar'; grams?: number }>; // Format: 'YYYY-MM-DD' -> { status, grams? }
    onDayPress: (date: Date) => void;
    startDate?: Date; // User's start date (can't log before this)
}

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEK_DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Monday-first for getCurrentWeek display
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateKey(date: Date): string {
    // Use local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getCurrentWeek(): Date[] {
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay();

    // Calculate Monday of this week
    // If today is Sunday (0), go back 6 days to get Monday
    // Otherwise, go back (dayOfWeek - 1) days
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);

    // Generate Monday through Sunday
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        days.push(day);
    }
    return days;
}

function getMonthDays(year: number, month: number): (Date | null)[] {
    const days: (Date | null)[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add empty slots for days before the first of the month (Monday-first)
    // getDay() returns 0=Sunday, 1=Monday, etc.
    // For Monday-first: Monday=0, Tuesday=1, ..., Sunday=6
    const dayOfWeek = firstDay.getDay();
    const startPadding = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    for (let i = 0; i < startPadding; i++) {
        days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }

    return days;
}

function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
}

function isWithinMonth(date: Date): boolean {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);
    return date >= oneMonthAgo;
}

interface DayCircleProps {
    date: Date | null;
    status: DayStatus;
    grams?: number;
    onPress: () => void;
    disabled: boolean;
    isToday: boolean;
    compact?: boolean;
}

function DayCircle({ date, status, grams, onPress, disabled, isToday: today, compact }: DayCircleProps) {
    if (!date) {
        return <View style={[styles.dayCircle, compact && styles.dayCircleCompact, styles.dayCircleEmpty]} />;
    }

    const getStatusStyle = () => {
        switch (status) {
            case 'sugar_free':
                return styles.dayCircleSugarFree;
            case 'had_sugar':
                return styles.dayCircleHadSugar;
            default:
                return styles.dayCircleNotLogged;
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'sugar_free':
                // Show grams with 'g' suffix if available, otherwise checkmark
                return grams !== undefined ? `${grams}g` : '✓';
            case 'had_sugar':
                // Show grams with 'g' suffix if available for gradual plan
                return grams !== undefined ? `${grams}g` : '○';
            default:
                return date.getDate().toString();
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.dayCircle,
                compact && styles.dayCircleCompact,
                getStatusStyle(),
                today && styles.dayCircleToday,
                disabled && styles.dayCircleDisabled,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.dayCircleText,
                compact && styles.dayCircleTextCompact,
                status === 'sugar_free' && styles.dayCircleTextSugarFree,
                status === 'had_sugar' && styles.dayCircleTextHadSugar,
                disabled && styles.dayCircleTextDisabled,
            ]}>
                {getStatusIcon()}
            </Text>
        </TouchableOpacity>
    );
}

export default function WeekStrip({ checkIns, onDayPress, startDate }: WeekStripProps) {
    const [expanded, setExpanded] = useState(false);
    const [viewMonth, setViewMonth] = useState(new Date());

    const last7Days = getCurrentWeek();
    const monthDays = getMonthDays(viewMonth.getFullYear(), viewMonth.getMonth());

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const canLogDay = (date: Date): boolean => {
        if (isFuture(date)) return false;
        if (!isWithinMonth(date)) return false;
        if (startDate && date < startDate) return false;
        return true;
    };

    const getStatus = (date: Date): DayStatus => {
        const key = formatDateKey(date);
        const entry = checkIns[key];
        return entry?.status || 'not_logged';
    };

    const getGrams = (date: Date): number | undefined => {
        const key = formatDateKey(date);
        return checkIns[key]?.grams;
    };

    const navigateMonth = (direction: -1 | 1) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newMonth = new Date(viewMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);

        // Limit to current month and 1 month back
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        if (newMonth <= now && newMonth >= oneMonthAgo) {
            setViewMonth(newMonth);
        }
    };

    // Calculate streak info
    const sugarFreeDays = last7Days.filter(d => getStatus(d) === 'sugar_free').length;

    return (
        <GlassCard variant="light" padding="md" style={styles.container}>
            {/* Header */}
            <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>This Week</Text>
                        <Text style={styles.subtitle}>
                            {sugarFreeDays}/7 days sugar-free
                        </Text>
                    </View>
                    <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
                </View>
            </TouchableOpacity>

            {/* Week Strip */}
            {!expanded && (
                <View style={styles.weekStrip}>
                    {last7Days.map((day, index) => (
                        <View key={index} style={styles.dayColumn}>
                            <Text style={styles.dayLabel}>
                                {WEEK_DAY_NAMES[index]}
                            </Text>
                            <DayCircle
                                date={day}
                                status={getStatus(day)}
                                grams={getGrams(day)}
                                onPress={() => onDayPress(day)}
                                disabled={!canLogDay(day)}
                                isToday={isToday(day)}
                                compact
                            />
                        </View>
                    ))}
                </View>
            )}

            {/* Expanded Month View */}
            {expanded && (
                <View style={styles.monthContainer}>
                    {/* Month Navigation */}
                    <View style={styles.monthNav}>
                        <TouchableOpacity
                            onPress={() => navigateMonth(-1)}
                            style={styles.monthNavButton}
                        >
                            <Text style={styles.monthNavText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.monthTitle}>
                            {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigateMonth(1)}
                            style={styles.monthNavButton}
                        >
                            <Text style={styles.monthNavText}>→</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Day Headers - Monday first */}
                    <View style={styles.dayHeaders}>
                        {WEEK_DAY_NAMES.map((name, i) => (
                            <Text key={i} style={styles.dayHeader}>{name}</Text>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {monthDays.map((day, index) => (
                            <View key={index} style={styles.gridCell}>
                                <DayCircle
                                    date={day}
                                    status={day ? getStatus(day) : 'not_logged'}
                                    grams={day ? getGrams(day) : undefined}
                                    onPress={() => day && onDayPress(day)}
                                    disabled={!day || !canLogDay(day)}
                                    isToday={day ? isToday(day) : false}
                                />
                            </View>
                        ))}
                    </View>

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.legendSugarFree]} />
                            <Text style={styles.legendText}>Sugar-free</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.legendHadSugar]} />
                            <Text style={styles.legendText}>Had sugar</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.legendNotLogged]} />
                            <Text style={styles.legendText}>Not logged</Text>
                        </View>
                    </View>
                </View>
            )}
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: skyColors.text.primary,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: skyColors.text.tertiary,
        marginTop: 2,
    },
    chevron: {
        fontSize: 12,
        color: skyColors.text.tertiary,
    },
    weekStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayColumn: {
        alignItems: 'center',
    },
    dayLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: skyColors.text.tertiary,
        marginBottom: spacing.xs,
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    dayCircleCompact: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    dayCircleEmpty: {
        backgroundColor: 'transparent',
    },
    dayCircleSugarFree: {
        backgroundColor: '#4CAF50', // Green for success
    },
    dayCircleHadSugar: {
        backgroundColor: '#F44336', // Red for exceeded/had sugar
    },
    dayCircleNotLogged: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    dayCircleToday: {
        borderWidth: 2,
        borderColor: skyColors.accent.primary,
    },
    dayCircleDisabled: {
        opacity: 0.4,
    },
    dayCircleText: {
        fontSize: 14,
        fontWeight: '600',
        color: skyColors.text.primary,
    },
    dayCircleTextCompact: {
        fontSize: 12,
    },
    dayCircleTextSugarFree: {
        color: '#FFFFFF',
    },
    dayCircleTextHadSugar: {
        color: '#FFFFFF', // White on red background
    },
    dayCircleTextDisabled: {
        color: skyColors.text.tertiary,
    },
    monthContainer: {
        marginTop: spacing.sm,
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    monthNavButton: {
        padding: spacing.sm,
    },
    monthNavText: {
        fontSize: 18,
        color: skyColors.accent.primary,
        fontWeight: '600',
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: skyColors.text.primary,
    },
    dayHeaders: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    dayHeader: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        color: skyColors.text.tertiary,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridCell: {
        width: '14.285%', // 1/7 = 14.285%
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendSugarFree: {
        backgroundColor: skyColors.accent.success,
    },
    legendHadSugar: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        borderColor: skyColors.text.tertiary,
    },
    legendNotLogged: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    legendText: {
        fontSize: 11,
        color: skyColors.text.tertiary,
    },
});
