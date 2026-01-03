/**
 * Progress Bar Component
 * 
 * An animated progress indicator with optional gradient fill.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import theme from '../../lib/theme';

interface ProgressBarProps {
    progress: number; // 0-100
    height?: number;
    showLabel?: boolean;
    gradient?: boolean;
    gradientColors?: string[];
    backgroundColor?: string;
    style?: ViewStyle;
}

export default function ProgressBar({
    progress,
    height = 8,
    showLabel = false,
    gradient = false,
    gradientColors = theme.gradients.primary,
    backgroundColor = theme.colors.gray[200],
    style,
}: ProgressBarProps) {
    const progressValue = useSharedValue(0);

    useEffect(() => {
        progressValue.value = withSpring(Math.min(Math.max(progress, 0), 100), {
            damping: 15,
            stiffness: 100,
        });
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progressValue.value}%`,
    }));

    return (
        <View style={[styles.container, style]}>
            <View style={[styles.track, { height, backgroundColor }]}>
                <Animated.View style={[styles.fill, { height }, animatedStyle]}>
                    {gradient ? (
                        <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradient}
                        />
                    ) : (
                        <View style={[styles.solidFill, { backgroundColor: gradientColors[0] }]} />
                    )}
                </Animated.View>
            </View>

            {showLabel && (
                <Text style={styles.label}>{Math.round(progress)}%</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },

    track: {
        width: '100%',
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
    },

    fill: {
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
    },

    gradient: {
        flex: 1,
    },

    solidFill: {
        flex: 1,
    },

    label: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text.secondary,
        textAlign: 'right',
    },
});
