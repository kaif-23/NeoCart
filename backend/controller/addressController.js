import User from '../model/userModel.js';

// Get all addresses
export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('addresses');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, addresses: user.addresses || [] });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add new address
export const addAddress = async (req, res) => {
    try {
        const { label, firstName, lastName, phone, addressLine1, addressLine2, city, state, zipCode, country, isDefault } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone || !addressLine1 || !city || !state || !zipCode) {
            return res.status(400).json({ success: false, message: 'All required fields must be filled' });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // If this is the first address, make it default
        const shouldBeDefault = isDefault || user.addresses.length === 0;

        // Add new address
        const newAddress = {
            label: label || 'Home',
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2 ? addressLine2.trim() : '',
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
            country: country || 'USA',
            isDefault: shouldBeDefault
        };

        user.addresses.push(newAddress);
        await user.save();

        // Get the newly added address (last one)
        const addedAddress = user.addresses[user.addresses.length - 1];

        res.json({ success: true, message: 'Address added successfully', address: addedAddress });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update address
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { label, firstName, lastName, phone, addressLine1, addressLine2, city, state, zipCode, country, isDefault } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // If setting this as default, unset others
        if (isDefault) {
            user.addresses.forEach(addr => {
                if (addr._id.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
        }

        // Update fields
        if (label) address.label = label;
        if (firstName) address.firstName = firstName.trim();
        if (lastName) address.lastName = lastName.trim();
        if (phone) address.phone = phone.trim();
        if (addressLine1) address.addressLine1 = addressLine1.trim();
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2.trim();
        if (city) address.city = city.trim();
        if (state) address.state = state.trim();
        if (zipCode) address.zipCode = zipCode.trim();
        if (country) address.country = country;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await user.save();

        res.json({ success: true, message: 'Address updated successfully', address });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        const wasDefault = address.isDefault;

        // Remove address using pull
        user.addresses.pull(addressId);

        // If deleted address was default, set first remaining as default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Set address as default
export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Unset all defaults
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });

        // Set this one as default
        address.isDefault = true;

        await user.save();

        res.json({ success: true, message: 'Default address updated successfully', address });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
