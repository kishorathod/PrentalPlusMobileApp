/**
 * Enhanced Card Component
 * 
 * A flexible card component with multiple variants and optional press interaction.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { lightImpact } from '../../lib/haptics';
import theme from '../../lib/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type CardVariant = 'default' | 'elevated' | 'outlined' | 'gradient';

interface CardProps {
    children: React.ReactNode;
    variant?: CardVariant;
    onPress?: () => void;
    style?: ViewStyle;
    padding?: keyof typeof theme.spacing;
    gradientColors?: readonly string[];
}

export default function Card({
    children,
    variant = 'default',
    onPress,
    style,
    padding = 'md',
    gradientColors,
}: CardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (onPress) {
            scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        }
    };

    const handlePress = () => {
        if (onPress) {
            lightImpact();
            onPress();
        }
    };

    const cardStyle = [
        styles.base,
        styles[variant],
        { padding: theme.spacing[padding] },
        animatedStyle,
        style,
    ];

    if (variant === 'gradient' && gradientColors) {
        const content = <View style={styles.content}>{children}</View>;

        if (onPress) {
            return (
                <AnimatedTouchable
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                    style={[cardStyle, { padding: 0 }]}
                >
                    <LinearGradient
                        colors={gradientColors as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradient, { padding: theme.spacing[padding] }]}
                    >
                        {children}
                    </LinearGradient>
                </AnimatedTouchable>
            );
        }

        return (
            <Animated.View style={[cardStyle, { padding: 0 }]}>
                <LinearGradient
                    colors={gradientColors as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradient, { padding: theme.spacing[padding] }]}
                >
                    {children}
                </LinearGradient>
            </Animated.View>
        );
    }

    if (onPress) {
        return (
            <AnimatedTouchable
                style={cardStyle}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                {children}
            </AnimatedTouchable>
        );
    }

    return <Animated.View style={cardStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
    base: {
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.white,
    },

    default: {
        backgroundColor: theme.colors.white,
    },

    elevated: {
        backgroundColor: theme.colors.white,
        ...theme.shadows.lg,
    },

    outlined: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.border.default,
    },

    gradient: {
        overflow: 'hidden',
    },

    content: {
        flex: 1,
    },
});
