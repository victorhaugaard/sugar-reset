/**
 * AlternativesScreen - Healthy Alternatives
 * 
 * Dedicated screen for healthy food alternatives during cravings.
 * Users can describe what they're craving and get personalized alternatives.
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const calmColors = {
    darkBg: '#1A1A2E',
    darkerBg: '#0F0F1E',
    text: '#E8E8F0',
    textSecondary: '#B0B0C8',
    accent: '#7FB069', // Green for healthy alternatives
    cardBg: 'rgba(255, 255, 255, 0.08)',
    inputBg: 'rgba(255, 255, 255, 0.12)',
};

// Alternative categories with their alternatives
interface Alternative {
    id: string;
    title: string;
    description: string;
    keywords: string[]; // Keywords that match this alternative to cravings
}

interface Category {
    id: string;
    name: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
    alternatives: Alternative[];
}

const CATEGORIES: Category[] = [
    {
        id: 'cheatmeal',
        name: 'Cheatmeal',
        icon: 'star',
        color: '#C997A8',
        alternatives: [
            {
                id: 'dark-chocolate',
                title: 'Dark Chocolate (85%+)',
                description: 'A healthier treat that still feels indulgent',
                keywords: ['chocolate', 'candy', 'sweet', 'dessert', 'snack'],
            },
            {
                id: 'frozen-banana',
                title: 'Frozen Banana "Ice Cream"',
                description: 'Blend frozen bananas for creamy soft-serve',
                keywords: ['ice cream', 'gelato', 'frozen', 'dessert', 'creamy'],
            },
            {
                id: 'protein-brownie',
                title: 'Protein Brownie',
                description: 'Rich chocolate flavor with added protein',
                keywords: ['brownie', 'cake', 'chocolate', 'baked'],
            },
        ],
    },
    {
        id: 'healthy',
        name: 'Healthy Alternative',
        icon: 'heart',
        color: '#7FB069',
        alternatives: [
            {
                id: 'apple-almond',
                title: 'Apple with Almond Butter',
                description: 'Sweet, satisfying, and nutritious',
                keywords: ['sweet', 'crunchy', 'snack', 'fruit', 'candy'],
            },
            {
                id: 'greek-yogurt',
                title: 'Greek Yogurt with Berries',
                description: 'Creamy, protein-rich satisfaction',
                keywords: ['creamy', 'yogurt', 'dessert', 'ice cream', 'pudding'],
            },
            {
                id: 'banana-cinnamon',
                title: 'Banana with Cinnamon',
                description: 'Simple and naturally sweet',
                keywords: ['sweet', 'fruit', 'snack', 'simple'],
            },
            {
                id: 'cottage-cheese',
                title: 'Cottage Cheese with Honey',
                description: 'High protein with natural sweetness',
                keywords: ['creamy', 'cheese', 'protein', 'breakfast'],
            },
            {
                id: 'trail-mix',
                title: 'Homemade Trail Mix',
                description: 'Nuts, seeds, and a few dark chocolate chips',
                keywords: ['crunchy', 'snack', 'chips', 'nuts', 'salty'],
            },
        ],
    },
    {
        id: 'superfood',
        name: 'Superfood',
        icon: 'zap',
        color: '#88A4D6',
        alternatives: [
            {
                id: 'mixed-berries',
                title: 'Mixed Berries',
                description: 'Antioxidant-rich and naturally sweet',
                keywords: ['sweet', 'fruit', 'berry', 'candy', 'gummy'],
            },
            {
                id: 'dates-nut',
                title: 'Dates with Nut Butter',
                description: 'Natural energy and sweetness',
                keywords: ['sweet', 'caramel', 'candy', 'energy', 'chewy'],
            },
            {
                id: 'chia-pudding',
                title: 'Chia Pudding',
                description: 'Omega-3s with dessert-like texture',
                keywords: ['pudding', 'dessert', 'creamy', 'tapioca'],
            },
            {
                id: 'acai-bowl',
                title: 'Açaí Bowl',
                description: 'Superfood smoothie bowl with toppings',
                keywords: ['ice cream', 'smoothie', 'frozen', 'bowl'],
            },
        ],
    },
];

// Flatten all alternatives for easy searching
const ALL_ALTERNATIVES = CATEGORIES.flatMap(cat => 
    cat.alternatives.map(alt => ({ ...alt, category: cat }))
);

// Function to find relevant alternatives based on craving
const findAlternatives = (craving: string): typeof ALL_ALTERNATIVES => {
    if (!craving.trim()) {
        // Return a default selection when no craving specified
        return ALL_ALTERNATIVES.slice(0, 6);
    }

    const searchTerms = craving.toLowerCase().split(/\s+/);
    
    // Score each alternative based on keyword matches
    const scored = ALL_ALTERNATIVES.map(alt => {
        let score = 0;
        searchTerms.forEach(term => {
            alt.keywords.forEach(keyword => {
                if (keyword.includes(term) || term.includes(keyword)) {
                    score += 2;
                }
            });
            // Also check title
            if (alt.title.toLowerCase().includes(term)) {
                score += 3;
            }
        });
        return { ...alt, score };
    });

    // Sort by score and return top matches (or all if no matches)
    const matches = scored.filter(a => a.score > 0).sort((a, b) => b.score - a.score);
    
    if (matches.length === 0) {
        // If no keyword matches, return variety from each category
        return ALL_ALTERNATIVES.slice(0, 6);
    }
    
    return matches.slice(0, 6);
};

export default function AlternativesScreen() {
    const navigation = useNavigation();
    const [craving, setCraving] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Memoize alternatives based on craving
    const alternatives = useMemo(() => {
        if (!hasSearched && !craving.trim()) {
            return ALL_ALTERNATIVES.slice(0, 6);
        }
        return findAlternatives(craving);
    }, [craving, hasSearched]);

    const handleCravingChange = (text: string) => {
        setCraving(text);
        if (text.length > 2) {
            setHasSearched(true);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[calmColors.darkerBg, calmColors.darkBg, calmColors.darkerBg]}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={24} color={calmColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Alternatives</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView 
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Craving Input Section */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>What are you craving?</Text>
                            <View style={styles.inputContainer}>
                                <Feather name="search" size={20} color={calmColors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., chocolate, ice cream, cookies..."
                                    placeholderTextColor={calmColors.textSecondary}
                                    value={craving}
                                    onChangeText={handleCravingChange}
                                    returnKeyType="search"
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss();
                                        setHasSearched(true);
                                    }}
                                />
                                {craving.length > 0 && (
                                    <TouchableOpacity 
                                        onPress={() => { setCraving(''); setHasSearched(false); }}
                                        style={styles.clearButton}
                                    >
                                        <Feather name="x" size={18} color={calmColors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text style={styles.inputHint}>
                                Describe what you're craving and we'll suggest healthier options
                            </Text>
                        </View>

                        {/* Title */}
                        <View style={styles.titleSection}>
                            <Text style={styles.title}>Healthy Alternatives</Text>
                            <Text style={styles.subtitle}>
                                {hasSearched && craving.trim() 
                                    ? `Suggestions for "${craving}"`
                                    : 'Satisfy your craving the smart way'
                                }
                            </Text>
                        </View>

                        {/* Alternatives */}
                        <View style={styles.alternativesContainer}>
                            {alternatives.map((alt) => (
                                <View
                                    key={alt.id}
                                    style={[styles.alternativeCard, { borderLeftColor: alt.category.color }]}
                                >
                                    <View style={styles.categoryBadge}>
                                        <Feather name={alt.category.icon} size={12} color={alt.category.color} style={{ marginRight: 4 }} />
                                        <Text style={[styles.categoryText, { color: alt.category.color }]}>
                                            {alt.category.name}
                                        </Text>
                                    </View>
                                    <View style={styles.alternativeContent}>
                                        <View style={[styles.alternativeIcon, { backgroundColor: `${alt.category.color}15` }]}>
                                            <Feather name={alt.category.icon} size={24} color={alt.category.color} />
                                        </View>
                                        <View style={styles.alternativeInfo}>
                                            <Text style={styles.alternativeTitle}>{alt.title}</Text>
                                            <Text style={styles.alternativeDescription}>{alt.description}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Tip */}
                        <View style={styles.tipCard}>
                            <Feather name="info" size={20} color={calmColors.accent} style={{ marginRight: spacing.md }} />
                            <Text style={styles.tipText}>
                                These options provide natural sweetness without the blood sugar spike. The more specific your craving, the better the suggestions!
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: calmColors.darkerBg,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: calmColors.text,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing['3xl'],
    },
    // Input Section
    inputSection: {
        marginBottom: spacing.xl,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: calmColors.text,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: calmColors.inputBg,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: spacing.md,
    },
    inputIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: 16,
        color: calmColors.text,
    },
    clearButton: {
        padding: spacing.xs,
    },
    inputHint: {
        fontSize: 13,
        color: calmColors.textSecondary,
        marginTop: spacing.sm,
        fontStyle: 'italic',
    },
    // Title
    titleSection: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: calmColors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: calmColors.textSecondary,
        lineHeight: 22,
    },
    // Alternatives
    alternativesContainer: {
        marginBottom: spacing.xl,
    },
    alternativeCard: {
        backgroundColor: calmColors.cardBg,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderLeftWidth: 4,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: spacing.sm,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    alternativeContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    alternativeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    alternativeInfo: {
        flex: 1,
    },
    alternativeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: calmColors.text,
        marginBottom: 2,
    },
    alternativeDescription: {
        fontSize: 13,
        color: calmColors.textSecondary,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: calmColors.cardBg,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: `${calmColors.accent}30`,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: calmColors.textSecondary,
        lineHeight: 20,
    },
});
