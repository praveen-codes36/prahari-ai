import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MaintenancePrediction } from './src/models/maintenance_prediction.model.js';
import { RoadHealthScore } from './src/models/road_health.model.js';
import { RoadSegment } from './src/models/road_segment.model.js';

dotenv.config({ path: './.env' });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prahari-ai');
    console.log('Connected to MongoDB');

    // Ensure we have some road segments
    let segment = await RoadSegment.findOne();
    if (!segment) {
      segment = await RoadSegment.create({
        road_name: 'MG Road, Prayagraj',
        start_coordinates: { type: 'Point', coordinates: [81.8463, 25.4358] },
        end_coordinates: { type: 'Point', coordinates: [81.8500, 25.4400] },
        road_type: 'Arterial'
      });
      console.log('Created dummy road segment');
    }

    // Seed RoadHealthScore
    if (await RoadHealthScore.countDocuments() === 0) {
      await RoadHealthScore.create({
        road_segment_id: segment._id,
        road_name: segment.road_name,
        coordinates: [81.8463, 25.4358],
        health_score: 35, // High risk
        factors: {
          accident_history: 5,
          potholes: 12,
          traffic: 'HIGH',
          lighting: 'POOR',
          drainage: 'POOR',
          complaints: 8,
          road_condition: 'POOR'
        }
      });
      console.log('Seeded RoadHealthScore');
    }

    // Seed MaintenancePrediction
    if (await MaintenancePrediction.countDocuments() === 0) {
      await MaintenancePrediction.create({
        road_segment_id: segment._id,
        current_risk_score: 65,
        predicted_risk_score_30d: 85,
        estimated_preventive_cost: 150000,
        estimated_catastrophic_cost: 2500000,
        recommended_intervention_days: 15,
        reasoning: ['High complaint velocity indicates rapid structural decay.', 'Monsoon season approaching increases washout risk.']
      });
      console.log('Seeded MaintenancePrediction');
    }
    
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
