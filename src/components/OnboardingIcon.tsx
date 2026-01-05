/**
 * OnboardingIcon Component
 * 
 * Replaces emojis with colored Feather icons for a more polished look.
 * Uses the app's color palette for consistent theming.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { looviColors } from './LooviBackground';

// Color palette for icons
export const iconColors = {
    coral: looviColors.coralOrange,      // Primary accent
    blue: '#3B82F6',                      // Info/Analytics
    green: '#22C55E',                     // Success/Health
    purple: '#8B5CF6',                    // Learn/Education
    red: '#EF4444',                       // Alert/Danger
    yellow: '#F59E0B',                    // Warning/Energy
    pink: '#EC4899',                      // Heart/Love
    teal: '#14B8A6',                      // Fresh/Clean
    orange: '#F97316',                    // Action
    gray: '#6B7280',                      // Neutral
};

// Emoji to Feather icon mapping
type IconName = keyof typeof Feather.glyphMap;

interface IconMapping {
    icon: IconName;
    color: string;
}

const emojiToIcon: Record<string, IconMapping> = {
    // Progress & Analytics
    '📊': { icon: 'bar-chart-2', color: iconColors.coral },
    '📈': { icon: 'trending-up', color: iconColors.red },
    '📉': { icon: 'trending-down', color: iconColors.green },

    // Science & Brain
    '🧬': { icon: 'activity', color: iconColors.blue },
    '🧠': { icon: 'cpu', color: iconColors.purple },
    '🔬': { icon: 'search', color: iconColors.blue },

    // Help & Support
    '🆘': { icon: 'life-buoy', color: iconColors.red },
    '💡': { icon: 'zap', color: iconColors.yellow },
    '❓': { icon: 'help-circle', color: iconColors.blue },

    // Education & Books
    '📖': { icon: 'book-open', color: iconColors.purple },
    '📚': { icon: 'book', color: iconColors.purple },
    '✏️': { icon: 'edit-3', color: iconColors.gray },

    // Health & Body
    '❤️': { icon: 'heart', color: iconColors.pink },
    '💔': { icon: 'heart', color: iconColors.red },
    '💪': { icon: 'activity', color: iconColors.green },
    '⚡': { icon: 'zap', color: iconColors.yellow },
    '😴': { icon: 'moon', color: iconColors.purple },
    '✨': { icon: 'star', color: iconColors.yellow },
    '😊': { icon: 'smile', color: iconColors.yellow },

    // Food & Drinks
    '🍭': { icon: 'x-circle', color: iconColors.red },
    '🍬': { icon: 'x-circle', color: iconColors.red },
    '🥤': { icon: 'coffee', color: iconColors.red },
    '🍩': { icon: 'circle', color: iconColors.orange },
    '🍫': { icon: 'square', color: iconColors.orange },
    '🧁': { icon: 'gift', color: iconColors.pink },
    '🍦': { icon: 'droplet', color: iconColors.teal },
    '🍎': { icon: 'check-circle', color: iconColors.green },
    '🍌': { icon: 'check-circle', color: iconColors.yellow },
    '🍇': { icon: 'check-circle', color: iconColors.purple },
    '🥕': { icon: 'check-circle', color: iconColors.orange },
    '🥛': { icon: 'droplet', color: iconColors.gray },
    '🍯': { icon: 'droplet', color: iconColors.yellow },
    '☕': { icon: 'coffee', color: iconColors.orange },
    '🍪': { icon: 'circle', color: iconColors.orange },
    '🍰': { icon: 'layers', color: iconColors.pink },
    '🍝': { icon: 'disc', color: iconColors.orange },
    '🥣': { icon: 'sun', color: iconColors.yellow },

    // Money & Goals
    '💵': { icon: 'dollar-sign', color: iconColors.green },
    '💰': { icon: 'dollar-sign', color: iconColors.green },
    '💸': { icon: 'trending-down', color: iconColors.red },
    '🎯': { icon: 'target', color: iconColors.coral },
    '🏆': { icon: 'award', color: iconColors.yellow },
    '⚖️': { icon: 'sliders', color: iconColors.blue },

    // Travel & Activities
    '✈️': { icon: 'navigation', color: iconColors.blue },
    '📱': { icon: 'smartphone', color: iconColors.gray },
    '🎭': { icon: 'music', color: iconColors.purple },
    '🏦': { icon: 'briefcase', color: iconColors.blue },
    '🎨': { icon: 'feather', color: iconColors.pink },
    '🎁': { icon: 'gift', color: iconColors.coral },

    // Status indicators
    '✅': { icon: 'check-circle', color: iconColors.green },
    '✓': { icon: 'check', color: iconColors.green },
    '✕': { icon: 'x', color: iconColors.red },
    '🟢': { icon: 'check-circle', color: iconColors.green },
    '🟡': { icon: 'alert-circle', color: iconColors.yellow },
    '🟠': { icon: 'alert-circle', color: iconColors.orange },
    '🔴': { icon: 'x-circle', color: iconColors.red },
    '💚': { icon: 'check-circle', color: iconColors.green },
    '💛': { icon: 'alert-circle', color: iconColors.yellow },
    '🧡': { icon: 'alert-circle', color: iconColors.orange },

    // People & Demographics
    '👋': { icon: 'user', color: iconColors.coral },
    '👤': { icon: 'user', color: iconColors.gray },
    '🧑': { icon: 'user', color: iconColors.coral },
    '♂️': { icon: 'user', color: iconColors.blue },
    '♀️': { icon: 'user', color: iconColors.pink },

    // Medical & Awareness
    '🎗️': { icon: 'shield', color: iconColors.teal },
    '💊': { icon: 'thermometer', color: iconColors.blue },

    // Nature & Environment
    '🌳': { icon: 'feather', color: iconColors.green },
    '🌱': { icon: 'feather', color: iconColors.green },
    '🌟': { icon: 'star', color: iconColors.yellow },
    '💧': { icon: 'droplet', color: iconColors.blue },

    // Tools & Actions
    '🔍': { icon: 'search', color: iconColors.blue },
    '📝': { icon: 'edit-3', color: iconColors.gray },
    '📓': { icon: 'book', color: iconColors.purple },
    '🤖': { icon: 'cpu', color: iconColors.blue },
    '🤝': { icon: 'users', color: iconColors.coral },
    '📋': { icon: 'clipboard', color: iconColors.blue },

    // Notifications & Settings
    '🔔': { icon: 'bell', color: iconColors.yellow },
    '💬': { icon: 'message-circle', color: iconColors.blue },
    '⭐': { icon: 'star', color: iconColors.yellow },
    '🔒': { icon: 'lock', color: iconColors.gray },
    '📄': { icon: 'file-text', color: iconColors.gray },

    // Misc
    '🔥': { icon: 'sunrise', color: iconColors.coral },
    '⏰': { icon: 'clock', color: iconColors.gray },
    '📅': { icon: 'calendar', color: iconColors.blue },
    '🌙': { icon: 'moon', color: iconColors.purple },
    '☀️': { icon: 'sun', color: iconColors.yellow },
};

// Fallback for unmapped emojis
const defaultMapping: IconMapping = { icon: 'circle', color: iconColors.gray };

interface OnboardingIconProps {
    emoji: string;
    size?: number;
    style?: ViewStyle;
    /** Override the default color */
    color?: string;
    /** Show icon in a circular background */
    withBackground?: boolean;
    /** Background opacity (0-1) */
    backgroundOpacity?: number;
}

export function OnboardingIcon({
    emoji,
    size = 24,
    style,
    color,
    withBackground = false,
    backgroundOpacity = 0.15,
}: OnboardingIconProps) {
    const mapping = emojiToIcon[emoji] || defaultMapping;
    const iconColor = color || mapping.color;
    const iconName = mapping.icon;

    if (withBackground) {
        return (
            <View
                style={[
                    styles.iconBackground,
                    {
                        backgroundColor: `${iconColor}${Math.round(backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
                        width: size * 1.8,
                        height: size * 1.8,
                        borderRadius: size * 0.9,
                    },
                    style,
                ]}
            >
                <Feather name={iconName} size={size} color={iconColor} />
            </View>
        );
    }

    return (
        <View style={style}>
            <Feather name={iconName} size={size} color={iconColor} />
        </View>
    );
}

const styles = StyleSheet.create({
    iconBackground: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

// Export as both OnboardingIcon (legacy) and AppIcon (preferred)
export { OnboardingIcon as AppIcon };
export default OnboardingIcon;
