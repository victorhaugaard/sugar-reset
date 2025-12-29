/**
 * SugarScienceScreen (SugarDangers)
 * 
 * Swipeable slides showing the NEGATIVE effects of sugar.
 * Science-based facts about glucose, cancer, mental/physical health.
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedIllustration } from '../../components/AnimatedIllustration';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SugarScienceScreenProps = {
    navigation: NativeStackNavigationProp<any, 'SugarScience'>;
};

interface ScienceSlide {
    id: string;
    emoji: string;
    title: string;
    subtitle: string;
    facts: string[];
    source?: string;
}

const scienceSlides: ScienceSlide[] = [
    {
        id: '1',
        emoji: '📈',
        title: 'Blood Sugar Spikes',
        subtitle: 'The hidden damage',
        facts: [
            'Sugar causes rapid glucose spikes that stress your pancreas',
            'Repeated spikes lead to insulin resistance over time',
            'This is the pathway to Type 2 diabetes',
            'Even "healthy" people suffer energy crashes daily',
        ],
        source: 'Harvard Medical School',
    },
    {
        id: '2',
        emoji: '🧠',
        title: 'Brain & Mental Health',
        subtitle: 'Sugar affects your mind',
        facts: [
            'Sugar triggers the same dopamine pathways as addictive drugs',
            'High sugar intake linked to 23% higher depression risk',
            'Causes brain fog, poor concentration, and memory issues',
            'Accelerates cognitive decline as you age',
        ],
        source: 'American Journal of Clinical Nutrition',
    },
    {
        id: '3',
        emoji: '💔',
        title: 'Heart & Inflammation',
        subtitle: 'Silent damage inside',
        facts: [
            'Sugar causes chronic inflammation throughout your body',
            'Doubles the risk of heart disease when consumed daily',
            'Raises triglycerides and lowers "good" HDL cholesterol',
            'Damages blood vessel walls over time',
        ],
        source: 'Journal of the American Heart Association',
    },
    {
        id: '4',
        emoji: '🎗️',
        title: 'Cancer Risk',
        subtitle: 'The uncomfortable truth',
        facts: [
            'Cancer cells consume 200x more glucose than normal cells',
            'High sugar diets linked to increased cancer risk',
            'Obesity (driven by sugar) is a major cancer risk factor',
            'Cutting sugar may slow tumor growth',
        ],
        source: 'Cancer Research UK',
    },
    {
        id: '5',
        emoji: '😴',
        title: 'Energy & Sleep',
        subtitle: 'The exhaustion cycle',
        facts: [
            'Sugar provides fake energy followed by crashes',
            'Disrupts deep sleep and recovery cycles',
            'Creates dependency: you need more to feel "normal"',
            'Breaking free restores natural, stable energy',
        ],
        source: 'Sleep Foundation',
    },
];

export default function SugarScienceScreen({ navigation }: SugarScienceScreenProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = () => {
        if (currentIndex < scienceSlides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.navigate('SugarestWelcome');
        }
    };

    const handleSkip = () => {
        navigation.navigate('SugarestWelcome');
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderSlide = ({ item }: { item: ScienceSlide }) => (
        <View style={styles.slide}>
            <View style={styles.slideContent}>
                <AnimatedIllustration
                    name={item.emoji}
                    size={120}
                    animation="breathe"
                />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>

                <GlassCard variant="light" padding="lg" style={styles.factsCard}>
                    {item.facts.map((fact, index) => (
                        <View key={index} style={styles.factRow}>
                            <Text style={styles.factBullet}>⚠️</Text>
                            <Text style={styles.factText}>{fact}</Text>
                        </View>
                    ))}
                    {item.source && (
                        <Text style={styles.source}>Source: {item.source}</Text>
                    )}
                </GlassCard>
            </View>
        </View>
    );

    const isLastSlide = currentIndex === scienceSlides.length - 1;

    return (
        <LooviBackground variant="coralTop">
            {/* Strong Red/Warning Overlay */}
            <LinearGradient
                colors={[
                    'rgba(198, 40, 40, 0.15)',
                    'rgba(198, 40, 40, 0.08)',
                    'rgba(198, 40, 40, 0.12)',
                ]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            <SafeAreaView style={styles.container}>
                {/* Header with title */}
                <View style={styles.header}>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>⚠️ Learn About Sugar</Text>
                    </View>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>

                {/* Slides */}
                <FlatList
                    ref={flatListRef}
                    data={scienceSlides}
                    renderItem={renderSlide}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                />

                {/* Pagination */}
                <View style={styles.pagination}>
                    {scienceSlides.map((_, index) => {
                        const inputRange = [
                            (index - 1) * SCREEN_WIDTH,
                            index * SCREEN_WIDTH,
                            (index + 1) * SCREEN_WIDTH,
                        ];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                key={index}
                                style={[styles.dot, { width: dotWidth, opacity }]}
                            />
                        );
                    })}
                </View>

                {/* Bottom */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.nextButtonText}>
                            {isLastSlide ? "Let's start the Sugar Reset!" : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LooviBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.sm,
    },
    headerBadge: {
        backgroundColor: 'rgba(198, 40, 40, 0.18)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 20,
    },
    headerBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#B71C1C',
    },
    skipButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    skipText: {
        fontSize: 15,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    slide: {
        width: SCREEN_WIDTH,
        paddingHorizontal: spacing.screen.horizontal,
    },
    slideContent: {
        flex: 1,
        alignItems: 'center',
        paddingTop: spacing.xl,
    },
    emoji: {
        fontSize: 56,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    factsCard: {
        width: '100%',
    },
    factRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    factBullet: {
        fontSize: 14,
        marginRight: spacing.sm,
        marginTop: 2,
    },
    factText: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        flex: 1,
        lineHeight: 22,
    },
    source: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        fontStyle: 'italic',
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        gap: spacing.xs,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#C62828',
    },
    bottomContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingBottom: spacing['2xl'],
    },
    nextButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
