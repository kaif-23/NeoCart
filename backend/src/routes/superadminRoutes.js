import express from 'express';
import superadminAuth from '../middlewares/superadminAuth.js';
import {
    getAllUsers,
    getUserStats,
    promoteUser,
    demoteUser,
    toggleUserStatus
} from '../controllers/superadminController.js';

const router = express.Router();

// All routes protected by superadminAuth middleware
router.use(superadminAuth);

// Get all users with search/filter
router.get('/users', getAllUsers);

// Get user statistics
router.get('/stats', getUserStats);

// Promote user to admin
router.post('/promote/:id', promoteUser);

// Demote admin to user
router.post('/demote/:id', demoteUser);

// Toggle user active status
router.patch('/toggle/:id', toggleUserStatus);

export default router;
