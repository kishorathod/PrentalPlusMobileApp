/**
 * Reusable Animation Utilities
 * 
 * This file contains common animation configurations and helpers
 * for use with react-native-reanimated throughout the app.
 */

import { Easing, withSequence, withSpring, withTiming } from 'react-native-reanimated';

// Animation Configurations
export const springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 1,
};

export const timingConfig = {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export const fastTimingConfig = {
    duration: 150,
    easing: Easing.out(Easing.ease),
};

export const slowTimingConfig = {
    duration: 500,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
};

// Fade Animations
export const fadeIn = (duration = 300) => {
    return withTiming(1, { duration, easing: Easing.ease });
};

export const fadeOut = (duration = 300) => {
    return withTiming(0, { duration, easing: Easing.ease });
};

// Scale Animations
export const scaleIn = (toValue = 1, config = springConfig) => {
    return withSpring(toValue, config);
};

export const scaleOut = (toValue = 0, config = springConfig) => {
    return withSpring(toValue, config);
};

export const pressScale = () => {
    return withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, springConfig)
    );
};

// Slide Animations
export const slideInFromBottom = (toValue = 0, duration = 300) => {
    return withTiming(toValue, { duration, easing: Easing.out(Easing.ease) });
};

export const slideOutToBottom = (toValue: number, duration = 300) => {
    return withTiming(toValue, { duration, easing: Easing.in(Easing.ease) });
};

export const slideInFromRight = (toValue = 0, duration = 300) => {
    return withTiming(toValue, { duration, easing: Easing.out(Easing.ease) });
};

export const slideInFromLeft = (toValue = 0, duration = 300) => {
    return withTiming(toValue, { duration, easing: Easing.out(Easing.ease) });
};

// Bounce Animation
export const bounce = () => {
    return withSequence(
        withTiming(1.1, { duration: 150 }),
        withSpring(1, springConfig)
    );
};

// Shake Animation (for errors)
export const shake = () => {
    return withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
    );
};

// Pulse Animation
export const pulse = (toValue = 1.05) => {
    return withSequence(
        withTiming(toValue, { duration: 500 }),
        withTiming(1, { duration: 500 })
    );
};

// Rotate Animation
export const rotate = (toValue: number, duration = 300) => {
    return withTiming(toValue, { duration, easing: Easing.linear });
};

// Shimmer Effect (for loading skeletons)
export const shimmer = (duration = 1500) => {
    return withTiming(1, {
        duration,
        easing: Easing.linear,
    });
};

// Stagger Animation Helper
export const staggerDelay = (index: number, baseDelay = 50) => {
    return index * baseDelay;
};

// Animation Presets
export const animationPresets = {
    fadeIn: { opacity: fadeIn() },
    fadeOut: { opacity: fadeOut() },
    scaleIn: { transform: [{ scale: scaleIn() }] },
    scaleOut: { transform: [{ scale: scaleOut() }] },
    bounce: { transform: [{ scale: bounce() }] },
    shake: { transform: [{ translateX: shake() }] },
    pulse: { transform: [{ scale: pulse() }] },
};

export default {
    springConfig,
    timingConfig,
    fastTimingConfig,
    slowTimingConfig,
    fadeIn,
    fadeOut,
    scaleIn,
    scaleOut,
    pressScale,
    slideInFromBottom,
    slideOutToBottom,
    slideInFromRight,
    slideInFromLeft,
    bounce,
    shake,
    pulse,
    rotate,
    shimmer,
    staggerDelay,
    animationPresets,
};
