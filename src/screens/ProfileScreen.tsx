/**
 * ProfileScreen
 * 
 * User profile and settings with sky theme.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    Dimensions,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { GlassCard } from '../components/GlassCard';
import PlanDetailsModal from '../components/PlanDetailsModal';
import EditGoalsModal from '../components/EditGoalsModal';

import { useUserData } from '../context/UserDataContext';
import { userService } from '../services/userService';
import { useAuthContext } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { AppIcon } from '../components/OnboardingIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showEditSavingsModal, setShowEditSavingsModal] = useState(false);
    const [editSavingsGoal, setEditSavingsGoal] = useState('');
    const [editNameState, setEditNameState] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [originalUsername, setOriginalUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Get user data from context
    const startDateString = onboardingData.startDate || new Date().toISOString();
    const startDate = useMemo(() => new Date(startDateString), [startDateString]);
    const dailySpendingCents = onboardingData.dailySpendingCents || 300;
    const savingsGoal = onboardingData.savingsGoal || 'Something amazing';
    const savingsGoalAmount = onboardingData.savingsGoalAmount || 500;

    const GOAL_TO_REASON: Record<string, string> = {
        cravings: 'Break free from sugar cravings',
        habits: 'Form healthier daily habits',
        energy: 'Better focus and mental clarity',
        health: 'Improved overall health',
        weight: 'Achieve your weight goals',
        skin: 'Clearer, healthier skin',
        focus: 'Enhanced focus and productivity',
        blood_sugar: 'Stable blood sugar levels',
        sleep: 'Improved sleep quality',
        savings: 'Save money for what matters',
    };

    const userGoals = onboardingData.goals || [];
    const reasons = userGoals.length > 0
        ? userGoals.map(goalOrText => GOAL_TO_REASON[goalOrText] || goalOrText).filter(Boolean)
        : ['Better focus and mental clarity', 'Stable blood sugar levels', 'Improved sleep quality'];

    useEffect(() => {
        const now = new Date();
        const elapsed = now.getTime() - startDate.getTime();
        setTimeElapsed(Math.max(0, elapsed));

        intervalRef.current = setInterval(() => {
            const now = new Date();
            const elapsed = now.getTime() - startDate.getTime();
            setTimeElapsed(Math.max(0, elapsed));
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startDate]);

    const moneySavedCents = Math.floor((timeElapsed / (1000 * 60 * 60 * 24)) * dailySpendingCents);
    const moneySavedValue = (moneySavedCents / 100).toFixed(2);

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

    const handleEditSavings = () => {
        setEditSavingsGoal(savingsGoal);
        setShowEditSavingsModal(true);
    };

    const handleClearAllData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all wellness logs, food logs, and reset your data for testing. Your onboarding data and streak will be preserved. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear Data',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('wellness_logs');
                            await AsyncStorage.removeItem('@sugar_reset_scanned_items');
                            Alert.alert('Success', 'All wellness and food data has been cleared.');
                        } catch (error) {
                            console.error('Error clearing data:', error);
                            Alert.alert('Error', 'Failed to clear data. Please try again.');
                        }
                    }
                },
            ]
        );
    };

    const handleSaveSavingsGoal = async () => {
        if (editSavingsGoal.trim()) {
            await updateOnboardingData({ savingsGoal: editSavingsGoal.trim() });
            setShowEditSavingsModal(false);
        }
    };

    const handleEditProfile = async () => {
        if (!user) return;
        setEditNameState(name);

        // Fetch current username if exists
        try {
            const profile = await userService.getUserProfile(user.id);
            const currentUsername = profile?.username || '';
            setEditUsername(currentUsername);
            setOriginalUsername(currentUsername);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setEditUsername('');
        }

        setUsernameError('');
        setShowEditProfile(true);
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        setUsernameError(''); // Clear previous error

        try {
            // Update displayName locally and in auth/onboarding
            if (editNameState.trim() !== name) {
                await updateOnboardingData({ nickname: editNameState.trim() });
                // Note: user.displayName updates are handled by auth provider usually, 
                // but we store nickname in onboardingData for this app
            }

            // Update username if changed
            const trimmedUsername = editUsername.trim().toLowerCase();
            if (trimmedUsername && trimmedUsername !== originalUsername) {
                if (trimmedUsername.length < 3) {
                    setUsernameError('Username must be at least 3 characters');
                    setIsSavingProfile(false);
                    return;
                }

                const isAvailable = await userService.checkUsernameAvailable(trimmedUsername);
                if (!isAvailable) {
                    setUsernameError('Username is already taken');
                    setIsSavingProfile(false);
                    return;
                }

                await userService.updateUsername(user.id, trimmedUsername);
                setOriginalUsername(trimmedUsername);
            }

            setShowEditProfile(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Error saving profile:', error);
            setUsernameError('Failed to save profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <>
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
                                <AppIcon emoji="🧑" size={40} />
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
                                    <AppIcon emoji="🌟" size={24} />
                                    <Text style={styles.statLabel}>{plan}</Text>
                                </View>
                            </View>
                        </GlassCard>

                        {/* Reasons Section */}
                        <View style={styles.profileSection}>
                            <View style={styles.profileSectionHeader}>
                                <Text style={styles.profileSectionTitle}>Why I Started</Text>
                                <TouchableOpacity onPress={handleEditGoals}>
                                    <Text style={styles.editIcon}>✏️</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.reasonsContainer}>
                                {reasons.map((reason, index) => (
                                    <GlassCard key={index} variant="light" padding="md" style={styles.reasonCard}>
                                        <Text style={styles.reasonText}>{reason}</Text>
                                    </GlassCard>
                                ))}
                            </View>
                        </View>

                        {/* Savings Section */}
                        <TouchableOpacity activeOpacity={0.8} onPress={handleEditSavings} style={styles.profileSection}>
                            <GlassCard variant="light" padding="md" style={styles.savingsCard}>
                                <View style={styles.savingsHeader}>
                                    <Text style={styles.savingsLabel}>Saving for</Text>
                                    <Text style={styles.editIcon}>✏️</Text>
                                </View>
                                <Text style={styles.savingsGoalTitle}>{savingsGoal}</Text>
                                <View style={styles.savingsProgress}>
                                    <View style={styles.savingsProgressBar}>
                                        <View style={[styles.savingsProgressFill, { width: `${Math.min((moneySavedCents / (savingsGoalAmount * 100)) * 100, 100)}%` }]} />
                                    </View>
                                    <Text style={styles.savingsProgressText}>${moneySavedValue} / ${savingsGoalAmount} goal</Text>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>

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
                                                        : item.id === 'profile'
                                                            ? handleEditProfile
                                                            : item.id === 'journal'
                                                                ? () => navigation.navigate('Journal')
                                                                : undefined
                                            }
                                        >
                                            <AppIcon emoji={item.emoji} size={20} />
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

                        {/* Development Tools */}
                        <View style={styles.menuSection}>
                            <Text style={styles.sectionTitle}>Development</Text>
                            <GlassCard variant="light" padding="none" style={styles.menuCard}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    activeOpacity={0.6}
                                    onPress={handleClearAllData}
                                >
                                    <AppIcon emoji="🗑️" size={20} />
                                    <View style={styles.menuLabelContainer}>
                                        <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Clear All Data</Text>
                                        <Text style={styles.menuSubtext}>Reset wellness & food logs</Text>
                                    </View>
                                    <Text style={styles.menuArrow}>›</Text>
                                </TouchableOpacity>
                            </GlassCard>
                        </View>

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

                    {/* Edit Savings Goal Modal */}
                    <Modal
                        visible={showEditSavingsModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowEditSavingsModal(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowEditSavingsModal(false)}
                        >
                            <TouchableOpacity activeOpacity={1} style={styles.editModalContent}>
                                <Text style={styles.editModalTitle}>What are you saving for?</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={editSavingsGoal}
                                    onChangeText={setEditSavingsGoal}
                                    placeholder="e.g., A vacation, New phone..."
                                    placeholderTextColor={looviColors.text.muted}
                                />
                                <View style={styles.editModalButtons}>
                                    <TouchableOpacity
                                        style={styles.editCancelButton}
                                        onPress={() => setShowEditSavingsModal(false)}
                                    >
                                        <Text style={styles.editCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.editSaveButton}
                                        onPress={handleSaveSavingsGoal}
                                    >
                                        <Text style={styles.editSaveText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>

                    {/* Edit Profile Modal */}
                    <Modal
                        visible={showEditProfile}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowEditProfile(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowEditProfile(false)}
                        >
                            <TouchableOpacity activeOpacity={1} style={styles.editModalContent}>
                                <Text style={styles.editModalTitle}>Edit Profile</Text>

                                <Text style={styles.inputLabel}>Display Name</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={editNameState}
                                    onChangeText={setEditNameState}
                                    placeholder="Your Name"
                                    placeholderTextColor={looviColors.text.muted}
                                />

                                <Text style={styles.inputLabel}>Username (Unique)</Text>
                                <TextInput
                                    style={[styles.editInput, usernameError ? { borderColor: '#EF4444', borderWidth: 1 } : {}]}
                                    value={editUsername}
                                    onChangeText={(text) => {
                                        setEditUsername(text);
                                        setUsernameError('');
                                    }}
                                    placeholder="username"
                                    placeholderTextColor={looviColors.text.muted}
                                    autoCapitalize="none"
                                />
                                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

                                <View style={styles.editModalButtons}>
                                    <TouchableOpacity
                                        style={styles.editCancelButton}
                                        onPress={() => setShowEditProfile(false)}
                                        disabled={isSavingProfile}
                                    >
                                        <Text style={styles.editCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.editSaveButton, isSavingProfile && { opacity: 0.7 }]}
                                        onPress={handleSaveProfile}
                                        disabled={isSavingProfile}
                                    >
                                        <Text style={styles.editSaveText}>{isSavingProfile ? 'Saving...' : 'Save'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>

                    {/* Plan Details Modal */}
                    <PlanDetailsModal
                        visible={showPlanDetails}
                        planType={onboardingData.plan || 'cold_turkey'}
                        onClose={() => setShowPlanDetails(false)}
                    />
                </SafeAreaView>
            </LooviBackground>
        </>
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
    // Reasons/Savings Section Styles
    profileSection: {
        marginBottom: spacing.xl,
    },
    profileSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    profileSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    editIcon: {
        fontSize: 14,
    },
    reasonsContainer: {
        gap: spacing.sm,
    },
    reasonCard: {
        marginBottom: spacing.xs,
    },
    reasonText: {
        fontSize: 15,
        fontWeight: '500',
        color: looviColors.text.primary,
    },
    savingsCard: {
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.1)',
    },
    savingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    savingsLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    savingsGoalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.md,
    },
    savingsProgress: {
        gap: spacing.xs,
    },
    savingsProgressBar: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    savingsProgressFill: {
        height: '100%',
        backgroundColor: looviColors.accent.success,
        borderRadius: 4,
    },
    savingsProgressText: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.screen.horizontal,
    },
    editModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    editModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    editInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: 16,
        color: looviColors.text.primary,
        marginBottom: spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.secondary,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginBottom: spacing.md,
        marginTop: -spacing.sm,
        marginLeft: spacing.xs,
    },
    editModalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    editCancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    editCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    editSaveButton: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        backgroundColor: looviColors.accent.primary,
    },
    editSaveText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
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
    menuLabelContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.primary,
    },
    menuValue: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    menuSubtext: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
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
});
