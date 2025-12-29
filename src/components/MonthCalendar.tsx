/**
 * MonthCalendar Component
 * 
 * Full month calendar view for Analytics screen.
 * Shows check-in history with color-coded days.
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

interface MonthCalendarProps {
    checkIns: Record<string, { status: 'sugar_free' | 'had_sugar'; grams?: number }>; // 'YYYY-MM-DD' -> { status, grams? }
    onDayPress: (date: Date) => void;
    startDate?: Date;
}

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

function formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
}

function getMonthDays(year: number, month: number): (Date | null)[] {
    const days: (Date | null)[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
        days.push(null);
    }

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

export default function MonthCalendar({ checkIns, onDayPress, startDate }: MonthCalendarProps) {
    const [viewDate, setViewDate] = useState(new Date());

    const monthDays = getMonthDays(viewDate.getFullYear(), viewDate.getMonth());

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

    const navigateMonth = (direction: -1 | 1) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + direction);

        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        if (newDate <= now && newDate >= oneMonthAgo) {
            setViewDate(newDate);
        }
    };

    // Calculate stats
    const sugarFreeDays = monthDays.filter(d => d && getStatus(d) === 'sugar_free').length;
    const hadSugarDays = monthDays.filter(d => d && getStatus(d) === 'had_sugar').length;
    const loggedDays = sugarFreeDays + hadSugarDays;

    return (
        <GlassCard variant="light" padding="md" style={styles.container}>
            {/* Month Navigation */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigateMonth(-1)}
                    style={styles.navButton}
                >
                    <Text style={styles.navText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                    {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </Text>
                <TouchableOpacity
                    onPress={() => navigateMonth(1)}
                    style={styles.navButton}
                >
                    <Text style={styles.navText}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeaders}>
                {DAY_NAMES.map((name, i) => (
                    <Text key={i} style={styles.dayHeader}>{name}</Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.grid}>
                {monthDays.map((day, index) => {
                    if (!day) {
                        return <View key={index} style={styles.dayCell} />;
                    }

                    const status = getStatus(day);
                    const canLog = canLogDay(day);
                    const today = isToday(day);

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayCell,
                                status === 'sugar_free' && styles.daySugarFree,
                                status === 'had_sugar' && styles.dayHadSugar,
                                status === 'not_logged' && styles.dayNotLogged,
                                today && styles.dayToday,
                                !canLog && styles.dayDisabled,
                            ]}
                            onPress={() => canLog && onDayPress(day)}
                            disabled={!canLog}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.dayText,
                                status === 'sugar_free' && styles.dayTextSugarFree,
                                !canLog && styles.dayTextDisabled,
                            ]}>
                                {status === 'sugar_free' ? '✓' : day.getDate()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Stats Summary */}
            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <View style={[styles.statDot, styles.statDotSuccess]} />
                    <Text style={styles.statText}>{sugarFreeDays} sugar-free</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={[styles.statDot, styles.statDotNeutral]} />
                    <Text style={styles.statText}>{hadSugarDays} had sugar</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{loggedDays} logged</Text>
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    navButton: {
        padding: spacing.sm,
    },
    navText: {
        fontSize: 18,
        color: skyColors.accent.primary,
        fontWeight: '600',
    },
    monthTitle: {
        fontSize: 18,
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        marginBottom: 2,
    },
    daySugarFree: {
        backgroundColor: skyColors.accent.success,
    },
    dayHadSugar: {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
    dayNotLogged: {
        backgroundColor: 'transparent',
    },
    dayToday: {
        borderWidth: 2,
        borderColor: skyColors.accent.primary,
    },
    dayDisabled: {
        opacity: 0.3,
    },
    dayText: {
        fontSize: 13,
        fontWeight: '500',
        color: skyColors.text.primary,
    },
    dayTextSugarFree: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    dayTextDisabled: {
        color: skyColors.text.tertiary,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    statDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statDotSuccess: {
        backgroundColor: skyColors.accent.success,
    },
    statDotNeutral: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    statText: {
        fontSize: 12,
        color: skyColors.text.secondary,
    },
    statLabel: {
        fontSize: 12,
        color: skyColors.text.tertiary,
    },
});
