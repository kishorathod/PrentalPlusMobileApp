/**
 * Badge Component
 * 
 * A small status indicator component with multiple variants and sizes.
 */

import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import theme from '../../lib/theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    children?: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Badge({
    children,
    variant = 'primary',
    size = 'md',
    dot = false,
    style,
    textStyle,
}: BadgeProps) {
    if (dot) {
        return (
            <View style={[styles.dot, styles[`dot_${variant}`], styles[`dotSize_${size}`], style]} />
        );
    }

    return (
        <View style={[styles.base, styles[variant], styles[`size_${size}`], style]}>
            <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
                {children}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        alignSelf: 'flex-start',
        borderRadius: theme.borderRadius.full,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },

    // Variants
    primary: {
        backgroundColor: theme.colors.primary[100],
    },
    secondary: {
        backgroundColor: theme.colors.secondary[100],
    },
    success: {
        backgroundColor: theme.colors.success[100],
    },
    warning: {
        backgroundColor: theme.colors.warning[100],
    },
    danger: {
        backgroundColor: theme.colors.danger[100],
    },
    info: {
        backgroundColor: theme.colors.primary[50],
    },
    neutral: {
        backgroundColor: theme.colors.gray[100],
    },

    // Sizes
    size_sm: {
        paddingHorizontal: theme.spacing.xs + 2,
        paddingVertical: 2,
    },
    size_md: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    size_lg: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },

    // Text Styles
    text: {
        fontWeight: theme.typography.fontWeight.semibold,
    },
    text_primary: {
        color: theme.colors.primary[700],
    },
    text_secondary: {
        color: theme.colors.secondary[700],
    },
    text_success: {
        color: theme.colors.success[700],
    },
    text_warning: {
        color: theme.colors.warning[700],
    },
    text_danger: {
        color: theme.colors.danger[700],
    },
    text_info: {
        color: theme.colors.primary[600],
    },
    text_neutral: {
        color: theme.colors.gray[700],
    },

    // Text Sizes
    textSize_sm: {
        fontSize: theme.typography.fontSize.xs,
    },
    textSize_md: {
        fontSize: theme.typography.fontSize.sm,
    },
    textSize_lg: {
        fontSize: theme.typography.fontSize.base,
    },

    // Dot Variant
    dot: {
        borderRadius: theme.borderRadius.full,
    },
    dot_primary: {
        backgroundColor: theme.colors.primary[500],
    },
    dot_secondary: {
        backgroundColor: theme.colors.secondary[500],
    },
    dot_success: {
        backgroundColor: theme.colors.success[500],
    },
    dot_warning: {
        backgroundColor: theme.colors.warning[500],
    },
    dot_danger: {
        backgroundColor: theme.colors.danger[500],
    },
    dot_info: {
        backgroundColor: theme.colors.primary[400],
    },
    dot_neutral: {
        backgroundColor: theme.colors.gray[400],
    },

    // Dot Sizes
    dotSize_sm: {
        width: 6,
        height: 6,
    },
    dotSize_md: {
        width: 8,
        height: 8,
    },
    dotSize_lg: {
        width: 10,
        height: 10,
    },
});
