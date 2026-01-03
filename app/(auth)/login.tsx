import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Button, Input } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';
import { errorNotification, mediumImpact, successNotification } from '../../src/lib/haptics';
import theme from '../../src/lib/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const { signIn } = useAuth();

    const shakeAnimation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeAnimation.value }],
    }));

    const triggerShake = () => {
        shakeAnimation.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    const handleLogin = async () => {
        if (!email || !password) {
            triggerShake();
            errorNotification();
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setFormLoading(true);
        try {
            const cleanEmail = email.trim();
            const cleanPassword = password.trim();

            const payload = {
                email: cleanEmail,
                password: cleanPassword
            };

            const response = await api.post('/mobile-login', payload);

            if (response.data?.error) {
                throw new Error(response.data.error);
            }

            const sessionToken = response.data?.token || '';

            if (!sessionToken) {
                throw new Error('Authentication successful but no token received.');
            }

            const userPreview = response.data?.user || { id: 'user', name: 'User', email: cleanEmail, role: 'PATIENT' };
            await signIn(sessionToken, userPreview as any);
            successNotification();

        } catch (error: any) {
            console.error('Login Error:', error);
            triggerShake();
            errorNotification();
            const message = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
            Alert.alert('Login Error', message);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <LinearGradient
                colors={theme.gradients.background}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Logo and Title */}
                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.logoContainer}>
                    <LinearGradient
                        colors={theme.gradients.pregnancy}
                        style={styles.logoGradient}
                    >
                        <Text style={styles.logoText}>P+</Text>
                    </LinearGradient>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your prenatal journey</Text>
                </Animated.View>

                {/* Form */}
                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    style={[styles.formContainer, animatedStyle]}
                >
                    <Input
                        label="Email Address"
                        placeholder="e.g. sarah@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon={<Mail size={20} color={theme.colors.text.tertiary} />}
                        containerStyle={styles.inputContainer}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        leftIcon={<Lock size={20} color={theme.colors.text.tertiary} />}
                        rightIcon={
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {showPassword ? (
                                    <EyeOff size={22} color={theme.colors.primary[500]} />
                                ) : (
                                    <Eye size={22} color={theme.colors.text.tertiary} />
                                )}
                            </TouchableOpacity>
                        }
                        containerStyle={styles.passwordInput}
                    />

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => Alert.alert('Forgot Password', 'Please visit our website to reset your password.')}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <Button
                        onPress={handleLogin}
                        disabled={formLoading}
                        loading={formLoading}
                        fullWidth
                        size="lg"
                        style={styles.loginButton}
                    >
                        Sign In
                    </Button>
                </Animated.View>

                {/* Sign Up Link */}
                <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity onPress={() => mediumImpact()}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: theme.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 80 : 60,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoGradient: {
        width: 56, // Reduced from 80
        height: 56, // Reduced from 80
        borderRadius: theme.borderRadius.md, // Adjusted from lg
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadows.md, // Adjusted from lg
    },
    logoText: {
        color: theme.colors.white,
        fontSize: theme.typography.fontSize['2xl'], // Reduced from 4xl
        fontWeight: theme.typography.fontWeight.extrabold,
    },
    title: {
        fontSize: theme.typography.fontSize['3xl'],
        fontWeight: theme.typography.fontWeight.extrabold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    formContainer: {
        marginBottom: theme.spacing.lg,
    },
    inputContainer: {
        marginBottom: theme.spacing.md,
    },
    passwordInput: {
        marginBottom: theme.spacing.xs, // Pull forgot password closer
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing.xl,
        paddingVertical: 4,
    },
    forgotPasswordText: {
        color: theme.colors.primary[600], // Darkened for better contrast
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.bold, // Increased weight
    },
    loginButton: {
        marginTop: theme.spacing.sm,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.base,
    },
    signupLink: {
        color: theme.colors.primary[500],
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
    },
});
