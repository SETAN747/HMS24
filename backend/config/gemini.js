// backend/config/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// API key .env file me rakho
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default genAI;
