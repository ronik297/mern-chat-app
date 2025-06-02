import cloudinary from '../lib/cloudinary.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}   

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params.id;
        const myId = req.user._id;

        if (!userToChatId) {
            return res.status(400).json({ error: "User ID is required" });
        }
       
        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userToChatId },
                { sender: userToChatId, receiver: myId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) { 
        console.error("Error in getMessages controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


export const sendMessage = async (req, res) => {
    try {
        const {text,image} = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;

        if(image) {
            // Uploaded base64 image to cloudinary
            const uploadedResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadedResponse.secure_url;
        }

        const newMessge = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessge.save();
        // todo: realtime functionality
        res.status(201).json(newMessge);
    } catch (error) {
        console.error("Error in sendMessage controller", error);
        res.status(500).json({ error: "Internal Server Error" });            
    }
}