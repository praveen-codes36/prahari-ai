import mongoose from "mongoose";
import { Hospital } from "./src/models/hospital.model.js";
import { Ambulance } from "./src/models/ambulance.model.js";
import connectDB from "./src/db/index.js";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
    try {
        await connectDB();

        // Import the Accident model inline since we didn't add it at the top
        const { Accident } = await import("./src/models/accident.model.js");

        const accident = new Accident({
            reported_by: new mongoose.Types.ObjectId(), // Dummy user ID
            location: {
                type: "Point",
                coordinates: [81.8463, 25.4358] // The exact coordinates we've been using
            },
            severity: "HIGH",
            status: "REPORTED"
        });

        await accident.save();
        console.log(`\n✅ Dummy Accident created successfully!`);
        console.log(`👉 PLEASE COPY THIS ACCIDENT ID TO TEST THE DASHBOARD API: ${accident._id}\n`);

        mongoose.disconnect();
    } catch (error) {
        console.error("Seeding failed:", error);
        mongoose.disconnect();
    }
}

seed();
