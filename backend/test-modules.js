import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';

// Create a direct DB connection to insert mock data for entities that lack POST routes
async function seedMockData() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Ambulance
    const Ambulance = mongoose.model('Ambulance', new mongoose.Schema({
        vehicle_number: String,
        current_location: Object,
        status: String,
        hospital_id: mongoose.Schema.Types.ObjectId
    }));
    
    // Hospital
    const Hospital = mongoose.model('Hospital', new mongoose.Schema({
        name: String,
        location: Object,
        capacity_status: String
    }));

    const hospital = await Hospital.create({
        name: "Test Hospital",
        location: { type: 'Point', coordinates: [81.8, 25.4] },
        capacity_status: "NORMAL"
    });

    const ambulance = await Ambulance.create({
        vehicle_number: `UP-${Date.now()}`,
        current_location: { type: 'Point', coordinates: [81.81, 25.41] },
        status: "AVAILABLE",
        hospital_id: hospital._id
    });

    await mongoose.disconnect();
    return { hospitalId: hospital._id, ambulanceId: ambulance._id };
}

async function runTests() {
    let authHeader = '';
    let accidentId = '';

    try {
        console.log('--- Seeding Mock Data ---');
        await seedMockData();
        console.log('✅ Mock Hospital and Ambulance created');

        console.log('\n--- Setting up Auth ---');
        try {
            await axios.post(`${API_URL}/auth/register`, {
                name: "Test User", email: "module_test@example.com", password: "Password123!", role: "AUTHORITY"
            });
        } catch(e) { /* might already exist */ }
        
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: "module_test@example.com", password: "Password123!"
        });
        authHeader = `Bearer ${loginRes.data.token}`;
        console.log('✅ Auth token acquired');

        console.log('\n--- Testing Emergency Entities ---');
        console.log('Testing POST /api/accidents...');
        try {
            const accRes = await axios.post(`${API_URL}/accidents`, {
                coordinates: [81.8463, 25.4358],
                severity: "HIGH"
            }, { headers: { Authorization: authHeader }});
            accidentId = accRes.data.data._id;
            console.log('✅ POST /api/accidents');
        } catch(e) { console.error('❌ POST /api/accidents failed', e.response?.data || e.message); }

        console.log('Testing GET /api/accidents...');
        try {
            await axios.get(`${API_URL}/accidents`, { headers: { Authorization: authHeader }});
            console.log('✅ GET /api/accidents');
        } catch(e) { console.error('❌ GET /api/accidents failed', e.response?.data || e.message); }

        if (accidentId) {
            console.log('Testing PATCH /api/accidents/:id/status...');
            try {
                await axios.patch(`${API_URL}/accidents/${accidentId}/status`, { status: "RESPONDING" }, { headers: { Authorization: authHeader }});
                console.log('✅ PATCH /api/accidents/:id/status');
            } catch(e) { console.error('❌ PATCH /api/accidents/:id/status failed', e.response?.data || e.message); }
        }

        console.log('Testing GET /api/ambulances...');
        try {
            await axios.get(`${API_URL}/ambulances?longitude=81.8&latitude=25.4`, { headers: { Authorization: authHeader }});
            console.log('✅ GET /api/ambulances');
        } catch(e) { console.error('❌ GET /api/ambulances failed', e.response?.data || e.message); }

        console.log('Testing GET /api/hospitals...');
        try {
            await axios.get(`${API_URL}/hospitals?longitude=81.8&latitude=25.4`, { headers: { Authorization: authHeader }});
            console.log('✅ GET /api/hospitals');
        } catch(e) { console.error('❌ GET /api/hospitals failed', e.response?.data || e.message); }

        console.log('Testing GET /api/blockages...');
        try {
            await axios.get(`${API_URL}/blockages`, { headers: { Authorization: authHeader }});
            console.log('✅ GET /api/blockages');
        } catch(e) { console.error('❌ GET /api/blockages failed', e.response?.data || e.message); }

        console.log('\n--- Testing Emergency Dashboard & Routing ---');
        console.log('Testing POST /api/emergency/route...');
        try {
            await axios.post(`${API_URL}/emergency/route`, {
                longitude: 81.8, latitude: 25.4
            }, { headers: { Authorization: authHeader }});
            console.log('✅ POST /api/emergency/route');
        } catch(e) { console.error('❌ POST /api/emergency/route failed', e.response?.data || e.message); }

        if (accidentId) {
            console.log('Testing GET /api/emergency/dashboard/:accidentId...');
            try {
                await axios.get(`${API_URL}/emergency/dashboard/${accidentId}`, { headers: { Authorization: authHeader }});
                console.log('✅ GET /api/emergency/dashboard/:accidentId');
            } catch(e) { console.error('❌ GET /api/emergency/dashboard/:accidentId failed', e.response?.data || e.message); }
        }

        console.log('\n--- Testing Road Health Score ---');
        console.log('Testing GET /api/roads/health-scores...'); 
        try {
            await axios.get(`${API_URL}/roads/health-scores`, { headers: { Authorization: authHeader }});
            console.log('✅ GET /api/roads/health-scores');
        } catch(e) { console.error('❌ GET /api/roads/health-scores failed', e.response?.data || e.message); }

        console.log('\n--- Testing Repair Priority Queue ---');
        console.log('Testing GET /api/priority/queue...');
        try {
            await axios.get(`${API_URL}/priority/queue`, { headers: { Authorization: authHeader }});
            console.log('✅ GET /api/priority/queue');
        } catch(e) { console.error('❌ GET /api/priority/queue failed', e.response?.data || e.message); }

        console.log('\n🎉 Module Testing Complete!');

    } catch (error) {
        console.error('Test execution error:', error.message);
    }
}

runTests();
