import React, { useState, useEffect, useContext } from 'react';
import { authDataContext } from '../context/AuthContext';
import AddressForm from '../component/AddressForm';
import AddressCard from '../component/AddressCard';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const { serverUrl } = useContext(authDataContext);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Personal info form
  const [personalInfo, setPersonalInfo] = useState({ name: '', phone: '' });
  
  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/profile/profile`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        setPersonalInfo({
          name: response.data.user.name,
          phone: response.data.user.phone || ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/profile/addresses`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      toast.error('Failed to fetch addresses');
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  // Update personal info
  const handleUpdatePersonalInfo = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${serverUrl}/api/profile/profile`,
        personalInfo,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setUser(response.data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  // Upload profile image
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await axios.post(
        `${serverUrl}/api/profile/profile/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Profile image updated');
        setUser(prev => ({ ...prev, profileImage: response.data.profileImage }));
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await axios.put(
        `${serverUrl}/api/profile/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  // Address operations
  const handleAddAddress = async (formData) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/profile/address`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Address added successfully');
        fetchAddresses();
        setShowAddressForm(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleUpdateAddress = async (formData) => {
    try {
      const response = await axios.put(
        `${serverUrl}/api/profile/address/${editingAddress._id}`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Address updated successfully');
        fetchAddresses();
        setShowAddressForm(false);
        setEditingAddress(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await axios.delete(
        `${serverUrl}/api/profile/address/${addressId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Address deleted successfully');
        fetchAddresses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await axios.put(
        `${serverUrl}/api/profile/address/${addressId}/default`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Default address updated');
        fetchAddresses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set default address');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'personal'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📝 Personal Info
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'addresses'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📍 Addresses
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'security'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🔒 Security
        </button>
      </div>

      {/* Personal Info Tab */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* Profile Image */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {imagePreview || user?.profileImage ? (
                  <img
                    src={imagePreview || user.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-400">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <form onSubmit={handleImageUpload} className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                {selectedImage && (
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Upload Image
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG only</p>
              </form>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
            <form onSubmit={handleUpdatePersonalInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          {!showAddressForm ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Saved Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-500 mb-4">No saved addresses yet</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Add your first address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address._id}
                      address={address}
                      onEdit={handleEditAddress}
                      onDelete={handleDeleteAddress}
                      onSetDefault={handleSetDefaultAddress}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <AddressForm
                address={editingAddress}
                onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
                onCancel={handleCancelAddressForm}
              />
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Change Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
