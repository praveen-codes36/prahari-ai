import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Accident } from './src/models/accident.model.js';
import { Ambulance } from './src/models/ambulance.model.js';
import { Hospital } from './src/models/hospital.model.js';
import { Complaint } from './src/models/complaint.model.js';
import { RoadBlockage } from './src/models/road_blockage.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/prahari-ai";

async function seedData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        // Clear existing test data
        await Accident.deleteMany({ "description": "Test Routing Scenario Accident" });
        await Complaint.deleteMany({ "description": "TEST_SCENARIO_HAZARD" });
        await RoadBlockage.deleteMany({ "reason": "TEST_SCENARIO_BLOCKAGE" });

        // Coords for testing
        const accCoords = [81.84, 25.43];
        const hospCoords = [81.845, 25.435];
        // R0 is the fastest path without hazards.
        // We will place a hazard exactly on R0 to penalize it.
        const hazardCoords = [81.841541, 25.431923];

        console.log("Creating Test Accident...");
        const accident = await Accident.create({
            description: "Test Routing Scenario Accident",
            severity: "CRITICAL",
            status: "REPORTED",
            location: { type: "Point", coordinates: accCoords },
            reported_by: new mongoose.Types.ObjectId()
        });

        console.log("Creating Test Ambulance at Accident...");
        await Ambulance.findOneAndUpdate(
            { vehicle_number: "TEST-AMB-01" },
            {
                vehicle_number: "TEST-AMB-01",
                driver_name: "Test Driver",
                driver_phone: "9999999999",
                current_location: { type: "Point", coordinates: accCoords },
                status: "AVAILABLE",
                equipment_level: "ALS"
            },
            { upsert: true, new: true }
        );

        console.log("Creating Test Hospital...");
        await Hospital.findOneAndUpdate(
            { name: "Test Trauma Center" },
            {
                name: "Test Trauma Center",
                location: { type: "Point", coordinates: hospCoords },
                trauma_center: true,
                available_icu_beds: 5,
                available_ambulances: 1,
                contact_number: "8888888888"
            },
            { upsert: true, new: true }
        );

        console.log("Creating Test Hazard (Potholes) on Route A...");
        await Complaint.create({
            citizen_id: new mongoose.Types.ObjectId(),
            defect_type: "POTHOLE",
            location: { type: "Point", coordinates: hazardCoords },
            description: "TEST_SCENARIO_HAZARD",
            severity: "CRITICAL",
            status: "REPORTED",
            photo_url: "http://example.com/pothole.jpg"
        });

        console.log("Creating Test Roadblock on Route A...");
        await RoadBlockage.create({
            location: { type: "Point", coordinates: hazardCoords },
            reason: "TEST_SCENARIO_BLOCKAGE",
            is_active: true,
            reported_by: new mongoose.Types.ObjectId()
        });

        console.log("Seed data created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedData();
