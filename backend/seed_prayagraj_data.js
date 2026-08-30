import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { User } from "./src/models/User.model.js";

// Models
import { Accident } from "./src/models/accident.model.js";
import { Alert } from "./src/models/alert.model.js";
import { Ambulance } from "./src/models/ambulance.model.js";
import { Complaint } from "./src/models/complaint.model.js";
import { Hospital } from "./src/models/hospital.model.js";
import { MaintenancePrediction } from "./src/models/maintenance_prediction.model.js";
import { RepairPriority } from "./src/models/repair_priority.model.js";
import { RiskZone } from "./src/models/risk_zone.model.js";
import { RoadBlockage } from "./src/models/road_blockage.model.js";
import { RoadHealthScore } from "./src/models/road_health.model.js";
import { RoadSegment } from "./src/models/road_segment.model.js";

dotenv.config();

async function seed() {
    try {
        await connectDB();
        console.log("Connected to MongoDB. Starting database cleanup (excluding Users)...");

        // Delete all data except Users
        await Accident.deleteMany({});
        await Alert.deleteMany({});
        await Ambulance.deleteMany({});
        await Complaint.deleteMany({});
        await Hospital.deleteMany({});
        await MaintenancePrediction.deleteMany({});
        await RepairPriority.deleteMany({});
        await RiskZone.deleteMany({});
        await RoadBlockage.deleteMany({});
        await RoadHealthScore.deleteMany({});
        await RoadSegment.deleteMany({});

        console.log("✅ Cleanup complete. Seeding Prayagraj region data...");

        // Hospitals in Prayagraj
        const hospitals = await Hospital.insertMany([
            {
                name: "Swaroop Rani Nehru (SRN) Hospital",
                location: { type: "Point", coordinates: [81.8260, 25.4410] },
                contact_number: "05322242000",
                capacity: 50,
                available_beds: 20
            },
            {
                name: "Kamla Nehru Memorial Hospital",
                location: { type: "Point", coordinates: [81.8290, 25.4480] },
                contact_number: "05322256789",
                capacity: 100,
                available_beds: 35
            },
            {
                name: "Nazareth Hospital",
                location: { type: "Point", coordinates: [81.8310, 25.4420] },
                contact_number: "05322234567",
                capacity: 80,
                available_beds: 15
            }
        ]);
        console.log(`✅ Seeded ${hospitals.length} Hospitals`);

        // Ambulances in Prayagraj
        const ambulances = await Ambulance.insertMany([
            {
                vehicle_number: "UP70 AB 1234",
                current_location: { type: "Point", coordinates: [81.8463, 25.4358] }, // Civil Lines
                status: "AVAILABLE",
                hospital_id: hospitals[0]._id
            },
            {
                vehicle_number: "UP70 CD 5678",
                current_location: { type: "Point", coordinates: [81.8150, 25.4600] }, // Balson Chauraha
                status: "AVAILABLE",
                hospital_id: hospitals[1]._id
            },
            {
                vehicle_number: "UP70 EF 9012",
                current_location: { type: "Point", coordinates: [81.8330, 25.4310] }, // Katra
                status: "MAINTENANCE",
                hospital_id: hospitals[2]._id
            }
        ]);
        console.log(`✅ Seeded ${ambulances.length} Ambulances`);

        // Road Segments
        const roadSegments = await RoadSegment.insertMany([
            {
                road_name: "Mahatma Gandhi (MG) Marg, Civil Lines",
                start_coordinates: { type: "Point", coordinates: [81.8360, 25.4520] },
                end_coordinates: { type: "Point", coordinates: [81.8500, 25.4400] },
                road_type: "Arterial"
            },
            {
                road_name: "Stanley Road",
                start_coordinates: { type: "Point", coordinates: [81.8260, 25.4620] },
                end_coordinates: { type: "Point", coordinates: [81.8410, 25.4550] },
                road_type: "Collector"
            },
            {
                road_name: "Triveni Road (near Sangam)",
                start_coordinates: { type: "Point", coordinates: [81.8600, 25.4200] },
                end_coordinates: { type: "Point", coordinates: [81.8800, 25.4150] },
                road_type: "Highway"
            }
        ]);
        console.log(`✅ Seeded ${roadSegments.length} Road Segments`);

        // Road Health Scores
        const healthScores = await RoadHealthScore.insertMany([
            {
                road_segment_id: roadSegments[0]._id,
                road_name: roadSegments[0].road_name,
                coordinates: [81.8400, 25.4480],
                health_score: 85,
                factors: { accident_history: 2, potholes: 5, traffic: 50, lighting: 80, drainage: 90, complaints: 2, road_condition: 85 }
            },
            {
                road_segment_id: roadSegments[1]._id,
                road_name: roadSegments[1].road_name,
                coordinates: [81.8300, 25.4600],
                health_score: 45,
                factors: { accident_history: 5, potholes: 15, traffic: 90, lighting: 30, drainage: 20, complaints: 12, road_condition: 35 }
            }
        ]);
        console.log(`✅ Seeded ${healthScores.length} Road Health Scores`);

        // Blockages
        const blockages = await RoadBlockage.insertMany([
            {
                location: { type: "Point", coordinates: [81.8400, 25.4500] },
                reason: "Waterlogging due to heavy rain",
                is_active: true
            },
            {
                location: { type: "Point", coordinates: [81.8650, 25.4180] },
                reason: "Maha Kumbh Mela Preparation - Road Diversion",
                is_active: true
            }
        ]);
        console.log(`✅ Seeded ${blockages.length} Road Blockages`);

        // Risk Zones
        const riskZones = await RiskZone.insertMany([
            {
                geometry: { type: "LineString", coordinates: [[81.8490, 25.4290], [81.8510, 25.4310]] },
                risk_score: 85,
                risk_level: "HIGH",
                factors: { accident_history: 80, traffic: 90, weather: 20, road_condition: 70, potholes: 60, streetlights: 30, time_of_day: 50, day_of_week: 50, citizen_complaints: 45 }
            },
            {
                geometry: { type: "LineString", coordinates: [[81.8590, 25.4990], [81.8610, 25.5010]] },
                risk_score: 55,
                risk_level: "MEDIUM",
                factors: { accident_history: 40, traffic: 70, weather: 10, road_condition: 50, potholes: 40, streetlights: 80, time_of_day: 50, day_of_week: 50, citizen_complaints: 20 }
            }
        ]);
        console.log(`✅ Seeded ${riskZones.length} Risk Zones`);
        
        // Dummy Accident
        const accident = new Accident({
            reported_by: new mongoose.Types.ObjectId(), // Dummy user ID
            location: { type: "Point", coordinates: [81.8463, 25.4358] }, // Civil Lines
            severity: "HIGH",
            status: "REPORTED"
        });
        await accident.save();
        console.log(`✅ Seeded 1 Accident`);

        console.log("\n🎉 Database successfully seeded with Prayagraj region data!");
        console.log("===============================================================");
        console.log(`👉 DUMMY ACCIDENT ID: ${accident._id}`);
        console.log("===============================================================\n");

        mongoose.disconnect();
    } catch (error) {
        console.error("Seeding failed:", error);
        mongoose.disconnect();
    }
}

seed();
