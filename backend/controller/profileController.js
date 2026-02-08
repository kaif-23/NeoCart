import User from '../model/userModel.js';
import cloudinary, { uploadOnCloudinary } from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user profile (personal info)
export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        // Validate input
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields
        user.name = name.trim();
        if (phone) user.phone = phone.trim();

        await user.save();

        // Return without password
        const updatedUser = await User.findById(req.userId).select('-password -resetPasswordToken -resetPasswordExpires');

        res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete old image from cloudinary if exists
        if (user.profileImage) {
            try {
                const publicId = user.profileImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error('Failed to delete old image:', error);
            }
        }

        // Upload new image using uploadOnCloudinary function
        const imageUrl = await uploadOnCloudinary(req.file.path);

        if (!imageUrl) {
            return res.status(500).json({ success: false, message: 'Failed to upload image to cloud storage' });
        }

        user.profileImage = imageUrl;
        await user.save();

        res.json({
            success: true,
            message: 'Profile image updated successfully',
            profileImage: imageUrl
        });
    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
};

// Change password (requires current password)
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both passwords are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if user has password (Google auth users might not)
        if (!user.password) {
            return res.status(400).json({ success: false, message: 'Cannot change password for social login accounts' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear any reset tokens
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
