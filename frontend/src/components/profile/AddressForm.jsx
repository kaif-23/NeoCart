import React, { useState, useEffect } from 'react'

const AddressForm = ({ address, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    label: 'Home',
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  })

  useEffect(() => {
    if (address) {
      setFormData(address)
    }
  }, [address])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const inputClass = 'w-full px-4 py-3 bg-[#ffffff08] border border-[#80808030] rounded-lg text-white text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors placeholder-gray-600'
  const labelClass = 'block text-sm text-gray-400 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {/* Label */}
        <div>
          <label className={labelClass}>Label</label>
          <select
            name="label"
            value={formData.label}
            onChange={handleChange}
            required
            className={`${inputClass} cursor-pointer`}
          >
            <option value="Home" className='bg-[#1a1a1a]'>Home</option>
            <option value="Work" className='bg-[#1a1a1a]'>Work</option>
            <option value="Other" className='bg-[#1a1a1a]'>Other</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {/* First Name */}
        <div>
          <label className={labelClass}>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className={labelClass}>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Address Line 1 */}
      <div>
        <label className={labelClass}>Address Line 1</label>
        <input
          type="text"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          placeholder="Street address, P.O. box"
          required
          className={inputClass}
        />
      </div>

      {/* Address Line 2 */}
      <div>
        <label className={labelClass}>Address Line 2 (Optional)</label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          placeholder="Apartment, suite, unit, building, floor, etc."
          className={inputClass}
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {/* City */}
        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* State */}
        <div>
          <label className={labelClass}>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Zip Code */}
        <div>
          <label className={labelClass}>Zip Code</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className={labelClass}>Country</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      {/* Default Checkbox */}
      <label className='flex items-center gap-2.5 cursor-pointer group'>
        <input
          type="checkbox"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className='w-4 h-4 rounded border-[#80808030] bg-[#ffffff08] text-[#0ea5e9] focus:ring-[#0ea5e9] focus:ring-offset-0 cursor-pointer accent-[#0ea5e9]'
        />
        <span className='text-sm text-gray-400 group-hover:text-gray-300 transition-colors'>Set as default address</span>
      </label>

      {/* Buttons */}
      <div className='flex gap-3 pt-2'>
        <button
          type="submit"
          className='flex-1 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-xl transition-colors cursor-pointer'
        >
          {address ? 'Update Address' : 'Save Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className='flex-1 py-3 border border-[#80808030] text-gray-300 font-semibold rounded-xl hover:border-gray-400 hover:text-white transition-colors cursor-pointer'
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default AddressForm
