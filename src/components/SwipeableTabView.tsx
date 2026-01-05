/**
 * SwipeableTabView Component
 * 
 * Wraps screen content and detects horizontal swipe gestures
 * to navigate between tabs.
 * 
 * Uses PanResponder (no reanimated worklets) to avoid native build requirements.
 */

import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { MainTabParamList } from '../types';

interface SwipeableTabViewProps {
    children: ReactNode;
    currentTab: keyof MainTabParamList;
}

export function SwipeableTabView({ children, currentTab }: SwipeableTabViewProps) {
    // Swipe functionality disabled to prevent conflicts with other gestures
    return (
        <View style={styles.container}>
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
