import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getAdmin, getCurrentUser } from "../controllers/userController.js"
import adminAuth from "../middlewares/adminAuth.js"

let userRoutes = express.Router()

userRoutes.get("/getcurrentuser", isAuth, getCurrentUser)
userRoutes.get("/getadmin", adminAuth, getAdmin)

export default userRoutes
