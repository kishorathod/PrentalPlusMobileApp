import DateTimePicker from '@react-native-community/datetimepicker';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Baby, Calendar, ChevronRight, Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Button, Input } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';
import { errorNotification, mediumImpact, successNotification } from '../../src/lib/haptics';
import theme from '../../src/lib/theme';

// Password Validation Helper
const PasswordRequirement = ({ label, met }: { label: string; met: boolean }) => (
    <View style={styles.requirementRow}>
        <View style={[styles.requirementDot, met && styles.requirementDotMet]} />
        <Text style={[styles.requirementText, met && styles.requirementTextMet]}>{label}</Text>
    </View>
);

export default function RegisterScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birthDate: new Date(1995, 0, 1),
        expectedDueDate: new Date(new Date().setMonth(new Date().getMonth() + 9)),
        password: '',
        confirmPassword: '',
    });

    const [showBirthPicker, setShowBirthPicker] = useState(false);
    const [showDuePicker, setShowDuePicker] = useState(false);
    const [dueDateSelected, setDueDateSelected] = useState(false);

    // Password validation state
    const [validations, setValidations] = useState({
        length: false,
        number: false,
        symbol: false,
        match: false,
    });

    useEffect(() => {
        setValidations({
            length: formData.password.length >= 8,
            number: /\d/.test(formData.password),
            symbol: /[^A-Za-z0-9]/.test(formData.password),
            match: formData.password === formData.confirmPassword && formData.password !== '',
        });
    }, [formData.password, formData.confirmPassword]);

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password) {
                Alert.alert('Error', 'Please fill in all core fields.');
                return;
            }
            if (!validations.length || !validations.number || !validations.symbol) {
                Alert.alert('Error', 'Password does not meet requirements.');
                return;
            }
            if (!validations.match) {
                Alert.alert('Error', 'Passwords do not match.');
                return;
            }
            mediumImpact();
            setStep(2);
        }
    };

    const handleRegister = async () => {
        if (!formData.phone) {
            Alert.alert('Error', 'Please enter your phone number.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: `+91${formData.phone.trim()}`, // Defaulting to IN for now as requested
                dateOfBirth: formData.birthDate.toISOString().split('T')[0],
                expectedDueDate: dueDateSelected ? formData.expectedDueDate.toISOString().split('T')[0] : undefined,
                password: formData.password.trim(),
                confirmPassword: formData.confirmPassword.trim(),
                role: 'patient'
            };

            const response = await api.post('/auth/register', payload);

            if (response.data.token && response.data.user) {
                await signIn(response.data.token, response.data.user);
                successNotification();
                Alert.alert('Success', 'Account created! Welcome to PrenatalPlus.');
            } else {
                router.replace('/(auth)/login');
            }
        } catch (error: any) {
            errorNotification();
            const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed.';
            Alert.alert('Registration Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
                        <View style={styles.logoGradient}>
                            <Text style={styles.logoText}>P+</Text>
                        </View>
                        <Text style={styles.title}>Join PrenatalPlus</Text>
                        <Text style={styles.subtitle}>
                            {step === 1 ? 'Start your supported pregnancy journey today.' : 'Tell us a bit more about yourself.'}
                        </Text>
                    </Animated.View>

                    {/* Step Progress */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
                        <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
                        <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
                    </View>

                    {step === 1 ? (
                        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChangeText={(t) => handleChange('name', t)}
                                leftIcon={<UserIcon size={20} color={theme.colors.text.tertiary} />}
                            />

                            <Input
                                label="Email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChangeText={(t) => handleChange('email', t)}
                                keyboardType="email-address"
                                leftIcon={<Mail size={20} color={theme.colors.text.tertiary} />}
                            />

                            <Input
                                label="Password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChangeText={(t) => handleChange('password', t)}
                                secureTextEntry={!showPassword}
                                leftIcon={<Lock size={20} color={theme.colors.text.tertiary} />}
                                rightIcon={
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={20} color={theme.colors.primary[500]} /> : <Eye size={20} color={theme.colors.text.tertiary} />}
                                    </TouchableOpacity>
                                }
                            />

                            <View style={styles.validationContainer}>
                                <PasswordRequirement label="At least 8 characters" met={validations.length} />
                                <PasswordRequirement label="At least one number" met={validations.number} />
                                <PasswordRequirement label="At least one special symbol" met={validations.symbol} />
                            </View>

                            <Input
                                label="Confirm Password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChangeText={(t) => handleChange('confirmPassword', t)}
                                secureTextEntry={!showPassword}
                                state={validations.match ? 'success' : 'default'}
                                leftIcon={<Lock size={20} color={theme.colors.text.tertiary} />}
                            />

                            <Button
                                fullWidth
                                size="lg"
                                style={styles.actionButton}
                                onPress={nextStep}
                                icon={<ChevronRight size={20} color="white" />}
                                iconPosition="right"
                            >
                                Continue
                            </Button>
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeInRight} style={styles.stepContainer}>
                            <View style={styles.phoneInputContainer}>
                                <View style={styles.countryPicker}>
                                    <Text style={styles.countryText}>🇮🇳 +91</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        label="Phone Number"
                                        placeholder="9876543210"
                                        value={formData.phone}
                                        onChangeText={(t) => handleChange('phone', t)}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => setShowBirthPicker(true)}>
                                <Input
                                    label="Birth Date"
                                    value={formData.birthDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    editable={false}
                                    pointerEvents="none"
                                    leftIcon={<Calendar size={20} color={theme.colors.text.tertiary} />}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowDuePicker(true)}>
                                <Input
                                    label="Expected Due Date (Optional)"
                                    value={dueDateSelected ? formData.expectedDueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                    placeholder="Tap to set due date"
                                    editable={false}
                                    pointerEvents="none"
                                    helperText="You can also add this later from Profile"
                                    leftIcon={<Baby size={20} color={theme.colors.text.tertiary} />}
                                />
                            </TouchableOpacity>

                            {showBirthPicker && (
                                <DateTimePicker
                                    value={formData.birthDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, date) => {
                                        setShowBirthPicker(false);
                                        if (date) handleChange('birthDate', date);
                                    }}
                                    maximumDate={new Date()}
                                />
                            )}

                            {showDuePicker && (
                                <DateTimePicker
                                    value={formData.expectedDueDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, date) => {
                                        setShowDuePicker(false);
                                        if (date) {
                                            handleChange('expectedDueDate', date);
                                            setDueDateSelected(true);
                                        }
                                    }}
                                    minimumDate={new Date()}
                                />
                            )}

                            <View style={styles.buttonRow}>
                                <Button
                                    variant="outline"
                                    style={{ flex: 1 }}
                                    onPress={() => setStep(1)}
                                >
                                    Back
                                </Button>
                                <Button
                                    fullWidth={false}
                                    style={{ flex: 2 }}
                                    onPress={handleRegister}
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Create Account
                                </Button>
                            </View>
                        </Animated.View>
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
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
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.xl,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    logoGradient: {
        width: 56,
        height: 56,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadows.md,
        backgroundColor: theme.colors.primary[500],
    },
    logoText: {
        color: theme.colors.white,
        fontSize: theme.typography.fontSize['2xl'],
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
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.gray[200],
    },
    progressDotActive: {
        backgroundColor: theme.colors.primary[500],
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: theme.colors.gray[200],
        marginHorizontal: 8,
    },
    progressLineActive: {
        backgroundColor: theme.colors.primary[500],
    },
    stepContainer: {
        width: '100%',
    },
    validationContainer: {
        marginBottom: theme.spacing.md,
        marginTop: -theme.spacing.sm,
        paddingHorizontal: 4,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    requirementDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.gray[300],
        marginRight: 8,
    },
    requirementDotMet: {
        backgroundColor: theme.colors.success[500],
    },
    requirementText: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
    },
    requirementTextMet: {
        color: theme.colors.success[700],
        fontWeight: '500',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing.sm,
    },
    countryPicker: {
        height: 52,
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border.default,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.sm,
    },
    countryText: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    actionButton: {
        marginTop: theme.spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing['2xl'],
    },
    footerText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.base,
    },
    footerLink: {
        color: theme.colors.primary[500],
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
    },
});
