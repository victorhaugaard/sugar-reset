/**
 * SuccessStoriesScreen
 * 
 * Social proof screen showing:
 * - User success statistics with animated numbers
 * - Testimonial cards from real users
 * - App store rating
 * - "Tweet" style cards about sugar dangers
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, borderRadius } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SuccessStoriesScreenProps = {
    navigation: NativeStackNavigationProp<any, 'SuccessStories'>;
};

interface Testimonial {
    id: string;
    name: string;
    avatar: string;
    days: number;
    quote: string;
}

interface SugarFact {
    id: string;
    source: string;
    handle: string;
    text: string;
    likes: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        id: '1',
        name: 'Sarah M.',
        avatar: '👩‍💼',
        days: 47,
        quote: 'I never thought I could go a week without sugar. Now I\'m at 47 days and counting!',
    },
    {
        id: '2',
        name: 'James K.',
        avatar: '👨‍🔬',
        days: 90,
        quote: 'The science-based approach finally made it click. My energy levels are incredible.',
    },
    {
        id: '3',
        name: 'Emma L.',
        avatar: '👩‍🎨',
        days: 21,
        quote: 'The craving support feature saved me so many times in the first two weeks.',
    },
];

const SUGAR_FACTS: SugarFact[] = [
    {
        id: '1',
        source: 'Harvard Health',
        handle: '@HarvardHealth',
        text: 'Sugar activates the same brain reward centers as addictive drugs, triggering dopamine release.',
        likes: '12.4K',
    },
    {
        id: '2',
        source: 'WHO',
        handle: '@WHO',
        text: 'Reducing sugar intake to less than 10% of daily calories can prevent obesity, diabetes, and heart disease.',
        likes: '8.7K',
    },
];

export default function SuccessStoriesScreen({ navigation }: SuccessStoriesScreenProps) {
    const [animatedValues] = useState({
        successRate: new Animated.Value(0),
        avgDays: new Animated.Value(0),
        users: new Animated.Value(0),
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Animate content in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Animate numbers
        Animated.parallel([
            Animated.timing(animatedValues.successRate, {
                toValue: 87,
                duration: 1500,
                useNativeDriver: false,
            }),
            Animated.timing(animatedValues.avgDays, {
                toValue: 47,
                duration: 1500,
                useNativeDriver: false,
            }),
            Animated.timing(animatedValues.users, {
                toValue: 10,
                duration: 1500,
                useNativeDriver: false,
            }),
        ]).start();
    }, []);

    const handleContinue = () => {
        navigation.navigate('Goals');
    };

    return (
        <LooviBackground variant="blueBottom">
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Real Results</Text>
                        <Text style={styles.headerSubtitle}>From people just like you</Text>
                    </View>

                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        {/* Statistics Cards */}
                        <View style={styles.statsRow}>
                            <GlassCard variant="light" padding="md" style={styles.statCard}>
                                <AnimatedNumber
                                    value={animatedValues.successRate}
                                    suffix="%"
                                />
                                <Text style={styles.statLabel}>Success Rate</Text>
                            </GlassCard>
                            <GlassCard variant="light" padding="md" style={styles.statCard}>
                                <AnimatedNumber
                                    value={animatedValues.avgDays}
                                    suffix=" days"
                                />
                                <Text style={styles.statLabel}>Avg. Streak</Text>
                            </GlassCard>
                            <GlassCard variant="light" padding="md" style={styles.statCard}>
                                <AnimatedNumber
                                    value={animatedValues.users}
                                    suffix="K+"
                                />
                                <Text style={styles.statLabel}>Users</Text>
                            </GlassCard>
                        </View>

                        {/* App Rating */}
                        <GlassCard variant="light" padding="lg" style={styles.ratingCard}>
                            <View style={styles.ratingRow}>
                                <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
                                <Text style={styles.ratingValue}>4.8</Text>
                            </View>
                            <Text style={styles.ratingSubtext}>from 2,400+ reviews</Text>
                        </GlassCard>

                        {/* Testimonials */}
                        <Text style={styles.sectionTitle}>Success Stories</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.testimonialsContainer}
                        >
                            {TESTIMONIALS.map((testimonial) => (
                                <GlassCard
                                    key={testimonial.id}
                                    variant="light"
                                    padding="lg"
                                    style={styles.testimonialCard}
                                >
                                    <View style={styles.testimonialHeader}>
                                        <Text style={styles.testimonialAvatar}>
                                            {testimonial.avatar}
                                        </Text>
                                        <View>
                                            <Text style={styles.testimonialName}>
                                                {testimonial.name}
                                            </Text>
                                            <Text style={styles.testimonialDays}>
                                                🔥 {testimonial.days} days sugar-free
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.testimonialQuote}>
                                        "{testimonial.quote}"
                                    </Text>
                                </GlassCard>
                            ))}
                        </ScrollView>

                        {/* Sugar Facts */}
                        <Text style={styles.sectionTitle}>The Sugar Truth</Text>
                        {SUGAR_FACTS.map((fact) => (
                            <GlassCard
                                key={fact.id}
                                variant="light"
                                padding="lg"
                                style={styles.factCard}
                            >
                                <View style={styles.factHeader}>
                                    <View style={styles.factSource}>
                                        <Text style={styles.factIcon}>🔬</Text>
                                        <View>
                                            <Text style={styles.factName}>{fact.source}</Text>
                                            <Text style={styles.factHandle}>{fact.handle}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.factText}>{fact.text}</Text>
                                <View style={styles.factFooter}>
                                    <Text style={styles.factLikes}>❤️ {fact.likes}</Text>
                                </View>
                            </GlassCard>
                        ))}
                    </Animated.View>
                </ScrollView>

                {/* Continue Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueButtonText}>
                            See How It Works →
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LooviBackground>
    );
}

// Animated number component
function AnimatedNumber({ value, suffix }: { value: Animated.Value; suffix: string }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const listener = value.addListener(({ value: v }) => {
            setDisplayValue(Math.round(v));
        });
        return () => value.removeListener(listener);
    }, [value]);

    return (
        <Text style={styles.statValue}>
            {displayValue}{suffix}
        </Text>
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
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: looviColors.text.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.screen.horizontal,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.accent.primary,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
    ratingCard: {
        marginHorizontal: spacing.screen.horizontal,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    ratingStars: {
        fontSize: 18,
    },
    ratingValue: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    ratingSubtext: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
        paddingHorizontal: spacing.screen.horizontal,
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    testimonialsContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        gap: spacing.md,
        paddingBottom: spacing.sm,
    },
    testimonialCard: {
        width: SCREEN_WIDTH * 0.75,
    },
    testimonialHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    testimonialAvatar: {
        fontSize: 36,
    },
    testimonialName: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    testimonialDays: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.accent.success,
    },
    testimonialQuote: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        fontStyle: 'italic',
        lineHeight: 22,
    },
    factCard: {
        marginHorizontal: spacing.screen.horizontal,
        marginBottom: spacing.md,
    },
    factHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    factSource: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    factIcon: {
        fontSize: 32,
    },
    factName: {
        fontSize: 14,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    factHandle: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    factText: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.primary,
        lineHeight: 23,
    },
    factFooter: {
        marginTop: spacing.md,
    },
    factLikes: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.screen.horizontal,
        paddingBottom: spacing.xl,
        paddingTop: spacing.md,
        backgroundColor: 'rgba(255,250,245,0.95)',
    },
    continueButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.coralOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 5,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
