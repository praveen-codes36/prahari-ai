import express from "express";
import multer from "multer";
import { createComplaint } from "../controllers/complaint.controller.js";
import {protect} from "../middlewares/auth.middleware.js"
const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Basic multer setup

// POST /api/complaints
router.post("/", upload.single("photo"), createComplaint); 

export default router;