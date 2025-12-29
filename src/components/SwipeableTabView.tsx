/**
 * SwipeableTabView Component
 * 
 * Wraps screen content and detects horizontal swipe gestures
 * to navigate between tabs.
 * 
 * Uses PanResponder (no reanimated worklets) to avoid native build requirements.
 */

import React, { ReactNode, useRef } from 'react';
import { StyleSheet, View, Dimensions, PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../types';

type TabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// Tab order for navigation
const TAB_ORDER: (keyof MainTabParamList)[] = ['Home', 'Analytics', 'Alternatives', 'Library', 'Profile'];

interface SwipeableTabViewProps {
    children: ReactNode;
    currentTab: keyof MainTabParamList;
}

export function SwipeableTabView({ children, currentTab }: SwipeableTabViewProps) {
    const navigation = useNavigation<TabNavigationProp>();
    const { width } = Dimensions.get('window');
    const SWIPE_THRESHOLD = width * 0.2; // 20% of screen width
    const VELOCITY_THRESHOLD = 0.3;

    const currentIndex = TAB_ORDER.indexOf(currentTab);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Only respond to horizontal swipes
                const { dx, dy } = gestureState;
                return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                // Capture horizontal swipes
                const { dx, dy } = gestureState;
                return Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 20;
            },
            onPanResponderRelease: (evt, gestureState) => {
                const { dx, vx } = gestureState;

                // Check if swipe is significant enough
                const isSwipe = Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > VELOCITY_THRESHOLD;

                if (!isSwipe) return;

                if (dx > 0 && currentIndex > 0) {
                    // Swipe right - go to previous tab
                    navigation.navigate(TAB_ORDER[currentIndex - 1]);
                } else if (dx < 0 && currentIndex < TAB_ORDER.length - 1) {
                    // Swipe left - go to next tab
                    navigation.navigate(TAB_ORDER[currentIndex + 1]);
                }
            },
        })
    ).current;

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default SwipeableTabView;
