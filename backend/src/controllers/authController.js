import User from "../models/userModel.js";
import validator from "validator"
import bcrypt from "bcryptjs"
import { genToken, genToken1 } from "../utils/token.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../config/emailService.js";
import admin from "firebase-admin";

// Lazy-initialize Firebase Admin SDK (env vars aren't loaded at import time)
const getFirebaseAdmin = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID || "login-neocart",
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
    return admin;
};


export const registration = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existUser = await User.findOne({ email })
        if (existUser) {
            return res.status(400).json({ message: "User already exist" })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Enter valid Email" })
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Enter Strong Password" })
        }
        let hashPassword = await bcrypt.hash(password, 10)

        const user = await User.create({ name, email, password: hashPassword })
        let token = await genToken(user._id)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(201).json(user)
    } catch (error) {
        console.log("registration error")
        return res.status(500).json({ message: `registration error ${error}` })
    }
}


export const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User is not Found" })
        }
        let isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" })
        }
        let token = await genToken(user._id)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(201).json(user)

    } catch (error) {
        console.log("login error")
        return res.status(500).json({ message: `Login error ${error}` })
    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax"
        })
        return res.status(200).json({ message: "logOut successful" })
    } catch (error) {
        console.log("logOut error")
        return res.status(500).json({ message: `LogOut error ${error}` })
    }
}


export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Firebase ID token is required" })
        }

        // Verify the Firebase ID token server-side
        let decodedToken;
        try {
            const firebaseAdmin = getFirebaseAdmin();
            decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired Google token" })
        }

        const email = decodedToken.email;
        const name = decodedToken.name || decodedToken.email;

        if (!email) {
            return res.status(400).json({ message: "Email not found in Google token" })
        }

        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                name, email
            })
        }

        let token = await genToken(user._id)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json(user)

    } catch (error) {
        console.log("googleLogin error")
        return res.status(500).json({ message: "Google login failed. Please try again." })
    }
}


export const adminLogin = async (req, res) => {
    try {
        let { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        let user = await User.findOne({
            email,
            isActive: true,
            role: { $in: ['admin', 'superadmin'] }
        })

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials or access denied" })
        }

        if (!user.password) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        let isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        user.lastLogin = new Date()
        await user.save()

        let token = await genToken(user._id)
        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 8 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        return res.status(500).json({ message: `Login error: ${error.message}` })
    }
}

export const adminLogOut = async (req, res) => {
    try {
        res.clearCookie("adminToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax"
        })
        return res.status(200).json({ message: "Admin logout successful" })
    } catch (error) {
        return res.status(500).json({ message: `Admin logout error: ${error.message}` })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Valid email is required" });
        }

        const user = await User.findOne({ email, isActive: true });

        if (!user) {
            return res.json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link"
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "This account uses social login. Please sign in with Google."
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
        await user.save();

        const emailResult = await sendPasswordResetEmail(email, resetToken, user.name);

        if (!emailResult.success) {
            console.error('Failed to send reset email:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: "Failed to send reset email. Please try again later."
            });
        }

        res.json({
            success: true,
            message: "Password reset link has been sent to your email"
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};

export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        res.json({
            success: true,
            message: "Token is valid",
            email: user.email
        });

    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({
            success: true,
            message: "Password has been reset successfully. You can now login with your new password."
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};
