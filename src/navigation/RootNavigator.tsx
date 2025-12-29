/**
 * Root Navigation Setup for SugarReset
 * 
 * Calm, linear navigation flow with emphasis on habit science.
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
    WelcomeScreen,
    QuizIntroScreen,
    SugarDefinitionScreen,
    ComprehensiveQuizScreen,
    SugarScienceScreen,
    SugarestWelcomeScreen,
    SuccessStoriesScreen,
    FeatureShowcaseScreen,
    GoalsScreen,
    PlanSelectionScreen,
    PromiseScreen,
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
import AnalyticsScreen from '../screens/AnalyticsScreen';
import LibraryScreen from '../screens/LibraryScreen';
import AlternativesScreen from '../screens/AlternativesScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Support/Modal Screens
import ReasonsScreen from '../screens/ReasonsScreen';
import BreathingExerciseScreen from '../screens/BreathingExerciseScreen';
import JournalScreen from '../screens/JournalScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator (swipe not supported with BottomTabNavigator)
function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'rgba(255, 250, 245, 0.98)',
                    borderTopColor: 'transparent',
                    borderTopWidth: 0,
                    paddingTop: 6,
                    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
                    height: Platform.OS === 'ios' ? 80 : 60,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
                tabBarActiveTintColor: '#D97B66',
                tabBarInactiveTintColor: 'rgba(107, 114, 128, 0.7)',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Feather name="home" size={22} color={color} style={{ opacity: focused ? 1 : 0.6 }} />
                    ),
                }}
            />
            <Tab.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{
                    tabBarLabel: 'Analytics',
                    tabBarIcon: ({ color, focused }) => (
                        <Feather name="bar-chart-2" size={22} color={color} style={{ opacity: focused ? 1 : 0.6 }} />
                    ),
                }}
            />
            <Tab.Screen
                name="Alternatives"
                component={AlternativesScreen}
                options={{
                    tabBarLabel: 'Scan',
                    tabBarIcon: ({ color, focused }) => (
                        <Feather name="camera" size={22} color={color} style={{ opacity: focused ? 1 : 0.6 }} />
                    ),
                }}
            />
            <Tab.Screen
                name="Library"
                component={LibraryScreen}
                options={{
                    tabBarLabel: 'Library',
                    tabBarIcon: ({ color, focused }) => (
                        <Feather name="book-open" size={22} color={color} style={{ opacity: focused ? 1 : 0.6 }} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Feather name="user" size={22} color={color} style={{ opacity: focused ? 1 : 0.6 }} />
                    ),
                }}
            />
        </Tab.Navigator>
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
                            {/* Phase 1: Quiz */}
                            <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
                            <OnboardingStack.Screen name="QuizIntro" component={QuizIntroScreen} />
                            <OnboardingStack.Screen name="SugarDefinition" component={SugarDefinitionScreen} />
                            <OnboardingStack.Screen name="ComprehensiveQuiz" component={ComprehensiveQuizScreen} />

                            {/* Phase 2: Education & Social Proof */}
                            <OnboardingStack.Screen name="SugarDangers" component={SugarScienceScreen} />
                            <OnboardingStack.Screen name="SugarestWelcome" component={SugarestWelcomeScreen} />
                            <OnboardingStack.Screen name="FeatureShowcase" component={FeatureShowcaseScreen} />
                            <OnboardingStack.Screen name="SuccessStories" component={SuccessStoriesScreen} />

                            {/* Phase 3: Commitment */}
                            <OnboardingStack.Screen name="Goals" component={GoalsScreen} />
                            <OnboardingStack.Screen name="PlanSelection" component={PlanSelectionScreen} />
                            <OnboardingStack.Screen name="Promise" component={PromiseScreen} />
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

                {/* Support Screens (accessible from any tab) */}
                <RootStack.Screen
                    name="Reasons"
                    component={ReasonsScreen}
                    options={{
                        presentation: 'fullScreenModal',
                        animation: 'fade',
                    }}
                />
                <RootStack.Screen
                    name="BreathingExercise"
                    component={BreathingExerciseScreen}
                    options={{
                        presentation: 'fullScreenModal',
                        animation: 'fade',
                    }}
                />
                <RootStack.Screen
                    name="Journal"
                    component={JournalScreen}
                    options={{
                        presentation: 'card',
                        animation: 'slide_from_right',
                    }}
                />
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
