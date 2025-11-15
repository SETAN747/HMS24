import express from "express";
import { addDoctor , loginAdmin , logoutAdmin,allDoctors,appointmentsAdmin,appointmentCancel,adminDashboard,} from "../controllers/adminControllers.js"; 
import authAdmin from "../middlewares/authAdmin.js";
import upload from "../middlewares/multer.js"; 
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router() 

adminRouter.post('/add-doctor',upload.single('image'),authAdmin,addDoctor) 
adminRouter.post('/login',loginAdmin) 
adminRouter.post('/logout',logoutAdmin) 
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin); 
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter