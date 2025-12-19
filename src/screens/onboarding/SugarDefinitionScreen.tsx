/**
 * SugarDefinitionScreen
 * 
 * Clearly defines what SugarReset tracks.
 * Factual, neutral tone with simple bullet lists.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../../theme';

type SugarDefinitionScreenProps = {
    navigation: NativeStackNavigationProp<any, 'SugarDefinition'>;
};

const countsSugar = [
    'Candy and sweets',
    'Sugary drinks',
    'Desserts',
    'Pure added sugar foods',
];

const doesNotCount = [
    'Small amounts of sugar in meals',
    'Naturally occurring sugars in whole foods',
];

export default function SugarDefinitionScreen({ navigation }: SugarDefinitionScreenProps) {
    const handleContinue = () => {
        navigation.navigate('ScienceFraming');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>What SugarReset tracks</Text>
                </View>

                {/* Counts as sugar section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Counts as sugar</Text>
                    <View style={styles.card}>
                        {countsSugar.map((item, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Does not count section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Does not count</Text>
                    <View style={styles.card}>
                        {doesNotCount.map((item, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>Understood</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing['3xl'],
        paddingBottom: spacing.xl,
    },
    header: {
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text.tertiary,
        marginBottom: spacing.md,
        letterSpacing: 0.3,
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        gap: spacing.md,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bullet: {
        fontSize: 15,
        color: colors.text.secondary,
        marginRight: spacing.sm,
        lineHeight: 22,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.secondary,
        lineHeight: 22,
    },
    bottomContainer: {
        paddingHorizontal: spacing.screen.horizontal,
        paddingTop: spacing.lg,
        paddingBottom: spacing['2xl'],
    },
    continueButton: {
        backgroundColor: colors.accent.primary,
        paddingVertical: spacing.lg,
        borderRadius: 14,
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.inverse,
    },
});
