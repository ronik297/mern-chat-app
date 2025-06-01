import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import type { User } from './useAuthStore';

interface ChatState {
    messages: string[];
    users: User[];
    selectedUser: string | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    setSelectedUser: (userId: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    users: [],
    selectedUser: null, 
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get('/messages/users');
            set({ users: response.data });
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data });
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    // todo: optimize this one later
    setSelectedUser: (userId: string | null) => set({ selectedUser: userId }),
       
}))