import express from "express";
import { addDoctor , loginAdmin , allDoctors} from "../controllers/adminControllers.js"; 
import authAdmin from "../middlewares/authAdmin.js";
import upload from "../middlewares/multer.js"; 
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router() 

adminRouter.post('/add-doctor',upload.single('image'),authAdmin,addDoctor) 
adminRouter.post('/login',loginAdmin) 
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);

export default adminRouter