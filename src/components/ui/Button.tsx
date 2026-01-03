/**
 * Enhanced Button Component
 * 
 * A flexible button component with multiple variants, sizes, and states.
 * Includes animations and haptic feedback for better UX.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { lightImpact } from '../../lib/haptics';
import theme from '../../lib/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    style,
    textStyle,
}: ButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    };

    const handlePress = () => {
        if (!disabled && !loading && onPress) {
            lightImpact();
            onPress();
        }
    };

    const buttonStyle = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`textSize_${size}`],
        (disabled || loading) && styles.textDisabled,
        textStyle,
    ];

    return (
        <AnimatedTouchable
            style={buttonStyle}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary[500] : theme.colors.white}
                    size={size === 'sm' ? 'small' : 'small'}
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <>{icon}</>}
                    <Text style={textStyles}>{children}</Text>
                    {icon && iconPosition === 'right' && <>{icon}</>}
                </>
            )}
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },

    // Variants
    primary: {
        backgroundColor: theme.colors.primary[500],
        ...theme.shadows.md,
    },
    secondary: {
        backgroundColor: theme.colors.secondary[500],
        ...theme.shadows.md,
    },
    outline: {
        backgroundColor: theme.colors.transparent,
        borderWidth: 2,
        borderColor: theme.colors.primary[500],
    },
    ghost: {
        backgroundColor: theme.colors.transparent,
    },
    danger: {
        backgroundColor: theme.colors.danger[500],
        ...theme.shadows.md,
    },

    // Sizes
    size_sm: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
    },
    size_md: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 44,
    },
    size_lg: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg - 4,
        minHeight: 52,
    },

    // Text Styles
    text: {
        fontWeight: theme.typography.fontWeight.bold,
    },
    text_primary: {
        color: theme.colors.white,
    },
    text_secondary: {
        color: theme.colors.white,
    },
    text_outline: {
        color: theme.colors.primary[500],
    },
    text_ghost: {
        color: theme.colors.primary[500],
    },
    text_danger: {
        color: theme.colors.white,
    },

    // Text Sizes
    textSize_sm: {
        fontSize: theme.typography.fontSize.sm,
    },
    textSize_md: {
        fontSize: theme.typography.fontSize.base,
    },
    textSize_lg: {
        fontSize: theme.typography.fontSize.lg,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    textDisabled: {
        opacity: 0.7,
    },

    fullWidth: {
        width: '100%',
    },
});
