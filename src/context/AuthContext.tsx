import axios from 'axios';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../lib/api';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    signIn: (token: string, userData: User) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const loadSession = async () => {
            try {
                const token = await SecureStore.getItemAsync('sessionToken');
                const userData = await SecureStore.getItemAsync('userData');

                if (token && userData) {
                    console.log('[AuthContext] Found stored session, verifying...');
                    try {
                        const rawAxios = axios.create({ baseURL: API_URL, maxRedirects: 0, validateStatus: (status) => status < 500 });
                        const testConfig = { headers: {} as any };
                        if (token.includes('authjs.session-token=') || token.includes('next-auth.session-token=')) {
                            testConfig.headers['Cookie'] = token;
                        } else {
                            testConfig.headers['Authorization'] = `Bearer ${token}`;
                        }

                        const verifyRes = await rawAxios.get('/mobile-auth', testConfig);
                        if (verifyRes.status === 200 && !verifyRes.headers['content-type']?.includes('text/html')) {
                            console.log('[AuthContext] Session verified strictly, restoring user.');
                            setUser(JSON.parse(userData));
                        } else {
                            console.warn('[AuthContext] Verification failed status=', verifyRes.status);
                            throw new Error('Invalid status');
                        }
                    } catch (verifyErr) {
                        console.error('[AuthContext] Session invalid/expired:', verifyErr);
                        await Promise.all([SecureStore.deleteItemAsync('sessionToken'), SecureStore.deleteItemAsync('userData')]);
                        setUser(null);
                    }
                } else if (token || userData) {
                    console.log('[AuthContext] Partial session found, clearing...');
                    await Promise.all([SecureStore.deleteItemAsync('sessionToken'), SecureStore.deleteItemAsync('userData')]);
                    setUser(null);
                }
            } catch (e) {
                console.error('Failed to load session:', e);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        // Safety check: ensure segments is available
        if (!segments) {
            console.log('[AuthContext] Segments null, waiting...');
            return;
        }

        console.log('[AuthContext] Segments:', JSON.stringify(segments), 'User:', !!user);
        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            console.log('[AuthContext] Redirecting to login...');
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            console.log('[AuthContext] Redirecting to home...');
            router.replace('/');
        }
    }, [user, segments, isLoading, router]);

    const signIn = async (token: string, userData: User) => {
        console.log('[AuthContext] signIn called with token length:', token?.length);
        console.log('[AuthContext] signIn called with user:', userData?.email);

        try {
            await SecureStore.setItemAsync('sessionToken', token);
            await SecureStore.setItemAsync('userData', JSON.stringify(userData));
            console.log('[AuthContext] Token and user data saved to SecureStore');

            setUser(userData);
            console.log('[AuthContext] User state updated');
            // Navigation will happen automatically via useEffect when user state changes
        } catch (error) {
            console.error('[AuthContext] Error saving to SecureStore:', error);
        }
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync('sessionToken');
        await SecureStore.deleteItemAsync('userData');
        setUser(null);
        try {
            router.replace('/(auth)/login');
        } catch (e) {
            console.log('[AuthContext] Navigation not ready in signOut');
        }
    };

    const value = {
        user,
        isLoading,
        signIn,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
