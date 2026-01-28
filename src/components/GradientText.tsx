/**
 * GradientText Component
 * 
 * Creates text with a modern gradient effect using SVG.
 */

import React from 'react';
import { View, StyleSheet, TextStyle, Dimensions } from 'react-native';
import Svg, { Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GradientTextProps {
    text: string;
    colors?: string[];
    fontSize?: number;
    fontWeight?: TextStyle['fontWeight'];
    fontStyle?: TextStyle['fontStyle'];
    style?: any;
}

export function GradientText({
    text,
    colors = ['#E8A87C', '#A8D8E8'], // Coral to sky blue
    fontSize = 36,
    fontWeight = '800',
    fontStyle = 'normal',
    style,
}: GradientTextProps) {
    // Use full width for centering, with some padding
    const svgWidth = SCREEN_WIDTH - 60; // Account for screen padding

    return (
        <View style={[styles.container, style]}>
            <Svg height={fontSize * 1.5} width={svgWidth}>
                <Defs>
                    <LinearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        {colors.map((color, index) => (
                            <Stop
                                key={index}
                                offset={`${(index / (colors.length - 1)) * 100}%`}
                                stopColor={color}
                            />
                        ))}
                    </LinearGradient>
                </Defs>
                <SvgText
                    fill="url(#textGradient)"
                    fontSize={fontSize}
                    fontWeight={fontWeight as string}
                    fontStyle={fontStyle}
                    x={svgWidth / 2}
                    y={fontSize}
                    textAnchor="middle"
                >
                    {text}
                </SvgText>
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
});

export default GradientText;
