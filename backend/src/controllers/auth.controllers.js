import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../models/User.model.js";
import { Department } from "../models/Department.model.js";
import { RegistrationOtp } from "../models/RegistrationOtp.model.js";


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

const VALID_REGISTER_ROLES = ['CITIZEN', 'AUTHORITY', 'EMERGENCY', 'ADMIN'];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const isStrongPassword = (password) => {
    const value = String(password || '');
    return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const validateDepartmentId = async (department_id) => {
    if (!department_id) {
        return null;
    }

    if (!mongoose.Types.ObjectId.isValid(department_id)) {
        throw new Error("Invalid department_id");
    }

    const department = await Department.findById(department_id);
    if (!department) {
        throw new Error("Department not found");
    }

    return department._id;
};

export const requestRegistrationOtp = async (req, res) => {
    try {
        const { name, email, password, role, department_id } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "name, email, password and role are required" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        if (!VALID_REGISTER_ROLES.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        let normalizedDepartmentId = null;
        try {
            normalizedDepartmentId = await validateDepartmentId(department_id || null);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const otp = generateOtp();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);

        await RegistrationOtp.findOneAndUpdate(
            { email: normalizedEmail },
            {
                name: String(name).trim(),
                email: normalizedEmail,
                password_hash,
                role,
                department_id: normalizedDepartmentId,
                otp,
                otp_expiry,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await sendEmailHelper(
            normalizedEmail,
            "Prahari-AI Registration OTP",
            `Your registration OTP is: ${otp}. It is valid for 10 minutes.`
        );

        return res.status(200).json({
            message: "OTP sent to your email",
            expiresInMinutes: 10,
        });
    } catch (error) {
        return res.status(500).json({ message: "Error generating registration OTP", error: error.message });
    }
};

export const verifyRegistrationOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "email and otp are required" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const pending = await RegistrationOtp.findOne({ email: normalizedEmail });

        if (!pending) {
            return res.status(404).json({ message: "No pending registration found. Please request a new OTP." });
        }

        if (pending.otp_expiry < Date.now()) {
            await RegistrationOtp.deleteOne({ email: normalizedEmail });
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        if (pending.otp !== String(otp).trim()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            await RegistrationOtp.deleteOne({ email: normalizedEmail });
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({
            name: pending.name,
            email: pending.email,
            password_hash: pending.password_hash,
            role: pending.role,
            department_id: pending.department_id || null,
        });

        await newUser.save();
        await RegistrationOtp.deleteOne({ email: normalizedEmail });

        await sendEmailHelper(
            normalizedEmail,
            "Welcome to Prahari-AI!",
            `Hello ${pending.name},\n\nYour account has been successfully created. Welcome aboard!`
        );

        return res.status(201).json({
            message: "OTP verified and account created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                department_id: newUser.department_id,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "Error verifying registration OTP", error: error.message });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, department_id } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "name, email, password and role are required" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        if (!VALID_REGISTER_ROLES.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters and include uppercase, lowercase, number and special character" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        let normalizedDepartmentId = null;
        try {
            normalizedDepartmentId = await validateDepartmentId(department_id || null);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: String(name).trim(),
            email: normalizedEmail,
            password_hash,
            role,
            department_id: normalizedDepartmentId
        });

        await newUser.save();

        await sendEmailHelper(normalizedEmail, "Welcome to Prahari-AI!",
            `Hello ${String(name).trim()},\n\nYour account has been successfully created. Welcome aboard!`);

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

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "email and otp are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.reset_otp || !user.reset_otp_expiry) {
            return res.status(400).json({ message: "No active OTP found. Please request a new one." });
        }

        if (user.reset_otp_expiry < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        if (user.reset_otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "email, otp and newPassword are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.reset_otp || !user.reset_otp_expiry) {
            return res.status(400).json({ message: "No active OTP found. Please request a new one." });
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