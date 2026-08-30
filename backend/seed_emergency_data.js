import mongoose from "mongoose";
import dotenv from "dotenv";
import { Hospital } from "./src/models/hospital.model.js";
import { Ambulance } from "./src/models/ambulance.model.js";
import { Accident } from "./src/models/accident.model.js";
import { User } from "./src/models/user.model.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/prahari-ai");
    console.log("Connected to MongoDB.");

    // Create a dummy user for the accident report
    let user = await User.findOne({ email: "demo@prahari.ai" });
    if (!user) {
        user = await User.create({
            name: "Demo Citizen",
            email: "demo@prahari.ai",
            password_hash: "password123",
            role: "CITIZEN",
            department: "PWD",
            designation: "Citizen",
            is_active: true
        });
    }

    // 1. Create a Hospital in Prayagraj
    let hospital = await Hospital.findOne({ name: "AIIMS Prayagraj Trauma Center" });
    if (!hospital) {
        hospital = await Hospital.create({
            name: "AIIMS Prayagraj Trauma Center",
            location: {
                type: "Point",
                coordinates: [81.8650, 25.4450]
            },
            contact_number: "1800-111-222",
            total_beds: 50,
            available_beds: 15
        });
        console.log("Hospital created.");
    }

    // 2. Create or Reset an Ambulance in Prayagraj
    let ambulance = await Ambulance.findOne({ vehicle_number: "UP70-EMS-42" });
    if (!ambulance) {
        ambulance = await Ambulance.create({
            vehicle_number: "UP70-EMS-42",
            current_location: {
                type: "Point",
                coordinates: [81.8250, 25.4250]
            },
            status: "AVAILABLE",
            hospital_id: hospital._id
        });
        console.log("Ambulance created.");
    } else {
        ambulance.status = "AVAILABLE";
        await ambulance.save();
        console.log("Ambulance reset to AVAILABLE.");
    }

    // 3. Create an Accident in Prayagraj
    let accident = await Accident.findOne({ status: "REPORTED" });
    if (!accident) {
        accident = await Accident.create({
            reported_by: user._id,
            location: {
                type: "Point",
                coordinates: [81.8463, 25.4358]
            },
            severity: "CRITICAL",
            status: "REPORTED"
        });
        console.log("Accident created.");
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
