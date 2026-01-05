/**
 * PanicScreen (Craving Support)
 * 
 * Redesigned SOS/Cravings support screen with:
 * - Calming hero message
 * - 3 floating action buttons: Distract, Alternatives, Contact Circle
 * - Distractions section
 * - Alternatives section (Cheatmeal, Healthy, Superfood)
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';

// Calming messages that rotate
const calmingMessages = [
    { title: "Don't give up now!", subtitle: "We have lots of options to get you through this craving" },
    { title: "You're stronger than this!", subtitle: "This craving will pass in just a few minutes" },
    { title: "Take a deep breath", subtitle: "Let's find something to help you through this moment" },
    { title: "You've got this!", subtitle: "Every craving you beat makes you stronger" },
];

// Distraction options
const distractions = [
    {
        id: 'breathing',
        icon: 'wind' as const,
        title: 'Breathing Exercise',
        description: 'Calm your mind with guided breathing',
        screen: 'BreathingExercise',
        color: looviColors.skyBlue,
    },
    {
        id: 'walk',
        icon: 'navigation' as const,
        title: 'Quick 5-Minute Walk',
        description: 'Movement reduces cravings by 50%',
        action: 'timer',
        color: looviColors.accent.success,
    },
    {
        id: 'water',
        icon: 'droplet' as const,
        title: 'Drink Water Challenge',
        description: 'Finish a full glass, then reassess',
        action: 'challenge',
        color: looviColors.accent.secondary,
    },
];

// Food alternatives
const alternatives = [
    {
        id: 'cheatmeal',
        icon: 'star' as const,
        category: 'Cheatmeal',
        title: 'Dark Chocolate (85%+)',
        description: 'A healthier treat that still feels indulgent',
        color: '#8B5CF6',
    },
    {
        id: 'healthy',
        icon: 'heart' as const,
        category: 'Healthy Alternative',
        title: 'Apple with Almond Butter',
        description: 'Sweet, satisfying, and nutritious',
        color: looviColors.accent.success,
    },
    {
        id: 'superfood',
        icon: 'zap' as const,
        category: 'Superfood',
        title: 'Mixed Berries',
        description: 'Antioxidant-rich and naturally sweet',
        color: looviColors.accent.primary,
    },
];

type ActiveSection = 'none' | 'distractions' | 'alternatives';

export default function PanicScreen() {
    const navigation = useNavigation<any>();
    const [messageIndex, setMessageIndex] = useState(0);
    const [activeSection, setActiveSection] = useState<ActiveSection>('none');
    const fadeAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
        // Rotate messages every 6 seconds
        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
            setTimeout(() => {
                setMessageIndex((prev) => (prev + 1) % calmingMessages.length);
            }, 300);
        }, 6000);
        return () => clearInterval(interval);
    }, [fadeAnim]);

    const handleDistractPress = () => {
        setActiveSection(activeSection === 'distractions' ? 'none' : 'distractions');
    };

    const handleAlternativesPress = () => {
        setActiveSection(activeSection === 'alternatives' ? 'none' : 'alternatives');
    };

    const handleContactPress = () => {
        navigation.navigate('Social');
    };

    const handleDistractionSelect = (distraction: typeof distractions[0]) => {
        if (distraction.screen) {
            navigation.navigate(distraction.screen);
        } else if (distraction.action === 'timer') {
            Alert.alert(
                'Quick Walk',
                'Get up and take a quick walk around. Movement releases dopamine and reduces cravings. Set a 5-minute timer on your phone!',
                [{ text: 'Start Walking!' }]
            );
        } else if (distraction.action === 'challenge') {
            Alert.alert(
                'Water Challenge',
                'Drink a full glass of water right now. Thirst is often mistaken for sugar cravings. Once you finish, take a moment to see how you feel.',
                [{ text: 'Challenge Accepted!' }]
            );
        }
    };

    const currentMessage = calmingMessages[messageIndex];

    return (
        <LooviBackground variant="blueBottom">
            <SafeAreaView style={styles.container} edges={['top']}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
                        <Text style={styles.heroTitle}>{currentMessage.title}</Text>
                        <Text style={styles.heroSubtitle}>{currentMessage.subtitle}</Text>
                    </Animated.View>

                    {/* Three Floating Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[
                                styles.floatingButton,
                                { backgroundColor: looviColors.accent.warning },
                                activeSection === 'distractions' && styles.floatingButtonActive
                            ]}
                            onPress={handleDistractPress}
                            activeOpacity={0.8}
                        >
                            <View style={styles.floatingIconContainer}>
                                <Feather name="target" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.floatingLabel}>Distract me</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.floatingButton,
                                { backgroundColor: looviColors.accent.success },
                                activeSection === 'alternatives' && styles.floatingButtonActive
                            ]}
                            onPress={handleAlternativesPress}
                            activeOpacity={0.8}
                        >
                            <View style={styles.floatingIconContainer}>
                                <Feather name="refresh-cw" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.floatingLabel}>Alternatives</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.floatingButton,
                                { backgroundColor: looviColors.skyBlue }
                            ]}
                            onPress={handleContactPress}
                            activeOpacity={0.8}
                        >
                            <View style={styles.floatingIconContainer}>
                                <Feather name="users" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.floatingLabel}>My Circle</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Distractions Section */}
                    {activeSection === 'distractions' && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Choose a Distraction</Text>
                            <Text style={styles.sectionSubtitle}>
                                Shift your focus for just a few minutes
                            </Text>
                            {distractions.map((distraction) => (
                                <TouchableOpacity
                                    key={distraction.id}
                                    onPress={() => handleDistractionSelect(distraction)}
                                    activeOpacity={0.7}
                                >
                                    <GlassCard variant="light" padding="md" style={styles.optionCard}>
                                        <View style={styles.optionRow}>
                                            <View style={[styles.optionIconContainer, { backgroundColor: `${distraction.color}20` }]}>
                                                <Feather name={distraction.icon} size={22} color={distraction.color} />
                                            </View>
                                            <View style={styles.optionContent}>
                                                <Text style={styles.optionTitle}>{distraction.title}</Text>
                                                <Text style={styles.optionDescription}>{distraction.description}</Text>
                                            </View>
                                            <Feather name="chevron-right" size={20} color={looviColors.text.muted} />
                                        </View>
                                    </GlassCard>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Alternatives Section */}
                    {activeSection === 'alternatives' && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Healthy Alternatives</Text>
                            <Text style={styles.sectionSubtitle}>
                                Satisfy your craving the smart way
                            </Text>
                            {alternatives.map((alt) => (
                                <GlassCard
                                    key={alt.id}
                                    variant="light"
                                    padding="md"
                                    style={[styles.alternativeCard, { borderLeftColor: alt.color }]}
                                >
                                    <View style={styles.alternativeHeader}>
                                        <View style={[styles.categoryBadge, { backgroundColor: `${alt.color}15` }]}>
                                            <Feather name={alt.icon} size={12} color={alt.color} style={{ marginRight: 4 }} />
                                            <Text style={[styles.alternativeCategory, { color: alt.color }]}>
                                                {alt.category}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.optionRow}>
                                        <View style={[styles.altIconContainer, { backgroundColor: `${alt.color}15` }]}>
                                            <Feather name={alt.icon} size={24} color={alt.color} />
                                        </View>
                                        <View style={styles.optionContent}>
                                            <Text style={styles.optionTitle}>{alt.title}</Text>
                                            <Text style={styles.optionDescription}>{alt.description}</Text>
                                        </View>
                                    </View>
                                </GlassCard>
                            ))}
                        </View>
                    )}

                    {/* Quick Access Buttons */}
                    <View style={styles.quickAccess}>
                        <TouchableOpacity
                            style={styles.quickButton}
                            onPress={() => navigation.navigate('BreathingExercise')}
                            activeOpacity={0.8}
                        >
                            <GlassCard variant="light" padding="md" style={styles.quickCard}>
                                <View style={[styles.quickIconBg, { backgroundColor: `${looviColors.skyBlue}20` }]}>
                                    <Feather name="wind" size={24} color={looviColors.skyBlue} />
                                </View>
                                <Text style={styles.quickText}>Breathe</Text>
                            </GlassCard>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickButton}
                            onPress={() => navigation.navigate('Reasons')}
                            activeOpacity={0.8}
                        >
                            <GlassCard variant="light" padding="md" style={styles.quickCard}>
                                <View style={[styles.quickIconBg, { backgroundColor: `${looviColors.accent.primary}20` }]}>
                                    <Feather name="heart" size={24} color={looviColors.accent.primary} />
                                </View>
                                <Text style={styles.quickText}>My Why</Text>
                            </GlassCard>
                        </TouchableOpacity>
                    </View>

                    {/* Encouragement Footer */}
                    <View style={styles.footer}>
                        <Feather name="award" size={16} color={looviColors.text.tertiary} style={{ marginRight: 8 }} />
                        <Text style={styles.footerText}>
                            Every craving you overcome makes the next one easier
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LooviBackground>
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
        paddingBottom: 100,
    },
    // Hero Section
    heroSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    heroSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    // Floating Action Buttons
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    floatingButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    floatingButtonActive: {
        transform: [{ scale: 1.05 }],
        shadowOpacity: 0.4,
    },
    floatingIconContainer: {
        marginBottom: 6,
    },
    floatingLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    // Section Container
    sectionContainer: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginBottom: spacing.lg,
    },
    // Option Cards
    optionCard: {
        marginBottom: spacing.sm,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    optionDescription: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginTop: 2,
    },
    // Alternative Cards
    alternativeCard: {
        marginBottom: spacing.sm,
        borderLeftWidth: 4,
    },
    alternativeHeader: {
        marginBottom: spacing.sm,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    alternativeCategory: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    altIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    // Quick Access
    quickAccess: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    quickButton: {
        flex: 1,
    },
    quickCard: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    quickIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickText: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginTop: spacing.sm,
    },
    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textAlign: 'center',
    },
});
