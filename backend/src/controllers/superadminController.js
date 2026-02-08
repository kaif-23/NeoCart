import User from '../models/userModel.js';

// Get all users with search and filters
export const getAllUsers = async (req, res) => {
    try {
        const { search, role, status } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .populate('promotedBy', 'name email');

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error fetching users: ${error.message}`
        });
    }
};

// Get user statistics
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        const admins = await User.countDocuments({ role: 'admin' });
        const superadmins = await User.countDocuments({ role: 'superadmin' });
        const regularUsers = await User.countDocuments({ role: 'user' });

        return res.status(200).json({
            success: true,
            stats: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                admins,
                superadmins,
                regularUsers
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error fetching stats: ${error.message}`
        });
    }
};

// Promote user to admin
export const promoteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const superadminId = req.user._id;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'User is already an admin'
            });
        }

        if (user.role === 'superadmin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify superadmin role'
            });
        }

        user.role = 'admin';
        user.promotedBy = superadminId;
        user.promotedAt = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: `${user.name} has been promoted to admin`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error promoting user: ${error.message}`
        });
    }
};

// Demote admin to user
export const demoteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const superadminId = req.user._id;

        if (id === superadminId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot demote yourself'
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'superadmin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot demote superadmin'
            });
        }

        if (user.role === 'user') {
            return res.status(400).json({
                success: false,
                message: 'User is already a regular user'
            });
        }

        user.role = 'user';
        user.promotedBy = null;
        user.promotedAt = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `${user.name} has been demoted to regular user`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error demoting user: ${error.message}`
        });
    }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const superadminId = req.user._id;

        if (id === superadminId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate yourself'
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'superadmin') {
            const activeSuperadmins = await User.countDocuments({
                role: 'superadmin',
                isActive: true
            });

            if (activeSuperadmins <= 1 && user.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot deactivate the last active superadmin'
                });
            }
        }

        user.isActive = !user.isActive;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `${user.name} has been ${user.isActive ? 'activated' : 'deactivated'}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error toggling user status: ${error.message}`
        });
    }
};
