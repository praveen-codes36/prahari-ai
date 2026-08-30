# SLIDE 1 — IDEA TITLE

**❖ Proposed Solution (Describe your Idea/Solution/Prototype)**
Prahari AI is a unified, autonomous ecosystem connecting citizens, authorities, and emergency services. It leverages AI to instantly analyze citizen-reported road defects, predict infrastructure failures, and compute both the fastest and safest routes for everyday commuters and critical emergency response.

**❖ Detailed explanation of the proposed solution / How it addresses the problem**
```text
Citizen / Commuter
      ↓
Reports Road Issue (Image/Location) via App
      ↓
AI Vision Triage (Severity & Defect Type)
      ↓
Risk & Degradation Forecasting Engine
      ↓
Dynamic Routing Update (Safe/Fast Routes) + Authority Dashboard
      ↓
Rapid Emergency Response & Proactive Maintenance
```

**❖ Innovation and uniqueness of the solution**
- **Tri-layered Intelligence:** Combines Computer Vision (defect intake), Predictive ML (30-day degradation forecasting), and Graph Optimization (routing).
- **Fastest vs. Safest Routing:** Dynamic routing that actively avoids newly detected hazard zones in real-time, unlike standard navigation apps.
- **Closed-Loop Ecosystem:** Citizens report, AI triages without human bottleneck, and authorities act based on computed risk scores.

---

# SLIDE 2 — TECHNICAL APPROACH

**❖ Technologies to be used (e.g. programming languages, frameworks, hardware)**
- **Frontend:** React / TypeScript / Tailwind CSS / React Leaflet
- **Backend:** Node.js / Express.js / RESTful APIs
- **Database:** MongoDB (Geospatial schemas)
- **ML & AI:** Python / FastAPI / CLIP (Vision) / XGBoost (Risk Modeling)
- **Routing & Maps:** OSRM (Open Source Routing Machine) / Nominatim

**❖ Methodology and process for implementation (Flow Charts/Images/ working prototype)**
```text
┌─────────────────┐       ┌─────────────────┐
│ Citizen AI App  │ ────> │  Vision Model   │
└─────────────────┘       │ (Defect Triage) │
                          └────────┬────────┘
                                   ↓
┌─────────────────┐       ┌─────────────────┐
│ OSRM / Map Data │ <──── │ XGBoost Risk &  │
└────────┬────────┘       │ Forecast Engine │
         ↓                └────────┬────────┘
┌─────────────────┐                ↓
│ Safety-Aware    │       ┌─────────────────┐
│ Routing Engine  │       │ Authority & Ops │
└─────────────────┘       │    Dashboard    │
                          └─────────────────┘
```

**❖ Challenges/work involved**
- Modifying OSRM edge weights dynamically in real-time based on new AI hazard reports.
- Ensuring ultra-low latency for ML inference (CLIP model) during live citizen uploads.
- Maintaining state synchronization between the Python ML service and Node.js backend.

---

# SLIDE 3 — FEASIBILITY AND VIABILITY

| ✓ FEASIBILITY | ⚠ CHALLENGES & RISKS | 🛠 STRATEGIES TO OVERCOME |
| :--- | :--- | :--- |
| **Technical:** Modular microservices (Node/Python) allow independent scaling. | **ML Reliability:** Inference accuracy can drop in poor lighting or weather. | **Adaptive Learning:** Human-in-the-loop (HITL) flagging for low-confidence detections. |
| **Real-world:** Currently validated on 18 diverse real-world corridors. | **Latency Constraints:** Emergency routing requires instant data processing. | **Edge Optimization:** Pre-computing risk grids; caching active routing graphs. |
| **Integration:** Seamless REST API flow from mobile frontend to ML backend. | **Spam Reports:** Open reporting can clutter authority queues with noise. | **AI Filtering:** Geospatial clustering & duplicate image detection at intake. |
| **Scalable:** Docker-ready components adaptable to any municipal cloud. | **API Dependency:** High reliance on OSRM & external map providers. | **Offline Redundancy:** Local cache of critical map zones & offline-first reporting. |

---

# SLIDE 4 — IMPACT AND BENEFITS

**❖ Potential impact on the target audience**
- **👥 Citizens:** Safer daily commutes with hazard-aware navigation and easy reporting.
- **🚑 Emergency Services:** Faster, obstacle-free routes to critical incidents.
- **🏛 Authorities:** Automated triage replaces manual inspection, prioritizing urgent repairs.

**❖ Benefits of the solution (social, economic, environmental, etc.)**

**🧑 SOCIAL BENEFITS**
- Maximized public safety and enhanced citizen-government collaboration.
- Equitable distribution of infrastructure maintenance based on data, not bias.

**💰 ECONOMIC BENEFITS**
- Prevents costly emergency infrastructure failures through early intervention.
- Highly efficient public resource and workforce allocation.

**🌱 ENVIRONMENTAL BENEFITS**
- Rapid identification and clearing of roadside waste/garbage hazards.
- Less vehicle idling and lower emissions due to optimized traffic routing.

**⚡ OPERATIONAL BENEFITS**
- Eliminates manual reporting backlogs.
- Transforms reactive municipal maintenance into data-driven proactive planning.
