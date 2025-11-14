import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js';
import userRouter from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js";
import { createServer } from "http";   // ✅ import http
import { initSocket } from "./config/socket.io.js";  // ✅ import socket.io config 
import { globalLimiter } from './middlewares/globalLimiter.js';


//app config
dotenv.config();
connectDB()
const app = express()
const port = process.env.PORT || 4000 

connectCloudinary() 

app.use(cookieParser());
app.use(passport.initialize());


const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

//middlewares 
app.use(express.json())
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))
app.use(globalLimiter);

//api endpoints  

app.use('/api/admin',adminRouter) 
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get('/',(req, res)=>{
  res.send('API Working')
})


// app.listen(port ,()=>{console.log("server started" , port)}) 


// ✅ Create HTTP server
const server = createServer(app);

// ✅ Initialize socket.io (from separate file)
initSocket(server, allowedOrigins);

// ✅ Start server
server.listen(port, () => {
  console.log("🚀 Server started on port", port);
});