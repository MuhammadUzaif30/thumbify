import { createContext, useContext, useEffect, useState } from "react";
import type { IUser } from "../../assets/assets";
import api from "../configs/api";
import toast from "react-hot-toast";

interface AuthContextProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    signUp: (data: { name: string; email: string; password: string }) => Promise<void>;
    login: (data: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    user: null,
    setUser: () => {},
    signUp: async () => {},
    login: async () => {},
    logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const signUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
        try {
            const { data } = await api.post("/api/auth/register", { name, email, password });
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }
            toast.success(data.message);
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Sign up failed");
        }
    };

    const login = async ({ email, password }: { email: string; password: string }) => {
        try {
            const { data } = await api.post("/api/auth/login", { email, password });
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }
            toast.success(data.message);
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Login failed");
        }
    };

    const logout = async () => {
        try {
            const { data } = await api.post("/api/auth/logout");
            setUser(null);
            setIsLoggedIn(false);
            toast.success(data.message);
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    };

    const fetchUser = async () => {
        try {
            const { data } = await api.get("/api/auth/verify");
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const value = { user, setUser, isLoggedIn, setIsLoggedIn, signUp, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);