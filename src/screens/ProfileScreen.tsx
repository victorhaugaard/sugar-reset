/**
 * SettingsScreen (Profile/About)
 * 
 * Explains how SugarReset works and its philosophy.
 * Text-focused, calm academic tone.
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
import { colors, spacing, borderRadius } from '../theme';

interface Section {
    title: string;
    content: string;
}

const sections: Section[] = [
    {
        title: 'How SugarReset works',
        content: 'SugarReset tracks your daily sugar consumption using a simple binary choice: sugar-free or not. This data helps you understand patterns over time without obsessing over details. The tree visualization grows to reflect cumulative consistency, not perfection.',
    },
    {
        title: 'Why we avoid streak punishment',
        content: 'Traditional streak apps create anxiety by resetting progress to zero after a single slip. Research shows this approach leads to shame spirals and abandonment. SugarReset tracks your journey differently—one day of sugar consumption is simply data, not failure. Your tree continues to grow based on your overall consistency.',
    },
    {
        title: 'Science-based approach',
        content: 'Habit formation research suggests that consistency over time matters more than perfection. Sugar cravings are driven by dopamine pathways that adapt gradually. By logging daily without judgment, you build awareness and allow your brain to naturally recalibrate its reward system.',
    },
];

function SectionCard({ section }: { section: Section }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
        </View>
    );
}

export default function SettingsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>About</Text>
                    <Text style={styles.subtitle}>How SugarReset approaches change</Text>
                </View>

                {/* Sections */}
                <View style={styles.sectionsContainer}>
                    {sections.map((section, index) => (
                        <SectionCard key={index} section={section} />
                    ))}
                </View>

                {/* Footer Links */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.footerLink}>
                        <Text style={styles.footerLinkText}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerLink}>
                        <Text style={styles.footerLinkText}>Terms of Service</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerLink}>
                        <Text style={styles.footerLinkText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>
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
        paddingTop: spacing.xl,
        paddingBottom: spacing['3xl'],
    },
    header: {
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.secondary,
    },
    sectionsContainer: {
        gap: spacing.xl,
        marginBottom: spacing['3xl'],
    },
    section: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    sectionContent: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text.secondary,
        lineHeight: 22,
    },
    footer: {
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    footerLink: {
        paddingVertical: spacing.sm,
    },
    footerLinkText: {
        fontSize: 15,
        fontWeight: '400',
        color: colors.text.tertiary,
    },
    version: {
        fontSize: 13,
        fontWeight: '400',
        color: colors.text.muted,
        textAlign: 'center',
    },
});
