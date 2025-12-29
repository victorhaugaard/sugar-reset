/**
 * PlanProgressCircle Component
 * 
 * Circular SVG-based progress indicator showing 90-day plan progress.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { looviColors } from './LooviBackground';

interface PlanProgressCircleProps {
    daysCompleted: number;
    totalDays?: number;
    size?: number;
    strokeWidth?: number;
}

export function PlanProgressCircle({
    daysCompleted,
    totalDays = 90,
    size = 140,
    strokeWidth = 10,
}: PlanProgressCircleProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(daysCompleted / totalDays, 1);
    const strokeDashoffset = circumference * (1 - progress);
    const percentage = Math.round(progress * 100);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svg}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(217, 123, 102, 0.15)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={looviColors.coralOrange}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <View style={styles.centerContent}>
                <Text style={styles.percentage}>{percentage}%</Text>
                <Text style={styles.label}>complete</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    svg: {
        position: 'absolute',
    },
    centerContent: {
        alignItems: 'center',
    },
    percentage: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
});

export default PlanProgressCircle;
