/**
 * FoodScannerModal
 * 
 * Modal for scanning food items with full macro analysis.
 * New workflow: Photo → Optional description → AI Analysis → Confirmation/Edit → Portion → Save
 */

import React, { useState, useEffect } from 'react';
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
import { Feather } from '@expo/vector-icons';
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
    getScannedItems,
    getPinnedItems,
    pinItem,
    unpinItem,
} from '../services/scannerService';

interface FoodScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onScanComplete: (item: ScannedItem) => void;
    selectedDate?: string; // For backdating (YYYY-MM-DD format)
}

type ScanStep = 'select' | 'describe' | 'text-input' | 'analyzing' | 'result';

export default function FoodScannerModal({
    visible,
    onClose,
    onScanComplete,
    selectedDate,
}: FoodScannerModalProps) {
    const [step, setStep] = useState<ScanStep>('select');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [textOnlyInput, setTextOnlyInput] = useState(''); // For text-only food entry
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [portionPercent, setPortionPercent] = useState(100);
    const [editedName, setEditedName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [pinnedFoods, setPinnedFoods] = useState<ScannedItem[]>([]);
    const [recentFoods, setRecentFoods] = useState<ScannedItem[]>([]);

    // Load recent foods when modal opens
    useEffect(() => {
        if (visible) {
            loadRecentFoods();
        }
    }, [visible]);

    const loadRecentFoods = async () => {
        try {
            // Load pinned items first
            const pinned = await getPinnedItems();
            setPinnedFoods(pinned);

            // Load all scanned items
            const items = await getScannedItems();

            // Get unique items by name, most recent first, excluding pinned ones
            const pinnedNames = new Set(pinned.map(p => p.name));
            const uniqueMap = new Map<string, ScannedItem>();
            items.forEach(item => {
                if (!uniqueMap.has(item.name) && !pinnedNames.has(item.name)) {
                    uniqueMap.set(item.name, item);
                }
            });
            setRecentFoods(Array.from(uniqueMap.values()).slice(0, 10));
        } catch (error) {
            console.error('Error loading recent foods:', error);
        }
    };

    const resetState = () => {
        setStep('select');
        setImageUri(null);
        setDescription('');
        setTextOnlyInput('');
        setResult(null);
        setPortionPercent(100);
        setEditedName('');
        setIsEditing(false);
    };

    const quickAddRecent = async (item: ScannedItem) => {
        // Create a copy with new ID and timestamp for the selected date
        const timestamp = selectedDate
            ? new Date(selectedDate + 'T12:00:00').toISOString()
            : new Date().toISOString();

        const newItem: ScannedItem = {
            ...item,
            id: generateScanId(),
            timestamp,
        };

        try {
            await saveScannedItem(newItem);
            onScanComplete(newItem);
            handleClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to add food item.');
        }
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

    const processTextOnly = async () => {
        if (!textOnlyInput.trim()) {
            Alert.alert('Description Required', 'Please describe what you ate.');
            return;
        }
        setStep('analyzing');

        try {
            // Use text description only - pass empty string for imageUri
            const analysisResult = await analyzeFood('', textOnlyInput.trim());
            setResult(analysisResult);
            setEditedName(analysisResult.foodName);
            setStep('result');
        } catch (error) {
            console.error('Analysis error:', error);
            Alert.alert('Error', 'Failed to analyze food description. Please try again.');
            resetState();
        }
    };

    const handleSave = async () => {
        if (!result) return;

        // Apply portion percentage to macros
        const portionMultiplier = portionPercent / 100;

        // Create timestamp based on selectedDate or current time
        const timestamp = selectedDate
            ? new Date(selectedDate + 'T12:00:00').toISOString() // Use noon on selected date
            : new Date().toISOString();

        const scannedItem: ScannedItem = {
            id: generateScanId(),
            imageUri: imageUri || '', // Empty string for text-only entries
            name: editedName || result.foodName,
            timestamp,
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
                    <ScrollView style={styles.selectScrollView} showsVerticalScrollIndicator={false}>
                        {/* Header Icon */}
                        <View style={styles.headerIconContainer}>
                            <View style={styles.headerIcon}>
                                <Text style={styles.headerIconEmoji}>📷</Text>
                            </View>
                        </View>

                        <Text style={styles.modalTitle}>Track Your Food</Text>
                        <Text style={styles.modalSubtitle}>
                            Scan what you eat to track your sugar intake
                        </Text>

                        {/* Quick Guide */}
                        <View style={styles.quickGuide}>
                            <View style={styles.guideStep}>
                                <View style={styles.guideStepNumber}>
                                    <Text style={styles.guideStepNumberText}>1</Text>
                                </View>
                                <Text style={styles.guideStepText}>Take a photo of your food</Text>
                            </View>
                            <View style={styles.guideStep}>
                                <View style={styles.guideStepNumber}>
                                    <Text style={styles.guideStepNumberText}>2</Text>
                                </View>
                                <Text style={styles.guideStepText}>AI analyzes nutrition info</Text>
                            </View>
                            <View style={styles.guideStep}>
                                <View style={styles.guideStepNumber}>
                                    <Text style={styles.guideStepNumberText}>3</Text>
                                </View>
                                <Text style={styles.guideStepText}>Adjust portion & save</Text>
                            </View>
                        </View>

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={takePhoto}
                                activeOpacity={0.8}
                            >
                                <View style={styles.optionIconBg}>
                                    <Text style={styles.optionEmoji}>📷</Text>
                                </View>
                                <Text style={styles.optionText}>Take Photo</Text>
                                <Text style={styles.optionHint}>Best for accuracy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={pickFromGallery}
                                activeOpacity={0.8}
                            >
                                <View style={styles.optionIconBg}>
                                    <Text style={styles.optionEmoji}>🖼️</Text>
                                </View>
                                <Text style={styles.optionText}>Gallery</Text>
                                <Text style={styles.optionHint}>From saved photos</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Text-only input option */}
                        <TouchableOpacity
                            style={styles.textInputOption}
                            onPress={() => setStep('text-input')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.textInputOptionIcon}>
                                <Text style={styles.optionEmoji}>✏️</Text>
                            </View>
                            <View style={styles.textInputOptionContent}>
                                <Text style={styles.textInputOptionTitle}>Describe Your Food</Text>
                                <Text style={styles.textInputOptionHint}>
                                    Type what you ate for a quick estimate
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={looviColors.text.tertiary} />
                        </TouchableOpacity>

                        {/* Pinned Foods - Always shown first */}
                        {pinnedFoods.length > 0 && (
                            <View style={styles.recentSection}>
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.pinnedTitle}>📌 Pinned Foods</Text>
                                </View>
                                <View style={styles.recentList}>
                                    {pinnedFoods.map((item) => (
                                        <View key={item.id} style={styles.recentItemWithPin}>
                                            <TouchableOpacity
                                                style={styles.recentItemMain}
                                                onPress={() => quickAddRecent(item)}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.recentInfo}>
                                                    <Text style={styles.recentName} numberOfLines={1}>
                                                        {item.name}
                                                    </Text>
                                                    <Text style={styles.recentMacros}>
                                                        {item.calories}cal · {item.sugar}g sugar
                                                    </Text>
                                                </View>
                                                <Text style={styles.recentAddIcon}>+</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.pinButton}
                                                onPress={async () => {
                                                    await unpinItem(item.name);
                                                    loadRecentFoods();
                                                }}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Text style={styles.pinIconActive}>📌</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Recently Scanned Foods */}
                        {recentFoods.length > 0 && (
                            <View style={styles.recentSection}>
                                <Text style={styles.recentTitle}>Quick Add - Recent Foods</Text>
                                <View style={styles.recentList}>
                                    {recentFoods.map((item) => (
                                        <View key={item.id} style={styles.recentItemWithPin}>
                                            <TouchableOpacity
                                                style={styles.recentItemMain}
                                                onPress={() => quickAddRecent(item)}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.recentInfo}>
                                                    <Text style={styles.recentName} numberOfLines={1}>
                                                        {item.name}
                                                    </Text>
                                                    <Text style={styles.recentMacros}>
                                                        {item.calories}cal · {item.sugar}g sugar
                                                    </Text>
                                                </View>
                                                <Text style={styles.recentAddIcon}>+</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.pinButton}
                                                onPress={async () => {
                                                    await pinItem(item);
                                                    loadRecentFoods();
                                                }}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Text style={styles.pinIcon}>📍</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
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

            case 'text-input':
                return (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            style={styles.textInputContainer}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        >
                            {/* Header */}
                            <View style={styles.textInputHeader}>
                                <View style={styles.textInputIconLarge}>
                                    <Text style={{ fontSize: 40 }}>✏️</Text>
                                </View>
                                <Text style={styles.stepTitle}>Describe Your Food</Text>
                                <Text style={styles.stepSubtitle}>
                                    Be as detailed as you'd like - more detail means better estimates
                                </Text>
                            </View>

                            {/* Input field */}
                            <TextInput
                                style={styles.textOnlyInput}
                                placeholder="e.g., Plate of grilled chicken with rice and steamed broccoli..."
                                placeholderTextColor={looviColors.text.muted}
                                value={textOnlyInput}
                                onChangeText={setTextOnlyInput}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                autoFocus
                            />

                            {/* Examples */}
                            <View style={styles.examplesContainer}>
                                <Text style={styles.examplesTitle}>Examples:</Text>
                                <TouchableOpacity
                                    style={styles.exampleChip}
                                    onPress={() => setTextOnlyInput('Large bowl of oatmeal with banana and honey')}
                                >
                                    <Text style={styles.exampleText}>🥣 Oatmeal with banana</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.exampleChip}
                                    onPress={() => setTextOnlyInput('Grilled chicken sandwich with lettuce and tomato')}
                                >
                                    <Text style={styles.exampleText}>🥪 Chicken sandwich</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.exampleChip}
                                    onPress={() => setTextOnlyInput('Slice of pepperoni pizza')}
                                >
                                    <Text style={styles.exampleText}>🍕 Pizza slice</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Buttons */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={() => { setTextOnlyInput(''); setStep('select'); }}
                                >
                                    <Text style={styles.skipText}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.continueButton,
                                        !textOnlyInput.trim() && styles.continueButtonDisabled
                                    ]}
                                    onPress={processTextOnly}
                                    disabled={!textOnlyInput.trim()}
                                >
                                    <Text style={styles.continueText}>Analyze</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                );

            case 'analyzing':
                return (
                    <View style={styles.analyzingWrapper}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.textAnalyzingIcon}>
                                <Text style={{ fontSize: 48 }}>🔍</Text>
                            </View>
                        )}
                        <View style={styles.analyzingContainer}>
                            <ActivityIndicator size="large" color={looviColors.coralOrange} />
                            <Text style={styles.analyzingText}>Analyzing food...</Text>
                            <Text style={styles.analyzingHint}>
                                {imageUri ? 'Detecting nutritional content' : 'Estimating from your description'}
                            </Text>
                        </View>
                    </View>
                );

            case 'result':
                const healthColor = result ? getHealthScoreColor(result.healthScore) : looviColors.accent.success;
                return (
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.resultScroll}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.textResultIcon}>
                                <Text style={{ fontSize: 40 }}>🍽️</Text>
                            </View>
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
                                        minimumTrackTintColor={looviColors.coralOrange}
                                        maximumTrackTintColor="rgba(0,0,0,0.1)"
                                        thumbTintColor={looviColors.coralOrange}
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
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalCard}>
                                {/* Close Button */}
                                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                                    <Feather name="x" size={20} color={looviColors.text.secondary} />
                                </TouchableOpacity>

                                {renderContent()}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        maxHeight: '90%',
        width: '100%',
        maxWidth: 420,
        overflow: 'hidden',
    },
    describeContainer: {
        // Container for describe step
    },
    closeButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeText: {
        fontSize: 20,
        color: looviColors.text.primary,
    },
    selectScrollView: {
        padding: spacing.xl,
        paddingTop: spacing.xl + 8,
    },
    headerIconContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    headerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(232, 168, 124, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIconEmoji: {
        fontSize: 40,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        marginBottom: spacing.lg,
        textAlign: 'center',
        lineHeight: 22,
    },
    quickGuide: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    guideStep: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    guideStepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: looviColors.coralOrange,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    guideStepNumberText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    guideStepText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.secondary,
        flex: 1,
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    optionButton: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    optionIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(232, 168, 124, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    optionEmoji: {
        fontSize: 28,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: 2,
    },
    optionHint: {
        fontSize: 11,
        fontWeight: '400',
        color: looviColors.text.muted,
    },
    // Text input option (in select step)
    textInputOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    textInputOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(232, 168, 124, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    textInputOptionContent: {
        flex: 1,
    },
    textInputOptionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: 2,
    },
    textInputOptionHint: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.muted,
    },
    // Text-only input step
    textInputContainer: {
        flex: 1,
        padding: spacing.xl,
        paddingTop: spacing.xl + 8,
    },
    textInputHeader: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    textInputIconLarge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(232, 168, 124, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    textOnlyInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        fontSize: 15,
        color: looviColors.text.primary,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
        marginBottom: spacing.md,
    },
    examplesContainer: {
        marginBottom: spacing.lg,
    },
    examplesTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: looviColors.text.muted,
        marginBottom: spacing.sm,
    },
    exampleChip: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xs,
    },
    exampleText: {
        fontSize: 13,
        color: looviColors.text.secondary,
    },
    continueButtonDisabled: {
        opacity: 0.5,
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
        height: 160,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
    },
    stepTitle: {
        fontSize: 18,
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
        minHeight: 70,
        textAlignVertical: 'top',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
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
        backgroundColor: looviColors.coralOrange,
    },
    continueText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    analyzingWrapper: {
        padding: spacing.xl,
        paddingTop: spacing['3xl'],
        alignItems: 'center',
    },
    textAnalyzingIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        marginBottom: spacing.md,
    },
    textResultIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(232, 168, 124, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: spacing.md,
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
        color: looviColors.text.muted,
        marginTop: spacing.xs,
    },
    resultScroll: {
        maxHeight: '100%',
        padding: spacing.xl,
        paddingTop: spacing.xl + 8,
    },
    resultContainer: {
        alignItems: 'center',
    },
    foodName: {
        fontSize: 20,
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
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: looviColors.coralOrange,
        paddingBottom: spacing.xs,
        marginBottom: spacing.md,
    },
    healthScoreBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
    },
    healthScoreValue: {
        fontSize: 32,
        fontWeight: '800',
    },
    healthScoreLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.secondary,
        marginLeft: spacing.xs,
    },
    portionSection: {
        width: '100%',
        marginBottom: spacing.md,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: spacing.xs,
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
        color: looviColors.text.muted,
    },
    portionMarkerActive: {
        color: looviColors.coralOrange,
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
        marginBottom: spacing.md,
    },
    macroItem: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        minWidth: 65,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    macroValue: {
        fontSize: 15,
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    macroLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: looviColors.text.muted,
        marginTop: 2,
    },
    suggestion: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: spacing.md,
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
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
        backgroundColor: looviColors.coralOrange,
    },
    saveText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Recently scanned foods styles
    recentSection: {
        marginTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.06)',
        paddingTop: spacing.md,
    },
    recentTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: looviColors.text.secondary,
        marginBottom: spacing.sm,
    },
    recentList: {
        gap: spacing.xs,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.md,
    },
    recentInfo: {
        flex: 1,
    },
    recentName: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginBottom: 2,
    },
    recentMacros: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.muted,
    },
    recentAddIcon: {
        fontSize: 20,
        fontWeight: '600',
        color: looviColors.coralOrange,
        paddingHorizontal: spacing.sm,
    },
    // Pinned foods styles
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    pinnedTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: looviColors.coralOrange,
    },
    recentItemWithPin: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
    },
    recentItemMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingLeft: spacing.md,
    },
    pinButton: {
        padding: spacing.sm,
        paddingRight: spacing.md,
    },
    pinIcon: {
        fontSize: 16,
        opacity: 0.4,
    },
    pinIconActive: {
        fontSize: 16,
    },
});
