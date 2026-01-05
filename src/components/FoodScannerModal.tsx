/**
 * FoodScannerModal
 * 
 * Modal for scanning food items with full macro analysis.
 * New workflow: Photo → Optional description → AI Analysis → Confirmation/Edit → Portion → Save
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
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { spacing, borderRadius } from '../theme';
import { looviColors } from './LooviBackground';
import {
    analyzeFood,
    saveScannedItem,
    generateScanId,
    ScannedItem,
    AnalysisResult,
    getHealthScoreColor,
} from '../services/scannerService';

interface FoodScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onScanComplete: (item: ScannedItem) => void;
}

type ScanStep = 'select' | 'describe' | 'analyzing' | 'result';

export default function FoodScannerModal({
    visible,
    onClose,
    onScanComplete,
}: FoodScannerModalProps) {
    const [step, setStep] = useState<ScanStep>('select');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [portionPercent, setPortionPercent] = useState(100);
    const [editedName, setEditedName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const resetState = () => {
        setStep('select');
        setImageUri(null);
        setDescription('');
        setResult(null);
        setPortionPercent(100);
        setEditedName('');
        setIsEditing(false);
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
            setImageUri(result.assets[0].uri);
            setStep('describe');
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
            setImageUri(result.assets[0].uri);
            setStep('describe');
        }
    };

    const processImage = async () => {
        if (!imageUri) return;
        setStep('analyzing');

        try {
            const analysisResult = await analyzeFood(imageUri, description);
            setResult(analysisResult);
            setEditedName(analysisResult.foodName);
            setStep('result');
        } catch (error) {
            console.error('Analysis error:', error);
            Alert.alert('Error', 'Failed to analyze image. Please try again.');
            resetState();
        }
    };

    const handleSave = async () => {
        if (!imageUri || !result) return;

        // Apply portion percentage to macros
        const portionMultiplier = portionPercent / 100;

        const scannedItem: ScannedItem = {
            id: generateScanId(),
            imageUri,
            name: editedName || result.foodName,
            timestamp: new Date().toISOString(),
            portionPercent,
            calories: Math.round(result.calories * portionMultiplier),
            protein: Math.round(result.protein * portionMultiplier * 10) / 10,
            carbs: Math.round(result.carbs * portionMultiplier * 10) / 10,
            carbsSugars: Math.round(result.carbsSugars * portionMultiplier * 10) / 10,
            fat: Math.round(result.fat * portionMultiplier * 10) / 10,
            fatSaturated: Math.round(result.fatSaturated * portionMultiplier * 10) / 10,
            fiber: Math.round(result.fiber * portionMultiplier * 10) / 10,
            sugar: Math.round(result.sugar * portionMultiplier * 10) / 10,
            sodium: Math.round(result.sodium * portionMultiplier),
            healthScore: result.healthScore,
            confidence: result.confidence,
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

    const renderContent = () => {
        switch (step) {
            case 'select':
                return (
                    <>
                        <Text style={styles.modalTitle}>Scan Food</Text>
                        <Text style={styles.modalSubtitle}>
                            Take a photo of your food or nutrition label
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

            case 'describe':
                return (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.describeContainer}>
                            {imageUri && (
                                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                            )}
                            <Text style={styles.stepTitle}>What is this?</Text>
                            <Text style={styles.stepSubtitle}>
                                Add a description to improve accuracy (optional)
                            </Text>

                            <TextInput
                                style={styles.descriptionInput}
                                placeholder="e.g., Caesar salad with chicken..."
                                placeholderTextColor={looviColors.text.muted}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                returnKeyType="done"
                                blurOnSubmit={true}
                            />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.skipButton} onPress={() => { setDescription(''); processImage(); }}>
                                    <Text style={styles.skipText}>Skip</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.continueButton} onPress={processImage}>
                                    <Text style={styles.continueText}>Analyze Food</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
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
                                Detecting nutritional content
                            </Text>
                        </View>
                    </>
                );

            case 'result':
                const healthColor = result ? getHealthScoreColor(result.healthScore) : looviColors.accent.success;
                return (
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.resultScroll}>
                        {imageUri && (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        )}
                        {result && (
                            <View style={styles.resultContainer}>
                                {/* Food Name (Editable) */}
                                {isEditing ? (
                                    <TextInput
                                        style={styles.nameInput}
                                        value={editedName}
                                        onChangeText={setEditedName}
                                        autoFocus
                                        onBlur={() => setIsEditing(false)}
                                    />
                                ) : (
                                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                                        <Text style={styles.foodName}>{editedName || result.foodName}</Text>
                                        <Text style={styles.tapToEdit}>Tap to edit</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Health Score */}
                                <View style={[styles.healthScoreBadge, { backgroundColor: `${healthColor}15` }]}>
                                    <Text style={[styles.healthScoreValue, { color: healthColor }]}>
                                        {result.healthScore}
                                    </Text>
                                    <Text style={styles.healthScoreLabel}>/10 Health Score</Text>
                                </View>

                                {/* Portion Slider */}
                                <View style={styles.portionSection}>
                                    <Text style={styles.sectionLabel}>How much did you eat?</Text>
                                    <View style={styles.portionMarkers}>
                                        {[0, 25, 50, 75, 100].map(p => (
                                            <Text key={p} style={[
                                                styles.portionMarker,
                                                portionPercent === p && styles.portionMarkerActive
                                            ]}>{p}%</Text>
                                        ))}
                                    </View>
                                    <Slider
                                        style={styles.slider}
                                        minimumValue={0}
                                        maximumValue={100}
                                        step={25}
                                        value={portionPercent}
                                        onValueChange={setPortionPercent}
                                        minimumTrackTintColor={looviColors.accent.primary}
                                        maximumTrackTintColor="rgba(0,0,0,0.1)"
                                    />
                                </View>

                                {/* Macro Summary */}
                                <View style={styles.macroGrid}>
                                    <View style={styles.macroItem}>
                                        <Text style={styles.macroValue}>{Math.round(result.calories * portionPercent / 100)}</Text>
                                        <Text style={styles.macroLabel}>kcal</Text>
                                    </View>
                                    <View style={styles.macroItem}>
                                        <Text style={styles.macroValue}>{(result.protein * portionPercent / 100).toFixed(1)}g</Text>
                                        <Text style={styles.macroLabel}>Protein</Text>
                                    </View>
                                    <View style={styles.macroItem}>
                                        <Text style={styles.macroValue}>{(result.carbs * portionPercent / 100).toFixed(1)}g</Text>
                                        <Text style={styles.macroLabel}>Carbs</Text>
                                    </View>
                                    <View style={styles.macroItem}>
                                        <Text style={styles.macroValue}>{(result.fat * portionPercent / 100).toFixed(1)}g</Text>
                                        <Text style={styles.macroLabel}>Fat</Text>
                                    </View>
                                    <View style={styles.macroItem}>
                                        <Text style={[styles.macroValue, { color: result.sugar > 15 ? '#EF4444' : looviColors.text.primary }]}>
                                            {(result.sugar * portionPercent / 100).toFixed(1)}g
                                        </Text>
                                        <Text style={styles.macroLabel}>Sugar</Text>
                                    </View>
                                    <View style={styles.macroItem}>
                                        <Text style={styles.macroValue}>{(result.fiber * portionPercent / 100).toFixed(1)}g</Text>
                                        <Text style={styles.macroLabel}>Fiber</Text>
                                    </View>
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
                    </ScrollView>
                );
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                        {renderContent()}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    describeContainer: {
        // Remove flex: 1 to prevent layout issues
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        padding: spacing.xl,
        paddingTop: spacing.lg,
        minHeight: '50%',
        maxHeight: '90%',
    },
    closeButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeText: {
        fontSize: 20,
        color: looviColors.text.tertiary,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
        textAlign: 'center',
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
        flex: 1,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
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
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.muted,
    },
    previewImage: {
        width: '100%',
        height: 180,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.lg,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    stepSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    descriptionInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: 15,
        color: looviColors.text.primary,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: spacing.lg,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    skipButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    skipText: {
        fontSize: 15,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    continueButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        backgroundColor: looviColors.accent.primary,
    },
    continueText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    analyzingContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
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
    resultScroll: {
        maxHeight: '100%',
    },
    resultContainer: {
        alignItems: 'center',
    },
    foodName: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
    },
    tapToEdit: {
        fontSize: 11,
        fontWeight: '400',
        color: looviColors.text.muted,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    nameInput: {
        fontSize: 22,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: looviColors.accent.primary,
        paddingBottom: spacing.xs,
        marginBottom: spacing.md,
    },
    healthScoreBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.lg,
    },
    healthScoreValue: {
        fontSize: 36,
        fontWeight: '800',
    },
    healthScoreLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.secondary,
        marginLeft: spacing.xs,
    },
    portionSection: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    portionMarkers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    portionMarker: {
        fontSize: 11,
        fontWeight: '500',
        color: looviColors.text.tertiary,
    },
    portionMarkerActive: {
        color: looviColors.accent.primary,
        fontWeight: '700',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    macroGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    macroItem: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        minWidth: 70,
    },
    macroValue: {
        fontSize: 16,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    macroLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: 2,
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
        borderRadius: borderRadius.xl,
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
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        backgroundColor: looviColors.accent.primary,
    },
    saveText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
