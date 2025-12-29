/**
 * ScannedItemCard
 * 
 * Card component for displaying a scanned food item.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import { spacing } from '../theme';
import { looviColors } from './LooviBackground';
import { GlassCard } from './GlassCard';
import { ScannedItem } from '../services/scannerService';

interface ScannedItemCardProps {
    item: ScannedItem;
    onPress?: () => void;
    onDelete?: () => void;
    compact?: boolean;
}

export default function ScannedItemCard({
    item,
    onPress,
    onDelete,
    compact = false,
}: ScannedItemCardProps) {
    const getSugarColor = (grams: number) => {
        if (grams <= 5) return looviColors.accent.success;
        if (grams <= 15) return looviColors.accent.warning;
        return '#EF4444';
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    if (compact) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <GlassCard variant="light" padding="sm" style={styles.compactCard}>
                    <Image source={{ uri: item.imageUri }} style={styles.compactImage} />
                    <Text style={styles.compactName} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.compactSugar, { color: getSugarColor(item.sugarGrams) }]}>
                        {item.sugarGrams}g
                    </Text>
                </GlassCard>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <GlassCard variant="light" padding="md" style={styles.card}>
                <View style={styles.row}>
                    <Image source={{ uri: item.imageUri }} style={styles.image} />
                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
                    </View>
                    <View style={styles.sugarContainer}>
                        <Text style={[styles.sugarValue, { color: getSugarColor(item.sugarGrams) }]}>
                            {item.sugarGrams}g
                        </Text>
                        <Text style={styles.sugarLabel}>sugar</Text>
                    </View>
                    {onDelete && (
                        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                            <Text style={styles.deleteText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </GlassCard>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: spacing.md,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    sugarContainer: {
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    sugarValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    sugarLabel: {
        fontSize: 10,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    deleteButton: {
        padding: spacing.sm,
    },
    deleteText: {
        fontSize: 16,
        color: looviColors.text.muted,
    },
    // Compact styles
    compactCard: {
        width: 100,
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    compactImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginBottom: spacing.xs,
    },
    compactName: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: 2,
    },
    compactSugar: {
        fontSize: 14,
        fontWeight: '700',
    },
});
