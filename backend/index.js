import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'

dotenv.config();
let app=express();

app.use(express.json())
app.use(cookieParser())
 let  port=process.env.PORT || 8000;

 app.use("/api/auth",authRoutes);




 app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
    connectDb();
 });