/**
 * ReasonsScreen
 * 
 * Tap anywhere to cycle through motivational reasons not to relapse.
 * Combines user's personal goals with universal benefits.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing } from '../theme';
import LooviBackground, { looviColors } from '../components/LooviBackground';
import { useUserData } from '../context/UserDataContext';

type ReasonsScreenProps = {
    navigation: NativeStackNavigationProp<any, 'Reasons'>;
};

// Universal benefits everyone experiences
const UNIVERSAL_REASONS = [
    {
        emoji: '🧠',
        title: 'Mental Clarity',
        reason: 'Your brain fog will lift. Clear thinking returns when you break free from sugar crashes.'
    },
    {
        emoji: '⚡',
        title: 'Stable Energy',
        reason: 'No more afternoon crashes. Your energy will be steady throughout the day.'
    },
    {
        emoji: '😴',
        title: 'Better Sleep',
        reason: 'Sugar disrupts sleep quality. You\'ll wake up more refreshed and rested.'
    },
    {
        emoji: '✨',
        title: 'Clearer Skin',
        reason: 'Sugar causes inflammation. Your skin will thank you within 2 weeks.'
    },
    {
        emoji: '💪',
        title: 'True Strength',
        reason: 'Every "no" makes you stronger. You\'re building willpower that applies everywhere.'
    },
    {
        emoji: '🎯',
        title: 'Reach Your Goals',
        reason: 'You chose this for a reason. Remember why you started this journey.'
    },
    {
        emoji: '📉',
        title: 'Blood Sugar Stability',
        reason: 'Your pancreas needs a break. Stable blood sugar = stable mood.'
    },
    {
        emoji: '🔥',
        title: 'Keep Your Streak',
        reason: 'Look how far you\'ve come! Don\'t let one moment erase your progress.'
    },
    {
        emoji: '💰',
        title: 'Save Money',
        reason: 'Sugar is expensive. You\'re saving for something better.'
    },
    {
        emoji: '🌟',
        title: 'Be an Example',
        reason: 'Someone is watching and learning from your strength.'
    },
    {
        emoji: '🧘',
        title: 'Freedom',
        reason: 'Addiction is captivity. You\'re choosing freedom over cravings.'
    },
    {
        emoji: '❤️',
        title: 'Self-Love',
        reason: 'Saying no to sugar is saying yes to yourself. You deserve better.'
    },
];

// Map goal IDs to reasons
const GOAL_REASONS: Record<string, { emoji: string; title: string; reason: string }> = {
    cravings: {
        emoji: '🍭',
        title: 'Break the Cycle',
        reason: 'Cravings are temporary - usually lasting only 3-5 minutes. This too shall pass.'
    },
    habits: {
        emoji: '🔄',
        title: 'New Neural Pathways',
        reason: 'Every time you resist, you\'re rewiring your brain. The habit is breaking.'
    },
    energy: {
        emoji: '⚡',
        title: 'Real Energy',
        reason: 'Sugar energy is fake. The crash isn\'t worth the spike.'
    },
    health: {
        emoji: '💚',
        title: 'Your Health Matters',
        reason: 'Every cell in your body benefits when you say no to added sugar.'
    },
    weight: {
        emoji: '⚖️',
        title: 'Progress Over Perfection',
        reason: 'Your body is transforming. Don\'t interrupt the process.'
    },
    skin: {
        emoji: '✨',
        title: 'Glow From Within',
        reason: 'Sugar causes glycation - aging your skin faster. Choose youth.'
    },
    focus: {
        emoji: '🧠',
        title: 'Sharp Mind',
        reason: 'Brain fog isn\'t normal. Clarity is waiting on the other side.'
    },
    blood_sugar: {
        emoji: '📉',
        title: 'Metabolic Health',
        reason: 'Your insulin sensitivity is improving. Keep going.'
    },
    sleep: {
        emoji: '😴',
        title: 'Rest Well',
        reason: 'Sugar before bed guarantees poor sleep. Choose tomorrow\'s energy.'
    },
    savings: {
        emoji: '💰',
        title: 'Worth More',
        reason: 'That money is going toward something meaningful. Not temporary pleasure.'
    },
};

export default function ReasonsScreen({ navigation }: ReasonsScreenProps) {
    const { onboardingData } = useUserData();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Build reasons list: user goals + universal
    const reasons = React.useMemo(() => {
        const userGoals = onboardingData.goals || [];
        const goalReasons = userGoals
            .map(goalId => GOAL_REASONS[goalId])
            .filter(Boolean);

        return [...goalReasons, ...UNIVERSAL_REASONS];
    }, [onboardingData.goals]);

    const currentReason = reasons[currentIndex];

    const handleTap = () => {
        setCurrentIndex((prev) => (prev + 1) % reasons.length);
    };

    return (
        <LooviBackground variant="coralDominant">
            <SafeAreaView style={styles.container}>
                <Pressable style={styles.tapArea} onPress={handleTap}>
                    <View style={styles.content}>
                        <Text style={styles.emoji}>{currentReason.emoji}</Text>
                        <Text style={styles.title}>{currentReason.title}</Text>
                        <Text style={styles.reason}>{currentReason.reason}</Text>

                        <View style={styles.instructions}>
                            <Text style={styles.instructionText}>Tap anywhere for another reason</Text>
                        </View>
                    </View>
                </Pressable>

                {/* Exit Button */}
                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.exitText}>✕</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </LooviBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tapArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    content: {
        alignItems: 'center',
        maxWidth: 500,
    },
    emoji: {
        fontSize: 80,
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: looviColors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    reason: {
        fontSize: 20,
        fontWeight: '400',
        color: looviColors.text.secondary,
        textAlign: 'center',
        lineHeight: 32,
    },
    instructions: {
        marginTop: spacing['3xl'],
        alignItems: 'center',
    },
    instructionText: {
        fontSize: 14,
        fontWeight: '500',
        color: looviColors.text.tertiary,
        marginBottom: spacing.xs,
    },
    counter: {
        fontSize: 12,
        fontWeight: '400',
        color: looviColors.text.muted,
    },
    exitButton: {
        position: 'absolute',
        top: spacing.xl,
        right: spacing.xl,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exitText: {
        fontSize: 24,
        fontWeight: '300',
        color: '#FFFFFF',
    },
});
