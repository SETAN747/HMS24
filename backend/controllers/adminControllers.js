import bcrypt from "bcryptjs";
import validator from "validator"; 
import {v2 as cloudinary} from "cloudinary"
import { json } from "express";
import doctorModel from "../models/doctorModel";

//API for ADMIN CONTROLS

const addDoctor = async (res, req) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // Input validation
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (!validator.isStrongPassword(password, { minLength: 6 })) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters and strong." });
    }

    if (!validator.isNumeric(fees.toString())) {
      return res.status(400).json({ error: "Fees must be a valid number." });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res
        .status(409)
        .json({ error: "Doctor with this email already exists." });
    }
    
   // Upload image to Cloudinary
    let uploadedImageUrl = '';
    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, {
        folder: "doctor_profiles", // Optional: cloud folder name
         resource_type: "image", 
      });
      uploadedImageUrl = result.secure_url;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor object
    const doctorData = {
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address :JSON.parse(address),
      profileImage: uploadedImageUrl,
      date:date.now(),
    };

    // Save to DB
     const newDoctor = new doctorModel(doctorData)
     await newDoctor.save() 

    return res
      .status(201)
      .json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export { addDoctor };
