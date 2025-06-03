import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';

const BASE_URL = 'http://localhost:5001';

type SignupData = {
    email: string;
    password: string;
    fullName: string;
};

type LoginData = {
    email: string;
    password: string;
}

export type User = {
    _id: string;
    email: string;
    fullName?: string;
    profilePic?: string;
    createdAt?: string;
}

interface AuthStore {
  authUser: User | null; 
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[]; 
  checkAuth: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  updateProfile: (data: { fullName?: string; profilePic?: string }) => Promise<void>;
  socket: Socket | null;
  connectSocket: () => void; 
  disconnectSocket: () => void; 
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],    
    isCheckingAuth: true,
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/auth/check');

            set({ authUser: response.data })

            get().connectSocket();
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
            get().connectSocket();
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
            get().disconnectSocket();
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

            get().connectSocket();
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Login failed");
            console.error("Error logging in:", err);
        } finally {
            set({ isLoggingIn: false });
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const response = await axiosInstance.put('/auth/update-profile', data);
            set({authUser: response.data});
            toast.success('Profile updated successfully!');
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Profile update failed");
            console.error("Error updating profile:", err);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser, socket } = get(); 
        if (!authUser || socket?.connected) { 
            if (!authUser) {
                console.warn("Cannot connect socket without authenticated user");
            }
            return;
        }

        const newSocket = io(BASE_URL, {
            query: {
                userId: authUser._id
            }
        })
        newSocket.connect();

        set({ socket: newSocket });

        newSocket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds });
        });
    },
    disconnectSocket: () => {
         const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
        }
        set({ socket: null });
    }
}))
