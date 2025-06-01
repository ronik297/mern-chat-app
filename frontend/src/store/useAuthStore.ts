import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

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
    }
}))
