
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Role = "user" | "researcher" | "admin" | "guest";

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    role: Role;
    login: (role: Role, email: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role>("guest");
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Load user from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("variomex_user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setRole(parsedUser.role);
            } catch (_) {
                // Ignore parse error
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (selectedRole: Role, email: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
            id: "1",
            name: email.split("@")[0],
            email,
            role: selectedRole,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        };

        setUser(mockUser);
        setRole(selectedRole);
        localStorage.setItem("variomex_user", JSON.stringify(mockUser));

        // Redirect based on role
        router.push(`/dashboard/${selectedRole}`);
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        setRole("guest");
        localStorage.removeItem("variomex_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
