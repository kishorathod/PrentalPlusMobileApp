import { Redirect } from 'expo-router';
import React from 'react';

export default function RootIndex() {
    // Redirect to the tabs layout home
    return <Redirect href="/(tabs)" />;
}
