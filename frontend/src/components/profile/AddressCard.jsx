import React from 'react'
import { Home, Briefcase, MapPin, Pencil, Trash2, CheckCircle } from 'lucide-react'

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const getLabelIcon = (label) => {
    switch (label) {
      case 'Home': return <Home className='w-3.5 h-3.5' />
      case 'Work': return <Briefcase className='w-3.5 h-3.5' />
      default: return <MapPin className='w-3.5 h-3.5' />
    }
  }

  return (
    <div className={`rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
      address.isDefault
        ? 'bg-[#0ea5e9]/5 border-[#0ea5e9]/40 shadow-lg shadow-[#0ea5e9]/5'
        : 'bg-[#ffffff08] border-[#80808030] hover:border-[#0ea5e9]/30'
    }`}>
      {/* Header */}
      <div className='flex items-center gap-2 mb-3'>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
          address.label === 'Home' ? 'bg-[#0ea5e9]/15 text-[#0ea5e9]'
          : address.label === 'Work' ? 'bg-purple-500/15 text-purple-400'
          : 'bg-gray-500/15 text-gray-400'
        }`}>
          {getLabelIcon(address.label)}
          {address.label}
        </span>
        {address.isDefault && (
          <span className='flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/15 text-green-400'>
            <CheckCircle className='w-3 h-3' />
            Default
          </span>
        )}
      </div>

      {/* Address Details */}
      <div className='space-y-1 mb-4'>
        <p className='text-sm font-semibold text-white'>{address.firstName} {address.lastName}</p>
        <p className='text-sm text-gray-400'>{address.addressLine1}</p>
        {address.addressLine2 && <p className='text-sm text-gray-400'>{address.addressLine2}</p>}
        <p className='text-sm text-gray-400'>{address.city}, {address.state} {address.zipCode}</p>
        <p className='text-sm text-gray-400'>{address.country}</p>
        <p className='text-sm text-gray-500 pt-1'>Phone: <span className='text-gray-300'>{address.phone}</span></p>
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address._id)}
            className='flex-1 py-2 text-xs font-medium rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white transition-colors cursor-pointer'
          >
            Set Default
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className='flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-[#80808030] text-gray-300 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors cursor-pointer'
        >
          <Pencil className='w-3 h-3' /> Edit
        </button>
        <button
          onClick={() => onDelete(address._id)}
          className='flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-[#80808030] text-gray-300 hover:border-red-500/50 hover:text-red-400 transition-colors cursor-pointer'
        >
          <Trash2 className='w-3 h-3' /> Delete
        </button>
      </div>
    </div>
  )
}

export default AddressCard
