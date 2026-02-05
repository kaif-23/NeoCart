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
    cartData: {
        type: Object,
        default: {}
    }
}, { timestamps: true, minimize: false })

// No need to add email index - 'unique: true' already creates one!

const User = mongoose.model("User", userSchema)

export default User