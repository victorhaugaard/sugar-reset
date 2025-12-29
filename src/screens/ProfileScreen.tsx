/**
 * ProfileScreen
 * 
 * User profile and settings with sky theme.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import PlanDetailsModal from '../components/PlanDetailsModal';
import EditGoalsModal from '../components/EditGoalsModal';
import { SwipeableTabView } from '../components/SwipeableTabView';
import { useUserData } from '../context/UserDataContext';
import { useAuthContext } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';

interface MenuItem {
    id: string;
    emoji: string;
    label: string;
    action?: () => void;
}

const menuSections = [
    {
        title: 'Account',
        items: [
            { id: 'profile', emoji: '👤', label: 'Edit Profile' },
            { id: 'goals', emoji: '🎯', label: 'My Goals' },
            { id: 'journal', emoji: '📝', label: 'Journal' },
            { id: 'plan', emoji: '📋', label: 'My Plan' },
        ],
    },
    {
        title: 'Preferences',
        items: [
            { id: 'notifications', emoji: '🔔', label: 'Notifications' },
            { id: 'reminders', emoji: '⏰', label: 'Daily Reminders' },
            { id: 'appearance', emoji: '🎨', label: 'Appearance' },
        ],
    },
    {
        title: 'Support',
        items: [
            { id: 'help', emoji: '❓', label: 'Help & FAQ' },
            { id: 'feedback', emoji: '💬', label: 'Send Feedback' },
            { id: 'rate', emoji: '⭐', label: 'Rate the App' },
        ],
    },
    {
        title: 'Legal',
        items: [
            { id: 'privacy', emoji: '🔒', label: 'Privacy Policy' },
            { id: 'terms', emoji: '📄', label: 'Terms of Service' },
        ],
    },
];

export default function ProfileScreen() {
    const { onboardingData, streakData, updateOnboardingData } = useUserData();
    const { user, isAuthenticated } = useAuthContext();
    const { signOut } = useAuth();
    const navigation = useNavigation<any>();
    const [showPlanDetails, setShowPlanDetails] = useState(false);
    const [showEditGoals, setShowEditGoals] = useState(false);

    // Get user data from context
    const name = onboardingData.nickname || user?.displayName || 'Guest';
    const email = user?.email || 'Not signed in';
    const daysSugarFree = streakData?.currentStreak || 0;
    const currentPlan = onboardingData.plan === 'cold_turkey' ? 'Cold Turkey' : 'Gradual Reduction';
    const plan = isAuthenticated ? 'Premium' : 'Free';

    const handleViewPlanDetails = () => {
        setShowPlanDetails(true);
    };

    const handleChangePlan = () => {
        const newPlan = onboardingData.plan === 'cold_turkey' ? 'gradual' : 'cold_turkey';
        const newPlanName = newPlan === 'cold_turkey' ? 'Cold Turkey' : 'Gradual Reduction';

        Alert.alert(
            'Change Plan',
            `Switch to ${newPlanName}?\n\n${newPlan === 'cold_turkey'
                ? '0g sugar from day 1 for 90 days. Maximum discipline.'
                : '50g → 45g → ... → 20g → 0g at week 8, then maintain.'}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Switch',
                    onPress: async () => {
                        await updateOnboardingData({ plan: newPlan });
                        Alert.alert('Plan Updated', `You're now on the ${newPlanName} plan.`);
                    }
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            console.error('Error signing out:', error);
                        }
                    }
                },
            ]
        );
    };

    const handleEditGoals = () => {
        setShowEditGoals(true);
    };

    const handleSaveGoals = async (newGoals: string[]) => {
        await updateOnboardingData({ goals: newGoals });
    };

    return (
        <SwipeableTabView currentTab="Profile">
            <LooviBackground variant="coralLeft">
                <SafeAreaView style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Profile</Text>
                        </View>

                        {/* User Card */}
                        <GlassCard variant="light" padding="lg" style={styles.userCard}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarEmoji}>🧑</Text>
                            </View>
                            <Text style={styles.userName}>{name}</Text>
                            <Text style={styles.userEmail}>{email}</Text>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{daysSugarFree}</Text>
                                    <Text style={styles.statLabel}>Days Free</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>🌟</Text>
                                    <Text style={styles.statLabel}>{plan}</Text>
                                </View>
                            </View>
                        </GlassCard>

                        {/* Menu Sections */}
                        {menuSections.map((section, sectionIndex) => (
                            <View key={sectionIndex} style={styles.menuSection}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <GlassCard variant="light" padding="none" style={styles.menuCard}>
                                    {section.items.map((item, itemIndex) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[
                                                styles.menuItem,
                                                itemIndex < section.items.length - 1 && styles.menuItemBorder,
                                            ]}
                                            activeOpacity={0.6}
                                            onPress={
                                                item.id === 'plan'
                                                    ? handleViewPlanDetails
                                                    : item.id === 'goals'
                                                        ? handleEditGoals
                                                        : item.id === 'journal'
                                                            ? () => navigation.navigate('Journal')
                                                            : undefined
                                            }
                                        >
                                            <Text style={styles.menuEmoji}>{item.emoji}</Text>
                                            <View style={styles.menuLabelContainer}>
                                                <Text style={styles.menuLabel}>{item.label}</Text>
                                                {item.id === 'plan' && (
                                                    <Text style={styles.menuValue}>{currentPlan}</Text>
                                                )}
                                            </View>
                                            <Text style={styles.menuArrow}>›</Text>
                                        </TouchableOpacity>
                                    ))}
                                </GlassCard>
                            </View>
                        ))}

                        {/* Logout */}
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>

                        {/* Logo */}
                        <Image
                            source={require('../public/sugarestlogo.png')}
                            style={styles.footerLogo}
                            resizeMode="contain"
                        />

                        {/* Version */}
                        <Text style={styles.version}>SugarReset v1.0.0</Text>
                    </ScrollView>

                    {/* Edit Goals Modal */}
                    <EditGoalsModal
                        visible={showEditGoals}
                        currentGoals={onboardingData.goals || []}
                        onSave={handleSaveGoals}
                        onClose={() => setShowEditGoals(false)}
                    />

                    {/* Plan Details Modal */}
                    <PlanDetailsModal
                        visible={showPlanDetails}
                        planType={onboardingData.plan || 'cold_turkey'}
                        onClose={() => setShowPlanDetails(false)}
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
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        letterSpacing: -0.5,
    },
    userCard: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    avatarEmoji: {
        fontSize: 40,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    userEmail: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginBottom: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    menuSection: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
        marginLeft: spacing.sm,
    },
    menuCard: {},
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    menuEmoji: {
        fontSize: 20,
        marginRight: spacing.md,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.primary,
    },
    menuArrow: {
        fontSize: 20,
        color: looviColors.text.muted,
    },
    logoutButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginTop: spacing.md,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#EF4444',
    },
    footerLogo: {
        width: Dimensions.get('window').width * 0.70,
        height: 80,
        alignSelf: 'center',
        marginTop: spacing.xl,
        opacity: 0.6,
    },
    version: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.muted,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    menuLabelContainer: {
        flex: 1,
    },
    menuValue: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
});
