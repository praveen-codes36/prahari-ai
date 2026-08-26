import { Router } from "express";
import { getRiskHotspots } from "../controllers/risk.controller.js";
import { 
    getDefectsLayer, 
    getTrafficLayer, 
    getAmbulancesLayer, 
    getHospitalsLayer, 
    getBlockagesLayer, 
    getLayersConfig 
} from "../controllers/map.controller.js";

const router = Router();

// Route: /api/map/hotspots (from Feature 2.3)
router.route("/hotspots").get(getRiskHotspots);

// Routes for toggleable map layers (Feature 4)
router.route("/defects").get(getDefectsLayer);
router.route("/traffic").get(getTrafficLayer);
router.route("/ambulances").get(getAmbulancesLayer);
router.route("/hospitals").get(getHospitalsLayer);
router.route("/blockages").get(getBlockagesLayer);
router.route("/layers").get(getLayersConfig);

export default router;
