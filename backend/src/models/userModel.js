import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    promotedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    promotedAt: {
        type: Date
    },
    phone: {
        type: String
    },
    cartData: {
        type: Object,
        default: {}
    },
    profileImage: {
        type: String,
        default: ''
    },
    addresses: [{
        label: {
            type: String,
            enum: ['Home', 'Work', 'Other'],
            default: 'Home'
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        addressLine1: {
            type: String,
            required: true
        },
        addressLine2: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: 'USA'
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, { timestamps: true, minimize: false })

// Database indexes for performance (email already has unique index from schema)
userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ lastLogin: -1 })

const User = mongoose.model("User", userSchema)

export default User