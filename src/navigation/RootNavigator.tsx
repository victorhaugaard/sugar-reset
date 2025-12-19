/**
 * Root Navigation Setup for SugarReset
 * 
 * Calm, linear navigation flow with emphasis on habit science.
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    RootStackParamList,
    AuthStackParamList,
    OnboardingStackParamList,
    MainTabParamList,
} from '../types';
import { colors } from '../theme';
import { useAuthContext } from '../context/AuthContext';

// Onboarding Screens
import {
    LaunchScreen,
    IntentSelectionScreen,
    SugarDefinitionScreen,
    ScienceFramingScreen,
    BaselineSetupScreen,
    PaywallScreen,
} from '../screens/onboarding';

// Auth Screens
import {
    LoginScreen,
    SignUpScreen,
    ForgotPasswordScreen,
} from '../screens/auth';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ScienceScreen from '../screens/ScienceScreen';
import ProfileScreen from '../screens/ProfileScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background.primary,
                    borderTopColor: colors.border.subtle,
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 80,
                },
                tabBarActiveTintColor: colors.accent.primary,
                tabBarInactiveTintColor: colors.text.tertiary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 4,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Today',
                    tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
                }}
            />
            <Tab.Screen
                name="Progress"
                component={ProgressScreen}
                options={{
                    tabBarLabel: 'Progress',
                    tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} />,
                }}
            />
            <Tab.Screen
                name="Science"
                component={ScienceScreen}
                options={{
                    tabBarLabel: 'Science',
                    tabBarIcon: ({ color }) => <TabIcon emoji="🧬" color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

// Simple emoji tab icon
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
    return (
        <View style={[styles.tabIcon, { opacity: color === colors.accent.primary ? 1 : 0.6 }]}>
            <Text style={styles.emojiText}>{emoji}</Text>
        </View>
    );
}

// Loading Screen
function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
    );
}

// Root Navigation - For testing, always show all screens
export default function RootNavigator() {
    const { isLoading } = useAuthContext();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
                initialRouteName="Onboarding"
            >
                {/* Onboarding Flow */}
                <RootStack.Screen name="Onboarding">
                    {() => (
                        <OnboardingStack.Navigator
                            screenOptions={{
                                headerShown: false,
                                animation: 'fade',
                            }}
                        >
                            <OnboardingStack.Screen name="Launch" component={LaunchScreen} />
                            <OnboardingStack.Screen name="IntentSelection" component={IntentSelectionScreen} />
                            <OnboardingStack.Screen name="SugarDefinition" component={SugarDefinitionScreen} />
                            <OnboardingStack.Screen name="ScienceFraming" component={ScienceFramingScreen} />
                            <OnboardingStack.Screen name="BaselineSetup" component={BaselineSetupScreen} />
                            <OnboardingStack.Screen name="Paywall" component={PaywallScreen} />
                        </OnboardingStack.Navigator>
                    )}
                </RootStack.Screen>

                {/* Auth Flow */}
                <RootStack.Screen name="Auth">
                    {() => (
                        <AuthStack.Navigator
                            screenOptions={{
                                headerShown: false,
                                animation: 'slide_from_right',
                            }}
                        >
                            <AuthStack.Screen name="Login" component={LoginScreen} />
                            <AuthStack.Screen name="SignUp" component={SignUpScreen} />
                            <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                        </AuthStack.Navigator>
                    )}
                </RootStack.Screen>

                {/* Main App */}
                <RootStack.Screen name="Main" component={MainTabNavigator} />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
    },
    tabIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiText: {
        fontSize: 20,
    },
});
