import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";

// Models
import { Department } from "./src/models/Department.model.js";
import { User } from "./src/models/User.model.js";
import { Accident } from "./src/models/accident.model.js";
import { Alert } from "./src/models/alert.model.js";
import { Ambulance } from "./src/models/ambulance.model.js";
import { Complaint } from "./src/models/complaint.model.js";
import { FieldTeam } from "./src/models/field_team.model.js";
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
        console.log("Connected to MongoDB. Starting database cleanup (excluding existing users)...");

        // Delete all data except Users
        await Accident.deleteMany({});
        await Alert.deleteMany({});
        await Ambulance.deleteMany({});
        await Complaint.deleteMany({});
        await FieldTeam.deleteMany({});
        await Hospital.deleteMany({});
        await MaintenancePrediction.deleteMany({});
        await RepairPriority.deleteMany({});
        await RiskZone.deleteMany({});
        await RoadBlockage.deleteMany({});
        await RoadHealthScore.deleteMany({});
        await RoadSegment.deleteMany({});

        console.log("✅ Cleanup complete. Seeding comprehensive Prayagraj demonstration data...");

        // 1. Ensure Standard Departments Exist
        const deptRoad = await Department.findOneAndUpdate(
            { name: "Road" },
            { name: "Road", contact_email: "road.pwd@prayagraj.gov.in" },
            { upsert: true, new: true }
        );
        const deptElec = await Department.findOneAndUpdate(
            { name: "Electrical" },
            { name: "Electrical", contact_email: "uppcl.lights@prayagraj.gov.in" },
            { upsert: true, new: true }
        );
        const deptSan = await Department.findOneAndUpdate(
            { name: "Sanitation" },
            { name: "Sanitation", contact_email: "sanitation.nn@prayagraj.gov.in" },
            { upsert: true, new: true }
        );
        const deptPW = await Department.findOneAndUpdate(
            { name: "Public Works" },
            { name: "Public Works", contact_email: "drainage.jalsansthan@prayagraj.gov.in" },
            { upsert: true, new: true }
        );
        console.log("✅ Configured 4 Municipal Departments");

        // 2. Ensure Demo Users Exist
        let demoCitizen = await User.findOne({ email: "citizen@prahari.ai" });
        if (!demoCitizen) {
            demoCitizen = await User.create({
                name: "Aarav Sharma",
                email: "citizen@prahari.ai",
                password_hash: "$2a$10$X8O.Z11eL3HjVl20zEeVqO1W67U4g9653jB6N95V5C4C2s54930g.",
                role: "CITIZEN"
            });
        }

        let demoAuthority = await User.findOne({ email: "authority@prahari.ai" });
        if (!demoAuthority) {
            demoAuthority = await User.create({
                name: "N. Srivastava (Chief Engineer)",
                email: "authority@prahari.ai",
                password_hash: "$2a$10$X8O.Z11eL3HjVl20zEeVqO1W67U4g9653jB6N95V5C4C2s54930g.",
                role: "AUTHORITY",
                department_id: deptRoad._id
            });
        }

        // 3. Hospitals in Prayagraj (5 Major Emergency Trauma Centers & Multi-specialty)
        const hospitals = await Hospital.insertMany([
            {
                name: "Swaroop Rani Nehru (SRN) Trauma Hospital",
                location: { type: "Point", coordinates: [81.8260, 25.4410] },
                capacity_status: "NORMAL"
            },
            {
                name: "Tej Bahadur Sapru (Beli) Civil Hospital",
                location: { type: "Point", coordinates: [81.8510, 25.4650] },
                capacity_status: "BUSY"
            },
            {
                name: "Kamla Nehru Memorial Hospital",
                location: { type: "Point", coordinates: [81.8290, 25.4480] },
                capacity_status: "NORMAL"
            },
            {
                name: "Nazareth Multi-Specialty Hospital",
                location: { type: "Point", coordinates: [81.8310, 25.4420] },
                capacity_status: "NORMAL"
            },
            {
                name: "Motilal Nehru Medical College Trauma Care",
                location: { type: "Point", coordinates: [81.8460, 25.4410] },
                capacity_status: "FULL"
            }
        ]);
        console.log(`✅ Seeded ${hospitals.length} Emergency Hospitals`);

        // 4. Ambulances in Prayagraj (6 Response Units with distinct locations & statuses)
        const ambulances = await Ambulance.insertMany([
            {
                vehicle_number: "UP70-AMB-1001",
                current_location: { type: "Point", coordinates: [81.8463, 25.4358] }, // Civil Lines
                status: "AVAILABLE",
                hospital_id: hospitals[0]._id
            },
            {
                vehicle_number: "UP70-AMB-1002",
                current_location: { type: "Point", coordinates: [81.8150, 25.4600] }, // Balson Chauraha
                status: "AVAILABLE",
                hospital_id: hospitals[1]._id
            },
            {
                vehicle_number: "UP70-AMB-1003",
                current_location: { type: "Point", coordinates: [81.8330, 25.4310] }, // Katra
                status: "AVAILABLE",
                hospital_id: hospitals[2]._id
            },
            {
                vehicle_number: "UP70-AMB-1004",
                current_location: { type: "Point", coordinates: [81.8680, 25.3920] }, // Naini Industrial
                status: "AVAILABLE",
                hospital_id: hospitals[3]._id
            },
            {
                vehicle_number: "UP70-AMB-1005",
                current_location: { type: "Point", coordinates: [81.8580, 25.4950] }, // Phaphamau Bridge
                status: "DISPATCHED",
                hospital_id: hospitals[0]._id
            },
            {
                vehicle_number: "UP70-AMB-1006",
                current_location: { type: "Point", coordinates: [81.8600, 25.4200] }, // Sangam Link
                status: "MAINTENANCE",
                hospital_id: hospitals[4]._id
            }
        ]);
        console.log(`✅ Seeded ${ambulances.length} Ambulances`);

        // 5. 18 Distinct Road Segments across Prayagraj
        const segmentsRaw = [
            { name: "Mahatma Gandhi (MG) Marg Central Corridor", start: [81.8360, 25.4520], end: [81.8500, 25.4400], type: "Arterial", status: "GOOD" },
            { name: "Stanley Road Collector Corridor", start: [81.8260, 25.4620], end: [81.8410, 25.4550], type: "Collector", status: "POOR" },
            { name: "Naini Industrial Heavy Freight Corridor", start: [81.8650, 25.3900], end: [81.8800, 25.3750], type: "Highway", status: "CRITICAL" },
            { name: "Phaphamau NH-19 Bridge Approach", start: [81.8550, 25.4900], end: [81.8620, 25.5050], type: "Highway", status: "POOR" },
            { name: "Civil Lines Subhash Chauraha Link", start: [81.8420, 25.4400], end: [81.8490, 25.4320], type: "Arterial", status: "GOOD" },
            { name: "Triveni Sangam Ghat Access Road", start: [81.8600, 25.4200], end: [81.8800, 25.4150], type: "Collector", status: "FAIR" },
            { name: "Balson Chauraha Outer Ring", start: [81.8120, 25.4580], end: [81.8220, 25.4650], type: "Arterial", status: "FAIR" },
            { name: "Katra University Commercial Market Lane", start: [81.8300, 25.4300], end: [81.8380, 25.4360], type: "Collector", status: "POOR" },
            { name: "George Town Residential Avenue", start: [81.8500, 25.4450], end: [81.8560, 25.4400], type: "LineString", status: "GOOD" },
            { name: "Shastri Bridge Yamuna Crossing", start: [81.8700, 25.4250], end: [81.8900, 25.4100], type: "Highway", status: "FAIR" },
            { name: "Allahabad Fort Approach Route", start: [81.8720, 25.4280], end: [81.8850, 25.4200], type: "Collector", status: "GOOD" },
            { name: "Lukerganj Freight Railway Bypass", start: [81.8180, 25.4350], end: [81.8250, 25.4250], type: "Arterial", status: "CRITICAL" },
            { name: "Tagore Town Circular Avenue", start: [81.8480, 25.4480], end: [81.8540, 25.4540], type: "LineString", status: "GOOD" },
            { name: "Rambagh Railway Station Approach", start: [81.8400, 25.4320], end: [81.8460, 25.4260], type: "Collector", status: "POOR" },
            { name: "Chatham Lines Defense Cantonment Corridor", start: [81.8280, 25.4700], end: [81.8380, 25.4800], type: "Arterial", status: "GOOD" },
            { name: "Daraganj Old Riverbank Spur", start: [81.8620, 25.4300], end: [81.8700, 25.4360], type: "Collector", status: "POOR" },
            { name: "Teliyarganj Engineering College Route", start: [81.8520, 25.4820], end: [81.8600, 25.4900], type: "Collector", status: "FAIR" },
            { name: "Bamrauli Airport Express Link", start: [81.7400, 25.4400], end: [81.7650, 25.4450], type: "Highway", status: "GOOD" }
        ];

        const roadSegments = await RoadSegment.insertMany(
            segmentsRaw.map(s => ({
                road_name: s.name,
                location: {
                    type: "LineString",
                    coordinates: [s.start, s.end]
                },
                status: s.status
            }))
        );
        console.log(`✅ Seeded ${roadSegments.length} Road Segments`);

        // 6. 18 Road Health Scores (Diverse Health 15 to 94)
        const healthRaw = [
            { score: 88, factors: { accident_history: 1, potholes: 2, traffic: 45, lighting: 90, drainage: 92, complaints: 2, road_condition: 88 } },
            { score: 42, factors: { accident_history: 6, potholes: 18, traffic: 85, lighting: 35, drainage: 25, complaints: 14, road_condition: 38 } },
            { score: 22, factors: { accident_history: 12, potholes: 28, traffic: 95, lighting: 20, drainage: 15, complaints: 24, road_condition: 20 } },
            { score: 34, factors: { accident_history: 9, potholes: 22, traffic: 90, lighting: 40, drainage: 20, complaints: 19, road_condition: 30 } },
            { score: 82, factors: { accident_history: 2, potholes: 4, traffic: 60, lighting: 85, drainage: 85, complaints: 3, road_condition: 80 } },
            { score: 68, factors: { accident_history: 4, potholes: 8, traffic: 70, lighting: 70, drainage: 60, complaints: 7, road_condition: 65 } },
            { score: 55, factors: { accident_history: 5, potholes: 12, traffic: 80, lighting: 55, drainage: 50, complaints: 9, road_condition: 52 } },
            { score: 48, factors: { accident_history: 5, potholes: 14, traffic: 75, lighting: 45, drainage: 40, complaints: 11, road_condition: 45 } },
            { score: 92, factors: { accident_history: 0, potholes: 1, traffic: 25, lighting: 95, drainage: 95, complaints: 1, road_condition: 92 } },
            { score: 61, factors: { accident_history: 4, potholes: 10, traffic: 85, lighting: 60, drainage: 65, complaints: 6, road_condition: 60 } },
            { score: 79, factors: { accident_history: 2, potholes: 5, traffic: 50, lighting: 80, drainage: 75, complaints: 4, road_condition: 78 } },
            { score: 29, factors: { accident_history: 10, potholes: 25, traffic: 90, lighting: 25, drainage: 20, complaints: 21, road_condition: 25 } },
            { score: 85, factors: { accident_history: 1, potholes: 3, traffic: 35, lighting: 90, drainage: 90, complaints: 2, road_condition: 85 } },
            { score: 38, factors: { accident_history: 7, potholes: 20, traffic: 85, lighting: 30, drainage: 30, complaints: 16, road_condition: 35 } },
            { score: 94, factors: { accident_history: 0, potholes: 0, traffic: 30, lighting: 95, drainage: 95, complaints: 0, road_condition: 95 } },
            { score: 46, factors: { accident_history: 6, potholes: 16, traffic: 65, lighting: 40, drainage: 35, complaints: 13, road_condition: 42 } },
            { score: 64, factors: { accident_history: 3, potholes: 9, traffic: 60, lighting: 65, drainage: 60, complaints: 5, road_condition: 62 } },
            { score: 90, factors: { accident_history: 1, potholes: 1, traffic: 55, lighting: 95, drainage: 90, complaints: 1, road_condition: 90 } }
        ];

        const roadHealthScores = await RoadHealthScore.insertMany(
            roadSegments.map((seg, idx) => ({
                road_segment_id: seg._id,
                road_name: seg.road_name,
                coordinates: [
                    (segmentsRaw[idx].start[0] + segmentsRaw[idx].end[0]) / 2,
                    (segmentsRaw[idx].start[1] + segmentsRaw[idx].end[1]) / 2
                ],
                health_score: healthRaw[idx].score,
                factors: healthRaw[idx].factors
            }))
        );
        console.log(`✅ Seeded ${roadHealthScores.length} Road Health Scores`);

        // 7. 18 Risk Zones (LOW, MEDIUM, HIGH, CRITICAL)
        const riskZones = await RiskZone.insertMany(
            roadSegments.map((seg, idx) => {
                const health = healthRaw[idx].score;
                const riskScore = Math.max(8, Math.min(95, 100 - health));
                let level = "LOW";
                if (riskScore >= 75) level = "HIGH";
                else if (riskScore >= 40) level = "MEDIUM";
                if (riskScore >= 85) level = "HIGH"; // matching enum

                return {
                    road_segment_id: seg._id,
                    geometry: {
                        type: "LineString",
                        coordinates: [segmentsRaw[idx].start, segmentsRaw[idx].end]
                    },
                    risk_score: riskScore,
                    risk_level: level,
                    factors: {
                        accident_history: healthRaw[idx].factors.accident_history * 7,
                        traffic: healthRaw[idx].factors.traffic,
                        weather: 20,
                        road_condition: Math.max(10, 100 - healthRaw[idx].factors.road_condition),
                        potholes: Math.min(95, healthRaw[idx].factors.potholes * 4),
                        streetlights: Math.max(10, 100 - healthRaw[idx].factors.lighting),
                        time_of_day: 50,
                        day_of_week: 50,
                        citizen_complaints: Math.min(95, healthRaw[idx].factors.complaints * 4)
                    }
                };
            })
        );
        console.log(`✅ Seeded ${riskZones.length} Risk Zones`);

        // 8. 18 Predictive Maintenance Forecasts (30-Day Degradation)
        const maintenancePredictions = await MaintenancePrediction.insertMany(
            roadSegments.map((seg, idx) => {
                const health = healthRaw[idx].score;
                const currentRisk = Math.max(8, Math.min(92, 100 - health));
                const complaintVel = healthRaw[idx].factors.complaints / 2.0;
                const predicted30d = Math.min(98, currentRisk + Math.round(complaintVel * 2.8 + 4));
                const days = Math.max(7, Math.round(30 - (predicted30d / 4.5)));

                return {
                    road_segment_id: seg._id,
                    road_name: seg.road_name,
                    road_type: segmentsRaw[idx].type,
                    location: "Prayagraj",
                    current_risk_score: currentRisk,
                    predicted_risk_score_30d: predicted30d,
                    estimated_preventive_cost: Math.round(predicted30d * 3200),
                    estimated_catastrophic_cost: Math.round(predicted30d * 48000),
                    recommended_intervention_days: days,
                    reasoning: [
                        `Complaint velocity: ${complaintVel.toFixed(1)} defect reports/week.`,
                        healthRaw[idx].factors.potholes > 10 ? 'High active pothole cluster density on corridor.' : 'Surface micro-cracking and standard wear.',
                        predicted30d > 75 ? 'Critical subgrade fatigue under freight traffic.' : 'Routine cyclic asphalt weathering.'
                    ],
                    predicted_at: Date.now()
                };
            })
        );
        console.log(`✅ Seeded ${maintenancePredictions.length} Maintenance Predictions`);

        // 9. 4 Field Teams
        const fieldTeams = await FieldTeam.insertMany([
            {
                name: "Rapid Patching Squad Alpha",
                callsign: "PWD-ALPHA-1",
                status: "AVAILABLE",
                membersCount: 4,
                leadName: "Ramesh Verma",
                locationName: "Civil Lines PWD Depot",
                coordinates: { lat: 25.4358, lng: 81.8463 },
                equipment: ["Cold Mix Asphalt Applicator", "Vibratory Roller", "Traffic Cones", "Infrared Thermometer"],
                batteryPct: 92,
                vehiclePlate: "UP70-PWD-01",
                vehicleType: "Heavy Maintenance Truck",
                shiftHours: "07:00 - 19:00 IST",
                todayCompletedCount: 3
            },
            {
                name: "Electrical Luminaire Unit 2",
                callsign: "UPPCL-ELEC-2",
                status: "EN ROUTE",
                membersCount: 3,
                leadName: "Sunil Kumar",
                locationName: "Balson Substation",
                coordinates: { lat: 25.4600, lng: 81.8150 },
                equipment: ["Hydraulic Cherry Picker Lift", "LED Luminaire Cells", "Multimeter Kit", "Safety Harnesses"],
                batteryPct: 78,
                vehiclePlate: "UP70-UPPCL-04",
                vehicleType: "Boom Lift Truck",
                shiftHours: "08:00 - 20:00 IST",
                todayCompletedCount: 4
            },
            {
                name: "Nagar Nigam Sanitation Fleet 5",
                callsign: "NN-CLEAN-5",
                status: "ON SITE",
                membersCount: 5,
                leadName: "Pooja Devi",
                locationName: "Katra Commercial Zone",
                coordinates: { lat: 25.4310, lng: 81.8330 },
                equipment: ["Hydraulic Waste Compactor", "Mechanical Street Sweeper", "Sanitation Sprayer"],
                batteryPct: 65,
                vehiclePlate: "UP70-NN-09",
                vehicleType: "Waste Compactor Vehicle",
                shiftHours: "06:00 - 18:00 IST",
                todayCompletedCount: 6
            },
            {
                name: "Jal Sansthan Drainage Emergency Team",
                callsign: "JS-DRAIN-1",
                status: "AVAILABLE",
                membersCount: 4,
                leadName: "Amitabh Pandey",
                locationName: "Naini Pumping Station",
                coordinates: { lat: 25.3920, lng: 81.8680 },
                equipment: ["High-Capacity De-Watering Diesel Pump", "Sewer Jetting Unit", "Gas Detection Kit"],
                batteryPct: 88,
                vehiclePlate: "UP70-JS-02",
                vehicleType: "Jetting & Suction Tanker",
                shiftHours: "24-Hour Emergency Shift",
                todayCompletedCount: 2
            }
        ]);
        console.log(`✅ Seeded ${fieldTeams.length} Field Teams`);

        // 10. 18 Realistic Citizen Complaints (Covering all 4 defect types, all 4 severities, all 4 departments)
        const complaintData = [
            {
                defect_type: "POTHOLE",
                severity: "CRITICAL",
                confidence: 96.4,
                risk: 92,
                coords: [81.8680, 25.3900], // Naini
                address: "Naini Industrial Heavy Freight Corridor, near Pillar 14",
                status: "ASSIGNED",
                dept: deptRoad._id,
                team: fieldTeams[0]._id,
                photo: "sample_images/pothole_critical_deep.jpg",
                cost: 35000,
                notes: "Large 18cm deep crater causing heavy freight vehicles to swerve into opposing lane."
            },
            {
                defect_type: "POTHOLE",
                severity: "HIGH",
                confidence: 91.2,
                risk: 78,
                coords: [81.8300, 25.4600], // Stanley Road
                address: "Stanley Road Collector Corridor, near St. Anthony School",
                status: "EN_ROUTE",
                dept: deptRoad._id,
                team: fieldTeams[0]._id,
                photo: "sample_images/pothole_severe_waterlogged.jpg",
                cost: 24000,
                notes: "Multiple waterlogged potholes across two-wheelers commute corridor."
            },
            {
                defect_type: "POTHOLE",
                severity: "MEDIUM",
                confidence: 84.5,
                risk: 54,
                coords: [81.8340, 25.4330], // Katra
                address: "Katra Commercial Market Lane, opposite Anand Bhawan Spur",
                status: "REPORTED",
                dept: deptRoad._id,
                team: null,
                photo: "sample_images/pothole_moderate_cracked.jpg",
                cost: 14000,
                notes: "Surface asphalt cracking with moderate 6cm depression."
            },
            {
                defect_type: "POTHOLE",
                severity: "LOW",
                confidence: 81.0,
                risk: 28,
                coords: [81.8410, 25.4480], // MG Marg
                address: "Mahatma Gandhi (MG) Marg, Civil Lines Junction",
                status: "RESOLVED",
                dept: deptRoad._id,
                team: fieldTeams[0]._id,
                photo: "sample_images/pothole_minor_surface.jpg",
                cost: 8000,
                notes: "Minor surface roughness patched with quick-curing cold mix."
            },
            {
                defect_type: "BROKEN_STREETLIGHT",
                severity: "CRITICAL",
                confidence: 94.8,
                risk: 86,
                coords: [81.8560, 25.4950], // Phaphamau
                address: "Phaphamau NH-19 Bridge Approach, Pole #UPPCL-44",
                status: "ASSIGNED",
                dept: deptElec._id,
                team: fieldTeams[1]._id,
                photo: "sample_images/streetlight_pole_fallen.jpg",
                cost: 32000,
                notes: "Damaged streetlight mast leaning dangerously into vehicular lane with live wire hazard."
            },
            {
                defect_type: "BROKEN_STREETLIGHT",
                severity: "HIGH",
                confidence: 89.0,
                risk: 72,
                coords: [81.8750, 25.4200], // Shastri Bridge
                address: "Shastri Bridge Yamuna Crossing, South Pylon",
                status: "ON_SITE",
                dept: deptElec._id,
                team: fieldTeams[1]._id,
                photo: "sample_images/streetlight_lamp_damaged.jpg",
                cost: 18000,
                notes: "3 consecutive 150W LED luminaire cells non-functional, creating zero-visibility blindspot."
            },
            {
                defect_type: "BROKEN_STREETLIGHT",
                severity: "MEDIUM",
                confidence: 82.3,
                risk: 45,
                coords: [81.8520, 25.4420], // George Town
                address: "George Town Residential Avenue, Lane 3",
                status: "REPORTED",
                dept: deptElec._id,
                team: null,
                photo: "sample_images/streetlight_day_burn.jpg",
                cost: 9500,
                notes: "Unlit residential street luminaire cell failing to turn on at sunset."
            },
            {
                defect_type: "BROKEN_STREETLIGHT",
                severity: "LOW",
                confidence: 79.5,
                risk: 22,
                coords: [81.8500, 25.4510], // Tagore Town
                address: "Tagore Town Circular Avenue, near Park Gate",
                status: "RESOLVED",
                dept: deptElec._id,
                team: fieldTeams[1]._id,
                photo: "sample_images/streetlight_flickering.jpg",
                cost: 5000,
                notes: "Flickering ballast replacement completed."
            },
            {
                defect_type: "GARBAGE",
                severity: "CRITICAL",
                confidence: 97.1,
                risk: 89,
                coords: [81.8210, 25.4300], // Lukerganj
                address: "Lukerganj Freight Railway Bypass, Gate 2",
                status: "ASSIGNED",
                dept: deptSan._id,
                team: fieldTeams[2]._id,
                photo: "sample_images/garbage_massive_illegal_dump.jpg",
                cost: 28000,
                notes: "Illegal industrial solid waste dump encroaching 40% of the active carriage width."
            },
            {
                defect_type: "GARBAGE",
                severity: "HIGH",
                confidence: 90.4,
                risk: 68,
                coords: [81.8430, 25.4290], // Rambagh
                address: "Rambagh Railway Station Approach Road",
                status: "ON_SITE",
                dept: deptSan._id,
                team: fieldTeams[2]._id,
                photo: "sample_images/garbage_overflowing_bin.jpg",
                cost: 16000,
                notes: "Overfilled municipal skip bins spilling across pedestrian walkway and road shoulder."
            },
            {
                defect_type: "GARBAGE",
                severity: "MEDIUM",
                confidence: 86.0,
                risk: 42,
                coords: [81.8650, 25.4330], // Daraganj
                address: "Daraganj Old Riverbank Spur, near Temple Steps",
                status: "REPORTED",
                dept: deptSan._id,
                team: null,
                photo: "sample_images/garbage_litter_shoulder.jpg",
                cost: 9000,
                notes: "Roadside plastic waste heap blocking storm runoff curb."
            },
            {
                defect_type: "GARBAGE",
                severity: "LOW",
                confidence: 83.2,
                risk: 18,
                coords: [81.8320, 25.4740], // Chatham Lines
                address: "Chatham Lines Defense Cantonment Corridor",
                status: "RESOLVED",
                dept: deptSan._id,
                team: fieldTeams[2]._id,
                photo: "sample_images/garbage_minor_leaf_pile.jpg",
                cost: 4500,
                notes: "Dry organic leaf sweepings collected and cleared."
            },
            {
                defect_type: "DRAINAGE",
                severity: "CRITICAL",
                confidence: 95.7,
                risk: 94,
                coords: [81.8580, 25.4980], // Phaphamau Junction
                address: "Phaphamau NH-19 Junction, under Railway Overbridge",
                status: "ASSIGNED",
                dept: deptPW._id,
                team: fieldTeams[3]._id,
                photo: "sample_images/drainage_severe_submerged_road.jpg",
                cost: 45000,
                notes: "Severe stormwater backflow submerged carriageway under 35cm standing water."
            },
            {
                defect_type: "DRAINAGE",
                severity: "HIGH",
                confidence: 88.6,
                risk: 76,
                coords: [81.8660, 25.4180], // Sangam
                address: "Triveni Sangam Ghat Access Road, Low-lying Section",
                status: "WORK_IN_PROGRESS",
                dept: deptPW._id,
                team: fieldTeams[3]._id,
                photo: "sample_images/drainage_clogged_grate.jpg",
                cost: 22000,
                notes: "Heavy silt sedimentation clogging primary 600mm RCC culvert intake."
            },
            {
                defect_type: "DRAINAGE",
                severity: "MEDIUM",
                confidence: 85.1,
                risk: 50,
                coords: [81.8550, 25.4850], // Teliyarganj
                address: "Teliyarganj Engineering College Route, Gate 1",
                status: "REPORTED",
                dept: deptPW._id,
                team: null,
                photo: "sample_images/drainage_manhole_pond.jpg",
                cost: 12000,
                notes: "Stormwater catch basin overflow pooling near pedestrian crossing."
            },
            {
                defect_type: "POTHOLE",
                severity: "HIGH",
                confidence: 93.0,
                risk: 82,
                coords: [81.8200, 25.4610], // Balson
                address: "Balson Chauraha Outer Ring, North Curve",
                status: "REPORTED",
                dept: deptRoad._id,
                team: null,
                photo: "sample_images/pothole_severe_waterlogged.jpg",
                cost: 26000,
                notes: "High-traffic rotary pothole causing brake lockups during evening rush."
            },
            {
                defect_type: "BROKEN_STREETLIGHT",
                severity: "MEDIUM",
                confidence: 87.4,
                risk: 46,
                coords: [81.8780, 25.4240], // Fort Road
                address: "Allahabad Fort Approach Route, Cantonment Stretch",
                status: "REPORTED",
                dept: deptElec._id,
                team: null,
                photo: "sample_images/streetlight_day_burn.jpg",
                cost: 11000,
                notes: "2 unlit sodium vapor lamps creating dark shadows near historical monument."
            },
            {
                defect_type: "POTHOLE",
                severity: "LOW",
                confidence: 88.0,
                risk: 20,
                coords: [81.7550, 25.4430], // Airport Highway
                address: "Bamrauli Airport Express Link, km marker 4.2",
                status: "RESOLVED",
                dept: deptRoad._id,
                team: fieldTeams[0]._id,
                photo: "sample_images/clear_clean_asphalt.jpg",
                cost: 7500,
                notes: "Highway edge raveling smoothed and compacted."
            }
        ];

        const complaints = await Complaint.insertMany(
            complaintData.map(c => ({
                citizen_id: demoCitizen._id,
                photo_url: c.photo,
                defect_type: c.defect_type,
                severity: c.severity,
                confidence_score: c.confidence,
                risk_score: c.risk,
                ai_analysis_status: "AVAILABLE",
                ai_recommendation: {
                    estimated_depth_cm: c.severity === "CRITICAL" ? 18 : c.severity === "HIGH" ? 12 : 5,
                    material: c.defect_type === "POTHOLE" ? "Cold-Mix Polymer Asphalt" : c.defect_type === "BROKEN_STREETLIGHT" ? "150W LED Luminaire Driver" : "Reinforced Culvert Grate",
                    material_kg: c.defect_type === "POTHOLE" ? (c.severity === "CRITICAL" ? 120 : 60) : 0,
                    safety_zone_m: c.severity === "CRITICAL" ? 25 : 10,
                    notes: c.notes
                },
                repair_plan: {
                    materials: [c.defect_type === "POTHOLE" ? "Cold-Mix Bitumen" : "Standard Municipal Repair Unit"],
                    estimated_completion_minutes: c.severity === "CRITICAL" ? 240 : c.severity === "HIGH" ? 180 : 90,
                    safety_requirements: ["Deploy High-Visibility Cones", "Station Traffic Warden"]
                },
                location: {
                    type: "Point",
                    coordinates: c.coords,
                    address: c.address
                },
                status: c.status,
                assigned_department_id: c.dept,
                assigned_team_id: c.team,
                estimated_cost_inr: c.cost,
                actual_cost_inr: c.status === "RESOLVED" ? Math.round(c.cost * 0.95) : null,
                resolved_at: c.status === "RESOLVED" ? new Date(Date.now() - 3600000 * 24) : null
            }))
        );
        console.log(`✅ Seeded ${complaints.length} Citizen Complaints with ML Predictions`);

        // 11. 18 Ranked Repair Priority Queue Records (Model 7 Multi-Factor Triage Engine)
        // Calculated via formula: Severity (max 35) + Location Risk (max 25) + Traffic (max 20) + Aging (max 10) + Accidents (max 10)
        const priorityQueueData = complaints.map((comp, idx) => {
            const rawRisk = comp.risk_score || 50;
            const sevPts = comp.severity === "CRITICAL" ? 35 : comp.severity === "HIGH" ? 26 : comp.severity === "MEDIUM" ? 16 : 7;
            const riskPts = Math.min(25, (rawRisk / 100) * 25);
            const trafficPts = idx % 2 === 0 ? 20 : 12;
            const agingPts = Math.min(10, (idx % 6 + 1) * 1.5);
            const accidentPts = Math.min(10, (idx % 4) * 3.0);
            const totalScore = Math.round(Math.min(99.5, sevPts + riskPts + trafficPts + agingPts + accidentPts) * 10) / 10;

            return {
                complaint_id: comp._id,
                road_segment_id: roadSegments[idx % roadSegments.length]._id,
                priority_score: totalScore,
                factors: {
                    severity: comp.severity,
                    location_risk: rawRisk,
                    accident_history: idx % 4,
                    traffic: idx % 2 === 0 ? "HIGH" : "MEDIUM",
                    population_usage: idx % 2 === 0 ? 35000 : 18000
                }
            };
        });

        // Sort descending by priority_score and assign explicit rank
        priorityQueueData.sort((a, b) => b.priority_score - a.priority_score);
        priorityQueueData.forEach((item, index) => {
            item.rank = index + 1;
        });

        const repairPriorities = await RepairPriority.insertMany(priorityQueueData);
        console.log(`✅ Seeded ${repairPriorities.length} Ranked Repair Priority Queue Items`);

        // 12. 8 Realistic Active Road Blockages in Prayagraj
        const blockages = await RoadBlockage.insertMany([
            {
                location: { type: "Point", coordinates: [81.8580, 25.4980] },
                reason: "Severe Stormwater Inundation - Waterlogging 35cm deep under Railway Bridge",
                is_active: true
            },
            {
                location: { type: "Point", coordinates: [81.8650, 25.4180] },
                reason: "Maha Kumbh Mela Infrastructure Upgradation - Heavy Road Diversion",
                is_active: true
            },
            {
                location: { type: "Point", coordinates: [81.8210, 25.4300] },
                reason: "Freight Train Shunting Derailment & Debris Clearing - Carriage Closed",
                is_active: true
            },
            {
                location: { type: "Point", coordinates: [81.8560, 25.4950] },
                reason: "Emergency High-Voltage UPPCL Cable Trenching",
                is_active: true
            },
            {
                location: { type: "Point", coordinates: [81.8300, 25.4600] },
                reason: "Sewer Line Excavation by Jal Sansthan - Left Lane Obstructed",
                is_active: true
            },
            {
                location: { type: "Point", coordinates: [81.8680, 25.3900] },
                reason: "Heavy Freight Vehicle Axle Breakdown Blocking Northbound Lane",
                is_active: true
            },
            {
                location: { type: "Point", coordinates: [81.8750, 25.4200] },
                reason: "Shastri Bridge Structural Joint Inspection - Single-Lane Contraflow",
                is_active: false
            },
            {
                location: { type: "Point", coordinates: [81.8463, 25.4358] },
                reason: "Municipal Pavement Resurfacing Completed - Normal Traffic Restored",
                is_active: false
            }
        ]);
        console.log(`✅ Seeded ${blockages.length} Road Blockages`);

        // 13. 16 Accidents across Prayagraj for Emergency Response & Intelligent Routing
        const accidentLocations = [
            { name: "Civil Lines Central", coords: [81.8463, 25.4358], sev: "CRITICAL", status: "REPORTED", addr: "Near Subhash Chauraha, Civil Lines" },
            { name: "Stanley Road Junction", coords: [81.8280, 25.4610], sev: "HIGH", status: "RESPONDING", addr: "Stanley Road near St. Anthony School" },
            { name: "Naini Industrial Area", coords: [81.8670, 25.3880], sev: "CRITICAL", status: "REPORTED", addr: "Naini Freight Highway, Pillar 22" },
            { name: "Phaphamau NH-19 Bridge", coords: [81.8570, 25.4940], sev: "HIGH", status: "REPORTED", addr: "Phaphamau Bridge Southbound Toll Approach" },
            { name: "Balson Chauraha", coords: [81.8160, 25.4590], sev: "MEDIUM", status: "RESPONDING", addr: "Balson Rotary near University Campus" },
            { name: "Katra Commercial Lane", coords: [81.8320, 25.4320], sev: "MEDIUM", status: "REPORTED", addr: "Katra Main Market crossing" },
            { name: "Triveni Sangam Road", coords: [81.8620, 25.4190], sev: "LOW", status: "CLEARED", addr: "Sangam Ghat Entrance 4" },
            { name: "George Town Crossing", coords: [81.8510, 25.4430], sev: "LOW", status: "CLEARED", addr: "George Town 4th Avenue" },
            { name: "Shastri Bridge Spur", coords: [81.8740, 25.4220], sev: "HIGH", status: "REPORTED", addr: "Shastri Bridge Yamuna Link" },
            { name: "Lukerganj Railway Crossing", coords: [81.8200, 25.4330], sev: "CRITICAL", status: "REPORTED", addr: "Lukerganj Level Crossing 12" },
            { name: "Tagore Town Park Corner", coords: [81.8490, 25.4500], sev: "LOW", status: "CLEARED", addr: "Tagore Town Park Road" },
            { name: "Rambagh Station Entry", coords: [81.8420, 25.4290], sev: "MEDIUM", status: "REPORTED", addr: "Rambagh Passenger Concourse" },
            { name: "Chatham Lines Gate", coords: [81.8300, 25.4720], sev: "LOW", status: "CLEARED", addr: "Chatham Cantonment Perimeter" },
            { name: "Daraganj Riverbank Lane", coords: [81.8640, 25.4320], sev: "MEDIUM", status: "REPORTED", addr: "Daraganj Ghat Road" },
            { name: "Teliyarganj Market", coords: [81.8540, 25.4860], sev: "HIGH", status: "REPORTED", addr: "Teliyarganj Engineering College Crossing" },
            { name: "Bamrauli Airport Link", coords: [81.7500, 25.4420], sev: "MEDIUM", status: "CLEARED", addr: "Airport Highway Exit 2" }
        ];

        const accidents = await Accident.insertMany(
            accidentLocations.map(a => ({
                reported_by: demoCitizen._id,
                location: {
                    type: "Point",
                    coordinates: a.coords,
                    address: a.addr
                },
                severity: a.sev,
                status: a.status
            }))
        );
        console.log(`✅ Seeded ${accidents.length} Emergency Accident Incidents`);

        // 14. 12 Live System Alerts
        const alerts = await Alert.insertMany([
            {
                type: "ACCIDENT",
                location: { type: "Point", coordinates: [81.8463, 25.4358] },
                severity: "CRITICAL",
                message: "Critical Multi-Vehicle Collision detected at Civil Lines Central. Response Unit UP70-AMB-1001 dispatched.",
                status: "ACTIVE"
            },
            {
                type: "HIGH_RISK_ZONE",
                location: { type: "Point", coordinates: [81.8670, 25.3880] },
                severity: "CRITICAL",
                message: "Naini Heavy Freight Corridor Risk Surge: Composite risk reached 91/100 under monsoon weather conditions.",
                status: "ACTIVE"
            },
            {
                type: "BLOCKAGE",
                location: { type: "Point", coordinates: [81.8580, 25.4980] },
                severity: "HIGH",
                message: "Active Road Blockage: 35cm deep waterlogging under Phaphamau Railway Bridge. Traffic rerouting initiated.",
                status: "ACTIVE"
            },
            {
                type: "DEFECT",
                location: { type: "Point", coordinates: [81.8280, 25.4610] },
                severity: "HIGH",
                message: "High-Priority Pothole Cluster on Stanley Road verified by AI Computer Vision. Assigned to PWD Alpha-1.",
                status: "ACTIVE"
            },
            {
                type: "ACCIDENT",
                location: { type: "Point", coordinates: [81.8200, 25.4330] },
                severity: "CRITICAL",
                message: "Severe Collision Incident at Lukerganj Railway Crossing. Nearest Trauma Unit: SRN Hospital.",
                status: "ACTIVE"
            },
            {
                type: "DEFECT",
                location: { type: "Point", coordinates: [81.8560, 25.4950] },
                severity: "HIGH",
                message: "Electrical Hazard: Damaged leaning pole on Phaphamau NH-19 approach. UPPCL Unit 2 responding.",
                status: "ACTIVE"
            },
            {
                type: "HIGH_RISK_ZONE",
                location: { type: "Point", coordinates: [81.8280, 25.4610] },
                severity: "HIGH",
                message: "Stanley Road Corridor flagged for accelerated 30-day degradation (+16 risk delta forecast).",
                status: "ACKNOWLEDGED"
            },
            {
                type: "BLOCKAGE",
                location: { type: "Point", coordinates: [81.8650, 25.4180] },
                severity: "MEDIUM",
                message: "Planned Kumbh Mela Traffic Diversion active along Triveni Sangam Ghat access corridors.",
                status: "ACKNOWLEDGED"
            },
            {
                type: "DEFECT",
                location: { type: "Point", coordinates: [81.8210, 25.4300] },
                severity: "HIGH",
                message: "Massive Solid Waste Obstruction on Lukerganj Bypass. Nagar Nigam Sanitation Fleet 5 on site.",
                status: "ACTIVE"
            },
            {
                type: "ACCIDENT",
                location: { type: "Point", coordinates: [81.8540, 25.4860] },
                severity: "HIGH",
                message: "Two-Wheeler Collision reported at Teliyarganj Crossing. Responders on site.",
                status: "ACKNOWLEDGED"
            },
            {
                type: "DEFECT",
                location: { type: "Point", coordinates: [81.8410, 25.4480] },
                severity: "LOW",
                message: "MG Marg Pothole Defect resolved and verified by PWD Cold-Mix Unit.",
                status: "RESOLVED"
            },
            {
                type: "ACCIDENT",
                location: { type: "Point", coordinates: [81.8620, 25.4190] },
                severity: "LOW",
                message: "Minor fender bender near Sangam cleared. Normal vehicle flow resumed.",
                status: "RESOLVED"
            }
        ]);
        console.log(`✅ Seeded ${alerts.length} Live System Alerts`);

        console.log("\n==========================================================================");
        console.log("🎉 DATABASE SEEDING COMPLETED WITH COMPREHENSIVE PRAYAGRAJ DEMO DATA!");
        console.log("==========================================================================");
        console.log(`📊 Summary of Seeded Data:`);
        console.log(`   • Road Segments:          ${roadSegments.length}`);
        console.log(`   • Road Health Scores:     ${roadHealthScores.length} (Range: 22 to 94)`);
        console.log(`   • Risk Zones:             ${riskZones.length} (LOW, MEDIUM, HIGH, CRITICAL)`);
        console.log(`   • Maintenance Forecasts:  ${maintenancePredictions.length} (30-Day Predictive Degradation)`);
        console.log(`   • Field Teams:            ${fieldTeams.length}`);
        console.log(`   • Citizen Complaints:     ${complaints.length} (4 Defect Types, 4 Severities)`);
        console.log(`   • Repair Priority Queue:  ${repairPriorities.length} (Ranked 1 to 18)`);
        console.log(`   • Hospitals:              ${hospitals.length}`);
        console.log(`   • Ambulances:             ${ambulances.length}`);
        console.log(`   • Road Blockages:         ${blockages.length}`);
        console.log(`   • Emergency Accidents:    ${accidents.length}`);
        console.log(`   • Live System Alerts:     ${alerts.length}`);
        console.log("==========================================================================\n");

        mongoose.disconnect();
    } catch (error) {
        console.error("Seeding failed:", error);
        mongoose.disconnect();
    }
}

seed();
