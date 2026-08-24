import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
let testAccidentId = null;
let testAmbulanceId = null;
let testBlockageId = null;

async function runTests() {
    console.log("=====================================");
    console.log("STARTING API TESTS FOR ROADGUARD AI");
    console.log("=====================================\n");

    try {
        // 1. POST /api/accidents
        console.log("Testing POST /api/accidents ...");
        const createAccidentRes = await axios.post(`${BASE_URL}/accidents`, {
            reported_by: "64f9b23c8a9e4b1a2c3d4e5f", // Mock User ID
            coordinates: [81.8463, 25.4358],
            severity: "HIGH",
            status: "REPORTED"
        });
        testAccidentId = createAccidentRes.data.data._id;
        console.log(`✅ Success! Created Accident ID: ${testAccidentId}\n`);

        // 2. GET /api/accidents
        console.log("Testing GET /api/accidents ...");
        const getAccidentsRes = await axios.get(`${BASE_URL}/accidents`);
        console.log(`✅ Success! Found ${getAccidentsRes.data.data.length} active accidents.\n`);

        // 3. PATCH /api/accidents/:id/status
        console.log(`Testing PATCH /api/accidents/${testAccidentId}/status ...`);
        const patchAccidentRes = await axios.patch(`${BASE_URL}/accidents/${testAccidentId}/status`, {
            status: "RESPONDING"
        });
        console.log(`✅ Success! Accident status updated to: ${patchAccidentRes.data.data.status}\n`);

        // 4. GET /api/ambulances
        console.log("Testing GET /api/ambulances ...");
        const getAmbulancesRes = await axios.get(`${BASE_URL}/ambulances?longitude=81.8463&latitude=25.4358`);
        console.log(`✅ Success! Found ${getAmbulancesRes.data.data.length} nearby ambulances.`);
        if (getAmbulancesRes.data.data.length > 0) {
            testAmbulanceId = getAmbulancesRes.data.data[0]._id;
            console.log(`   First Ambulance ID: ${testAmbulanceId}\n`);
        } else {
            console.log("   No ambulances found nearby. Make sure you ran seed.js!\n");
        }

        // 5. PATCH /api/ambulances/:id/location
        if (testAmbulanceId) {
            console.log(`Testing PATCH /api/ambulances/${testAmbulanceId}/location ...`);
            const patchAmbulanceRes = await axios.patch(`${BASE_URL}/ambulances/${testAmbulanceId}/location`, {
                longitude: 81.8465,
                latitude: 25.4359
            });
            console.log(`✅ Success! Ambulance location updated.\n`);
        }

        // 6. GET /api/hospitals
        console.log("Testing GET /api/hospitals ...");
        const getHospitalsRes = await axios.get(`${BASE_URL}/hospitals?longitude=81.8463&latitude=25.4358`);
        console.log(`✅ Success! Found ${getHospitalsRes.data.data.length} nearby hospitals.\n`);

        // 7. POST /api/blockages
        console.log("Testing POST /api/blockages ...");
        const createBlockageRes = await axios.post(`${BASE_URL}/blockages`, {
            location: {
                type: "Point",
                coordinates: [81.8460, 25.4355]
            },
            reason: "Fallen Tree",
            is_active: true
        });
        testBlockageId = createBlockageRes.data.data._id;
        console.log(`✅ Success! Created Blockage ID: ${testBlockageId}\n`);

        // 8. GET /api/blockages
        console.log("Testing GET /api/blockages ...");
        const getBlockagesRes = await axios.get(`${BASE_URL}/blockages`);
        console.log(`✅ Success! Found ${getBlockagesRes.data.data.length} active blockages.\n`);

        // 9. POST /api/emergency/route
        console.log("Testing POST /api/emergency/route (Integration with Python Engine) ...");
        const routeRes = await axios.post(`${BASE_URL}/emergency/route`, {
            accident_id: testAccidentId
        });
        console.log(`✅ Success! Routing Engine responded with ETA: ${routeRes.data.data.safest_route_eta_mins || routeRes.data.data.eta_minutes} mins\n`);

        // 10. GET /api/emergency/dashboard/:accidentId
        console.log(`Testing GET /api/emergency/dashboard/${testAccidentId} ...`);
        const dashboardRes = await axios.get(`${BASE_URL}/emergency/dashboard/${testAccidentId}`);
        console.log(`✅ Success! Dashboard Data loaded. Nearest Hospital: ${dashboardRes.data.data.nearest_hospital?.name || 'N/A'}\n`);


        // 11. POST /api/internal/calculate-health-score
        console.log("Testing POST /api/internal/calculate-health-score ...");
        const calcHealthRes = await axios.post(`${BASE_URL}/internal/calculate-health-score`, {
            road_segment_id: "64f9b23c8a9e4b1a2c3d4e5f", // Valid Hex ObjectId
            road_name: "MG Road",
            factors: {
                accident_history: 2,
                potholes: 5,
                traffic: "HIGH",
                lighting: "GOOD",
                drainage: "POOR",
                complaints: 3,
                road_condition: "POOR"
            }
        });
        const roadSegmentId = calcHealthRes.data.data.road_segment_id;
        console.log(`✅ Success! Health score calculated for ${calcHealthRes.data.data.road_name}: ${calcHealthRes.data.data.health_score}/100\n`);

        // 12. GET /api/roads/health-scores
        console.log("Testing GET /api/roads/health-scores ...");
        const getHealthRes = await axios.get(`${BASE_URL}/roads/health-scores`);
        console.log(`✅ Success! Found ${getHealthRes.data.data.length} road health records.\n`);

        // 13. GET /api/roads/health-scores/:segmentId
        console.log(`Testing GET /api/roads/health-scores/${roadSegmentId} ...`);
        const getOneHealthRes = await axios.get(`${BASE_URL}/roads/health-scores/${roadSegmentId}`);
        console.log(`✅ Success! Breakdown fetched: Potholes = ${getOneHealthRes.data.data.factors.potholes}\n`);


        console.log("=====================================");
        console.log("🎉 ALL API TESTS PASSED SUCCESSFULLY!");
        console.log("=====================================");

    } catch (error) {
        console.log("\n❌ TEST FAILED!");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Message: ${error.response.data.message || error.response.data.detail}`);
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTests();
