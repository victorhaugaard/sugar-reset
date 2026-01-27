import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing, Text } from 'react-native';
import { looviColors } from './LooviBackground';

const { width, height } = Dimensions.get('window');

interface PlanBuildingAnimationProps {
    onComplete: () => void;
    answers: any;
}

// Helper to get random start position off-screen
const getStartPosition = () => {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    switch (side) {
        case 0: return { x: Math.random() * width, y: -100 };
        case 1: return { x: width + 100, y: Math.random() * height };
        case 2: return { x: Math.random() * width, y: height + 100 };
        case 3: return { x: -100, y: Math.random() * height };
        default: return { x: 0, y: 0 };
    }
};

const FlyingElement = ({ content, delay, onImpact, isEmoji = true }: { content: string, delay: number, onImpact: () => void, isEmoji?: boolean }) => {
    const position = useRef(new Animated.ValueXY(getStartPosition())).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.2)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const duration = 800 + Math.random() * 400;
        
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(position, {
                    toValue: { x: width / 2 - 20, y: height / 2 - 100 },
                    duration,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                    useNativeDriver: true,
                }),
                Animated.timing(scale, { toValue: 1.2, duration, useNativeDriver: true }),
                Animated.timing(rotate, { 
                    toValue: 1, 
                    duration, 
                    useNativeDriver: true 
                }),
            ]),
        ]).start(({ finished }) => {
            if (finished) {
                onImpact();
                opacity.setValue(0); // Disappear on impact
            }
        });
    }, []);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <Animated.View style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: [
                { translateX: position.x },
                { translateY: position.y },
                { scale },
                { rotate: spin }
            ],
            opacity,
            zIndex: 30,
        }}>
            {isEmoji ? (
                <Text style={{ fontSize: 32 }}>{content}</Text>
            ) : (
                <View style={{ 
                    width: 20, 
                    height: 20, 
                    backgroundColor: content, 
                    borderRadius: 4,
                    shadowColor: content,
                    shadowOpacity: 0.5,
                    shadowRadius: 5,
                    elevation: 3
                }} />
            )}
        </Animated.View>
    );
};

export const PlanBuildingAnimation = ({ onComplete, answers }: PlanBuildingAnimationProps) => {
    console.log('PlanBuildingAnimation mounted');
    const centerScale = useRef(new Animated.Value(0)).current;
    const centerOpacity = useRef(new Animated.Value(0)).current;
    const rotateVal = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const [statusText, setStatusText] = useState('Analyzing habits...');

    // Collect elements to fly in
    const elements = [
        // Emojis from answers
        { content: answers.gender === 'male' ? '👨' : answers.gender === 'female' ? '👩' : '👤', type: 'emoji' },
        { content: '📅', type: 'emoji' },
        { content: '📈', type: 'emoji' },
        { content: '💪', type: 'emoji' },
        { content: '🎭', type: 'emoji' },
        { content: '💵', type: 'emoji' },
        { content: '🎯', type: 'emoji' },
        { content: '🧠', type: 'emoji' },
        { content: '⚡', type: 'emoji' },
        { content: '🍎', type: 'emoji' },
        { content: '🍭', type: 'emoji' },
        { content: '⚖️', type: 'emoji' },
        // Decorative building blocks (colors)
        { content: looviColors.accent.primary, type: 'block' },
        { content: looviColors.coralOrange, type: 'block' },
        { content: '#FFD700', type: 'block' },
        { content: '#4CAF50', type: 'block' },
        { content: looviColors.accent.primary, type: 'block' },
        { content: looviColors.coralOrange, type: 'block' },
        { content: '#FFD700', type: 'block' },
        { content: '#4CAF50', type: 'block' },
    ];

    const handleImpact = () => {
        Animated.sequence([
            Animated.timing(centerScale, { toValue: 1.15, duration: 60, useNativeDriver: true }),
            Animated.timing(centerScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    useEffect(() => {
        // Start sequence
        Animated.parallel([
            Animated.spring(centerScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
            Animated.timing(centerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(textOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]).start();
        
        // Continuous core rotation
        Animated.loop(
            Animated.timing(rotateVal, {
                toValue: 1,
                duration: 8000,
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start();

        // Status text updates
        const t1 = setTimeout(() => setStatusText('Personalizing recommendations...'), 1200);
        const t2 = setTimeout(() => setStatusText('Optimizing your roadmap...'), 2400);

        // Completion
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(centerScale, { toValue: 15, duration: 500, easing: Easing.in(Easing.ease), useNativeDriver: true }),
                Animated.timing(centerOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(textOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start(() => onComplete());
        }, 4000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(timer);
        };
    }, []);

    const spin = rotateVal.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.fullScreenOverlay}>
            <View style={styles.background} />
            
            {/* Flying Elements */}
            {elements.map((el, index) => (
                <FlyingElement 
                    key={index} 
                    content={el.content} 
                    isEmoji={el.type === 'emoji'}
                    delay={index * 150}
                    onImpact={handleImpact} 
                />
            ))}

            {/* Central Core */}
            <View style={styles.centerContainer}>
                <Animated.View style={[styles.core, {
                    transform: [{ scale: centerScale }, { rotate: spin }],
                    opacity: centerOpacity,
                }]}>
                    <View style={styles.coreInner}>
                        <Text style={styles.coreEmoji}>✨</Text>
                    </View>
                </Animated.View>
                
                <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
                    <Text style={styles.statusText}>{statusText}</Text>
                    <View style={styles.loaderBarContainer}>
                        <Animated.View style={styles.loaderBarFill} />
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 250, 245, 0.98)',
    },
    centerContainer: {
        alignItems: 'center',
        paddingBottom: 80,
    },
    core: {
        width: 120,
        height: 120,
        backgroundColor: looviColors.accent.primary,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: looviColors.accent.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15,
        marginBottom: 40,
    },
    coreInner: {
        width: 100,
        height: 100,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    coreEmoji: {
        fontSize: 50,
    },
    statusText: {
        fontSize: 18,
        fontWeight: '700',
        color: looviColors.text.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    loaderBarContainer: {
        width: 200,
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    loaderBarFill: {
        width: '100%',
        height: '100%',
        backgroundColor: looviColors.accent.primary,
        borderRadius: 3,
    }
});
