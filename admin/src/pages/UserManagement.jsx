import React, { useState, useEffect, useContext, useCallback } from 'react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'
import { HiOutlineSearch } from 'react-icons/hi'
import { HiOutlineShieldCheck, HiOutlineUser, HiOutlineUserGroup } from 'react-icons/hi2'

function UserManagement() {
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState(null)
  const { serverUrl } = useContext(authDataContext)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await axios.get(`${serverUrl}/api/superadmin/users?${params}`, { withCredentials: true })
      if (response.data.success) {
        setFilteredUsers(response.data.users)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [serverUrl, searchTerm, roleFilter, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/superadmin/stats`, { withCredentials: true })
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [serverUrl])

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [fetchUsers, fetchStats])

  const handlePromote = async (user) => {
    if (window.confirm(`Promote ${user.name} to Admin?`)) {
      try {
        const response = await axios.post(`${serverUrl}/api/superadmin/promote/${user._id}`, {}, { withCredentials: true })
        if (response.data.success) {
          toast.success(response.data.message)
          fetchUsers()
          fetchStats()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to promote user')
      }
    }
  }

  const handleDemote = async (user) => {
    if (window.confirm(`Demote ${user.name} to Regular User?`)) {
      try {
        const response = await axios.post(`${serverUrl}/api/superadmin/demote/${user._id}`, {}, { withCredentials: true })
        if (response.data.success) {
          toast.success(response.data.message)
          fetchUsers()
          fetchStats()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to demote user')
      }
    }
  }

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate'
    if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) {
      try {
        const response = await axios.patch(`${serverUrl}/api/superadmin/toggle/${user._id}`, {}, { withCredentials: true })
        if (response.data.success) {
          toast.success(response.data.message)
          fetchUsers()
          fetchStats()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update user status')
      }
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return <span className='flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 font-medium'><HiOutlineShieldCheck size={13} /> Superadmin</span>
      case 'admin':
        return <span className='flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/20 font-medium'><HiOutlineUserGroup size={13} /> Admin</span>
      default:
        return <span className='flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20 font-medium'><HiOutlineUser size={13} /> User</span>
    }
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.total, color: 'text-white' },
    { label: 'Active', value: stats.active, color: 'text-green-400' },
    { label: 'Inactive', value: stats.inactive, color: 'text-white/40' },
    { label: 'Superadmins', value: stats.superadmins, color: 'text-red-400' },
    { label: 'Admins', value: stats.admins, color: 'text-green-400' },
    { label: 'Users', value: stats.regularUsers, color: 'text-blue-400' },
  ] : []

  return (
    <div className='max-w-6xl'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-white'>User Management</h1>
        <p className='text-white/40 text-sm mt-1'>Manage user roles and permissions (Superadmin Only)</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6'>
          {statCards.map((stat, idx) => (
            <div key={idx} className='bg-white/5 border border-white/10 rounded-xl p-4'>
              <p className='text-white/40 text-xs font-medium mb-1'>{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className='bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 flex-wrap mb-6'>
        <div className='relative flex-1 min-w-[250px]'>
          <HiOutlineSearch className='absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30' size={18} />
          <input
            type='text'
            placeholder='Search by name or email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full h-10 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-white placeholder-white/30 focus:border-[#0ea5e9] focus:outline-none text-sm'
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className='h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm cursor-pointer appearance-none min-w-[130px]'>
          <option value='all' className='bg-[#0c2025]'>All Roles</option>
          <option value='user' className='bg-[#0c2025]'>Users Only</option>
          <option value='admin' className='bg-[#0c2025]'>Admins Only</option>
          <option value='superadmin' className='bg-[#0c2025]'>Superadmins</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className='h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm cursor-pointer appearance-none min-w-[130px]'>
          <option value='all' className='bg-[#0c2025]'>All Status</option>
          <option value='active' className='bg-[#0c2025]'>Active</option>
          <option value='inactive' className='bg-[#0c2025]'>Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <Loading />
        </div>
      ) : (
        <div className='bg-white/5 border border-white/10 rounded-xl overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-white/10'>
                  <th className='text-left p-4 text-white/40 text-xs font-semibold uppercase tracking-wider'>Name</th>
                  <th className='text-left p-4 text-white/40 text-xs font-semibold uppercase tracking-wider'>Email</th>
                  <th className='text-left p-4 text-white/40 text-xs font-semibold uppercase tracking-wider'>Role</th>
                  <th className='text-left p-4 text-white/40 text-xs font-semibold uppercase tracking-wider'>Status</th>
                  <th className='text-left p-4 text-white/40 text-xs font-semibold uppercase tracking-wider'>Last Login</th>
                  <th className='text-right p-4 text-white/40 text-xs font-semibold uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan='6' className='text-center p-12 text-white/30 text-sm'>No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className='border-b border-white/5 hover:bg-white/3 transition-colors'>
                      <td className='p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-full bg-[#0ea5e9]/15 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] text-xs font-bold'>
                            {user.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className='text-white text-sm font-medium'>{user.name}</span>
                        </div>
                      </td>
                      <td className='p-4 text-white/50 text-sm'>{user.email}</td>
                      <td className='p-4'>{getRoleBadge(user.role)}</td>
                      <td className='p-4'>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          user.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                            : 'bg-white/5 text-white/40 border border-white/10'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='p-4 text-white/40 text-xs'>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })
                          : 'Never'}
                      </td>
                      <td className='p-4'>
                        <div className='flex items-center justify-end gap-2'>
                          {user.role === 'user' && (
                            <button onClick={() => handlePromote(user)}
                              className='px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors cursor-pointer'>
                              ↑ Promote
                            </button>
                          )}
                          {user.role === 'admin' && (
                            <button onClick={() => handleDemote(user)}
                              className='px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-500/20 transition-colors cursor-pointer'>
                              ↓ Demote
                            </button>
                          )}
                          {user.role !== 'superadmin' && (
                            <button onClick={() => handleToggleStatus(user)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                user.isActive
                                  ? 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                                  : 'bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[#0ea5e9] hover:bg-[#0ea5e9]/20'
                              }`}>
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                          {user.role === 'superadmin' && (
                            <span className='px-3 py-1.5 bg-white/5 text-white/30 rounded-lg text-xs border border-white/10'>
                              Protected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
