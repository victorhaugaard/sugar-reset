/**
 * FriendSearchModal
 * 
 * Modal for searching and adding friends by username.
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';
import { GlassCard } from './GlassCard';
import { friendService } from '../services/friendService';
import { User } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';

interface FriendSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onRequestSent?: () => void;
}

export function FriendSearchModal({ visible, onClose, onRequestSent }: FriendSearchModalProps) {
    const { user } = useAuthContext();
    const { onboardingData } = useUserData();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sendingTo, setSendingTo] = useState<string | null>(null);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await friendService.searchUsers(searchQuery.trim());
            // Filter out current user
            const filtered = results.filter(u => u.id !== user?.id);
            setSearchResults(filtered);
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Failed to search users');
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, user?.id]);

    const handleSendRequest = async (toUser: User) => {
        if (!user) return;

        setSendingTo(toUser.id);
        try {
            await friendService.sendFriendRequest(
                user.id,
                onboardingData.nickname || user.displayName || user.email,
                undefined, // username - will be fetched from profile
                toUser.id
            );
            Alert.alert('Success', `Friend request sent to ${toUser.displayName || toUser.username}!`);
            onRequestSent?.();

            // Remove from results to prevent duplicate sends
            setSearchResults(prev => prev.filter(u => u.id !== toUser.id));
        } catch (error: any) {
            if (error.message === 'Already friends with this user') {
                Alert.alert('Already Friends', 'You are already friends with this user.');
            } else if (error.message === 'Friend request already sent') {
                Alert.alert('Already Sent', 'You have already sent a friend request to this user.');
            } else {
                console.error('Send request error:', error);
                Alert.alert('Error', 'Failed to send friend request');
            }
        } finally {
            setSendingTo(null);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        onClose();
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <GlassCard variant="light" padding="md" style={styles.userCard}>
            <View style={styles.userRow}>
                <View style={[styles.avatar, { backgroundColor: looviColors.accent.primary }]}>
                    <Text style={styles.avatarText}>
                        {(item.displayName || item.username || item.email)?.[0]?.toUpperCase() || '?'}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        {item.displayName || item.username || 'Anonymous'}
                    </Text>
                    {item.username && (
                        <Text style={styles.userUsername}>@{item.username}</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.addButton, sendingTo === item.id && styles.addButtonDisabled]}
                    onPress={() => handleSendRequest(item)}
                    disabled={sendingTo === item.id}
                >
                    {sendingTo === item.id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="person-add" size={16} color="#FFFFFF" />
                            <Text style={styles.addButtonText}>Add</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </GlassCard>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Find Friends</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={looviColors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Input */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={looviColors.text.muted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by username..."
                            placeholderTextColor={looviColors.text.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={looviColors.text.muted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Search Button */}
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                        disabled={isSearching || searchQuery.length < 2}
                    >
                        {isSearching ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.searchButtonText}>Search</Text>
                        )}
                    </TouchableOpacity>

                    {/* Results */}
                    <View style={styles.resultsContainer}>
                        {searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                            <Text style={styles.noResults}>No users found</Text>
                        )}
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id}
                            renderItem={renderUserItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.resultsList}
                        />
                    </View>

                    {/* Hint */}
                    <Text style={styles.hint}>
                        Search for friends by their username to add them to your Inner Circle
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing['3xl'],
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    closeButton: {
        padding: spacing.xs,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: looviColors.text.primary,
    },
    searchButton: {
        backgroundColor: looviColors.accent.primary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    searchButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    resultsContainer: {
        flex: 1,
        marginTop: spacing.lg,
    },
    resultsList: {
        gap: spacing.sm,
    },
    noResults: {
        fontSize: 14,
        color: looviColors.text.tertiary,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    userCard: {
        marginBottom: spacing.sm,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    userInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    userUsername: {
        fontSize: 13,
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: looviColors.accent.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    addButtonDisabled: {
        opacity: 0.7,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    hint: {
        fontSize: 12,
        color: looviColors.text.tertiary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});

export default FriendSearchModal;
