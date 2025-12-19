/**
 * Authentication Context
 * 
 * Provides global auth state and methods throughout the app.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User } from '../types';
import { userService } from '../services/userService';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    isLoading: true,
    isAuthenticated: false,
});

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                // Fetch user profile from Firestore
                try {
                    const userProfile = await userService.getUserProfile(fbUser.uid);
                    setUser(userProfile);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value: AuthContextType = {
        user,
        firebaseUser,
        isLoading,
        isAuthenticated: !!firebaseUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
