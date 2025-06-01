import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

type SignupData = {
    email: string;
    password: string;
    fullName: string;
};

type LoginData = {
    email: string;
    password: string;
}

interface AuthStore {
  authUser: {
    id: string;
    email: string;
    fullName?: string; 
    profilePic?: string; 
    createdAt?: string;
  } | null; 
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/auth/check');

            set({ authUser: response.data })
        } catch (error) {
            console.error('Error checking authentication:', error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    signup: async (data : SignupData) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosInstance.post('/auth/signup', data);
            toast.success('Account created successfully!');
            set({ authUser: response.data });
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Signup failed");
            console.error("Error signing up:", err);
        } finally {
            set({ isSigningUp: false });
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success('Logged out successfully!');
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Logout failed");
            console.error("Error logging out:", err);
        }
    },
    login: async (data: LoginData) => {
        set({ isLoggingIn: true });
        try {
            const response = await axiosInstance.post('/auth/login', data);
            set({ authUser: response.data });
            toast.success('Logged in successfully!');
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Login failed");
            console.error("Error logging in:", err);
        } finally {
            set({ isLoggingIn: false });
        }
    }
}))
