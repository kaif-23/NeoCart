import React from 'react';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const getLabelColor = (label) => {
    switch (label) {
      case 'Home':
        return 'bg-blue-100 text-blue-800';
      case 'Work':
        return 'bg-purple-100 text-purple-800';
      case 'Other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} transition-all hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLabelColor(address.label)}`}>
            {address.label}
          </span>
          {address.isDefault && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Default
            </span>
          )}
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-1 text-sm text-gray-700 mb-4">
        <p className="font-semibold text-gray-900">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {address.city}, {address.state} {address.zipCode}
        </p>
        <p>{address.country}</p>
        <p className="text-gray-600">Phone: {address.phone}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address._id)}
            className="flex-1 text-xs bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors"
          >
            Set as Default
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className="flex-1 text-xs bg-gray-200 text-gray-700 py-2 px-3 rounded hover:bg-gray-300 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(address._id)}
          className="flex-1 text-xs bg-red-100 text-red-700 py-2 px-3 rounded hover:bg-red-200 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
