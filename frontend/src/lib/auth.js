'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        // Check for existing session
        const storedUser = api.getUser();
        const token = api.getToken();

        if (storedUser && token) {
            setUser(storedUser);
            fetchCartCount();
        }
        setLoading(false);
    }, []);

    const fetchCartCount = async () => {
        try {
            const response = await api.getCart();
            if (response.success) {
                setCartCount(response.data.items.length);
            }
        } catch {
            setCartCount(0);
        }
    };

    const login = async (email, password) => {
        const response = await api.login(email, password);
        if (response.success) {
            setUser(response.data.user);
            await fetchCartCount();
        }
        return response;
    };

    const register = async (email, password, name) => {
        const response = await api.register(email, password, name);
        if (response.success) {
            setUser(response.data.user);
        }
        return response;
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
        setCartCount(0);
    };

    const updateCartCount = (count) => {
        setCartCount(count);
    };

    const value = {
        user,
        loading,
        cartCount,
        login,
        register,
        logout,
        updateCartCount,
        fetchCartCount,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
