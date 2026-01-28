/**
 * FeatureShowcaseScreen
 * 
 * Swipeable carousel showing key app features with phone mockups.
 * Shows what users can expect from the app before they personalize.
 * Each page swipes as a whole unit including the header.
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    Image,
    ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FeatureShowcaseScreenProps = {
    navigation: NativeStackNavigationProp<any, 'FeatureShowcase'>;
};

interface Feature {
    id: string;
    emoji: string;
    title: string;
    description: string;
    image: ImageSourcePropType;
    highlight: string;
}

const FEATURES: Feature[] = [
    {
        id: '1',
        emoji: '📊',
        title: 'Track Your Progress',
        description: 'Watch your streak grow day by day with beautiful visualizations',
        image: require('../../../assets/images/mockups/feature_track.png'),
        highlight: 'Visual streak counter',
    },
    {
        id: '2',
        emoji: '🧬',
        title: 'Science-Based Plans',
        description: 'Choose a personalized plan designed by habit scientists',
        image: require('../../../assets/images/mockups/feature_plan.png'),
        highlight: '3 proven approaches',
    },
    {
        id: '3',
        emoji: '🆘',
        title: 'Craving Support',
        description: 'Get instant help when cravings hit with proven techniques',
        image: require('../../../assets/images/mockups/feature_cravings.png'),
        highlight: '15-second relief',
    },
    {
        id: '4',
        emoji: '📖',
        title: 'Learn & Grow',
        description: 'Understand the science behind sugar addiction',
        image: require('../../../assets/images/mockups/feature_learn.png'),
        highlight: 'Daily education',
    },
];

export default function FeatureShowcaseScreen({ navigation }: FeatureShowcaseScreenProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleContinue = () => {
        if (currentIndex < FEATURES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            navigation.navigate('SuccessStories');
        }
    };

    const handleSkip = () => {
        navigation.navigate('SuccessStories');
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const renderFeature = ({ item, index }: { item: Feature; index: number }) => (
        <View style={styles.fullPage}>
            {/* Header - included in each slide */}
            <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>How It Works</Text>
                    <TouchableOpacity onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Main Content */}
            <View style={styles.contentArea}>
                {/* Phone Mockup Container with Glow */}
                <View style={styles.phoneGlowContainer}>
                    <View style={styles.phoneFrame}>
                        {/* Metal Edge/Border */}
                        <View style={styles.phoneBorderInner}>
                            <View style={styles.phoneNotch} />
                            <View style={styles.phoneScreen}>
                                <Image
                                    source={item.image}
                                    style={styles.screenImage}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.phoneHomeIndicator} />
                        </View>
                    </View>
                </View>

                {/* Feature Info */}
                <View style={styles.featureInfo}>
                    <Text style={styles.featureEmoji}>{item.emoji}</Text>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureDescription}>{item.description}</Text>
                </View>
            </View>

            {/* Bottom Section */}
            <SafeAreaView edges={['bottom']} style={styles.safeAreaBottom}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {FEATURES.map((_, dotIndex) => (
                        <View
                            key={dotIndex}
                            style={[
                                styles.paginationDot,
                                dotIndex === index && styles.paginationDotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* Designed By Badge */}
                <GlassCard variant="light" padding="md" style={styles.designBadge}>
                    <Text style={styles.designBadgeText}>
                        🔬 Designed by habit scientists
                    </Text>
                </GlassCard>

                {/* Continue Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueButtonText}>
                            {index < FEATURES.length - 1
                                ? 'Next →'
                                : 'Personalize Your Plan →'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );

    return (
        <LooviBackground variant="mixed">
            <FlatList
                ref={flatListRef}
                data={FEATURES}
                renderItem={renderFeature}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                style={styles.flatList}
            />
        </LooviBackground>
    );
}

const styles = StyleSheet.create({
    flatList: {
        flex: 1,
    },
    fullPage: {
        width: SCREEN_WIDTH,
        height: '100%',
        flex: 1,
    },
    safeAreaTop: {
        backgroundColor: 'transparent',
    },
    safeAreaBottom: {
        backgroundColor: 'transparent',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    skipText: {
        fontSize: 15,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    contentArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    phoneGlowContainer: {
        // Soft glow behind the phone (iOS only - no elevation to avoid Android edge artifacts)
        shadowColor: looviColors.coralOrange,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        // No elevation - causes visible edge on Android
    },
    phoneFrame: {
        width: SCREEN_WIDTH * 0.45,
        height: SCREEN_WIDTH * 0.91,
        backgroundColor: '#1E1E1E',
        borderRadius: 32,
        padding: 3,
        // Standard shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    phoneBorderInner: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 2,
        borderColor: '#000',
    },
    phoneNotch: {
        position: 'absolute',
        top: 8,
        alignSelf: 'center',
        width: 60,
        height: 18,
        backgroundColor: '#000',
        borderRadius: 9,
        zIndex: 10,
    },
    phoneScreen: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 26,
        overflow: 'hidden',
    },
    screenImage: {
        width: '100%',
        height: '100%',
    },
    phoneHomeIndicator: {
        position: 'absolute',
        bottom: 6,
        alignSelf: 'center',
        width: '35%',
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 2,
        zIndex: 10,
    },
    featureInfo: {
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
        marginTop: spacing.xl,
    },
    featureEmoji: {
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    featureTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    featureDescription: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.md,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: spacing.lg,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    paginationDotActive: {
        width: 24,
        backgroundColor: looviColors.accent.primary,
    },
    designBadge: {
        alignSelf: 'center',
        marginBottom: spacing.xl,
    },
    designBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.secondary,
        textAlign: 'center',
    },
    footer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingBottom: spacing.lg,
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
