/**
 * Scanner Service
 * 
 * Handles storage and retrieval of scanned food items.
 * Uses AsyncStorage for persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SCANNED_ITEMS_KEY = '@sugar_reset_scanned_items';

export interface ScannedItem {
    id: string;
    imageUri: string;
    name: string;
    sugarGrams: number;
    confidence: number;
    timestamp: string;
    suggestion?: string;
}

export interface AnalysisResult {
    foodName: string;
    sugarGrams: number;
    confidence: number;
    suggestion?: string;
}

/**
 * Get all scanned items from storage
 */
export const getScannedItems = async (): Promise<ScannedItem[]> => {
    try {
        const stored = await AsyncStorage.getItem(SCANNED_ITEMS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    } catch (error) {
        console.error('Error loading scanned items:', error);
        return [];
    }
};

/**
 * Save a new scanned item
 */
export const saveScannedItem = async (item: ScannedItem): Promise<void> => {
    try {
        const existing = await getScannedItems();
        const updated = [item, ...existing].slice(0, 50); // Keep last 50 items
        await AsyncStorage.setItem(SCANNED_ITEMS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error saving scanned item:', error);
        throw error;
    }
};

/**
 * Delete a scanned item by ID
 */
export const deleteScannedItem = async (id: string): Promise<void> => {
    try {
        const existing = await getScannedItems();
        const updated = existing.filter(item => item.id !== id);
        await AsyncStorage.setItem(SCANNED_ITEMS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error deleting scanned item:', error);
        throw error;
    }
};

/**
 * Clear all scanned items
 */
export const clearScannedItems = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SCANNED_ITEMS_KEY);
    } catch (error) {
        console.error('Error clearing scanned items:', error);
        throw error;
    }
};

/**
 * Analyze food image using AI
 * TODO: Replace with actual Gemini Vision API call
 */
export const analyzeFood = async (imageUri: string): Promise<AnalysisResult> => {
    // PLACEHOLDER: Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // TODO: Implement Google Gemini Vision API integration
    // 1. Get API key from environment: process.env.EXPO_PUBLIC_GEMINI_API_KEY
    // 2. Convert image to base64
    // 3. Send to Gemini Vision API
    // 4. Parse response for food name and sugar content

    // For now, return placeholder data
    const mockFoods = [
        { foodName: 'Apple', sugarGrams: 10, confidence: 0.85 },
        { foodName: 'Coca-Cola (330ml)', sugarGrams: 35, confidence: 0.92 },
        { foodName: 'Orange Juice (250ml)', sugarGrams: 22, confidence: 0.88 },
        { foodName: 'Chocolate Bar', sugarGrams: 24, confidence: 0.78 },
        { foodName: 'Yogurt (plain)', sugarGrams: 5, confidence: 0.75 },
    ];

    // Return random mock food for demo
    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];

    return {
        ...randomFood,
        suggestion: '💡 This is demo data. Add Gemini API key to enable real detection.',
    };
};

/**
 * Generate unique ID for scanned items
 */
export const generateScanId = (): string => {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
