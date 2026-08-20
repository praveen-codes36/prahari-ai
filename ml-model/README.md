# ml-model/

Accident risk prediction model + infrastructure defect classifier (CNN).

## What goes here

- `data/` — raw and cleaned datasets (MoRTH accident data, defect images)
  — keep large files out of Git; `.gitignore` already excludes `data/*.csv`
- `notebooks/` — exploration/training notebooks
- `train_risk_model.py` — Random Forest/XGBoost training script
- `train_defect_classifier.py` — CNN transfer-learning training script
- `checkpoints/` — saved model files (`.pkl`, `.pt`) — excluded from Git,
  share via Drive link in this README once trained
- `predict.py` — clean wrapper functions for the backend to import:
  - `predict_risk(features) -> risk_score`
  - `classify_defect(image) -> defect_type`

## Setup

```bash
pip install pandas numpy scikit-learn xgboost torch torchvision joblib
```

## Data sources

- data.gov.in — MoRTH road accident datasets
- Kaggle — "India road accident dataset", "pothole detection dataset",
  RDD2022 (road damage dataset)
- OpenWeatherMap API — weather features

## Trained model links (update once trained)

- Risk model: _(add Drive/HuggingFace link here)_
- Defect classifier: _(add Drive/HuggingFace link here)_
