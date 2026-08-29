import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FieldTeam } from './src/models/field_team.model.js';

dotenv.config({ path: './.env' });

const DEMO_TEAMS = [
  {
    name: 'Squad Alpha',
    callsign: 'ALPHA-01',
    status: 'AVAILABLE',
    membersCount: 4,
    leadName: 'Eng. Sunil Verma',
    locationName: 'HQ Depot, Civil Lines',
    coordinates: { lat: 25.4519, lng: 81.8409 },
    currentTask: 'Standing by',
    etaMin: 0,
    equipment: [
      'Polymer Cold-Mix (450kg)',
      'Vibro-Compactor 1.2T',
      'Safety Barrier Cones (24x)',
      'AI Laser Depth Gauge',
    ],
    batteryPct: 96,
    vehiclePlate: 'UP70 AB 4521',
    vehicleType: 'Repair Van',
  },
  {
    name: 'Squad Bravo',
    callsign: 'BRAVO-02',
    status: 'EN ROUTE',
    membersCount: 3,
    leadName: 'Insp. R. Yadav',
    locationName: 'NH-19, Naini',
    coordinates: { lat: 25.3897, lng: 81.8531 },
    currentTask: 'Pothole repair @ NH-19 KM 14.2',
    etaMin: 12,
    equipment: [
      'Cold Asphalt Injection Kit',
      'Traffic Diversion Cones (12x)',
      'Portable Generator',
    ],
    batteryPct: 82,
    vehiclePlate: 'UP70 CD 7788',
    vehicleType: 'Maintenance Truck',
  },
  {
    name: 'Squad Charlie',
    callsign: 'CHARLIE-03',
    status: 'ON SITE',
    membersCount: 5,
    leadName: 'Eng. Priya Nair',
    locationName: 'George Town Junction',
    coordinates: { lat: 25.4595, lng: 81.8534 },
    currentTask: 'Drainage clearance & sub-base sealing',
    etaMin: 0,
    equipment: [
      'Geo-Grid Mesh Rolls',
      'Cold Milling Unit',
      'Drainage Suction Pump',
    ],
    batteryPct: 74,
    vehiclePlate: 'UP70 EF 3391',
    vehicleType: 'Repair Van',
  },
  {
    name: 'Squad Delta',
    callsign: 'DELTA-04',
    status: 'MAINTENANCE',
    membersCount: 4,
    leadName: 'Eng. Aman Tiwari',
    locationName: 'Fleet Workshop, Allahpur',
    coordinates: { lat: 25.4680, lng: 81.8296 },
    currentTask: 'Vehicle under scheduled service',
    etaMin: 0,
    equipment: ['Standard Repair Kit'],
    batteryPct: 100,
    vehiclePlate: 'UP70 GH 1102',
    vehicleType: 'Repair Van',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prahari-ai');
    console.log('Connected to MongoDB');

    if ((await FieldTeam.countDocuments()) === 0) {
      await FieldTeam.insertMany(DEMO_TEAMS);
      console.log(`Seeded ${DEMO_TEAMS.length} field teams.`);
    } else {
      console.log('Field teams already exist — skipping seed. Delete the collection first to reseed.');
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
