/**
 * AlternativesScreen (Food Scanner & Swaps)
 * 
 * Combined food scanning with healthy alternatives.
 * Features:
 * - Prominent scan button at top
 * - Recently scanned items
 * - Healthy food swaps organized by category
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import FoodScannerModal from '../components/FoodScannerModal';
import ScannedItemCard from '../components/ScannedItemCard';
import { SwipeableTabView } from '../components/SwipeableTabView';
import { getScannedItems, deleteScannedItem, ScannedItem } from '../services/scannerService';

interface Alternative {
    id: string;
    emoji: string;
    name: string;
    swapFor: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface Category {
    id: string;
    emoji: string;
    name: string;
    alternatives: Alternative[];
}

const categories: Category[] = [
    {
        id: 'drinks',
        emoji: '🥤',
        name: 'Drinks',
        alternatives: [
            { id: '1', emoji: '💧', name: 'Sparkling water with lemon', swapFor: 'Soda', difficulty: 'Easy' },
            { id: '2', emoji: '🍵', name: 'Unsweetened green tea', swapFor: 'Sweet tea', difficulty: 'Easy' },
            { id: '3', emoji: '☕', name: 'Black coffee', swapFor: 'Frappuccino', difficulty: 'Medium' },
        ],
    },
    {
        id: 'snacks',
        emoji: '🍿',
        name: 'Snacks',
        alternatives: [
            { id: '4', emoji: '🥜', name: 'Mixed nuts', swapFor: 'Candy bars', difficulty: 'Easy' },
            { id: '5', emoji: '🧀', name: 'Cheese & crackers', swapFor: 'Cookies', difficulty: 'Easy' },
            { id: '6', emoji: '🍫', name: 'Dark chocolate (85%+)', swapFor: 'Milk chocolate', difficulty: 'Medium' },
        ],
    },
    {
        id: 'breakfast',
        emoji: '🍳',
        name: 'Breakfast',
        alternatives: [
            { id: '7', emoji: '🥚', name: 'Eggs & avocado', swapFor: 'Sugary cereal', difficulty: 'Easy' },
            { id: '8', emoji: '🥣', name: 'Plain oatmeal + berries', swapFor: 'Flavored oatmeal', difficulty: 'Easy' },
            { id: '9', emoji: '🥛', name: 'Greek yogurt (plain)', swapFor: 'Flavored yogurt', difficulty: 'Easy' },
        ],
    },
    {
        id: 'desserts',
        emoji: '🍰',
        name: 'Desserts',
        alternatives: [
            { id: '10', emoji: '🍓', name: 'Fresh berries + cream', swapFor: 'Ice cream', difficulty: 'Easy' },
            { id: '11', emoji: '🥥', name: 'Coconut bites', swapFor: 'Cookies', difficulty: 'Medium' },
            { id: '12', emoji: '🍌', name: 'Frozen banana slices', swapFor: 'Candy', difficulty: 'Easy' },
        ],
    },
];

const difficultyColors = {
    Easy: looviColors.accent.success,
    Medium: looviColors.accent.warning,
    Hard: '#EF4444',
};

export default function AlternativesScreen() {
    const [selectedCategory, setSelectedCategory] = useState('drinks');
    const [showScanner, setShowScanner] = useState(false);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [swapsExpanded, setSwapsExpanded] = useState(true);

    const activeCategory = categories.find(c => c.id === selectedCategory) || categories[0];

    // Load scanned items
    const loadScannedItems = async () => {
        const items = await getScannedItems();
        setScannedItems(items);
    };

    // Load on focus
    useFocusEffect(
        useCallback(() => {
            loadScannedItems();
        }, [])
    );

    // Handle refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await loadScannedItems();
        setRefreshing(false);
    };

    // Handle new scan
    const handleScanComplete = (item: ScannedItem) => {
        setScannedItems(prev => [item, ...prev]);
    };

    // Handle delete
    const handleDeleteItem = async (id: string) => {
        await deleteScannedItem(id);
        setScannedItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <SwipeableTabView currentTab="Alternatives">
            <LooviBackground variant="coralBottom">
                <SafeAreaView style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        {/* Header with Scan Button */}
                        <View style={styles.header}>
                            <View style={styles.headerText}>
                                <Text style={styles.title}>Food & Scan</Text>
                                <Text style={styles.subtitle}>Scan foods or find healthy swaps</Text>
                            </View>
                        </View>

                        {/* Prominent Scan Button */}
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={() => setShowScanner(true)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.scanButtonContent}>
                                <Text style={styles.scanEmoji}>📷</Text>
                                <View style={styles.scanTextContainer}>
                                    <Text style={styles.scanTitle}>Scan Food</Text>
                                    <Text style={styles.scanSubtitle}>Check sugar content instantly</Text>
                                </View>
                                <Text style={styles.scanArrow}>→</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Recently Scanned */}
                        {scannedItems.length > 0 && (
                            <View style={styles.recentSection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Recently Scanned</Text>
                                    <Text style={styles.sectionCount}>{scannedItems.length} items</Text>
                                </View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.recentScroll}
                                >
                                    {scannedItems.slice(0, 10).map((item) => (
                                        <ScannedItemCard
                                            key={item.id}
                                            item={item}
                                            compact
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Empty State for Scans */}
                        {scannedItems.length === 0 && (
                            <GlassCard variant="light" padding="lg" style={styles.emptyCard}>
                                <Text style={styles.emptyEmoji}>📸</Text>
                                <Text style={styles.emptyTitle}>No scans yet</Text>
                                <Text style={styles.emptyText}>
                                    Scan your first food item to start tracking sugar content
                                </Text>
                            </GlassCard>
                        )}

                        {/* Food Swaps Section (Collapsible) */}
                        <TouchableOpacity
                            style={styles.swapsHeader}
                            onPress={() => setSwapsExpanded(!swapsExpanded)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.swapsTitle}>Healthy Alternatives</Text>
                            <Text style={styles.expandIcon}>{swapsExpanded ? '▼' : '▶'}</Text>
                        </TouchableOpacity>

                        {swapsExpanded && (
                            <>
                                {/* Category Tabs */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoryScroll}
                                >
                                    <View style={styles.categoryRow}>
                                        {categories.map((category) => (
                                            <TouchableOpacity
                                                key={category.id}
                                                onPress={() => setSelectedCategory(category.id)}
                                                activeOpacity={0.7}
                                            >
                                                <GlassCard
                                                    variant="light"
                                                    padding="sm"
                                                    style={selectedCategory === category.id ? {
                                                        ...styles.categoryChip,
                                                        ...styles.categoryChipActive,
                                                    } : styles.categoryChip}
                                                >
                                                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                                    <Text style={[
                                                        styles.categoryName,
                                                        selectedCategory === category.id && styles.categoryNameActive,
                                                    ]}>
                                                        {category.name}
                                                    </Text>
                                                </GlassCard>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                {/* Alternatives List */}
                                <View style={styles.alternativesList}>
                                    {activeCategory.alternatives.map((alt) => (
                                        <GlassCard key={alt.id} variant="light" padding="md" style={styles.alternativeCard}>
                                            <View style={styles.alternativeRow}>
                                                <Text style={styles.altEmoji}>{alt.emoji}</Text>
                                                <View style={styles.altInfo}>
                                                    <Text style={styles.altName}>{alt.name}</Text>
                                                    <Text style={styles.altSwap}>Instead of: {alt.swapFor}</Text>
                                                </View>
                                                <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColors[alt.difficulty]}20` }]}>
                                                    <Text style={[styles.difficultyText, { color: difficultyColors[alt.difficulty] }]}>
                                                        {alt.difficulty}
                                                    </Text>
                                                </View>
                                            </View>
                                        </GlassCard>
                                    ))}
                                </View>
                            </>
                        )}

                        {/* Tip */}
                        <GlassCard variant="light" padding="md" style={styles.tipCard}>
                            <Text style={styles.tipTitle}>💡 Pro Tip</Text>
                            <Text style={styles.tipText}>
                                Start with "Easy" swaps first. Small wins build momentum!
                            </Text>
                        </GlassCard>
                    </ScrollView>

                    {/* Scanner Modal */}
                    <FoodScannerModal
                        visible={showScanner}
                        onClose={() => setShowScanner(false)}
                        onScanComplete={handleScanComplete}
                    />
                </SafeAreaView>
            </LooviBackground>
        </SwipeableTabView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.lg,
        paddingBottom: spacing['3xl'],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginTop: spacing.xs,
    },
    // Scan Button
    scanButton: {
        backgroundColor: looviColors.accent.primary,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    scanButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scanEmoji: {
        fontSize: 36,
        marginRight: spacing.md,
    },
    scanTextContainer: {
        flex: 1,
    },
    scanTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scanSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    scanArrow: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '300',
    },
    // Recent Section
    recentSection: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    sectionCount: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    recentScroll: {
        marginHorizontal: -spacing.screen.horizontal,
        paddingHorizontal: spacing.screen.horizontal,
    },
    // Empty State
    emptyCard: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
    },
    // Swaps Section
    swapsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginBottom: spacing.md,
    },
    swapsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    expandIcon: {
        fontSize: 12,
        color: looviColors.text.tertiary,
    },
    // Category styles
    categoryScroll: {
        marginBottom: spacing.md,
        marginHorizontal: -spacing.screen.horizontal,
        paddingHorizontal: spacing.screen.horizontal,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    categoryChipActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: looviColors.accent.primary,
    },
    categoryEmoji: {
        fontSize: 18,
        marginRight: spacing.xs,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.secondary,
    },
    categoryNameActive: {
        color: looviColors.text.primary,
        fontWeight: '600',
    },
    // Alternatives List
    alternativesList: {
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    alternativeCard: {},
    alternativeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    altEmoji: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    altInfo: {
        flex: 1,
    },
    altName: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: 2,
    },
    altSwap: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    difficultyBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 8,
    },
    difficultyText: {
        fontSize: 11,
        fontWeight: '600',
    },
    // Tip Card
    tipCard: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    tipText: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
    },
});
