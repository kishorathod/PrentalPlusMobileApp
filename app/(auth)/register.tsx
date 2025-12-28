import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../src/lib/api';

export default function RegisterScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birthDate: '', // YYYY-MM-DD
        expectedDueDate: '', // YYYY-MM-DD
        password: '',
        confirmPassword: '',
    });

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleRegister = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        // Updated to match Web App's endpoint: /api/auth/register
        // BaseURL is /api, so we post to /auth/register
        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                dateOfBirth: formData.birthDate,
                expectedDueDate: formData.expectedDueDate || undefined,
                password: formData.password.trim(), // Trim password too to be safe (though usually not recommended, for mobile it helps avoid accidental spaces)
                confirmPassword: formData.confirmPassword.trim(),
                role: 'patient'
            };

            console.log('Registering with payload:', JSON.stringify(payload));
            await api.post('/auth/register', payload);

            Alert.alert('Success', 'Account created! Please log in.', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') }
            ]);
        } catch (error: any) {
            console.error('Registration Error:', error);
            if (error.response) {
                console.log('Error Data:', JSON.stringify(error.response.data));
            }
            const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed.';
            Alert.alert('Registration Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView className="px-8 pt-6 pb-10" showsVerticalScrollIndicator={false}>
                        <View className="items-center mb-8">
                            <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-200">
                                <Text className="text-white text-2xl font-bold">P+</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900">Join PrenatalPlus</Text>
                            <Text className="text-gray-500 mt-2 text-center">Start your supported pregnancy journey today.</Text>
                        </View>

                        <View className="space-y-4">
                            <InputField label="Full Name" placeholder="John Doe" value={formData.name} onChangeText={(t: string) => handleChange('name', t)} />
                            <InputField label="Email" placeholder="email@example.com" value={formData.email} onChangeText={(t: string) => handleChange('email', t)} keyboardType="email-address" />

                            <View className="flex-row justify-between space-x-2">
                                <View className="flex-1">
                                    <InputField label="Phone" placeholder="9876543210" value={formData.phone} onChangeText={(t: string) => handleChange('phone', t)} keyboardType="phone-pad" />
                                </View>
                                <View className="flex-1">
                                    <InputField label="Birth Date (YYYY-MM-DD)" placeholder="1995-01-01" value={formData.birthDate} onChangeText={(t: string) => handleChange('birthDate', t)} />
                                </View>
                            </View>

                            <InputField label="Expected Due Date (Optional)" placeholder="2026-05-20" value={formData.expectedDueDate} onChangeText={(t: string) => handleChange('expectedDueDate', t)} />

                            <InputField label="Password" placeholder="••••••••" value={formData.password} onChangeText={(t: string) => handleChange('password', t)} secureTextEntry />
                            <InputField label="Confirm Password" placeholder="••••••••" value={formData.confirmPassword} onChangeText={(t: string) => handleChange('confirmPassword', t)} secureTextEntry />

                            <TouchableOpacity
                                className="w-full bg-blue-600 rounded-xl py-4 items-center justify-center shadow-lg shadow-blue-200 mt-6 active:bg-blue-700"
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Create Account</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-center mt-8 mb-10">
                            <Text className="text-gray-500">Already have an account? </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity>
                                    <Text className="text-blue-600 font-bold">Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

function InputField({ label, ...props }: any) {
    return (
        <View className="mb-2">
            <Text className="text-gray-700 font-medium mb-2 ml-1">{label}</Text>
            <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-blue-500 focus:bg-white"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                {...props}
            />
        </View>
    );
}

// Need to import SafeAreaView locally since it's used inside the component
import { SafeAreaView } from 'react-native-safe-area-context';

