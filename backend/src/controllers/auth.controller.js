import cloudinary from "../lib/cloudinary.js";
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

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    if(!email || !password) {
        return res.status(400).send("Please fill all the fields");
    }

    try {
        const user = await User.findOne({
            email
        });

        if(!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        generateJWTToken(user._id, res);
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic
            }
        });
    } catch (error) {
        console.error("Error in login controller", error);
        res.status(500).send("Internal Server Error");        
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
        })
        return res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        
    }
}

export const updateProfile = async (req, res) => {
   try {
     const { profilePic } =  req.body;
     const user = req.user._id ;

     if(!profilePic) {
         return res.status(400).json({
             message: "Profile picture is required"
         });
     }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
        user,
        { profilePic: uploadResponse.secure_url },
        { new: true }
    );

    res.status(200).json(updatedUser)

   } catch (error) {
         console.error("Error in updateProfile controller", error);
         res.status(500).json({
            message: "Internal Server Error"
         });
   }
}

export const checkAuth = (req, res) => {
   try {
        res.status(200).json(req.user);
   } catch (error) {
        console.error("Error in checkAuth controller", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
   }
}