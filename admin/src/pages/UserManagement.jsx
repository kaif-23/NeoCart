import React, { useState, useEffect, useContext, useCallback } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'
import { FaUserShield, FaUserTie, FaUser, FaSearch } from 'react-icons/fa'
import { MdToggleOn, MdToggleOff } from 'react-icons/md'

function UserManagement() {
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState(null)
  const { serverUrl } = useContext(authDataContext)

  // Fetch users with filters
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await axios.get(`${serverUrl}/api/superadmin/users?${params}`, {
        withCredentials: true
      })

      if (response.data.success) {
        setFilteredUsers(response.data.users)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [serverUrl, searchTerm, roleFilter, statusFilter])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/superadmin/stats`, {
        withCredentials: true
      })

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

  // Promote user to admin
  const handlePromote = async (user) => {
    if (window.confirm(`Promote ${user.name} to Admin?\n\nThey will gain access to manage products and orders.`)) {
      try {
        const response = await axios.post(
          `${serverUrl}/api/superadmin/promote/${user._id}`,
          {},
          { withCredentials: true }
        )

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

  // Demote admin to user
  const handleDemote = async (user) => {
    if (window.confirm(`Demote ${user.name} to Regular User?\n\nThey will lose admin privileges.`)) {
      try {
        const response = await axios.post(
          `${serverUrl}/api/superadmin/demote/${user._id}`,
          {},
          { withCredentials: true }
        )

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

  // Toggle user active status
  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate'
    if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) {
      try {
        const response = await axios.patch(
          `${serverUrl}/api/superadmin/toggle/${user._id}`,
          {},
          { withCredentials: true }
        )

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

  // Get role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className='flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold'>
            <FaUserShield /> Superadmin
          </span>
        )
      case 'admin':
        return (
          <span className='flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold'>
            <FaUserTie /> Admin
          </span>
        )
      default:
        return (
          <span className='flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold'>
            <FaUser /> User
          </span>
        )
    }
  }

  // Get status badge
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium'>
        Active
      </span>
    ) : (
      <span className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium'>
        Inactive
      </span>
    )
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white'>
      <Nav />
      <Sidebar />

      <div className='w-[82%] absolute right-0 top-0 pt-20 px-8 pb-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2'>👥 User Management</h1>
          <p className='text-gray-400'>Manage user roles and permissions (Superadmin Only)</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
            <div className='bg-slate-800 p-4 rounded-lg border border-slate-700'>
              <p className='text-gray-400 text-sm'>Total Users</p>
              <p className='text-3xl font-bold'>{stats.total}</p>
            </div>
            <div className='bg-slate-800 p-4 rounded-lg border border-slate-700'>
              <p className='text-gray-400 text-sm'>Active</p>
              <p className='text-3xl font-bold text-green-400'>{stats.active}</p>
            </div>
            <div className='bg-slate-800 p-4 rounded-lg border border-slate-700'>
              <p className='text-gray-400 text-sm'>Inactive</p>
              <p className='text-3xl font-bold text-gray-400'>{stats.inactive}</p>
            </div>
            <div className='bg-slate-800 p-4 rounded-lg border border-slate-700'>
              <p className='text-gray-400 text-sm'>Superadmins</p>
              <p className='text-3xl font-bold text-red-400'>{stats.superadmins}</p>
            </div>
            <div className='bg-slate-800 p-4 rounded-lg border border-slate-700'>
              <p className='text-gray-400 text-sm'>Admins</p>
              <p className='text-3xl font-bold text-green-400'>{stats.admins}</p>
            </div>
            <div className='bg-slate-800 p-4 rounded-lg border border-slate-700'>
              <p className='text-gray-400 text-sm'>Users</p>
              <p className='text-3xl font-bold text-blue-400'>{stats.regularUsers}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-4 mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700'>
          {/* Search */}
          <div className='flex items-center gap-2 flex-1 min-w-[250px]'>
            <FaSearch className='text-gray-400' />
            <input
              type='text'
              placeholder='Search by name or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-[#46d1f7] focus:outline-none'
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className='bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-[#46d1f7] focus:outline-none cursor-pointer'
          >
            <option value='all'>All Roles</option>
            <option value='user'>Users Only</option>
            <option value='admin'>Admins Only</option>
            <option value='superadmin'>Superadmins Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-[#46d1f7] focus:outline-none cursor-pointer'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active Only</option>
            <option value='inactive'>Inactive Only</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <Loading />
          </div>
        ) : (
          <div className='bg-slate-800 rounded-lg border border-slate-700 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-slate-900 border-b border-slate-700'>
                  <tr>
                    <th className='text-left p-4 font-semibold'>Name</th>
                    <th className='text-left p-4 font-semibold'>Email</th>
                    <th className='text-left p-4 font-semibold'>Role</th>
                    <th className='text-left p-4 font-semibold'>Status</th>
                    <th className='text-left p-4 font-semibold'>Last Login</th>
                    <th className='text-right p-4 font-semibold'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan='6' className='text-center p-8 text-gray-400'>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className='border-b border-slate-700 hover:bg-slate-750'>
                        <td className='p-4 font-medium'>{user.name}</td>
                        <td className='p-4 text-gray-300'>{user.email}</td>
                        <td className='p-4'>{getRoleBadge(user.role)}</td>
                        <td className='p-4'>{getStatusBadge(user.isActive)}</td>
                        <td className='p-4 text-gray-400 text-sm'>
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Never'}
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center justify-end gap-2'>
                            {/* Promote Button */}
                            {user.role === 'user' && (
                              <button
                                onClick={() => handlePromote(user)}
                                className='px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors'
                              >
                                ↑ Promote
                              </button>
                            )}

                            {/* Demote Button */}
                            {user.role === 'admin' && (
                              <button
                                onClick={() => handleDemote(user)}
                                className='px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors'
                              >
                                ↓ Demote
                              </button>
                            )}

                            {/* Toggle Status Button */}
                            {user.role !== 'superadmin' && (
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                                  user.isActive
                                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {user.isActive ? (
                                  <>
                                    <MdToggleOff /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <MdToggleOn /> Activate
                                  </>
                                )}
                              </button>
                            )}

                            {/* Locked for superadmins */}
                            {user.role === 'superadmin' && (
                              <span className='px-3 py-1 bg-slate-700 text-gray-400 rounded text-sm'>
                                🔒 Protected
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
    </div>
  )
}

export default UserManagement
