import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setFormLoading(true);
        try {
            // Sign In using Custom Mobile Login Route
            const cleanEmail = email.trim();
            const cleanPassword = password.trim();

            console.log(`Attempting login with: "${cleanEmail}"`);

            const payload = {
                email: cleanEmail,
                password: cleanPassword
            };

            // CRITICAL FIX (Patch 3.0): Use Custom Mobile API Proxy
            // This route (/api/mobile-login) handles the NextAuth interactions server-side
            // and guarantees a JSON response, converting any HTML redirects into 401s.
            const response = await api.post('/mobile-login', payload);

            console.log('--- LOGIN RESPONSE (Patch 3.0) ---');
            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data));

            // Handle errors from custom API
            if (response.data?.error) {
                throw new Error(response.data.error);
            }

            // Extract token from response
            const sessionToken = response.data?.token || '';

            if (!sessionToken) {
                throw new Error('Authentication successful but no token received.');
            }

            console.log('Token received, length:', sessionToken.length);

            // Store session and user data
            const userPreview = response.data?.user || { id: 'user', name: 'User', email: cleanEmail, role: 'PATIENT' };
            await signIn(sessionToken, userPreview as any);

        } catch (error: any) {
            console.error('Login Error:', error);
            console.error('Error response status:', error.response?.status);
            console.error('Error response data:', JSON.stringify(error.response?.data));
            console.error('Error response headers:', JSON.stringify(error.response?.headers));
            const message = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
            Alert.alert('Login Error', message);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center px-8"
            >
                <View className="items-center mb-10">
                    <View className="w-20 h-20 bg-blue-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        <Text className="text-white text-3xl font-bold">P+</Text>
                    </View>
                    <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
                    <Text className="text-gray-500 mt-2 text-center">Sign in to continue your prenatal journey</Text>
                    <Text className="text-xs text-gray-400 mt-1">Security Patch 3.0 (Custom API)</Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Email Address</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-blue-500 focus:bg-white"
                            placeholder="e.g. sarah@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Password</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-blue-500 focus:bg-white"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <TouchableOpacity
                        className="flex-row justify-end"
                        onPress={() => Alert.alert('Forgot Password', 'Please visit our website to reset your password.')}
                    >
                        <Text className="text-blue-600 font-semibold">Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-full bg-blue-600 rounded-xl py-4 items-center justify-center shadow-lg shadow-blue-200 mt-4 active:bg-blue-700"
                        onPress={handleLogin}
                        disabled={formLoading}
                    >
                        {formLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-center mt-10">
                    <Text className="text-gray-500">Don't have an account? </Text>
                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-bold">Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                <TouchableOpacity
                    className="mt-8 self-center p-2"
                    onPress={async () => {
                        try {
                            const res = await api.get('/auth/csrf');
                            Alert.alert('Connection OK', `Status: ${res.status}\nCSRF: ${res.data.csrfToken ? 'Found' : 'Missing'}\nURL: ${api.getUri()}`);
                        } catch (e: any) {
                            Alert.alert('Connection Failed', `${e.message}\nURL: ${api.getUri()}`);
                        }
                    }}
                >
                    <Text className="text-gray-400 text-xs text-center">DEBUG: Test Server Connection</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    );
}
