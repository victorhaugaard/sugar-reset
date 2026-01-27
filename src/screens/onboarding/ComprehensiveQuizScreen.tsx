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
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import LooviBackground, { looviColors } from '../../components/LooviBackground';
import { GlassCard } from '../../components/GlassCard';
import { useUserData } from '../../context/UserDataContext';
import { PlanBuildingAnimation } from '../../components/PlanBuildingAnimation';

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
            title: 'Has your sugar consumption grown over time?',
            options: [
                { id: 'yes', emoji: '📈', label: 'Yes' },
                { id: 'fluctuates', emoji: '📊', label: 'It varies' },
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
            title: "How does your mood change when you don't eat sugar?",
            options: [
                { id: 'worse', emoji: '😞', label: 'It becomes worse' },
                { id: 'same', emoji: '😐', label: 'It stays the same' },
                { id: 'better', emoji: '😊', label: 'It becomes better' },
            ],
        },
        {
            id: 'monthlySpending',
            type: 'single',
            emoji: '💵',
            title: 'How much do you spend on sugary products each month?',
            options: [
                { id: '0-10', emoji: '💚', label: '$0 - $10 per month' },
                { id: '10-50', emoji: '💛', label: '$10 - $50 per month' },
                { id: '50-100', emoji: '🧡', label: '$50 - $100 per month' },
                { id: '100+', emoji: '❤️', label: '$100+ per month' },
            ],
        },
        {
            id: 'reasons',
            type: 'triggers', // Using triggers type for multi-select
            emoji: '🎯',
            title: 'Why are you reducing your sugar intake?',
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
    const [isCalculating, setIsCalculating] = useState(false);

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
        console.log('goNext called, currentQuestion:', currentQuestion, 'QUESTIONS.length:', QUESTIONS.length);
        Keyboard.dismiss();
        
        if (currentQuestion < QUESTIONS.length - 1) {
            animateTransition(() => setCurrentQuestion(prev => prev + 1));
        } else {
            console.log('Final question reached, checking canProceed...');
            if (canProceed()) {
                console.log('Proceeding to calculate results...');
                saveAnswers().catch(err => console.error('Error saving answers:', err));
                setIsCalculating(true);
            } else {
                console.log('canProceed returned false');
            }
        }
    };

    const handleAnimationComplete = () => {
        setIsCalculating(false);
        showResultScreen();
    };

    const saveAnswers = async () => {
        // Calculate sugar dependency score
        const frequencyMap: Record<string, number> = { rarely: 1, weekly: 2, daily: 3, multiple: 4 };
        const frequencyScore = frequencyMap[answers.frequency as string] || 0;
        
        const hardScore = parseInt(answers.hardToGoWithout) || 0;
        
        const shiftScore = answers.consumptionShift === 'yes' ? 2 : answers.consumptionShift === 'fluctuates' ? 1 : 0;
        
        const moodScore = answers.moodDifference === 'worse' ? 2 : answers.moodDifference === 'same' ? 1 : 0;
        
        const spendingMap: Record<string, number> = { 
            '0-10': 0, 
            '10-50': 1, 
            '50-100': 2, 
            '100+': 3 
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

    // Extract primary motivation/trigger for emotional bridge
    const getPrimaryMotivation = (): string => {
        // Priority 1: Check reasons (more specific motivations)
        const reasons = answers.reasons || [];
        if (reasons.length > 0) {
            const reasonMap: Record<string, string> = {
                'energy': 'energy crashes',
                'weight': 'weight struggles',
                'health': 'health concerns',
                'balance': 'mood swings',
                'beauty': 'skin issues',
                'dependence': 'sugar cravings',
            };
            // Return the first reason found, or a default
            for (const reason of reasons) {
                if (reasonMap[reason]) {
                    return reasonMap[reason];
                }
            }
        }

        // Priority 2: Check triggers
        const triggers = answers.triggers || [];
        if (triggers.length > 0) {
            const triggerMap: Record<string, string> = {
                'stress': 'stress eating',
                'tired': 'energy crashes',
                'emotional': 'emotional eating',
                'boredom': 'boredom snacking',
            };
            for (const trigger of triggers) {
                if (triggerMap[trigger]) {
                    return triggerMap[trigger];
                }
            }
        }

        // Default fallback
        return 'sugar cravings';
    };

    // Calculate result
    const getResultMessage = () => {
        const frequencyMap2: Record<string, number> = { rarely: 1, weekly: 2, daily: 3, multiple: 4 };
        const frequencyScore = frequencyMap2[answers.frequency as string] || 0;
        const hardScore = parseInt(answers.hardToGoWithout) || 0;
        
        const shiftScore = answers.consumptionShift === 'yes' ? 2 : answers.consumptionShift === 'fluctuates' ? 1 : 0;
        const moodScore = answers.moodDifference === 'worse' ? 2 : answers.moodDifference === 'same' ? 1 : 0;
        
        const spendingMap: Record<string, number> = { 
            '0-10': 0, 
            '10-50': 1, 
            '50-100': 2, 
            '100+': 3 
        };
        const spendingScore = spendingMap[answers.monthlySpending as string] || 0;

        const totalScore = frequencyScore + hardScore + shiftScore + moodScore + spendingScore;
        const maxScore = 15;
        const rawPercentage = Math.round((totalScore / maxScore) * 100);

        // Determine dependency level
        let dependencyLevel = 'Significant';
        if (rawPercentage >= 60) {
            dependencyLevel = 'High';
        } else if (rawPercentage < 35) {
            dependencyLevel = 'Low';
        }

        const adjustedPercentage = (() => {
            // Low dependency: map to 15-25% range
            if (rawPercentage < 35) {
                const scaled = 15 + (rawPercentage / 34) * 10;
                return Math.round(Math.min(25, Math.max(15, scaled)));
            }

            const scaled = 55 + ((rawPercentage - 35) / 65) * 45;
            return Math.round(Math.min(100, Math.max(55, scaled)));
        })();

        return {
            score: adjustedPercentage,
            dependencyLevel,
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
        const average = 34;
        const userScore = Math.max(result.score, 20); // Ensure minimum visibility
        const userPosition = Math.min(userScore, 95); // Cap at 95% to keep marker visible

        return (
            <LooviBackground variant="mixed">
                <SafeAreaView style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.resultScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View
                            style={[
                                styles.resultContainer,
                                {
                                    opacity: resultFade,
                                    transform: [{ scale: resultScale }],
                                },
                            ]}
                        >
                            {/* Headline */}
                            <Text style={styles.resultHeadline}>The results are in.</Text>

                            {/* Verdict */}
                            <View style={styles.resultVerdictContainer}>
                                <Text style={styles.resultVerdict}>
                                    Your profile indicates
                                </Text>
                                <Text style={styles.resultVerdictBold}>
                                    {result.dependencyLevel} Sugar Dependency
                                </Text>
                            </View>

                            {/* Habit Spectrum Card */}
                            <GlassCard variant="light" padding="lg" style={styles.spectrumCard}>
                                <Text style={styles.spectrumTitle}>Habit Spectrum</Text>
                                
                                {/* Spectrum Container */}
                                <View style={styles.spectrumContainer}>
                                    {/* The Spectrum Track */}
                                    <View style={styles.spectrumTrackContainer}>
                                        <LinearGradient
                                            colors={[looviColors.skyBlue, looviColors.coralOrange]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.spectrumTrack}
                                        />
                                        
                                        {/* Average Marker - line extends from bar to label */}
                                        <View style={[styles.markerWithLine, { left: `${average}%` }]}>
                                            <View style={styles.markerLineExtended} />
                                            <Text style={styles.smallMarkerLabel}>Average</Text>
                                            <Text style={styles.smallMarkerScore}>{average}%</Text>
                                        </View>

                                        {/* User Marker - emoji on bar with line and label below */}
                                        <View style={[styles.userMarkerWithLine, { left: `${userPosition}%` }]}>
                                            <View style={styles.userMarkerCircle}>
                                                <Text style={styles.userMarkerEmoji}>
                                                    {answers.gender === 'male' ? '👨' : answers.gender === 'female' ? '👩' : '👤'}
                                                </Text>
                                            </View>
                                            <Text style={styles.userMarkerLabel}>You</Text>
                                            <Text style={styles.userMarkerScore}>{result.score}%</Text>
                                        </View>
                                    </View>

                                    {/* Score Comparison */}
                                    <View style={styles.scoreComparison}>
                                        <Text style={styles.scoreComparisonText}>
                                            You scored <Text style={styles.scoreComparisonBold}>{result.score}%</Text>, 
                                            {' '}significantly higher than the average of <Text style={styles.scoreComparisonBold}>{average}%</Text>.
                                        </Text>
                                    </View>
                                </View>
                            </GlassCard>

                            {/* Emotional Bridge */}
                            <View style={styles.emotionalBridge}>
                                <Text style={styles.emotionalBridgeText}>
                                    This dependency strains your body and worsens mental health issues.
                                </Text>
                            </View>

                            {/* CTA Button */}
                            <TouchableOpacity
                                style={styles.checkSymptomsButton}
                                onPress={handleContinue}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.checkSymptomsButtonText}>
                                    Discover how this affects you →
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </SafeAreaView>
            </LooviBackground>
        );
    }

    return (
        <LooviBackground variant="coralTop">
            {!isCalculating && (
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
            )}
            
            {/* Transition Animation */}
            {isCalculating && (
                <PlanBuildingAnimation 
                    answers={answers} 
                    onComplete={handleAnimationComplete} 
                />
            )}
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
    resultScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: spacing['2xl'],
    },
    resultContainer: {
        paddingHorizontal: spacing.screen.horizontal,
    },
    resultHeadline: {
        fontSize: 28,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    resultVerdictContainer: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    resultVerdict: {
        fontSize: 16,
        fontWeight: '400',
        color: looviColors.text.primary,
        textAlign: 'center',
        lineHeight: 24,
    },
    resultVerdictBold: {
        fontSize: 24,
        fontWeight: '700',
        color: looviColors.accent.primary,
        textAlign: 'center',
    },
    spectrumCard: {
        marginBottom: spacing['2xl'],
        paddingHorizontal: spacing.md,
    },
    spectrumTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    spectrumContainer: {
        width: '100%',
    },
    spectrumTrackContainer: {
        width: '100%',
        marginBottom: spacing.xs,
        position: 'relative',
        paddingHorizontal: spacing.xs,
        paddingBottom: 60, // Space for labels below bar
    },
    spectrumTrack: {
        width: '100%',
        height: 28,
        borderRadius: borderRadius.lg,
        position: 'relative',
        zIndex: 1,
    },
    markerWithLine: {
        position: 'absolute',
        top: 10, // Start at middle of bar (bar is 28px, so 14 is middle, 10 gives slight overlap)
        alignItems: 'center',
        transform: [{ translateX: -20 }],
        zIndex: 5,
    },
    markerLineExtended: {
        width: 2,
        height: 24, // Extends from middle of bar down past it
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 1,
        marginBottom: 4,
    },
    smallMarkerLabel: {
        fontSize: 9,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    smallMarkerScore: {
        fontSize: 9,
        fontWeight: '600',
        color: looviColors.text.secondary,
    },
    userMarkerWithLine: {
        position: 'absolute',
        top: -6, // Position emoji above the bar
        alignItems: 'center',
        transform: [{ translateX: -20 }],
        zIndex: 10,
    },
    userMarkerCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: looviColors.accent.primary,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 4,
    },
    userMarkerEmoji: {
        fontSize: 20,
    },
    userMarkerLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: looviColors.accent.primary,
    },
    userMarkerScore: {
        fontSize: 12,
        fontWeight: '700',
        color: looviColors.accent.primary,
    },
    scoreComparison: {
        marginTop: spacing.xs,
        paddingHorizontal: spacing.md,
    },
    scoreComparisonText: {
        fontSize: 16,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    scoreComparisonBold: {
        fontWeight: '700',
        color: looviColors.text.primary,
    },
    emotionalBridge: {
        marginBottom: spacing['2xl'],
        paddingHorizontal: spacing.md,
    },
    emotionalBridgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: looviColors.text.primary,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 18,
        textShadowColor: looviColors.accent.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    checkSymptomsButton: {
        backgroundColor: looviColors.accent.primary,
        paddingVertical: 18,
        paddingHorizontal: spacing.xl,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: looviColors.coralOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 5,
        marginTop: spacing.md,
    },
    checkSymptomsButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    userInfoContainer: {
        paddingHorizontal: spacing.md,
        gap: spacing.xl,
        marginTop: spacing['2xl'],
    },
    inputGroup: {
        gap: spacing.sm,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: looviColors.text.primary,
        textAlign: 'center',
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
