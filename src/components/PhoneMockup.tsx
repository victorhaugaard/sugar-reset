/**
 * PhoneMockup
 * 
 * Visual component representing a modern smartphone.
 * Used for showcasing app features in a sleek way.
 */

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface PhoneMockupProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export default function PhoneMockup({ children, style }: PhoneMockupProps) {
    return (
        <View style={[styles.container, style]}>
            {/* Outer Bezel (Frame) */}
            <View style={styles.bezel}>
                {/* Screen Area */}
                <View style={styles.screen}>

                    {/* Status Bar / Notch Area simulation */}
                    <View style={styles.notchContainer}>
                        <View style={styles.notch} />
                    </View>

                    {/* Inner Content */}
                    <View style={styles.content}>
                        {children}
                    </View>

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    bezel: {
        width: 200,
        height: 400,
        backgroundColor: '#1E1E1E', // Dark grey bezel
        borderRadius: 40,
        borderWidth: 6,
        borderColor: '#2A2A2A', // Slightly lighter edge
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    screen: {
        flex: 1,
        backgroundColor: colors.background.secondary, // Screen background
        borderRadius: 32,
        overflow: 'hidden',
    },
    notchContainer: {
        width: '100%',
        height: 30,
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        zIndex: 10,
    },
    notch: {
        width: 80,
        height: 24,
        backgroundColor: '#000',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    content: {
        flex: 1,
        paddingTop: 40, // Space for notch
        alignItems: 'center',
        justifyContent: 'center',
    },
});
