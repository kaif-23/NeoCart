import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
import cors from 'cors';

dotenv.config();
let app=express();
let port = process.env.PORT || 8000;

app.use(express.json())
app.use(cookieParser())
app.use(cors({
 origin:["http://localhost:5173" , "http://localhost:5174"],
 credentials:true
}))
 

 app.use("/api/auth",authRoutes);




 app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
    connectDb();
 });