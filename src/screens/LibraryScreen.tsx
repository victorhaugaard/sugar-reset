/**
 * LibraryScreen
 * 
 * Educational content and resources with sky theme.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { SwipeableTabView } from '../components/SwipeableTabView';

interface Article {
    id: string;
    emoji: string;
    title: string;
    readTime: string;
    category: string;
    url: string;
}

interface Video {
    id: string;
    emoji: string;
    title: string;
    duration: string;
    url: string;
}

const articles: Article[] = [
    {
        id: '1',
        emoji: '🧠',
        title: 'How Sugar Affects Your Brain',
        readTime: '5 min',
        category: 'Science',
        url: 'https://www.healthline.com/nutrition/too-much-sugar'
    },
    {
        id: '2',
        emoji: '💪',
        title: 'The Science of Habit Formation',
        readTime: '8 min',
        category: 'Habits',
        url: 'https://jamesclear.com/habit-formation'
    },
    {
        id: '3',
        emoji: '🍎',
        title: 'Natural Sweetener Guide',
        readTime: '6 min',
        category: 'Nutrition',
        url: 'https://www.healthline.com/nutrition/natural-sugar-substitutes'
    },
    {
        id: '4',
        emoji: '😴',
        title: 'Sugar and Sleep Quality',
        readTime: '4 min',
        category: 'Health',
        url: 'https://www.sleepfoundation.org/nutrition/sugar-and-sleep'
    },
    {
        id: '5',
        emoji: '⚡',
        title: 'Hidden Sugars in Food',
        readTime: '5 min',
        category: 'Nutrition',
        url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/added-sugars'
    },
];

const videos: Video[] = [
    {
        id: '1',
        emoji: '🎬',
        title: 'That Sugar Film (Trailer)',
        duration: '3 min',
        url: 'https://www.youtube.com/watch?v=6uaWekLrilY'
    },
    {
        id: '2',
        emoji: '🎥',
        title: 'Fed Up Documentary',
        duration: '8 min',
        url: 'https://www.youtube.com/watch?v=aCUbvOwwfWM'
    },
    {
        id: '3',
        emoji: '📹',
        title: 'Sugar: The Bitter Truth',
        duration: '90 min',
        url: 'https://www.youtube.com/watch?v=dBnniua6-oM'
    },
];

const quickTips = [
    '💧 Drink water when cravings hit',
    '🚶 A 5-minute walk reduces cravings by 25%',
    '🍊 Eat protein with every meal',
    '😴 Poor sleep increases sugar cravings',
];

// Utility to extract YouTube video ID from URL
const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
};

// Utility to get YouTube thumbnail URL
const getYouTubeThumbnail = (url: string): string | null => {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

export default function LibraryScreen() {
    const [activeTab, setActiveTab] = useState<'articles' | 'videos'>('articles');

    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        }
    };

    return (
        <SwipeableTabView currentTab="Panic">
            <LooviBackground variant="mixed">
                <SafeAreaView style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Learn</Text>
                            <Text style={styles.subtitle}>Science-backed knowledge</Text>
                        </View>

                        {/* Quick Tips */}
                        <GlassCard variant="light" padding="md" style={styles.tipsCard}>
                            <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.tipsRow}>
                                    {quickTips.map((tip, index) => (
                                        <View key={index} style={styles.tipChip}>
                                            <Text style={styles.tipText}>{tip}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </GlassCard>

                        {/* Tabs */}
                        <View style={styles.tabsContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'articles' && styles.tabActive]}
                                onPress={() => setActiveTab('articles')}
                            >
                                <Text style={[styles.tabText, activeTab === 'articles' && styles.tabTextActive]}>
                                    📚 Articles
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'videos' && styles.tabActive]}
                                onPress={() => setActiveTab('videos')}
                            >
                                <Text style={[styles.tabText, activeTab === 'videos' && styles.tabTextActive]}>
                                    🎬 Videos
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        {activeTab === 'articles' ? (
                            <View style={styles.contentList}>
                                {articles.map((article) => (
                                    <TouchableOpacity
                                        key={article.id}
                                        activeOpacity={0.7}
                                        onPress={() => openLink(article.url)}
                                    >
                                        <GlassCard variant="light" padding="md" style={styles.contentCard}>
                                            <View style={styles.contentRow}>
                                                <Text style={styles.contentEmoji}>{article.emoji}</Text>
                                                <View style={styles.contentInfo}>
                                                    <Text style={styles.contentTitle}>{article.title}</Text>
                                                    <View style={styles.contentMeta}>
                                                        <Text style={styles.contentCategory}>{article.category}</Text>
                                                        <Text style={styles.contentDuration}>{article.readTime} read</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.arrow}>→</Text>
                                            </View>
                                        </GlassCard>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.contentList}>
                                {videos.map((video) => (
                                    <TouchableOpacity
                                        key={video.id}
                                        activeOpacity={0.7}
                                        onPress={() => openLink(video.url)}
                                    >
                                        <GlassCard variant="light" padding="md" style={styles.contentCard}>
                                            <View style={styles.videoCardContent}>
                                                {getYouTubeThumbnail(video.url) ? (
                                                    <View style={styles.thumbnailContainer}>
                                                        <Image
                                                            source={{ uri: getYouTubeThumbnail(video.url)! }}
                                                            style={styles.videoThumbnail}
                                                            resizeMode="cover"
                                                        />
                                                        <View style={styles.playOverlay}>
                                                            <Text style={styles.playIcon}>▶</Text>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <View style={styles.videoThumb}>
                                                        <Text style={styles.playIcon}>▶</Text>
                                                    </View>
                                                )}
                                                <View style={styles.videoInfo}>
                                                    <Text style={styles.contentTitle}>{video.title}</Text>
                                                    <Text style={styles.videoDuration}>{video.duration}</Text>
                                                </View>
                                            </View>
                                        </GlassCard>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* AI Support Teaser */}
                        <GlassCard variant="light" padding="lg" style={styles.aiCard}>
                            <Text style={styles.aiEmoji}>🤖</Text>
                            <Text style={styles.aiTitle}>AI Sugar Coach</Text>
                            <Text style={styles.aiText}>
                                Get personalized advice anytime. Coming soon!
                            </Text>
                        </GlassCard>
                    </ScrollView>
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
        marginBottom: spacing.xl,
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
    tipsCard: {
        marginBottom: spacing.xl,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
    },
    tipsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    tipChip: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    tipText: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: borderRadius.xl,
        padding: 4,
        marginBottom: spacing.lg,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: borderRadius.lg,
    },
    tabActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    tabTextActive: {
        color: looviColors.text.primary,
        fontWeight: '600',
    },
    contentList: {
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    contentCard: {},
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contentEmoji: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    contentInfo: {
        flex: 1,
    },
    contentTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: 2,
    },
    contentMeta: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    contentCategory: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.accent.primary,
    },
    contentDuration: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    arrow: {
        fontSize: 18,
        color: looviColors.text.muted,
    },
    videoThumb: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    playIcon: {
        fontSize: 16,
        color: looviColors.text.primary,
    },
    aiCard: {
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    aiEmoji: {
        fontSize: 40,
        marginBottom: spacing.sm,
    },
    aiTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    aiText: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    videoCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    thumbnailContainer: {
        position: 'relative',
        width: 120,
        height: 68,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoInfo: {
        flex: 1,
    },
    videoDuration: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
});
