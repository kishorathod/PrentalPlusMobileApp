import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// TODO: Replace with your actual local IP or deployed URL
// For Android Emulator use 'http://10.0.2.2:3000/api'
// For Physical Device use your machine's LAN IP e.g., 'http://192.168.1.X:3000/api'
export const API_URL = 'https://prenatal-plus.vercel.app/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    try {
        const token = await SecureStore.getItemAsync('sessionToken');
        console.log('[API Interceptor] Token retrieved:', token ? `${token.substring(0, 15)}...` : 'NULL/EMPTY');

        if (token) {
            if (token.includes('authjs.session-token=') || token.includes('next-auth.session-token=')) {
                config.headers['Cookie'] = token;
                console.log('[API Interceptor] Attached Cookie header');
            } else {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('[API Interceptor] Attached Bearer header');
            }
        } else {
            console.warn('[API Interceptor] !!! NO TOKEN IN SECURESTORE !!!');
        }
    } catch (e) {
        console.error('[API Interceptor] Error reading SecureStore:', e);
    }
    return config;
});

export default api;
