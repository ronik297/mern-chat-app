import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuthStore, type User } from './useAuthStore';

export type Message = {
    _id: string;
    senderId: string;
    receiverId: string;
    text: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
};

export type SendMessageData = {
    text: string;
    image?: string | null;
};

interface ChatState {
    messages: Message[];
    users: User[];
    selectedUser: User | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    setSelectedUser: (user: User | null) => void;
    sendMessage: (messageData: SendMessageData) => Promise<void>;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
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

    sendMessage: async (messageData: SendMessageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser?._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error("Failed to send message");
            console.error('Error sending message:', error);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket as import("socket.io-client").Socket;

        socket.on("newMessage", (message: Message) => {
            if(message.senderId !== selectedUser._id) return;
            set({ 
                messages: [...get().messages, message],
            })
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket as import("socket.io-client").Socket;
        socket.off("newMessage");
    },

    setSelectedUser: (user: User | null) => set({ selectedUser: user }),
}))