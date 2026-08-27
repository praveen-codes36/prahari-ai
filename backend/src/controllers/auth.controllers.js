import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../models/User.model.js";
import { Department } from "../models/Department.model.js";


const sendEmailHelper = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
    } catch (error) {
        console.error("Email sending failed:", error);
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, department_id } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password_hash,
            role,
            department_id: department_id || null
        });

        await newUser.save();

        await sendEmailHelper(email, "Welcome to Prahari-AI!",
            `Hello ${name},\n\nYour account has been successfully created. Welcome aboard!`);

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        await sendEmailHelper(email, "New Login Alert - Prahari-AI",
            "You have successfully logged into your Prahari-AI account. If this was not you, please reset your password immediately.");
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department_id: user.department_id
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
};


export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password_hash')
            .populate('department_id', 'name contact_email');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching profile", error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.reset_otp = otp;
        user.reset_otp_expiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        await sendEmailHelper(email, "Password Reset OTP - Prahari-AI",
            `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`);

        res.status(200).json({ message: "OTP generated and sent to your email" });
    } catch (error) {
        res.status(500).json({ message: "Error generating OTP", error: error.message });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

        user.reset_otp = newOtp;
        user.reset_otp_expiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        await sendEmailHelper(email, "New Password Reset OTP - Prahari-AI",
            `Your new OTP for password reset is: ${newOtp}. It is valid for 15 minutes.`);

        res.status(200).json({ message: "A new OTP has been sent to your email" });
    } catch (error) {
        res.status(500).json({ message: "Error resending OTP", error: error.message });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.reset_otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.reset_otp_expiry < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);

        user.reset_otp = null;
        user.reset_otp_expiry = null;

        await user.save();

        await sendEmailHelper(
            email,
            "Password Reset Successful - Prahari-AI",
            "Your password has been successfully reset. You can now log in with your new password."
        );

        res.status(200).json({ message: "Password reset successful! You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Server error during password reset", error: error.message });
    }
};