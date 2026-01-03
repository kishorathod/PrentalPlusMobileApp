/**
 * Enhanced Input Component
 * 
 * A flexible input component with validation states, icons, and floating labels.
 */

import { CheckCircle2 } from 'lucide-react-native';
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

    const borderWidth = isFocused || currentState !== 'default' ? 2 : 1;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Animated.View style={[styles.labelContainer, animatedLabelStyle]}>
                    <Text style={[styles.label, isFocused && styles.labelFocused]}>
                        {label}
                    </Text>
                </Animated.View>
            )}

            <View style={[styles.inputContainer, { borderColor, borderWidth }]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        leftIcon ? styles.inputWithLeftIcon : null,
                        (rightIcon || currentState === 'success') ? styles.inputWithRightIcon : null
                    ]}
                    placeholderTextColor={theme.colors.text.tertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...textInputProps}
                />

                {currentState === 'success' && !rightIcon && (
                    <View style={styles.rightIcon}>
                        <CheckCircle2 size={20} color={theme.colors.success[500]} />
                    </View>
                )}

                {rightIcon && (
                    <View style={styles.rightIconContainer}>
                        {rightIcon}
                    </View>
                )}
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
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text.secondary,
        paddingLeft: 4,
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

    rightIconContainer: {
        marginLeft: theme.spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44,
        minHeight: 44, // Minimum tap target
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
