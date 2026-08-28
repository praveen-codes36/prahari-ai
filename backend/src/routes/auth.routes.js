import express from "express";
import { registerUser, loginUser, getUser ,forgotPassword , resendOTP, verifyOTP, resetPassword } from "../controllers/auth.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getUser);
router.post("/forgot-password", forgotPassword);
router.post("/resend-otp", resendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;