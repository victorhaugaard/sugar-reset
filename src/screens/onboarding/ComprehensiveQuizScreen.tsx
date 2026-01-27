/**
 * ComprehensiveQuizScreen
 * 
 * Consolidated quiz with sophisticated questions to identify
 * sugar habits and personalize the user experience.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { spacing, borderRadius } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';
import { useUserData } from '../../context/UserDataContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ComprehensiveQuizScreenProps = {
    navigation: NativeStackNavigationProp<any, 'ComprehensiveQuiz'>;
    route: {
        params?: {
            skip?: boolean;
        };
    };
};

// Question types
type QuestionType = 'single' | 'scale' | 'multi' | 'slider' | 'text' | 'triggers' | 'userInfo';

interface QuestionOption {
    id: string;
    emoji: string;
    label: string;
    description?: string;
    femaleOnly?: boolean;
    isOther?: boolean;
}

interface Question {
    id: string;
    type: QuestionType;
    emoji: string;
    title: string;
    subtitle?: string;
    options?: QuestionOption[];
    sliderConfig?: {
        min: number;
        max: number;
        step: number;
        unit: string;
        references?: { value: number; label: string }[];
    };
    helpText?: string;
}

// Helper function to get questions based on gender
const getQuestions = (gender: string | null): Question[] => {
    const baseQuestions: Question[] = [
        {
            id: 'gender',
            type: 'single',
            emoji: '👤',
            title: "What's your gender?",
            subtitle: 'This helps us personalize recommendations',
            options: [
                { id: 'male', emoji: '👨', label: 'Male' },
                { id: 'female', emoji: '👩', label: 'Female' },
                { id: 'other', emoji: '🙂', label: 'Prefer not to say' },
            ],
        },
        {
            id: 'frequency',
            type: 'single',
            emoji: '📅',
            title: 'How often do you consume added sugar?',
            subtitle: 'Including sweets, soda, sweetened coffee, desserts...',
            options: [
                { id: 'rarely', emoji: '🌱', label: 'Rarely', description: 'Few times a month' },
                { id: 'weekly', emoji: '📆', label: 'Few times a week', description: 'Not every day' },
                { id: 'daily', emoji: '🔄', label: 'Daily', description: 'Once or twice a day' },
                { id: 'multiple', emoji: '🌊', label: 'Multiple times daily', description: 'Throughout the day' },
            ],
        },
        {
            id: 'consumptionShift',
            type: 'single',
            emoji: '📈',
            title: 'Have you noticed a shift towards a higher or more frequent consumption of sugar?',
            options: [
                { id: 'yes', emoji: '📈', label: 'Yes' },
                { id: 'no', emoji: '📉', label: 'No' },
            ],
        },
        {
            id: 'hardToGoWithout',
            type: 'scale',
            emoji: '💪',
            title: 'Do you find it hard to go a day without sugar?',
            options: [
                { id: '1', emoji: '🟢', label: 'Never', description: 'No problem at all' },
                { id: '2', emoji: '🟡', label: 'Sometimes', description: 'Depends on the day' },
                { id: '3', emoji: '🟠', label: 'Often', description: 'Most days are hard' },
                { id: '4', emoji: '🔴', label: 'Always', description: 'Can\'t imagine it' },
            ],
        },
        {
            id: 'triggers',
            type: 'triggers',
            emoji: '🎯',
            title: 'What triggers your sugar cravings?',
            subtitle: 'Select all that apply',
            options: [
                { id: 'stress', emoji: '😰', label: 'Stress or anxiety' },
                { id: 'boredom', emoji: '😐', label: 'Boredom' },
                { id: 'tired', emoji: '😴', label: 'Feeling tired' },
                { id: 'emotional', emoji: '😢', label: 'Emotional moments' },
                { id: 'social', emoji: '👥', label: 'Social situations' },
                { id: 'reward', emoji: '🏆', label: 'Rewarding myself' },
                { id: 'habit', emoji: '🔄', label: 'Just a habit' },
                { id: 'menstrual', emoji: '🌙', label: 'Menstrual cycle', femaleOnly: true },
            ],
        },
        {
            id: 'moodDifference',
            type: 'single',
            emoji: '🎭',
            title: 'Do you notice differences in your mood when you consume a lot of sugar, or when you’ve had no sugar at all?',
            options: [
                { id: 'yes', emoji: '🎭', label: 'Yes' },
                { id: 'alittle', emoji: '🤔', label: 'A little' },
                { id: 'no', emoji: '😐', label: 'No' },
            ],
        },
        {
            id: 'monthlySpending',
            type: 'single',
            emoji: '💵',
            title: 'How much do you spend on sugary products each month?',
            options: [
                { id: '0-10', emoji: '💚', label: '0 - $10 per month' },
                { id: '20-30', emoji: '💛', label: '$20 - $30 per month' },
                { id: '30-60', emoji: '🧡', label: '$30 - $60 per month' },
                { id: '60-100', emoji: '❤️', label: '$60 - $100 per month' },
                { id: '100+', emoji: '💔', label: '$100+ per month' },
            ],
        },
        {
            id: 'reasons',
            type: 'triggers', // Using triggers type for multi-select
            emoji: '🎯',
            title: 'What are your primary reasons to reduce your sugar intake?',
            subtitle: 'Select all that apply',
            options: [
                { id: 'dependence', emoji: '⛓️', label: 'Reducing sugar dependence' },
                { id: 'weight', emoji: '⚖️', label: 'Supporting weight loss' },
                { id: 'health', emoji: '🏥', label: 'Improving overall health' },
                { id: 'balance', emoji: '🧠', label: 'Mental and emotional balance' },
                { id: 'beauty', emoji: '✨', label: 'Healthier skin and hair' },
                { id: 'energy', emoji: '⚡', label: 'Sustained daily energy' },
                { id: 'other', emoji: '📝', label: 'Other: specify', isOther: true },
            ],
        },
        {
            id: 'userInfo',
            type: 'userInfo',
            emoji: '👤',
            title: 'A little more about you',
            subtitle: 'This helps us calculate your plan accurately',
        },
    ];

    return baseQuestions;
};

export default function ComprehensiveQuizScreen({ navigation, route }: ComprehensiveQuizScreenProps) {
    const { updateOnboardingData } = useUserData();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // Answers state
    const [answers, setAnswers] = useState<Record<string, any>>({
        gender: null,
        frequency: null,
        consumptionShift: null,
        hardToGoWithout: null,
        triggers: [],
        intake: 50,
        moodDifference: null,
        monthlySpending: null,
        reasons: [],
        otherReason: '',
        nickname: '',
        age: '',
    });

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const resultFade = useRef(new Animated.Value(0)).current;
    const resultScale = useRef(new Animated.Value(0.8)).current;

    // Handle skip from params
    useEffect(() => {
        if (route.params?.skip) {
            // Find the index of Question 9 (userInfo)
            const QUESTIONS = getQuestions(answers.gender);
            const userInfoIndex = QUESTIONS.findIndex(q => q.id === 'userInfo');
            if (userInfoIndex !== -1) {
                setCurrentQuestion(userInfoIndex);
            }
        }
    }, [route.params?.skip]);

    const QUESTIONS = getQuestions(answers.gender);
    const question = QUESTIONS[currentQuestion];
    const progress = (currentQuestion + 1) / QUESTIONS.length;

    const animateTransition = (callback: () => void) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            callback();
            slideAnim.setValue(30);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        });
    };

    const handleSingleSelect = (optionId: string) => {
        setAnswers(prev => ({ ...prev, [question.id]: optionId }));
        setTimeout(() => goNext(), 300);
    };

    const handleMultiSelect = (optionId: string, fieldId: string) => {
        setAnswers(prev => {
            const current = prev[fieldId] || [];
            if (current.includes(optionId)) {
                return { ...prev, [fieldId]: current.filter((id: string) => id !== optionId) };
            }
            return { ...prev, [fieldId]: [...current, optionId] };
        });
    };

    const handleOtherReasonChange = (text: string) => {
        setAnswers(prev => ({ ...prev, otherReason: text }));
    };

    const handleUserInfoChange = (field: 'nickname' | 'age', text: string) => {
        setAnswers(prev => ({ ...prev, [field]: text }));
    };

    const handleSliderChange = (value: number) => {
        setAnswers(prev => ({ ...prev, intake: Math.round(value) }));
    };

    const canProceed = () => {
        const answer = answers[question.id];
        if (question.type === 'userInfo') {
            return answers.nickname.trim().length > 0 && answers.age.trim().length > 0;
        }
        if (question.type === 'text') return answer && answer.trim().length > 0;
        if (question.type === 'multi' || question.type === 'triggers') {
            const hasSelection = answer && answer.length > 0;
            if (answer?.includes('other')) {
                return hasSelection && answers.otherReason.trim().length > 0;
            }
            return hasSelection;
        }
        if (question.type === 'slider') return true;
        return answer !== null;
    };

    const goNext = () => {
        if (currentQuestion < QUESTIONS.length - 1) {
            animateTransition(() => setCurrentQuestion(prev => prev + 1));
        } else {
            // Save all data and show result
            saveAnswers();
            showResultScreen();
        }
    };

    const saveAnswers = async () => {
        // Calculate sugar dependency score
        const frequencyMap: Record<string, number> = { rarely: 1, weekly: 2, daily: 3, multiple: 4 };
        const frequencyScore = frequencyMap[answers.frequency as string] || 0;
        
        const hardScore = parseInt(answers.hardToGoWithout) || 0;
        
        const shiftScore = answers.consumptionShift === 'yes' ? 2 : 0;
        
        const moodScore = answers.moodDifference === 'yes' ? 2 : answers.moodDifference === 'alittle' ? 1 : 0;
        
        const spendingMap: Record<string, number> = { 
            '0-10': 0, 
            '20-30': 1, 
            '30-60': 2, 
            '60-100': 3, 
            '100+': 4 
        };
        const spendingScore = spendingMap[answers.monthlySpending as string] || 0;

        const sugarDependencyScore = frequencyScore + hardScore + shiftScore + moodScore + spendingScore;

        await updateOnboardingData({
            gender: answers.gender,
            sugarFrequency: answers.frequency,
            consumptionShift: answers.consumptionShift,
            dailySugarGrams: answers.intake,
            hardToGoWithout: parseInt(answers.hardToGoWithout) || 0,
            triggers: answers.triggers,
            moodDifference: answers.moodDifference,
            monthlySpending: answers.monthlySpending,
            reasons: answers.reasons,
            otherReason: answers.otherReason,
            nickname: answers.nickname,
            age: answers.age,
            sugarDependencyScore,
        });
    };

    const showResultScreen = () => {
        setShowResult(true);
        Animated.parallel([
            Animated.timing(resultFade, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(resultScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();
    };

    const handleContinue = () => {
        navigation.navigate('SugarDangers');
    };

    // Calculate result
    const getResultMessage = () => {
        const frequencyMap2: Record<string, number> = { rarely: 1, weekly: 2, daily: 3, multiple: 4 };
        const frequencyScore = frequencyMap2[answers.frequency as string] || 0;
        const hardScore = parseInt(answers.hardToGoWithout) || 0;
        
        const shiftScore = answers.consumptionShift === 'yes' ? 2 : 0;
        const moodScore = answers.moodDifference === 'yes' ? 2 : answers.moodDifference === 'alittle' ? 1 : 0;
        
        const spendingMap: Record<string, number> = { 
            '0-10': 0, 
            '20-30': 1, 
            '30-60': 2, 
            '60-100': 3, 
            '100+': 4 
        };
        const spendingScore = spendingMap[answers.monthlySpending as string] || 0;

        const totalScore = frequencyScore + hardScore + shiftScore + moodScore + spendingScore;
        const maxScore = 16;
        const percentage = Math.round((totalScore / maxScore) * 100);

        if (percentage >= 60) {
            return {
                emoji: '💪',
                title: 'Perfect Match!',
                text: `Based on your answers, Sugarest is exactly what you need. We'll help you break free from sugar dependency.`,
                score: percentage,
            };
        } else if (percentage >= 35) {
            return {
                emoji: '✨',
                title: 'Great Match!',
                text: `You have some sugar habits worth addressing. Sugarest can help you build healthier patterns.`,
                score: percentage,
            };
        }
        return {
            emoji: '🌱',
            title: 'Good Match!',
            text: `You're in a good place! Sugarest will help you maintain healthy habits and prevent sugar issues.`,
            score: percentage,
        };
    };

    // Filter options for triggers question based on gender
    const getFilteredOptions = () => {
        if (!question.options) return [];
        if (question.id === 'triggers' && answers.gender !== 'female') {
            return question.options.filter(opt => !opt.femaleOnly);
        }
        return question.options;
    };

    const renderQuestion = () => {
        const filteredOptions = getFilteredOptions();

        switch (question.type) {
            case 'single':
            case 'scale':
                return (
                    <View style={styles.optionsContainer}>
                        {filteredOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionCard,
                                    answers[question.id] === option.id && styles.optionCardSelected,
                                ]}
                                onPress={() => handleSingleSelect(option.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                                <View style={styles.optionTextContainer}>
                                    <Text style={[
                                        styles.optionLabel,
                                        answers[question.id] === option.id && styles.optionLabelSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {option.description && (
                                        <Text style={styles.optionDescription}>{option.description}</Text>
                                    )}
                                </View>
                                {answers[question.id] === option.id && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 'multi':
                return (
                    <View style={styles.singleColumnContainer}>
                        {filteredOptions.map((option) => {
                            const isSelected = answers[question.id]?.includes(option.id);
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.singleRowOptionCard,
                                        isSelected && styles.singleRowOptionCardSelected,
                                    ]}
                                    onPress={() => handleMultiSelect(option.id, question.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.singleRowEmoji}>{option.emoji}</Text>
                                    <Text style={[
                                        styles.singleRowLabel,
                                        isSelected && styles.singleRowLabelSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.singleRowCheckmark}>
                                            <Text style={styles.singleRowCheckmarkText}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );

            case 'triggers':
                return (
                    <View style={styles.singleColumnContainer}>
                        {filteredOptions.map((option) => {
                            const isSelected = answers[question.id]?.includes(option.id);
                            return (
                                <View key={option.id}>
                                    <TouchableOpacity
                                        style={[
                                            styles.singleRowOptionCard,
                                            isSelected && styles.singleRowOptionCardSelected,
                                        ]}
                                        onPress={() => handleMultiSelect(option.id, question.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.singleRowEmoji}>{option.emoji}</Text>
                                        <Text style={[
                                            styles.singleRowLabel,
                                            isSelected && styles.singleRowLabelSelected,
                                        ]}>
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <View style={styles.singleRowCheckmark}>
                                                <Text style={styles.singleRowCheckmarkText}>✓</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    
                                    {option.isOther && isSelected && (
                                        <View style={styles.otherInputContainer}>
                                            <TextInput
                                                style={styles.otherInput}
                                                placeholder="Please specify..."
                                                placeholderTextColor={looviColors.text.muted}
                                                value={answers.otherReason}
                                                onChangeText={handleOtherReasonChange}
                                                autoFocus
                                            />
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                );

            case 'slider':
                return (
                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderValueContainer}>
                            <Text style={styles.sliderValue}>
                                {answers.intake >= 150 ? '150+' : answers.intake}g
                            </Text>
                            <Text style={styles.sliderValueLabel}>per day</Text>
                        </View>

                        {/* Help Text */}
                        {question.helpText && (
                            <View style={styles.helpTextContainer}>
                                <Text style={styles.helpText}>{question.helpText}</Text>
                            </View>
                        )}

                        <Slider
                            style={styles.slider}
                            minimumValue={question.sliderConfig?.min || 0}
                            maximumValue={question.sliderConfig?.max || 150}
                            step={question.sliderConfig?.step || 5}
                            value={answers.intake}
                            onValueChange={handleSliderChange}
                            minimumTrackTintColor={looviColors.accent.primary}
                            maximumTrackTintColor="rgba(0,0,0,0.1)"
                            thumbTintColor={looviColors.accent.primary}
                        />
                        <View style={styles.sliderReferences}>
                            {question.sliderConfig?.references?.map((ref, i) => (
                                <View key={i} style={styles.sliderReference}>
                                    <View style={[
                                        styles.sliderReferenceDot,
                                        answers.intake >= ref.value && styles.sliderReferenceDotActive,
                                    ]} />
                                    <Text style={styles.sliderReferenceLabel}>{ref.label}</Text>
                                    <Text style={styles.sliderReferenceValue}>{ref.value}g</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'text':
                return (
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your name..."
                            placeholderTextColor={looviColors.text.muted}
                            value={answers.nickname}
                            onChangeText={(text) => handleUserInfoChange('nickname', text)}
                            autoCapitalize="words"
                            maxLength={20}
                        />
                    </View>
                );

            case 'userInfo':
                return (
                    <View style={styles.userInfoContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>What should we call you?</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Your name"
                                placeholderTextColor={looviColors.text.muted}
                                value={answers.nickname}
                                onChangeText={(text) => handleUserInfoChange('nickname', text)}
                                autoCapitalize="words"
                                maxLength={20}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>How old are you?</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Your age"
                                placeholderTextColor={looviColors.text.muted}
                                value={answers.age}
                                onChangeText={(text) => handleUserInfoChange('age', text.replace(/[^0-9]/g, ''))}
                                keyboardType="number-pad"
                                maxLength={3}
                            />
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    if (showResult) {
        const result = getResultMessage();
        return (
            <LooviBackground variant="mixed">
                <SafeAreaView style={styles.container}>
                    <Animated.View
                        style={[
                            styles.resultContainer,
                            {
                                opacity: resultFade,
                                transform: [{ scale: resultScale }],
                            },
                        ]}
                    >
                        <GlassCard variant="light" padding="lg" style={styles.resultCard}>
                            <Text style={styles.resultEmoji}>{result.emoji}</Text>
                            <Text style={styles.resultTitle}>{result.title}</Text>
                            <Text style={styles.resultText}>{result.text}</Text>

                            {/* Stats Summary */}
                            <View style={styles.resultStats}>
                                <View style={styles.resultStatItem}>
                                    <Text style={styles.resultStatValue}>
                                        {answers.intake >= 150 ? '150+' : answers.intake}g
                                    </Text>
                                    <Text style={styles.resultStatLabel}>Daily intake</Text>
                                </View>
                                <View style={styles.resultStatDivider} />
                                <View style={styles.resultStatItem}>
                                    <Text style={styles.resultStatValue}>{answers.reasons?.length || 0}</Text>
                                    <Text style={styles.resultStatLabel}>Reasons set</Text>
                                </View>
                                <View style={styles.resultStatDivider} />
                                <View style={styles.resultStatItem}>
                                    <Text style={styles.resultStatValue}>{result.score}%</Text>
                                    <Text style={styles.resultStatLabel}>Match</Text>
                                </View>
                            </View>
                        </GlassCard>

                        <Text style={styles.resultGreeting}>
                            Hi {answers.nickname}! 👋
                        </Text>

                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleContinue}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.continueButtonText}>
                                Learn About Sugar →
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </SafeAreaView>
            </LooviBackground>
        );
    }

    return (
        <LooviBackground variant="coralTop">
            <SafeAreaView style={styles.container}>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        Question {currentQuestion + 1} of {QUESTIONS.length}
                    </Text>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.questionContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Question Header */}
                        <View style={styles.questionHeader}>
                            <Text style={styles.questionEmoji}>{question.emoji}</Text>
                            <Text style={styles.questionTitle}>{question.title}</Text>
                            {question.subtitle && (
                                <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
                            )}
                        </View>

                        {/* Question Content */}
                        {renderQuestion()}
                    </Animated.View>
                </ScrollView>

                {/* Continue Button (for multi-select, slider, text, triggers, userInfo) */}
                {(question.type === 'multi' || question.type === 'slider' || question.type === 'text' || question.type === 'triggers' || question.type === 'userInfo') && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                !canProceed() && styles.continueButtonDisabled,
                            ]}
                            onPress={goNext}
                            disabled={!canProceed()}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.continueButtonText}>
                                {currentQuestion < QUESTIONS.length - 1 ? 'Continue' : 'See Results'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </LooviBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progressContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.lg,
    },
    progressTrack: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: looviColors.accent.primary,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    questionContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.xl,
    },
    questionHeader: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    questionEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    questionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    questionSubtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
    },
    optionsContainer: {
        gap: spacing.md,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCardSelected: {
        backgroundColor: 'rgba(217, 123, 102, 0.1)',
        borderColor: looviColors.accent.primary,
    },
    optionEmoji: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    optionLabelSelected: {
        color: looviColors.accent.primary,
    },
    optionDescription: {
        fontSize: 13,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: 2,
    },
    checkmark: {
        fontSize: 20,
        color: looviColors.accent.primary,
        fontWeight: '700',
    },
    // Single column (one per row) styles for goals and triggers
    singleColumnContainer: {
        gap: spacing.sm,
    },
    singleRowOptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    singleRowOptionCardSelected: {
        backgroundColor: 'rgba(217, 123, 102, 0.1)',
        borderColor: looviColors.accent.primary,
    },
    singleRowEmoji: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    singleRowLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    singleRowLabelSelected: {
        color: looviColors.accent.primary,
    },
    singleRowCheckmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: looviColors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    singleRowCheckmarkText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '700',
    },
    sliderContainer: {
        paddingHorizontal: spacing.md,
    },
    sliderValueContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sliderValue: {
        fontSize: 48,
        fontWeight: '700',
        color: looviColors.accent.primary,
    },
    sliderValueLabel: {
        fontSize: 16,
        fontWeight: '400',
        color: looviColors.text.secondary,
    },
    helpTextContainer: {
        backgroundColor: 'rgba(232, 168, 124, 0.15)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    helpText: {
        fontSize: 13,
        fontWeight: '500',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderReferences: {
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    sliderReference: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    sliderReferenceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    sliderReferenceDotActive: {
        backgroundColor: looviColors.accent.primary,
    },
    sliderReferenceLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: looviColors.text.secondary,
    },
    sliderReferenceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: looviColors.text.primary,
    },
    textInputContainer: {
        paddingHorizontal: spacing.md,
    },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        fontSize: 20,
        fontWeight: '600',
        color: looviColors.text.primary,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.screen.horizontal,
        paddingBottom: spacing.xl,
        paddingTop: spacing.md,
        backgroundColor: 'rgba(255,250,245,0.95)',
    },
    continueButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.coralOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 5,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    resultContainer: {
        flex: 1,
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing['2xl'],
        justifyContent: 'center',
    },
    resultCard: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    resultEmoji: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: spacing.md,
    },
    resultText: {
        fontSize: 16,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.md,
    },
    resultStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
    },
    resultStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    resultStatValue: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.accent.primary,
    },
    resultStatLabel: {
        fontSize: 11,
        fontWeight: '400',
        color: looviColors.text.tertiary,
        marginTop: spacing.xs,
    },
    resultStatDivider: {
        width: 1,
        height: 35,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    resultGreeting: {
        fontSize: 18,
        fontWeight: '600',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.md,
    },
    userInfoContainer: {
        paddingHorizontal: spacing.md,
        gap: spacing.xl,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
        marginLeft: spacing.xs,
    },
    otherInputContainer: {
        marginTop: spacing.xs,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    otherInput: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: 16,
        color: looviColors.text.primary,
        borderWidth: 2,
        borderColor: looviColors.accent.primary,
    },
});
