import express from 'express';
import { getProfile, updateProfile, uploadProfileImage, changePassword } from '../controllers/profileController.js';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/addressController.js';
import isAuth from '../middlewares/isAuth.js';
import upload from '../middlewares/multer.js';

const profileRoutes = express.Router();

// Profile routes
profileRoutes.get('/profile', isAuth, getProfile);
profileRoutes.put('/profile', isAuth, updateProfile);
profileRoutes.post('/profile/avatar', isAuth, upload.single('image'), uploadProfileImage);
profileRoutes.put('/change-password', isAuth, changePassword);

// Address routes
profileRoutes.get('/addresses', isAuth, getAddresses);
profileRoutes.post('/address', isAuth, addAddress);
profileRoutes.put('/address/:addressId', isAuth, updateAddress);
profileRoutes.delete('/address/:addressId', isAuth, deleteAddress);
profileRoutes.put('/address/:addressId/default', isAuth, setDefaultAddress);

export default profileRoutes;
