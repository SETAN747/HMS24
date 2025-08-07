import express from "express";
import { addDoctor , loginAdmin } from "../controllers/adminControllers.js"; 
import authAdmin from "../middlewares/authAdmin.js";
import upload from "../middlewares/multer.js"; 

const adminRouter = express.Router() 

adminRouter.post('/add-doctor',upload.single('image'),authAdmin,addDoctor) 
adminRouter.post('/login',loginAdmin) 

export default adminRouter