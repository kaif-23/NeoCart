import React, { useState, useEffect, useContext } from 'react'
import { authDataContext } from '../context/AuthContext'
import AddressForm from '@/components/profile/AddressForm'
import AddressCard from '@/components/profile/AddressCard'
import axios from 'axios'
import { toast } from 'sonner'
import { User, MapPin, Shield, Camera, Loader2, Eye, EyeOff } from 'lucide-react'
import Loading from '@/components/common/Loading'

const Profile = () => {
  const { serverUrl } = useContext(authDataContext)
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [saving, setSaving] = useState(false)

  // Personal info form
  const [personalInfo, setPersonalInfo] = useState({ name: '', phone: '' })

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  // Profile image upload
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/profile/profile`, { withCredentials: true })
      if (response.data.success) {
        setUser(response.data.user)
        setPersonalInfo({ name: response.data.user.name, phone: response.data.user.phone || '' })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/profile/addresses`, { withCredentials: true })
      if (response.data.success) {
        setAddresses(response.data.addresses)
      }
    } catch (error) {
      toast.error('Failed to fetch addresses')
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchAddresses()
  }, [])

  const handleUpdatePersonalInfo = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await axios.put(`${serverUrl}/api/profile/profile`, personalInfo, { withCredentials: true })
      if (response.data.success) {
        toast.success('Profile updated successfully')
        setUser(response.data.user)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    e.preventDefault()
    if (!selectedImage) { toast.error('Please select an image'); return }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      const response = await axios.post(`${serverUrl}/api/profile/profile/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      })
      if (response.data.success) {
        toast.success('Profile image updated')
        setUser(prev => ({ ...prev, profileImage: response.data.profileImage }))
        setSelectedImage(null)
        setImagePreview(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image size must be less than 5MB'); return }
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('New passwords do not match'); return }
    if (passwordData.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      const response = await axios.put(`${serverUrl}/api/profile/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, { withCredentials: true })
      if (response.data.success) {
        toast.success('Password changed successfully')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleAddAddress = async (formData) => {
    try {
      const response = await axios.post(`${serverUrl}/api/profile/address`, formData, { withCredentials: true })
      if (response.data.success) {
        toast.success('Address added successfully')
        fetchAddresses()
        setShowAddressForm(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address')
    }
  }

  const handleUpdateAddress = async (formData) => {
    try {
      const response = await axios.put(`${serverUrl}/api/profile/address/${editingAddress._id}`, formData, { withCredentials: true })
      if (response.data.success) {
        toast.success('Address updated successfully')
        fetchAddresses()
        setShowAddressForm(false)
        setEditingAddress(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    try {
      const response = await axios.delete(`${serverUrl}/api/profile/address/${addressId}`, { withCredentials: true })
      if (response.data.success) {
        toast.success('Address deleted successfully')
        fetchAddresses()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete address')
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await axios.put(`${serverUrl}/api/profile/address/${addressId}/default`, {}, { withCredentials: true })
      if (response.data.success) {
        toast.success('Default address updated')
        fetchAddresses()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set default address')
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setShowAddressForm(true)
  }

  const handleCancelAddressForm = () => {
    setShowAddressForm(false)
    setEditingAddress(null)
  }

  if (loading) {
    return (
      <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-center justify-center'>
        <Loading />
      </div>
    )
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] pb-28 md:pb-10'>
      <div className='max-w-4xl mx-auto px-4 md:px-8 pt-24 md:pt-28'>
        {/* Header */}
        <h1 className='text-2xl md:text-3xl font-bold text-white mb-6'>My Profile</h1>

        {/* Tabs */}
        <div className='flex gap-1 mb-6 bg-[#ffffff08] rounded-xl p-1 border border-[#80808030] overflow-x-auto'>
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#ffffff08]'
                }`}
              >
                <Icon className='w-4 h-4' />
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className='space-y-6'>
            {/* Profile Picture */}
            <div className='bg-[#ffffff08] border border-[#80808030] rounded-xl p-5 md:p-6'>
              <h2 className='text-lg font-semibold text-white mb-4'>Profile Picture</h2>
              <div className='flex items-center gap-5'>
                <div className='relative'>
                  <div className='w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[#0ea5e9]/40 shadow-lg shadow-[#0ea5e9]/10'>
                    {imagePreview || user?.profileImage ? (
                      <img src={imagePreview || user?.profileImage} alt={user?.name} className='w-full h-full object-cover' />
                    ) : (
                      <div className='w-full h-full bg-gradient-to-br from-[#0c2025] to-[#1a1a1a] flex items-center justify-center text-3xl font-bold text-[#0ea5e9]'>
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className='absolute -bottom-1 -right-1 w-8 h-8 bg-[#0ea5e9] hover:bg-[#0284c7] rounded-full flex items-center justify-center cursor-pointer transition-colors border-2 border-[#1a1a1a] shadow-md'>
                    <Camera className='w-3.5 h-3.5 text-white' />
                    <input type="file" hidden accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} />
                  </label>
                </div>
                <div className='flex-1'>
                  {selectedImage && (
                    <div className='mb-2'>
                      <p className='text-sm text-gray-400 mb-2 truncate'>{selectedImage.name}</p>
                      <button
                        onClick={handleImageUpload}
                        disabled={saving}
                        className='px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50'
                      >
                        {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Upload'}
                      </button>
                    </div>
                  )}
                  <p className='text-xs text-gray-500'>Max 5MB, JPG/PNG only</p>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className='bg-[#ffffff08] border border-[#80808030] rounded-xl p-5 md:p-6'>
              <h2 className='text-lg font-semibold text-white mb-4'>Personal Details</h2>
              <form onSubmit={handleUpdatePersonalInfo} className='space-y-4'>
                <div>
                  <label className='block text-sm text-gray-400 mb-1.5'>Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className='w-full px-4 py-3 bg-[#ffffff05] border border-[#80808030] rounded-lg text-gray-500 text-sm cursor-not-allowed'
                  />
                  <p className='text-xs text-gray-600 mt-1'>Email cannot be changed</p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm text-gray-400 mb-1.5'>Name</label>
                    <input
                      type="text"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                      required
                      className='w-full px-4 py-3 bg-[#ffffff08] border border-[#80808030] rounded-lg text-white text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-400 mb-1.5'>Phone</label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className='w-full px-4 py-3 bg-[#ffffff08] border border-[#80808030] rounded-lg text-white text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors'
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className='px-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2'
                >
                  {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : null}
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div>
            {!showAddressForm ? (
              <>
                <div className='flex items-center justify-between mb-5'>
                  <h2 className='text-lg font-semibold text-white'>Saved Addresses</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className='flex items-center gap-2 px-4 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer'
                  >
                    <MapPin className='w-4 h-4' />
                    Add Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className='bg-[#ffffff08] border border-[#80808030] rounded-xl p-10 text-center'>
                    <MapPin className='w-14 h-14 text-gray-600 mx-auto mb-3' />
                    <h3 className='text-lg font-semibold text-white mb-1'>No saved addresses</h3>
                    <p className='text-sm text-gray-500 mb-4'>Add an address for faster checkout</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className='px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer'
                    >
                      Add your first address
                    </button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
              <div className='bg-[#ffffff08] border border-[#80808030] rounded-xl p-5 md:p-6'>
                <h2 className='text-lg font-semibold text-white mb-4'>
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
          <div className='bg-[#ffffff08] border border-[#80808030] rounded-xl p-5 md:p-6'>
            <h2 className='text-lg font-semibold text-white mb-4'>Change Password</h2>
            <form onSubmit={handleChangePassword} className='space-y-4 max-w-md'>
              <div>
                <label className='block text-sm text-gray-400 mb-1.5'>Current Password</label>
                <div className='relative'>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className='w-full px-4 py-3 pr-11 bg-[#ffffff08] border border-[#80808030] rounded-lg text-white text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors'
                  />
                  <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer'>
                    {showCurrentPass ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                  </button>
                </div>
              </div>
              <div>
                <label className='block text-sm text-gray-400 mb-1.5'>New Password</label>
                <div className='relative'>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={8}
                    className='w-full px-4 py-3 pr-11 bg-[#ffffff08] border border-[#80808030] rounded-lg text-white text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors'
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer'>
                    {showNewPass ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                  </button>
                </div>
                <p className='text-xs text-gray-600 mt-1'>Minimum 8 characters</p>
              </div>
              <div>
                <label className='block text-sm text-gray-400 mb-1.5'>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className={`w-full px-4 py-3 bg-[#ffffff08] border rounded-lg text-white text-sm focus:outline-none transition-colors ${
                    passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-[#80808030] focus:border-[#0ea5e9]'
                  }`}
                />
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className='text-xs text-red-400 mt-1'>Passwords do not match</p>
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                className='px-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2'
              >
                {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : null}
                Change Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
