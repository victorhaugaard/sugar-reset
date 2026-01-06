/**
 * SocialScreen
 *
 * Community features with tabs:
 * - Community: Public forum for support and sharing
 * - Inner Circle: Private friends and accountability
 * - Leaderboard: Top scores and consistency
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { SwipeableTabView } from '../components/SwipeableTabView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'community' | 'circle' | 'leaderboard';

// Mock community posts (QUITTR-style)
const communityPosts = [
    {
        id: '1',
        author: 'Emma R.',
        timeAgo: '2 hours ago',
        title: 'One Week Sugar-Free!',
        content: 'Finally hit my first week milestone! The cravings are getting easier. For anyone struggling, drinking herbal tea really helps when I want something sweet.',
        upvotes: 24,
        comments: 8,
        tags: ['milestone', 'tips'],
    },
    {
        id: '2',
        author: 'Sarah M.',
        timeAgo: '5 hours ago',
        title: 'Struggling with hormone-related cravings',
        content: 'Anyone else notice intense sugar cravings during certain times of the month? I\'m doing great most of the time but PMS hits differently. Looking for advice.',
        upvotes: 18,
        comments: 12,
        tags: ['hormones', 'advice-needed'],
    },
    {
        id: '3',
        author: 'Anonymous',
        timeAgo: '1 day ago',
        title: 'Relapsed after 21 days',
        content: 'Had a really bad day and gave in. Feeling disappointed but trying not to be too hard on myself. Just needed to share with people who understand.',
        upvotes: 32,
        comments: 15,
        tags: ['support', 'relapse'],
    },
];

// Mock friends/inner circle
const friends = [
    { id: '1', name: 'Jessica T.', healthScore: 87, streak: 14, status: 'online', avatar: 'J', color: looviColors.accent.primary },
    { id: '2', name: 'Maria K.', healthScore: 92, streak: 21, status: 'offline', avatar: 'M', color: looviColors.skyBlue },
    { id: '3', name: 'Rachel W.', healthScore: 78, streak: 7, status: 'online', avatar: 'R', color: looviColors.accent.success },
];

// Mock leaderboard
const leaderboardData = [
    { rank: 1, name: 'Alexandra M.', score: 95, streak: 45, badge: '🏆' },
    { rank: 2, name: 'Victoria L.', score: 93, streak: 38, badge: '🥈' },
    { rank: 3, name: 'Jennifer K.', score: 91, streak: 42, badge: '🥉' },
    { rank: 4, name: 'Michelle R.', score: 89, streak: 29, badge: '' },
    { rank: 5, name: 'Lisa T.', score: 87, streak: 34, badge: '' },
];

export default function SocialScreen() {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState<Tab>('community');
    const [sortFilter, setSortFilter] = useState<'new' | 'hot' | 'top'>('hot');

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const renderCommunityTab = () => (
        <View style={styles.tabContent}>
            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                {(['new', 'hot', 'top'] as const).map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterTab, sortFilter === filter && styles.filterTabActive]}
                        onPress={() => setSortFilter(filter)}
                    >
                        <Text style={[styles.filterText, sortFilter === filter && styles.filterTextActive]}>
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Post List */}
            {communityPosts.map((post) => (
                <TouchableOpacity key={post.id} activeOpacity={0.8}>
                    <GlassCard variant="light" padding="md" style={styles.postCard}>
                        {/* Post Header */}
                        <View style={styles.postHeader}>
                            <View style={styles.authorInfo}>
                                <View style={[styles.authorAvatar, { backgroundColor: looviColors.accent.primary }]}>
                                    <Text style={styles.authorInitial}>{post.author[0]}</Text>
                                </View>
                                <View>
                                    <Text style={styles.authorName}>{post.author}</Text>
                                    <Text style={styles.postTime}>{post.timeAgo}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.moreButton}>
                                <Ionicons name="ellipsis-horizontal" size={18} color={looviColors.text.tertiary} />
                            </TouchableOpacity>
                        </View>

                        {/* Post Content */}
                        <Text style={styles.postTitle}>{post.title}</Text>
                        <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>

                        {/* Tags */}
                        <View style={styles.tagsRow}>
                            {post.tags.map((tag, idx) => (
                                <View key={idx} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Post Actions */}
                        <View style={styles.postActions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="arrow-up-circle-outline" size={20} color={looviColors.accent.primary} />
                                <Text style={styles.actionText}>{post.upvotes}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="chatbubble-outline" size={18} color={looviColors.text.tertiary} />
                                <Text style={styles.actionText}>{post.comments}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="share-social-outline" size={18} color={looviColors.text.tertiary} />
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </TouchableOpacity>
            ))}

            {/* New Post Button */}
            <TouchableOpacity style={styles.newPostButton} activeOpacity={0.9}>
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.newPostText}>Share Your Journey</Text>
            </TouchableOpacity>
        </View>
    );

    const renderInnerCircleTab = () => (
        <View style={styles.tabContent}>
            {/* Friends List */}
            <View style={styles.sectionHeader}>
                <Ionicons name="people" size={18} color={looviColors.text.primary} />
                <Text style={styles.sectionTitle}>My Inner Circle ({friends.length})</Text>
            </View>

            {friends.map((friend) => (
                <TouchableOpacity key={friend.id} activeOpacity={0.8}>
                    <GlassCard variant="light" padding="md" style={styles.friendCard}>
                        <View style={styles.friendRow}>
                            <View style={[styles.friendAvatar, { backgroundColor: friend.color }]}>
                                <Text style={styles.friendInitial}>{friend.avatar}</Text>
                                {friend.status === 'online' && <View style={styles.onlineIndicator} />}
                            </View>
                            <View style={styles.friendInfo}>
                                <Text style={styles.friendName}>{friend.name}</Text>
                                <View style={styles.friendStats}>
                                    <View style={styles.friendStat}>
                                        <Ionicons name="heart" size={12} color={looviColors.accent.primary} />
                                        <Text style={styles.friendStatText}>Score: {friend.healthScore}</Text>
                                    </View>
                                    <View style={styles.friendStat}>
                                        <Ionicons name="flame" size={12} color={looviColors.accent.warning} />
                                        <Text style={styles.friendStatText}>{friend.streak} days</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.chatButton}>
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color={looviColors.accent.primary} />
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </TouchableOpacity>
            ))}

            {/* Add Friends CTA */}
            <TouchableOpacity style={styles.addFriendButton} activeOpacity={0.9}>
                <Ionicons name="person-add" size={20} color={looviColors.accent.primary} />
                <Text style={styles.addFriendText}>Find Accountability Partners</Text>
            </TouchableOpacity>

            {/* Friend Search */}
            <GlassCard variant="light" padding="md" style={styles.searchCard}>
                <Text style={styles.searchTitle}>Search by Username</Text>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={looviColors.text.muted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter username..."
                        placeholderTextColor={looviColors.text.muted}
                    />
                </View>
            </GlassCard>
        </View>
    );

    const renderLeaderboardTab = () => (
        <View style={styles.tabContent}>
            {/* Leaderboard Type Selector */}
            <View style={styles.leaderboardHeader}>
                <Text style={styles.leaderboardTitle}>Top Women This Week</Text>
                <TouchableOpacity style={styles.timeFilter}>
                    <Text style={styles.timeFilterText}>This Week</Text>
                    <Ionicons name="chevron-down" size={16} color={looviColors.text.primary} />
                </TouchableOpacity>
            </View>

            {/* Leaderboard List */}
            {leaderboardData.map((entry) => (
                <GlassCard key={entry.rank} variant="light" padding="md" style={styles.leaderboardCard}>
                    <View style={styles.leaderboardRow}>
                        <View style={styles.rankBadge}>
                            {entry.badge ? (
                                <Text style={styles.rankBadgeEmoji}>{entry.badge}</Text>
                            ) : (
                                <Text style={styles.rankNumber}>{entry.rank}</Text>
                            )}
                        </View>
                        <View style={styles.leaderboardInfo}>
                            <Text style={styles.leaderboardName}>{entry.name}</Text>
                            <View style={styles.leaderboardStats}>
                                <View style={styles.leaderboardStat}>
                                    <Ionicons name="heart" size={12} color={looviColors.accent.primary} />
                                    <Text style={styles.leaderboardStatText}>{entry.score}</Text>
                                </View>
                                <View style={styles.leaderboardStat}>
                                    <Ionicons name="flame" size={12} color={looviColors.accent.warning} />
                                    <Text style={styles.leaderboardStatText}>{entry.streak}d</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.followButton}>
                            <Text style={styles.followButtonText}>Follow</Text>
                        </TouchableOpacity>
                    </View>
                </GlassCard>
            ))}

            {/* Your Rank */}
            <GlassCard variant="light" padding="md" style={[styles.leaderboardCard, styles.yourRankCard]}>
                <View style={styles.yourRankHeader}>
                    <Ionicons name="trophy" size={20} color={looviColors.accent.primary} />
                    <Text style={styles.yourRankTitle}>Your Rank</Text>
                </View>
                <View style={styles.leaderboardRow}>
                    <View style={styles.rankBadge}>
                        <Text style={styles.rankNumber}>47</Text>
                    </View>
                    <View style={styles.leaderboardInfo}>
                        <Text style={styles.leaderboardName}>You</Text>
                        <View style={styles.leaderboardStats}>
                            <View style={styles.leaderboardStat}>
                                <Ionicons name="heart" size={12} color={looviColors.accent.primary} />
                                <Text style={styles.leaderboardStatText}>72</Text>
                            </View>
                            <View style={styles.leaderboardStat}>
                                <Ionicons name="flame" size={12} color={looviColors.accent.warning} />
                                <Text style={styles.leaderboardStatText}>5d</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.rankBadgeInfo}>
                        <Text style={styles.rankBadgeInfoText}>Keep going!</Text>
                    </View>
                </View>
            </GlassCard>
        </View>
    );

    return (
        <SwipeableTabView currentTab="Social">
            <LooviBackground variant="coralTop">
                <SafeAreaView style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Community</Text>
                            <Text style={styles.subtitle}>Support each other's journey</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={handleProfilePress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="person" size={22} color={looviColors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Tab Selector */}
                    <View style={styles.tabSelector}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'community' && styles.tabActive]}
                            onPress={() => setActiveTab('community')}
                        >
                            <Ionicons
                                name="chatbubbles"
                                size={20}
                                color={activeTab === 'community' ? looviColors.accent.primary : looviColors.text.muted}
                            />
                            <Text style={[styles.tabText, activeTab === 'community' && styles.tabTextActive]}>
                                Forum
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'circle' && styles.tabActive]}
                            onPress={() => setActiveTab('circle')}
                        >
                            <Ionicons
                                name="people"
                                size={20}
                                color={activeTab === 'circle' ? looviColors.accent.primary : looviColors.text.muted}
                            />
                            <Text style={[styles.tabText, activeTab === 'circle' && styles.tabTextActive]}>
                                Friends
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
                            onPress={() => setActiveTab('leaderboard')}
                        >
                            <Ionicons
                                name="trophy"
                                size={20}
                                color={activeTab === 'leaderboard' ? looviColors.accent.primary : looviColors.text.muted}
                            />
                            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
                                Leaders
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Content */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {activeTab === 'community' && renderCommunityTab()}
                        {activeTab === 'circle' && renderInnerCircleTab()}
                        {activeTab === 'leaderboard' && renderLeaderboardTab()}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
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
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
    },
    // Tab Selector
    tabSelector: {
        flexDirection: 'row',
        paddingHorizontal: spacing.screen.horizontal,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        gap: spacing.sm,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    tabActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.muted,
    },
    tabTextActive: {
        color: looviColors.accent.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingBottom: 100,
    },
    tabContent: {
        flex: 1,
    },
    // Community Tab - Filter
    filterRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    filterTab: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    filterTabActive: {
        backgroundColor: looviColors.accent.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.tertiary,
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    // Post Card
    postCard: {
        marginBottom: spacing.md,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    authorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorInitial: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    postTime: {
        fontSize: 11,
        fontWeight: '400',
        color: looviColors.text.tertiary,
    },
    moreButton: {
        padding: spacing.xs,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    postContent: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    tag: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        backgroundColor: `${looviColors.accent.primary}15`,
        borderRadius: borderRadius.md,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
        color: looviColors.accent.primary,
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.tertiary,
    },
    newPostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: looviColors.accent.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        marginTop: spacing.md,
    },
    newPostText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Inner Circle Tab
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    friendCard: {
        marginBottom: spacing.sm,
    },
    friendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    friendAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    friendInitial: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: looviColors.accent.success,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    friendInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    friendName: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: 4,
    },
    friendStats: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    friendStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    friendStatText: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    chatButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${looviColors.accent.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addFriendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        borderColor: looviColors.accent.primary,
        borderStyle: 'dashed',
        marginVertical: spacing.md,
    },
    addFriendText: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.accent.primary,
    },
    searchCard: {
        marginTop: spacing.md,
    },
    searchTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: looviColors.text.primary,
    },
    // Leaderboard Tab
    leaderboardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    leaderboardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    timeFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: borderRadius.md,
    },
    timeFilterText: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    leaderboardCard: {
        marginBottom: spacing.sm,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${looviColors.accent.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankBadgeEmoji: {
        fontSize: 20,
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.accent.primary,
    },
    leaderboardInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    leaderboardName: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: 4,
    },
    leaderboardStats: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    leaderboardStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    leaderboardStatText: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.tertiary,
    },
    followButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.lg,
        backgroundColor: looviColors.accent.primary,
    },
    followButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    yourRankCard: {
        backgroundColor: `${looviColors.accent.primary}10`,
        borderWidth: 2,
        borderColor: looviColors.accent.primary,
        marginTop: spacing.lg,
    },
    yourRankHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    yourRankTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: looviColors.accent.primary,
    },
    rankBadgeInfo: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        backgroundColor: looviColors.accent.success,
        borderRadius: borderRadius.md,
    },
    rankBadgeInfoText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
