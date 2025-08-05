import express from "express";
import { addDoctor , loginAdmin} from "../controllers/adminControllers"; 
import authAdmin from "../middlewares/authAdmin";
import upload from "../middlewares/multer"; 

const adminRouter = express.Router() 

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor) 
adminRouter.post('/login',loginAdmin) 

export default adminRouter