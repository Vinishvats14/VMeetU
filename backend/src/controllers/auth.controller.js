import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { upsertStreamUser } from "../lib/stream.js";

// Helper to generate and set JWT cookie
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
  });

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only on HTTPS in production
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // ✅ Lax for development
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

export async function signup(req, res) {
    const { email, password, fullname } = req.body;
    try {
        if (!email || !password || !fullname) {
            return res.status(400).json({ message: "All fields are required u" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation regex
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "email already exists" });
        }

        const idx = Math.floor(Math.random() * 100) + 1; // Random index for profile picture
        const profilePic = `https://avatar.iran.liara.run/public/${idx}.png`;

        // const profilePic = `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(idx)}`;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);   //agar m use nhi karunga to mongodbatlas m password dhikega no hashing done 
        // yeh h manuaaly add karna password jhaa jarurat hogi we can also make pre in model to do the same 

        const newUser = await User.create({
            email,
            fullname,              // this create a new user based on this data 
            password : hashedPassword, // store the hashed password
            profilePic: profilePic,
        })

        // Create Stream user after MongoDB user is created successfully
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullname,
                image: newUser.profilePic || "",
            });
            console.log(`Stream user created for ${newUser.fullname}`);
        } catch (error) {
            console.log("Error creating Stream user:", error);
        }

        // Generate token and set cookie
        generateTokenAndSetCookie(res, newUser._id);
        
        res.status(201).json({ success: true, user: newUser }); // send the user and token back to the client

    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
    const {email ,password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }
        generateTokenAndSetCookie(res, user._id); // Generate token and set cookie
        res.status(200).json({ message: "Login successful", user });
        console.log('User logged in:', user.email);

    }catch(error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function logout(req, res) {
    res.clearCookie("accessToken");
    res.status(200).json({ message: "Logout successful" });
    console.log('User logged out:', req.body);
}

export async function getMe(req, res) {
    try {
        console.log("getMe called, req.user:", req.user);
        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        console.error('Error in getMe:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function onboard(req, res) {
    try {
        const userId = req.user._id; // Assuming req.user is set by the protectRoute middleware

        const { fullname, bio, nativeLanguage, learningLanguage, location } = req.body;
        if (!fullname || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({ 
                message: "All fields are required",
                missingFields: [
                    !fullname && "fullname",
                    !bio && "bio",     
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean),
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...req.body,
                isOnboarded: true,
            },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullname,
                image: updatedUser.profilePic || "",
            });
            console.log(`Stream user updated after onboarding for ${updatedUser.fullname}`);
        } catch (streamError) {
            console.log("Error updating Stream user during onboarding:", streamError.message);
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error in onboarding:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

