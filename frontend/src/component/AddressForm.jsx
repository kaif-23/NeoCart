import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';

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
    country: 'USA',
    isDefault: false
  });

  useEffect(() => {
    if (address) {
      setFormData(address);
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Label */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Label"
            name="label"
            value={formData.label}
            onChange={handleChange}
            required
            variant="outlined"
          >
            <MenuItem value="Home">Home</MenuItem>
            <MenuItem value="Work">Work</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Grid>

        {/* Phone */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            required
            variant="outlined"
          />
        </Grid>

        {/* First Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        {/* Last Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        {/* Address Line 1 */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            placeholder="Street address, P.O. box"
            required
            variant="outlined"
          />
        </Grid>

        {/* Address Line 2 */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 2 (Optional)"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Apartment, suite, unit, building, floor, etc."
            variant="outlined"
          />
        </Grid>

        {/* City */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        {/* State */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        {/* Zip Code */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Zip Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        {/* Country */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        {/* Default Address Checkbox */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
            }
            label="Set as default address"
          />
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
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
              {address ? 'Update Address' : 'Save Address'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="large"
              onClick={onCancel}
              fullWidth
              sx={{
                borderColor: '#0c2025',
                color: '#0c2025',
                '&:hover': {
                  borderColor: '#1a1a1a',
                  bgcolor: 'rgba(12, 32, 37, 0.05)'
                },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddressForm;
