/**
 * Storage Service
 * 
 * Wrapper around AsyncStorage for local data persistence.
 * Provides typed access to app storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
    ONBOARDING_DATA: '@sugar_reset_onboarding',
    USER_PREFERENCES: '@sugar_reset_preferences',
    CHECK_INS_CACHE: '@sugar_reset_checkins',
    HAS_COMPLETED_ONBOARDING: '@sugar_reset_has_onboarded',
};

/**
 * Generic save function
 */
async function save<T>(key: string, data: T): Promise<void> {
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
        throw error;
    }
}

/**
 * Generic load function
 */
async function load<T>(key: string): Promise<T | null> {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error(`Error loading ${key}:`, error);
        return null;
    }
}

/**
 * Remove a specific key
 */
async function remove(key: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing ${key}:`, error);
    }
}

/**
 * Clear all app data
 */
async function clearAll(): Promise<void> {
    try {
        const keys = Object.values(STORAGE_KEYS);
        await AsyncStorage.multiRemove(keys);
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
}

// Export the service
export const storageService = {
    save,
    load,
    remove,
    clearAll,
    KEYS: STORAGE_KEYS,
};

export default storageService;
