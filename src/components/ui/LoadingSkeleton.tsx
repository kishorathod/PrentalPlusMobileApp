/**
 * Loading Skeleton Component
 * 
 * Provides skeleton loading states with shimmer animation.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import theme from '../../lib/theme';

type SkeletonVariant = 'text' | 'circle' | 'rectangle';

interface LoadingSkeletonProps {
    variant?: SkeletonVariant;
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export default function LoadingSkeleton({
    variant = 'rectangle',
    width = '100%',
    height = 20,
    borderRadius,
    style,
}: LoadingSkeletonProps) {
    const translateX = useSharedValue(-1);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(1, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value * 200 }],
    }));

    const getVariantStyle = () => {
        switch (variant) {
            case 'text':
                return { height: 16, borderRadius: theme.borderRadius.sm };
            case 'circle':
                return {
                    width: height,
                    height: height,
                    borderRadius: height / 2,
                };
            case 'rectangle':
            default:
                return {
                    height,
                    borderRadius: borderRadius ?? theme.borderRadius.md,
                };
        }
    };

    return (
        <View
            style={[
                styles.container,
                { width },
                getVariantStyle(),
                style,
            ]}
        >
            <Animated.View style={[styles.shimmer, animatedStyle]}>
                <LinearGradient
                    colors={[
                        theme.colors.gray[200],
                        theme.colors.gray[100],
                        theme.colors.gray[200],
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                />
            </Animated.View>
        </View>
    );
}

// Skeleton Group for multiple skeletons
interface SkeletonGroupProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function SkeletonGroup({ children, style }: SkeletonGroupProps) {
    return <View style={[styles.group, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.gray[200],
        overflow: 'hidden',
    },

    shimmer: {
        width: '100%',
        height: '100%',
    },

    gradient: {
        flex: 1,
    },

    group: {
        gap: theme.spacing.sm,
    },
});
