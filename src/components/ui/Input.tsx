/**
 * Enhanced Input Component
 * 
 * A flexible input component with validation states, icons, and floating labels.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import theme from '../../lib/theme';

type InputState = 'default' | 'error' | 'success';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    state?: InputState;
    containerStyle?: ViewStyle;
}

export default function Input({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    state = 'default',
    containerStyle,
    ...textInputProps
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const labelPosition = useSharedValue(0);

    const currentState = error ? 'error' : state;

    const animatedLabelStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: labelPosition.value }],
    }));

    const handleFocus = () => {
        setIsFocused(true);
        if (label) {
            labelPosition.value = withTiming(-8, { duration: 200 });
        }
        textInputProps.onFocus?.({} as any);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (label && !textInputProps.value) {
            labelPosition.value = withTiming(0, { duration: 200 });
        }
        textInputProps.onBlur?.({} as any);
    };

    const borderColor =
        currentState === 'error' ? theme.colors.danger[500] :
            currentState === 'success' ? theme.colors.success[500] :
                isFocused ? theme.colors.primary[500] :
                    theme.colors.border.default;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Animated.View style={[styles.labelContainer, animatedLabelStyle]}>
                    <Text style={[styles.label, isFocused && styles.labelFocused]}>
                        {label}
                    </Text>
                </Animated.View>
            )}

            <View style={[styles.inputContainer, { borderColor }]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[styles.input, leftIcon && styles.inputWithLeftIcon, rightIcon && styles.inputWithRightIcon]}
                    placeholderTextColor={theme.colors.text.tertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...textInputProps}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>

            {(error || helperText) && (
                <Text style={[styles.helperText, error && styles.errorText]}>
                    {error || helperText}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },

    labelContainer: {
        marginBottom: theme.spacing.sm,
    },

    label: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text.secondary,
    },

    labelFocused: {
        color: theme.colors.primary[500],
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.secondary,
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
    },

    input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
    },

    inputWithLeftIcon: {
        paddingLeft: theme.spacing.sm,
    },

    inputWithRightIcon: {
        paddingRight: theme.spacing.sm,
    },

    leftIcon: {
        marginRight: theme.spacing.sm,
    },

    rightIcon: {
        marginLeft: theme.spacing.sm,
    },

    helperText: {
        marginTop: theme.spacing.xs,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
        paddingHorizontal: theme.spacing.xs,
    },

    errorText: {
        color: theme.colors.danger[500],
    },
});
