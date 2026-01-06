/**
 * FoodCalendar
 * 
 * Calendar grid showing food logging intensity and wellness status per day.
 * Color coding: grey=none, light blue=little, full blue=lots
 * Wellness indicator: small heart icon for days with wellness data
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';

interface FoodCalendarProps {
    foodCounts: Record<string, number>;  // { '2026-01-05': 3 }
    wellnessDates?: string[];  // Dates that have wellness data
    selectedDate: string | null;
    onSelectDate: (date: string) => void;
    startDate?: Date;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getWeeksInMonth(year: number, month: number): Date[][] {
    const weeks: Date[][] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let currentWeek: Date[] = [];

    // Fill in days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const date = new Date(year, month, -(firstDay.getDay() - 1 - i));
        currentWeek.push(date);
    }

    // Fill in the days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        currentWeek.push(new Date(year, month, day));

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Fill in remaining days
    if (currentWeek.length > 0) {
        const remaining = 7 - currentWeek.length;
        for (let i = 1; i <= remaining; i++) {
            currentWeek.push(new Date(year, month + 1, i));
        }
        weeks.push(currentWeek);
    }

    return weeks;
}

function formatDateString(date: Date): string {
    // Use local date components to avoid timezone issues with toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDayColor(count: number, isCurrentMonth: boolean): { bg: string; text: string } {
    if (!isCurrentMonth) {
        return { bg: 'transparent', text: looviColors.text.muted };
    }
    if (count === 0) {
        return { bg: 'rgba(0, 0, 0, 0.05)', text: looviColors.text.tertiary };
    }
    if (count <= 2) {
        return { bg: 'rgba(59, 130, 246, 0.25)', text: looviColors.accent.primary };
    }
    return { bg: 'rgba(59, 130, 246, 0.6)', text: '#FFFFFF' };
}

export function FoodCalendar({ foodCounts, wellnessDates = [], selectedDate, onSelectDate }: FoodCalendarProps) {
    const today = new Date();
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [viewYear, setViewYear] = useState(today.getFullYear());

    const weeks = useMemo(() => getWeeksInMonth(viewYear, viewMonth), [viewYear, viewMonth]);
    const wellnessSet = useMemo(() => new Set(wellnessDates), [wellnessDates]);

    const goToPreviousMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const isToday = (date: Date) => {
        return formatDateString(date) === formatDateString(today);
    };

    return (
        <View style={styles.container}>
            {/* Month Navigation */}
            <View style={styles.header}>
                <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                    <Text style={styles.navText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                    {MONTHS[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                    <Text style={styles.navText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeaders}>
                {DAYS.map((day, index) => (
                    <Text key={index} style={styles.dayHeader}>{day}</Text>
                ))}
            </View>

            {/* Calendar Grid */}
            {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.week}>
                    {week.map((date, dayIndex) => {
                        const dateStr = formatDateString(date);
                        const count = foodCounts[dateStr] || 0;
                        const hasWellness = wellnessSet.has(dateStr);
                        const isCurrentMonth = date.getMonth() === viewMonth;
                        const colors = getDayColor(count, isCurrentMonth);
                        const isSelected = selectedDate === dateStr;
                        const isTodayDate = isToday(date);

                        return (
                            <TouchableOpacity
                                key={dayIndex}
                                style={[
                                    styles.day,
                                    { backgroundColor: colors.bg },
                                    isSelected && styles.daySelected,
                                    isTodayDate && styles.dayToday,
                                ]}
                                onPress={() => isCurrentMonth && onSelectDate(dateStr)}
                                disabled={!isCurrentMonth}
                            >
                                <Text style={[
                                    styles.dayText,
                                    { color: colors.text },
                                    isSelected && styles.dayTextSelected,
                                ]}>
                                    {date.getDate()}
                                </Text>
                                {/* Food count badge - top right */}
                                {count > 0 && isCurrentMonth && (
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countText}>{count}</Text>
                                    </View>
                                )}
                                {/* Wellness indicator - bottom center */}
                                {hasWellness && isCurrentMonth && (
                                    <View style={styles.wellnessIndicator}>
                                        <Ionicons name="heart" size={8} color={looviColors.accent.primary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]} />
                    <Text style={styles.legendText}>No food</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: 'rgba(59, 130, 246, 0.25)' }]} />
                    <Text style={styles.legendText}>1-2 items</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: 'rgba(59, 130, 246, 0.6)' }]} />
                    <Text style={styles.legendText}>3+ items</Text>
                </View>
                <View style={styles.legendItem}>
                    <Ionicons name="heart" size={10} color={looviColors.accent.primary} />
                    <Text style={styles.legendText}>Wellness</Text>
                </View>
            </View>
        </View>
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
    navButton: {
        padding: spacing.sm,
    },
    navText: {
        fontSize: 24,
        fontWeight: '300',
        color: looviColors.text.primary,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    dayHeaders: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    dayHeader: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.tertiary,
    },
    week: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    day: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        marginHorizontal: 2,
        position: 'relative',
    },
    daySelected: {
        borderWidth: 2,
        borderColor: looviColors.accent.primary,
    },
    dayToday: {
        borderWidth: 1,
        borderColor: looviColors.accent.success,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
    },
    dayTextSelected: {
        color: looviColors.accent.primary,
    },
    countBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: looviColors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        fontSize: 8,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    wellnessIndicator: {
        position: 'absolute',
        bottom: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
});
