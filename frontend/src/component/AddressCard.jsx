import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Home,
  Work,
  LocationOn,
  Edit,
  Delete,
  CheckCircle,
} from '@mui/icons-material';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const getLabelIcon = (label) => {
    switch (label) {
      case 'Home':
        return <Home fontSize="small" />;
      case 'Work':
        return <Work fontSize="small" />;
      default:
        return <LocationOn fontSize="small" />;
    }
  };

  const getLabelColor = (label) => {
    switch (label) {
      case 'Home':
        return 'primary';
      case 'Work':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      elevation={address.isDefault ? 6 : 3}
      sx={{ 
        height: '100%',
        border: address.isDefault ? 2 : 0,
        borderColor: address.isDefault ? 'primary.main' : 'transparent',
        borderRadius: 3,
        position: 'relative',
        transition: 'all 0.3s',
        boxShadow: address.isDefault 
          ? '0 8px 30px rgba(12, 32, 37, 0.25)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(12, 32, 37, 0.3)',
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        {/* Header with Label and Default Badge */}
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Chip
            icon={getLabelIcon(address.label)}
            label={address.label}
            color={getLabelColor(address.label)}
            size="small"
          />
          {address.isDefault && (
            <Chip
              icon={<CheckCircle fontSize="small" />}
              label="Default"
              color="success"
              size="small"
            />
          )}
        </Stack>

        {/* Address Details */}
        <Box>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            {address.firstName} {address.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {address.addressLine1}
          </Typography>
          {address.addressLine2 && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {address.addressLine2}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {address.city}, {address.state} {address.zipCode}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {address.country}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Phone:</strong> {address.phone}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Stack direction="row" spacing={1} width="100%">
          {!address.isDefault && (
            <Button
              size="small"
              variant="contained"
              onClick={() => onSetDefault(address._id)}
              fullWidth
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
              Set Default
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => onEdit(address)}
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
              fontWeight: 600
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => onDelete(address._id)}
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Delete
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default AddressCard;
