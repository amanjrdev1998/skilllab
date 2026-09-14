"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import UserDashboard from "@/components/UserDashboard";

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function UserDashboardPage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            // Get authentication data from localStorage
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");
            const expiresAt = localStorage.getItem("expires_at");

            // No token
            if (!token) {
                router.replace("/user");
                return;
            }

            // Check token expiration
            if (expiresAt) {
                const now = Date.now();
                const expiry = parseInt(expiresAt, 10);

                if (Number.isNaN(expiry) || now >= expiry) {
                    // Token expired
                    localStorage.removeItem("token");
                    localStorage.removeItem("secret_key");
                    localStorage.removeItem("user");
                    localStorage.removeItem("expires_at");
                    localStorage.removeItem("user_id");
                    localStorage.removeItem("isAuthenticated");

                    router.replace("/user");
                    return;
                }
            }

            // User data does not exist
            if (!userData) {
                router.replace("/user");
                return;
            }

            // Parse user data
            try {
                const parsedUser: User = JSON.parse(userData);

                // Validate basic user data
                if (!parsedUser.id || !parsedUser.email) {
                    throw new Error("Invalid user data");
                }

                setUser(parsedUser);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to parse user data:", error);

                // Clear invalid session
                localStorage.removeItem("token");
                localStorage.removeItem("secret_key");
                localStorage.removeItem("user");
                localStorage.removeItem("expires_at");
                localStorage.removeItem("user_id");
                localStorage.removeItem("isAuthenticated");

                router.replace("/user");
            }
        };

        checkAuth();
    }, [router]);

    // Show loading while authentication is being checked
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Checking authentication...
                    </p>
                </div>
            </div>
        );
    }

   
    if (!user) {
        return null;
    }
    return (
        <DashboardLayout user={user}>
            <UserDashboard user={user} />
        </DashboardLayout>
    );
}