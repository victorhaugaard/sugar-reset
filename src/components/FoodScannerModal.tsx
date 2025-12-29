/**
 * FoodScannerModal
 * 
 * Modal for scanning food items to detect sugar content.
 * Uses expo-image-picker for camera/gallery access.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';
import { GlassCard } from './GlassCard';
import {
    analyzeFood,
    saveScannedItem,
    generateScanId,
    ScannedItem,
    AnalysisResult,
} from '../services/scannerService';

interface FoodScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onScanComplete: (item: ScannedItem) => void;
}

type ScanStep = 'select' | 'analyzing' | 'result';

export default function FoodScannerModal({
    visible,
    onClose,
    onScanComplete,
}: FoodScannerModalProps) {
    const [step, setStep] = useState<ScanStep>('select');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const resetState = () => {
        setStep('select');
        setImageUri(null);
        setResult(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Camera permission is needed to scan food items.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            processImage(result.assets[0].uri);
        }
    };

    const pickFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            processImage(result.assets[0].uri);
        }
    };

    const processImage = async (uri: string) => {
        setImageUri(uri);
        setStep('analyzing');

        try {
            const analysisResult = await analyzeFood(uri);
            setResult(analysisResult);
            setStep('result');
        } catch (error) {
            console.error('Analysis error:', error);
            Alert.alert('Error', 'Failed to analyze image. Please try again.');
            resetState();
        }
    };

    const handleSave = async () => {
        if (!imageUri || !result) return;

        const scannedItem: ScannedItem = {
            id: generateScanId(),
            imageUri,
            name: result.foodName,
            sugarGrams: result.sugarGrams,
            confidence: result.confidence,
            timestamp: new Date().toISOString(),
            suggestion: result.suggestion,
        };

        try {
            await saveScannedItem(scannedItem);
            onScanComplete(scannedItem);
            handleClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to save scan. Please try again.');
        }
    };

    const getSugarColor = (grams: number) => {
        if (grams <= 5) return looviColors.accent.success;
        if (grams <= 15) return looviColors.accent.warning;
        return '#EF4444';
    };

    const renderContent = () => {
        switch (step) {
            case 'select':
                return (
                    <>
                        <Text style={styles.modalTitle}>Scan Food</Text>
                        <Text style={styles.modalSubtitle}>
                            Take a photo or select from gallery
                        </Text>

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={takePhoto}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.optionEmoji}>📷</Text>
                                <Text style={styles.optionText}>Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={pickFromGallery}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.optionEmoji}>🖼️</Text>
                                <Text style={styles.optionText}>Gallery</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                );

            case 'analyzing':
                return (
                    <>
                        {imageUri && (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        )}
                        <View style={styles.analyzingContainer}>
                            <ActivityIndicator size="large" color={looviColors.accent.primary} />
                            <Text style={styles.analyzingText}>Analyzing food...</Text>
                            <Text style={styles.analyzingHint}>
                                Looking for sugar content
                            </Text>
                        </View>
                    </>
                );

            case 'result':
                return (
                    <>
                        {imageUri && (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        )}
                        {result && (
                            <View style={styles.resultContainer}>
                                <Text style={styles.foodName}>{result.foodName}</Text>

                                <View style={styles.sugarBadge}>
                                    <Text style={styles.sugarLabel}>Sugar Content</Text>
                                    <Text style={[styles.sugarValue, { color: getSugarColor(result.sugarGrams) }]}>
                                        {result.sugarGrams}g
                                    </Text>
                                </View>

                                <View style={styles.confidenceRow}>
                                    <Text style={styles.confidenceLabel}>Confidence:</Text>
                                    <Text style={styles.confidenceValue}>
                                        {Math.round(result.confidence * 100)}%
                                    </Text>
                                </View>

                                {result.suggestion && (
                                    <Text style={styles.suggestion}>{result.suggestion}</Text>
                                )}

                                <View style={styles.resultButtons}>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={resetState}
                                    >
                                        <Text style={styles.retryText}>Scan Again</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.saveText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </>
                );
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleClose}
            >
                <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                    {renderContent()}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: spacing.xl,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
    },
    modalSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    optionButton: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 16,
        padding: spacing.xl,
        alignItems: 'center',
        minWidth: 120,
    },
    optionEmoji: {
        fontSize: 40,
        marginBottom: spacing.sm,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    cancelButton: {
        paddingVertical: spacing.sm,
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.muted,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: spacing.lg,
    },
    analyzingContainer: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    analyzingText: {
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginTop: spacing.md,
    },
    analyzingHint: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
    resultContainer: {
        width: '100%',
        alignItems: 'center',
    },
    foodName: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    sugarBadge: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 16,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.md,
        width: '100%',
    },
    sugarLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    sugarValue: {
        fontSize: 48,
        fontWeight: '800',
    },
    confidenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    confidenceLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginRight: spacing.xs,
    },
    confidenceValue: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    suggestion: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: spacing.lg,
    },
    resultButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    retryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    retryText: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: looviColors.accent.primary,
    },
    saveText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
