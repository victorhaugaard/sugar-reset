/**
 * SocialScreen
 *
 * Community features with tabs:
 * - Community: Public forum for support and sharing (mock for now)
 * - Inner Circle: Private friends and accountability (REAL DATA)
 * - Leaderboard: Top scores and consistency (REAL DATA)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { SwipeableTabView } from '../components/SwipeableTabView';
import { FriendSearchModal } from '../components/FriendSearchModal';
import { FriendRequestCard } from '../components/FriendRequestCard';
import { CommunityStatsWidget } from '../components/CommunityStatsWidget';
import { CreatePostModal } from '../components/CreatePostModal';
import { friendService } from '../services/friendService';
import { postService, Post } from '../services/postService';
import { useAuthContext } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { Friend, FriendRequest, UserStats, User } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'community' | 'circle' | 'leaderboard';

interface FriendWithStats extends Friend {
    healthScore?: number;
    streak?: number;
}

interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    username?: string;
    score: number;
    streak: number;
    badge: string;
}

export default function SocialScreen() {
    const navigation = useNavigation<any>();
    const { user, isAuthenticated } = useAuthContext();
    const { streakData, latestHealthScore } = useUserData();

    const [activeTab, setActiveTab] = useState<Tab>('community');
    const [sortFilter, setSortFilter] = useState<'new' | 'hot' | 'top'>('hot');
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Real data state
    const [posts, setPosts] = useState<Post[]>([]);
    const [friends, setFriends] = useState<FriendWithStats[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [userVotes, setUserVotes] = useState<Map<string, 'up' | 'down'>>(new Map());

    // Load data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && user) {
                loadData();
            }
        }, [isAuthenticated, user])
    );

    const loadData = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            await Promise.all([
                loadPosts(),
                loadFriends(),
                loadFriendRequests(),
                loadLeaderboard(),
            ]);
        } catch (error) {
            console.error('Error loading social data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadPosts = async () => {
        try {
            const fetchedPosts = await postService.getPosts(sortFilter, 20);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    };

    // Reload posts when sort filter changes
    useEffect(() => {
        if (activeTab === 'community') {
            loadPosts();
        }
    }, [sortFilter]);

    const loadFriends = async () => {
        if (!user) return;

        try {
            const friendsList = await friendService.getInnerCircle(user.id);

            // Fetch stats for each friend
            const friendsWithStats = await Promise.all(
                friendsList.map(async (friend) => {
                    const stats = await friendService.getFriendStats(friend.uid);
                    return {
                        ...friend,
                        healthScore: stats?.healthScore || 0,
                        streak: stats?.currentStreak || 0,
                    };
                })
            );

            setFriends(friendsWithStats);
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    };

    const loadFriendRequests = async () => {
        if (!user) return;

        try {
            const requests = await friendService.getIncomingRequests(user.id);
            setFriendRequests(requests);
        } catch (error) {
            console.error('Error loading friend requests:', error);
        }
    };

    const loadLeaderboard = async () => {
        try {
            const stats = await friendService.getLeaderboard(10);
            const userIds = stats.map(s => s.userId);
            const usersMap = await friendService.getUsersByIds(userIds);

            const entries: LeaderboardEntry[] = stats.map((stat, index) => {
                const userInfo = usersMap.get(stat.userId);
                const badge = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

                return {
                    rank: index + 1,
                    userId: stat.userId,
                    name: userInfo?.displayName || userInfo?.username || 'Anonymous',
                    username: userInfo?.username,
                    score: stat.healthScore,
                    streak: stat.currentStreak,
                    badge,
                };
            });

            setLeaderboard(entries);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    };

    const handleAcceptRequest = async (requestId: string) => {
        if (!user) return;

        try {
            await friendService.acceptFriendRequest(requestId, user.id);
            Alert.alert('Success', 'Friend request accepted!');
            await loadData(); // Refresh all data
        } catch (error) {
            console.error('Error accepting request:', error);
            Alert.alert('Error', 'Failed to accept friend request');
        }
    };

    const handleDeclineRequest = async (requestId: string) => {
        if (!user) return;

        try {
            await friendService.declineFriendRequest(requestId, user.id);
            setFriendRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error('Error declining request:', error);
            Alert.alert('Error', 'Failed to decline friend request');
        }
    };

    const handleRemoveFriend = async (friendId: string, friendName: string) => {
        if (!user) return;

        Alert.alert(
            'Remove Friend',
            `Are you sure you want to remove ${friendName} from your Inner Circle?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await friendService.removeFriend(user.id, friendId);
                            setFriends(prev => prev.filter(f => f.uid !== friendId));
                        } catch (error) {
                            console.error('Error removing friend:', error);
                            Alert.alert('Error', 'Failed to remove friend');
                        }
                    },
                },
            ]
        );
    };

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleSearchInline = async () => {
        if (!searchQuery.trim() || searchQuery.length < 2) return;
        setShowSearchModal(true);
    };

    // Calculate user's rank in leaderboard
    const userRank = leaderboard.findIndex(e => e.userId === user?.id) + 1;
    const userScore = latestHealthScore || 0;
    const userStreak = streakData?.currentStreak || 0;

    const renderCommunityTab = () => {
        const handleUpvote = async (postId: string) => {
            if (!user) return;
            try {
                await postService.upvotePost(postId, user.id);
                await loadPosts(); // Refresh to get updated vote count
            } catch (error) {
                console.error('Error upvoting:', error);
            }
        };

        return (
            <View style={styles.tabContent}>
                {/* Community Stats Widget */}
                <CommunityStatsWidget />

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
                {isLoading && posts.length === 0 ? (
                    <ActivityIndicator size="large" color={looviColors.accent.primary} style={styles.loader} />
                ) : posts.length === 0 ? (
                    <GlassCard variant="light" padding="lg" style={styles.emptyCard}>
                        <Ionicons name="chatbubbles-outline" size={48} color={looviColors.text.muted} />
                        <Text style={styles.emptyTitle}>No posts yet</Text>
                        <Text style={styles.emptyText}>
                            Be the first to share your journey with the community!
                        </Text>
                    </GlassCard>
                ) : (
                    posts.map((post: Post) => (
                        <TouchableOpacity key={post.id} activeOpacity={0.8}>
                            <GlassCard variant="light" padding="md" style={styles.postCard}>
                                {/* Post Header */}
                                <View style={styles.postHeader}>
                                    <View style={styles.authorInfo}>
                                        <View style={[styles.authorAvatar, { backgroundColor: looviColors.accent.primary }]}>
                                            <Text style={styles.authorInitial}>{post.authorName[0]?.toUpperCase()}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.authorName}>{post.authorName}</Text>
                                            <Text style={styles.postTime}>{postService.getTimeAgo(post.createdAt)}</Text>
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
                                {post.tags.length > 0 && (
                                    <View style={styles.tagsRow}>
                                        {post.tags.map((tag: string, idx: number) => (
                                            <View key={idx} style={styles.tag}>
                                                <Text style={styles.tagText}>#{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Post Actions */}
                                <View style={styles.postActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleUpvote(post.id)}
                                    >
                                        <Ionicons name="arrow-up-circle-outline" size={20} color={looviColors.accent.primary} />
                                        <Text style={styles.actionText}>{post.upvotes}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Ionicons name="chatbubble-outline" size={18} color={looviColors.text.tertiary} />
                                        <Text style={styles.actionText}>{post.commentCount}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Ionicons name="share-social-outline" size={18} color={looviColors.text.tertiary} />
                                    </TouchableOpacity>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    ))
                )}

                {/* New Post Button */}
                <TouchableOpacity
                    style={styles.newPostButton}
                    activeOpacity={0.9}
                    onPress={() => setShowCreatePostModal(true)}
                >
                    <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.newPostText}>Share Your Journey</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderInnerCircleTab = () => (
        <View style={styles.tabContent}>
            {/* Friend Requests Section */}
            {friendRequests.length > 0 && (
                <View style={styles.requestsSection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="mail" size={18} color={looviColors.accent.primary} />
                        <Text style={styles.sectionTitle}>Friend Requests ({friendRequests.length})</Text>
                    </View>
                    {friendRequests.map((request) => (
                        <FriendRequestCard
                            key={request.id}
                            request={request}
                            onAccept={handleAcceptRequest}
                            onDecline={handleDeclineRequest}
                        />
                    ))}
                </View>
            )}

            {/* Friends List */}
            <View style={styles.sectionHeader}>
                <Ionicons name="people" size={18} color={looviColors.text.primary} />
                <Text style={styles.sectionTitle}>My Inner Circle ({friends.length})</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={looviColors.accent.primary} style={styles.loader} />
            ) : friends.length === 0 ? (
                <GlassCard variant="light" padding="lg" style={styles.emptyCard}>
                    <Ionicons name="people-outline" size={48} color={looviColors.text.muted} />
                    <Text style={styles.emptyTitle}>No friends yet</Text>
                    <Text style={styles.emptyText}>
                        Find accountability partners to support each other on your sugar-free journey!
                    </Text>
                </GlassCard>
            ) : (
                friends.map((friend) => (
                    <TouchableOpacity
                        key={friend.uid}
                        activeOpacity={0.8}
                        onLongPress={() => handleRemoveFriend(friend.uid, friend.displayName)}
                    >
                        <GlassCard variant="light" padding="md" style={styles.friendCard}>
                            <View style={styles.friendRow}>
                                <View style={[styles.friendAvatar, { backgroundColor: looviColors.accent.primary }]}>
                                    <Text style={styles.friendInitial}>
                                        {friend.displayName?.[0]?.toUpperCase() || '?'}
                                    </Text>
                                </View>
                                <View style={styles.friendInfo}>
                                    <Text style={styles.friendName}>{friend.displayName}</Text>
                                    {friend.username && (
                                        <Text style={styles.friendUsername}>@{friend.username}</Text>
                                    )}
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
                ))
            )}

            {/* Add Friends CTA */}
            <TouchableOpacity
                style={styles.addFriendButton}
                activeOpacity={0.9}
                onPress={() => setShowSearchModal(true)}
            >
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
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearchInline}
                        returnKeyType="search"
                        autoCapitalize="none"
                    />
                </View>
            </GlassCard>
        </View>
    );

    const renderLeaderboardTab = () => (
        <View style={styles.tabContent}>
            {/* Leaderboard Type Selector */}
            <View style={styles.leaderboardHeader}>
                <Text style={styles.leaderboardTitle}>Top Users This Week</Text>
                <TouchableOpacity style={styles.timeFilter}>
                    <Text style={styles.timeFilterText}>This Week</Text>
                    <Ionicons name="chevron-down" size={16} color={looviColors.text.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={looviColors.accent.primary} style={styles.loader} />
            ) : leaderboard.length === 0 ? (
                <GlassCard variant="light" padding="lg" style={styles.emptyCard}>
                    <Ionicons name="trophy-outline" size={48} color={looviColors.text.muted} />
                    <Text style={styles.emptyTitle}>No leaderboard data</Text>
                    <Text style={styles.emptyText}>
                        Start tracking your wellness to appear on the leaderboard!
                    </Text>
                </GlassCard>
            ) : (
                <>
                    {/* Leaderboard List */}
                    {leaderboard.map((entry) => (
                        <GlassCard key={entry.userId} variant="light" padding="md" style={styles.leaderboardCard}>
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
                                {entry.userId !== user?.id && (
                                    <TouchableOpacity style={styles.followButton}>
                                        <Text style={styles.followButtonText}>Add</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </GlassCard>
                    ))}
                </>
            )}

            {/* Your Rank */}
            <GlassCard variant="light" padding="md" style={[styles.leaderboardCard, styles.yourRankCard]}>
                <View style={styles.yourRankHeader}>
                    <Ionicons name="trophy" size={20} color={looviColors.accent.primary} />
                    <Text style={styles.yourRankTitle}>Your Rank</Text>
                </View>
                <View style={styles.leaderboardRow}>
                    <View style={styles.rankBadge}>
                        <Text style={styles.rankNumber}>{userRank || '—'}</Text>
                    </View>
                    <View style={styles.leaderboardInfo}>
                        <Text style={styles.leaderboardName}>You</Text>
                        <View style={styles.leaderboardStats}>
                            <View style={styles.leaderboardStat}>
                                <Ionicons name="heart" size={12} color={looviColors.accent.primary} />
                                <Text style={styles.leaderboardStatText}>{userScore}</Text>
                            </View>
                            <View style={styles.leaderboardStat}>
                                <Ionicons name="flame" size={12} color={looviColors.accent.warning} />
                                <Text style={styles.leaderboardStatText}>{userStreak}d</Text>
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
                            {friendRequests.length > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{friendRequests.length}</Text>
                                </View>
                            )}
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
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor={looviColors.accent.primary}
                            />
                        }
                    >
                        {activeTab === 'community' && renderCommunityTab()}
                        {activeTab === 'circle' && renderInnerCircleTab()}
                        {activeTab === 'leaderboard' && renderLeaderboardTab()}
                    </ScrollView>

                    {/* Friend Search Modal */}
                    <FriendSearchModal
                        visible={showSearchModal}
                        onClose={() => setShowSearchModal(false)}
                        onRequestSent={loadData}
                    />

                    {/* Create Post Modal */}
                    <CreatePostModal
                        visible={showCreatePostModal}
                        onClose={() => setShowCreatePostModal(false)}
                        onPostCreated={loadPosts}
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
    badge: {
        backgroundColor: looviColors.accent.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
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
    loader: {
        marginTop: spacing.xl,
    },
    // Empty State
    emptyCard: {
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginTop: spacing.md,
    },
    emptyText: {
        fontSize: 14,
        color: looviColors.text.tertiary,
        textAlign: 'center',
        marginTop: spacing.sm,
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
    requestsSection: {
        marginBottom: spacing.lg,
    },
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
    friendInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    friendName: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: 2,
    },
    friendUsername: {
        fontSize: 12,
        color: looviColors.text.tertiary,
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
