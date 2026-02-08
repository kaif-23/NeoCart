import express from "express"
import { adminLogin, googleLogin, login, logOut, registration, forgotPassword, verifyResetToken, resetPassword } from "../controller/authController.js"

const authRoutes = express.Router()

authRoutes.post("/registration", registration)
authRoutes.post("/login", login)
authRoutes.get("/logout", logOut)
authRoutes.post("/googlelogin", googleLogin)
authRoutes.post("/adminlogin", adminLogin)

// Password reset routes (public)
authRoutes.post("/forgot-password", forgotPassword)
authRoutes.get("/verify-reset-token/:token", verifyResetToken)
authRoutes.post("/reset-password/:token", resetPassword)




export default authRoutes