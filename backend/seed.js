import mongoose from "mongoose";
import { Hospital } from "./src/models/hospital.model.js";
import { Ambulance } from "./src/models/ambulance.model.js";
import connectDB from "./src/db/index.js";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
    try {
        await connectDB();

        const hospital = new Hospital({
            name: "City General Hospital",
            location: {
                type: "Point",
                coordinates: [81.8500, 25.4400] // Near the test coordinates
            },
            capacity_status: "NORMAL"
        });

        await hospital.save();
        console.log("Dummy Hospital created successfully!");

        const ambulance = new Ambulance({
            vehicle_number: "UP-70-AMB-108",
            current_location: {
                type: "Point",
                coordinates: [81.8470, 25.4360] // Near the accident
            },
            status: "AVAILABLE",
            hospital_id: hospital._id
        });

        await ambulance.save();
        console.log("Dummy Ambulance created successfully!");

        mongoose.disconnect();
    } catch (error) {
        console.error("Seeding failed:", error);
        mongoose.disconnect();
    }
}

seed();
