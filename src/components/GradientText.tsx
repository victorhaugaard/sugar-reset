/**
 * GradientText Component
 * 
 * Creates text with a modern gradient effect using SVG.
 */

import React from 'react';
import { View, StyleSheet, TextStyle } from 'react-native';
import Svg, { Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

interface GradientTextProps {
    text: string;
    colors?: string[];
    fontSize?: number;
    fontWeight?: TextStyle['fontWeight'];
    style?: any;
}

export function GradientText({
    text,
    colors = ['#E8A87C', '#A8D8E8'], // Coral to sky blue
    fontSize = 36,
    fontWeight = '800',
    style,
}: GradientTextProps) {
    // Calculate approximate width based on text length
    const estimatedWidth = text.length * (fontSize * 0.6);

    return (
        <View style={[styles.container, style]}>
            <Svg height={fontSize * 1.3} width={estimatedWidth}>
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
                    x="0"
                    y={fontSize}
                    textAnchor="start"
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
