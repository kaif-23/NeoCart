import React, { useState, useEffect, useContext } from 'react';
import { authDataContext } from '../context/AuthContext';
import AddressForm from '../component/AddressForm';
import AddressCard from '../component/AddressCard';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Person,
  LocationOn,
  Security,
  Edit,
  PhotoCamera,
} from '@mui/icons-material';

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to left, #141414, #0c2025)',
        pt: { xs: '90px', md: '90px' },
        pb: { xs: 12, md: 4 }
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            color: 'white',
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          My Profile
        </Typography>

        <Paper 
          elevation={8} 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: 'rgba(12, 32, 37, 0.08)',
            '& .MuiTab-root': { 
              textTransform: 'none', 
              fontSize: { xs: '0.875rem', md: '1rem' },
              fontWeight: 600,
              color: '#555',
              py: 2,
              minWidth: { xs: 'auto', md: 120 },
              px: { xs: 2, md: 3 }
            },
            '& .Mui-selected': {
              color: '#0c2025 !important'
            },
            '& .MuiTabs-indicator': {
              height: 3,
              bgcolor: '#0c2025'
            },
            '& .MuiTabs-scrollButtons': {
              color: '#0c2025',
              '&.Mui-disabled': {
                opacity: 0.3
              }
            }
          }}
        >
          <Tab 
            icon={<Person sx={{ display: { xs: 'none', sm: 'block' } }} />} 
            iconPosition="start" 
            label="Personal Info" 
            value="personal"
          />
          <Tab 
            icon={<LocationOn sx={{ display: { xs: 'none', sm: 'block' } }} />} 
            iconPosition="start" 
            label="Addresses" 
            value="addresses"
          />
          <Tab 
            icon={<Security sx={{ display: { xs: 'none', sm: 'block' } }} />} 
            iconPosition="start" 
            label="Security" 
            value="security"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <Box>
              {/* Profile Image Section */}
              <Card 
                elevation={3} 
                sx={{ 
                  mb: 3, 
                  bgcolor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Profile Picture
                  </Typography>
                  <Box display="flex" alignItems="center" gap={3}>
                    <Box position="relative">
                      <Avatar
                        src={imagePreview || user?.profileImage}
                        alt={user?.name}
                        sx={{ 
                          width: { xs: 80, md: 100 }, 
                          height: { xs: 80, md: 100 },
                          fontSize: '2.5rem',
                          bgcolor: 'linear-gradient(135deg, #0c2025 0%, #1a1a1a 100%)',
                          background: 'linear-gradient(135deg, #0c2025 0%, #1a1a1a 100%)',
                          border: '3px solid #88d9ee',
                          boxShadow: '0 4px 20px rgba(136, 217, 238, 0.3)'
                        }}
                      >
                        {!imagePreview && !user?.profileImage && user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <IconButton
                        component="label"
                        sx={{
                          position: 'absolute',
                          bottom: -4,
                          right: -4,
                          bgcolor: '#0c2025',
                          color: 'white',
                          '&:hover': { bgcolor: '#1a1a1a' },
                          width: 40,
                          height: 40,
                          border: '2px solid white',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}
                      >
                        <PhotoCamera fontSize="small" />
                        <input
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleImageChange}
                        />
                      </IconButton>
                    </Box>
                    <Box flex={1}>
                      {selectedImage && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {selectedImage.name}
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={handleImageUpload}
                            size="medium"
                            sx={{
                              bgcolor: '#0c2025',
                              '&:hover': {
                                bgcolor: '#1a1a1a'
                              },
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            Upload Image
                          </Button>
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        Max 5MB, JPG/PNG only
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Personal Details Section */}
              <Card 
                elevation={3} 
                sx={{ 
                  bgcolor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Personal Details
                  </Typography>
                  <Box component="form" onSubmit={handleUpdatePersonalInfo}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={user?.email || ''}
                          disabled
                          helperText="Email cannot be changed"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Name"
                          type="text"
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          type="tel"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          sx={{
                            bgcolor: '#0c2025',
                            '&:hover': {
                              bgcolor: '#1a1a1a'
                            },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.5
                          }}
                        >
                          Save Changes
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <Box>
              {!showAddressForm ? (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="600">
                      Saved Addresses
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<LocationOn />}
                      onClick={() => setShowAddressForm(true)}
                      sx={{
                        bgcolor: '#0c2025',
                        '&:hover': {
                          bgcolor: '#1a1a1a'
                        },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Add New Address
                    </Button>
                  </Box>

                  {addresses.length === 0 ? (
                    <Card 
                      elevation={2} 
                      sx={{ 
                        bgcolor: 'white', 
                        py: 6,
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <CardContent>
                        <Box textAlign="center">
                          <LocationOn sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No saved addresses yet
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => setShowAddressForm(true)}
                            sx={{ 
                              mt: 2,
                              bgcolor: '#0c2025',
                              '&:hover': {
                                bgcolor: '#1a1a1a'
                              },
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            Add your first address
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ) : (
                    <Grid container spacing={3}>
                      {addresses.map((address) => (
                        <Grid item xs={12} md={6} key={address._id}>
                          <AddressCard
                            address={address}
                            onEdit={handleEditAddress}
                            onDelete={handleDeleteAddress}
                            onSetDefault={handleSetDefaultAddress}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </>
              ) : (
                <Card 
                  elevation={3} 
                  sx={{ 
                    bgcolor: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="600">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </Typography>
                    <AddressForm
                      address={editingAddress}
                      onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
                      onCancel={handleCancelAddressForm}
                    />
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card 
              elevation={3} 
              sx={{ 
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Change Password
                </Typography>
                <Box component="form" onSubmit={handleChangePassword} maxWidth="sm">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        helperText="Minimum 8 characters"
                        inputProps={{ minLength: 8 }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                          bgcolor: '#0c2025',
                          '&:hover': {
                            bgcolor: '#1a1a1a'
                          },
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5
                        }}
                      >
                        Change Password
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Paper>
    </Container>
    </Box>
  );
};

export default Profile;
