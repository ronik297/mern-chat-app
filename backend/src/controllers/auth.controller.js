import { generateJWTToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if(!fullName || !email || !password) {
            return res.status(400).send("Please fill all the fields");
        }

        // hash password
        if(password.length < 6) {
            return res.status(400).send("Password must be at least 6 characters long");
        }

        const user =  await User.findOne({
            email
        });

        if(user) return res.status(400).json({
            message: "Email already exists"
        })

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });
        
        if(newUser) {
            generateJWTToken(newUser._id, res);
            await newUser.save();

            return res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    profilePic: newUser.profilePic
                }
            });
        } else {
            return res.status(400).json({
                message: "Invalid user data"
            });
        }

    } catch (error) {
        console.error("Error in signup controller", error);
        res.status(500).send("Internal Server Error");
    }

}

export const login = (req, res) => {
    res.send("login Page");
}

export const logout = (req, res) => {
    res.send("logout Page");
}