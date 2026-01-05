/**
 * SocialScreen
 * 
 * Community and social features:
 * - Community performance metrics (mock data)
 * - Inner circle (friends/accountability)
 * - Content spotlight
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import { SwipeableTabView } from '../components/SwipeableTabView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock community data
const communityStats = {
    totalUsers: 12847,
    feeling: { great: 42, good: 35, okay: 15, struggling: 8 },
    goalAchievement: 68,
    averageStreak: 12,
};

// Mock inner circle members
const circleMembers = [
    { id: '1', name: 'Alex M.', streak: 14, initial: 'A', color: looviColors.accent.primary },
    { id: '2', name: 'Sarah K.', streak: 8, initial: 'S', color: looviColors.skyBlue },
    { id: '3', name: 'Mike R.', streak: 21, initial: 'M', color: looviColors.accent.success },
];

// Simple Pie Chart Component
function MiniPieChart({ data, size = 80 }: { data: { value: number; color: string }[]; size?: number }) {
    const radius = size / 2 - 5;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    let currentAngle = -90; // Start from top

    return (
        <Svg width={size} height={size}>
            <G x={size / 2} y={size / 2}>
                {data.map((segment, index) => {
                    const percentage = segment.value / total;
                    const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
                    const rotation = currentAngle;
                    currentAngle += percentage * 360;

                    return (
                        <Circle
                            key={index}
                            r={radius}
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth={10}
                            strokeDasharray={strokeDasharray}
                            transform={`rotate(${rotation})`}
                        />
                    );
                })}
            </G>
        </Svg>
    );
}

export default function SocialScreen() {
    const navigation = useNavigation<any>();

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleInvite = () => {
        // TODO: Implement invite functionality
    };

    return (
        <SwipeableTabView currentTab="Social">
            <LooviBackground variant="coralTop">
                <SafeAreaView style={styles.container}>
                    {/* Header with Profile Icon */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Community</Text>
                            <Text style={styles.subtitle}>Connect & support each other</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={handleProfilePress}
                            activeOpacity={0.7}
                        >
                            <Feather name="user" size={22} color={looviColors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Community Performance Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Feather name="trending-up" size={18} color={looviColors.text.primary} />
                                <Text style={styles.sectionTitle}>Community Performance</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>
                                See how {communityStats.totalUsers.toLocaleString()} members are doing
                            </Text>

                            {/* Stats Grid */}
                            <View style={styles.statsGrid}>
                                {/* Feeling Distribution */}
                                <GlassCard variant="light" padding="md" style={styles.statCard}>
                                    <Text style={styles.statLabel}>How people feel</Text>
                                    <View style={styles.pieContainer}>
                                        <MiniPieChart
                                            data={[
                                                { value: communityStats.feeling.great, color: looviColors.accent.success },
                                                { value: communityStats.feeling.good, color: looviColors.skyBlue },
                                                { value: communityStats.feeling.okay, color: looviColors.accent.warning },
                                                { value: communityStats.feeling.struggling, color: '#EF4444' },
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.legendRow}>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: looviColors.accent.success }]} />
                                            <Text style={styles.legendText}>{communityStats.feeling.great}% great</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: looviColors.skyBlue }]} />
                                            <Text style={styles.legendText}>{communityStats.feeling.good}% good</Text>
                                        </View>
                                    </View>
                                </GlassCard>

                                {/* Goal Achievement */}
                                <GlassCard variant="light" padding="md" style={styles.statCard}>
                                    <Text style={styles.statLabel}>Achieved goals</Text>
                                    <Text style={styles.bigStat}>{communityStats.goalAchievement}%</Text>
                                    <Text style={styles.statHint}>of daily goals met</Text>
                                </GlassCard>

                                {/* Average Streak */}
                                <GlassCard variant="light" padding="md" style={styles.statCard}>
                                    <Text style={styles.statLabel}>Average streak</Text>
                                    <Text style={styles.bigStat}>{communityStats.averageStreak}</Text>
                                    <Text style={styles.statHint}>days community avg</Text>
                                </GlassCard>
                            </View>
                        </View>

                        {/* Inner Circle Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Feather name="users" size={18} color={looviColors.text.primary} />
                                <Text style={styles.sectionTitle}>Inner Circle</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>
                                Your accountability partners
                            </Text>

                            <GlassCard variant="light" padding="md" style={styles.circleCard}>
                                {circleMembers.length > 0 ? (
                                    <>
                                        {circleMembers.map((member) => (
                                            <View key={member.id} style={styles.memberRow}>
                                                <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                                                    <Text style={styles.memberInitial}>{member.initial}</Text>
                                                </View>
                                                <View style={styles.memberInfo}>
                                                    <Text style={styles.memberName}>{member.name}</Text>
                                                    <View style={styles.memberStreak}>
                                                        <Feather name="zap" size={12} color={looviColors.accent.warning} />
                                                        <Text style={styles.memberStreakText}>{member.streak} day streak</Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity style={styles.congratsButton}>
                                                    <Feather name="thumbs-up" size={18} color={looviColors.accent.primary} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </>
                                ) : (
                                    <View style={styles.emptyCircle}>
                                        <Feather name="user-plus" size={32} color={looviColors.text.muted} />
                                        <Text style={styles.emptyText}>No members yet</Text>
                                    </View>
                                )}

                                {/* Invite CTA */}
                                <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
                                    <Feather name="send" size={18} color="#FFFFFF" />
                                    <Text style={styles.inviteText}>Invite Friends</Text>
                                </TouchableOpacity>
                                <Text style={styles.inviteHint}>
                                    Invite friends and both earn premium features!
                                </Text>
                            </GlassCard>
                        </View>

                        {/* Content Spotlight Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Feather name="star" size={18} color={looviColors.text.primary} />
                                <Text style={styles.sectionTitle}>Content Spotlight</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>
                                Featured content for you
                            </Text>

                            <TouchableOpacity activeOpacity={0.8}>
                                <GlassCard variant="light" padding="lg" style={styles.spotlightCard}>
                                    <View style={styles.spotlightBadge}>
                                        <Feather name="play-circle" size={14} color="#FFFFFF" />
                                        <Text style={styles.spotlightBadgeText}>Video</Text>
                                    </View>
                                    <View style={styles.spotlightContent}>
                                        <View style={styles.spotlightIcon}>
                                            <Feather name="play" size={32} color={looviColors.accent.primary} />
                                        </View>
                                        <Text style={styles.spotlightTitle}>
                                            5 Science-Backed Ways to Beat Sugar Cravings
                                        </Text>
                                        <Text style={styles.spotlightMeta}>
                                            Dr. Sarah Chen · 8 min watch
                                        </Text>
                                    </View>
                                </GlassCard>
                            </TouchableOpacity>
                        </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingBottom: 100,
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    sectionSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginBottom: spacing.md,
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    statCard: {
        width: (SCREEN_WIDTH - spacing.screen.horizontal * 2 - spacing.sm) / 2,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.tertiary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pieContainer: {
        marginBottom: spacing.sm,
    },
    legendRow: {
        flexDirection: 'column',
        gap: 4,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 10,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    bigStat: {
        fontSize: 36,
        fontWeight: '800',
        color: looviColors.text.primary,
    },
    statHint: {
        fontSize: 11,
        fontWeight: '400',
        color: looviColors.text.muted,
        marginTop: 4,
        textAlign: 'center',
    },
    // Inner Circle
    circleCard: {},
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    memberAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberInitial: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    memberInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    memberName: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    memberStreak: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    memberStreakText: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginLeft: 4,
    },
    congratsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${looviColors.accent.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyCircle: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.muted,
        marginTop: spacing.sm,
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 12,
        borderRadius: borderRadius.xl,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    inviteText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    inviteHint: {
        fontSize: 11,
        fontWeight: '400',
        color: looviColors.text.muted,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    // Content Spotlight
    spotlightCard: {
        position: 'relative',
        overflow: 'hidden',
    },
    spotlightBadge: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: looviColors.accent.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    spotlightBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    spotlightContent: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    spotlightIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: `${looviColors.accent.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    spotlightTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        lineHeight: 22,
    },
    spotlightMeta: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
});
