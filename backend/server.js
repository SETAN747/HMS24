import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js';
import userRouter from "./routes/userRoute.js";


//app config
dotenv.config();
const app = express()
const port = process.env.PORT || 4000 
connectDB()
connectCloudinary()


const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

//middlewares 
app.use(express.json())
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))


//api endpoints  

app.use('/api/admin',adminRouter) 
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get('/',(req,res)=>{
  res.send('API Working')
})


app.listen(port ,()=>{console.log("server started" , port)})