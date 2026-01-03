import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { lightImpact } from '../../lib/haptics';
import theme from '../../lib/theme';

type AccordionProps = {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    style?: ViewStyle;
    headerStyle?: ViewStyle;
    contentStyle?: ViewStyle;
};

export default function Accordion({
    title,
    children,
    defaultExpanded = false,
    style,
    headerStyle,
    contentStyle,
}: AccordionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [contentHeight, setContentHeight] = useState(0);
    const animatedHeight = useSharedValue(defaultExpanded ? 1 : 0);
    const rotation = useSharedValue(defaultExpanded ? 1 : 0);

    const toggleAccordion = () => {
        lightImpact();
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);

        animatedHeight.value = withTiming(newExpanded ? 1 : 0, {
            duration: 300,
        });

        rotation.value = withTiming(newExpanded ? 1 : 0, {
            duration: 300,
        });
    };

    const heightStyle = useAnimatedStyle(() => ({
        height: interpolate(
            animatedHeight.value,
            [0, 1],
            [0, contentHeight],
            Extrapolate.CLAMP
        ),
        opacity: interpolate(
            animatedHeight.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP
        ),
    }));

    const rotationStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: `${interpolate(rotation.value, [0, 1], [0, 180])}deg`,
            },
        ],
    }));

    return (
        <View style={[styles.container, style]}>
            {/* Header */}
            <TouchableOpacity
                style={[styles.header, headerStyle]}
                onPress={toggleAccordion}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>{title}</Text>
                <Animated.View style={rotationStyle}>
                    <ChevronDown size={20} color={theme.colors.text.secondary} />
                </Animated.View>
            </TouchableOpacity>

            {/* Content */}
            <Animated.View style={[styles.contentWrapper, heightStyle]}>
                <View
                    style={[styles.content, contentStyle]}
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        if (contentHeight === 0) {
                            setContentHeight(height);
                        }
                    }}
                >
                    {children}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        ...theme.shadows.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.white,
    },
    title: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text.primary,
        flex: 1,
    },
    contentWrapper: {
        overflow: 'hidden',
    },
    content: {
        position: 'absolute',
        width: '100%',
        padding: theme.spacing.md,
        paddingTop: 0,
    },
});
