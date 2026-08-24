"""
Training Pipeline for Accident Risk Surface Predictor (Tabular ML).
Models: XGBoost & Random Forest with Live Defect Feedback Link integration.
Dataset: Prayagraj, Uttar Pradesh (UP).
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    roc_auc_score,
    accuracy_score,
    classification_report,
)
import xgboost as xgb

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.spatial_utils import PRAYAGRAJ_BOUNDS


class CyclicalFeatureTransformer:
    """Transforms cyclic temporal features into sine/cosine pairs."""
    @staticmethod
    def transform(df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24.0)
        df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24.0)
        df["day_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7.0)
        df["day_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7.0)
        df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12.0)
        df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12.0)
        return df


def build_preprocessor() -> ColumnTransformer:
    """Builds scikit-learn column transformer for numeric and categorical features."""
    categorical_cols = ["road_type", "weather", "time_of_day", "traffic_density"]
    numeric_cols = [
        "lat",
        "lng",
        "speed_limit",
        "lane_count",
        "is_weekend",
        "nearby_defect_count_500m",
        "defect_severity_index",
        "hour_sin",
        "hour_cos",
        "day_sin",
        "day_cos",
        "month_sin",
        "month_cos",
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
        ]
    )
    return preprocessor


def train_risk_models(data_path: str = "data/prayagraj_accidents.csv",
                      models_dir: str = "trained_models") -> Dict[str, Any]:
    """Train XGBoost and Random Forest risk models with evaluation metrics."""
    data_full = os.path.join(root_dir, data_path)
    models_full = os.path.join(root_dir, models_dir)
    os.makedirs(models_full, exist_ok=True)

    print(f"Loading Prayagraj accident dataset from {data_full}...")
    df = pd.read_csv(data_full)
    df = CyclicalFeatureTransformer.transform(df)

    feature_cols = [
        "lat", "lng", "road_type", "speed_limit", "lane_count", "traffic_density",
        "weather", "time_of_day", "is_weekend", "nearby_defect_count_500m",
        "defect_severity_index", "hour_sin", "hour_cos", "day_sin", "day_cos",
        "month_sin", "month_cos"
    ]

    X = df[feature_cols]
    y_reg = df["risk_score"].values
    y_clf = df["is_high_risk"].values

    # Stratified/Spatial split
    X_train, X_test, y_reg_train, y_reg_test, y_clf_train, y_clf_test = train_test_split(
        X, y_reg, y_clf, test_size=0.20, random_state=42, stratify=y_clf
    )

    print(f"Dataset Split: {len(X_train)} training records, {len(X_test)} test records.")

    # 1. Fit Preprocessor
    preprocessor = build_preprocessor()
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    # 2. Train XGBoost Risk Regressor
    print("Training XGBoost Risk Regressor (Primary Production Model)...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=250,
        learning_rate=0.04,
        max_depth=6,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        objective="reg:squarederror",
        n_jobs=-1,
    )
    xgb_model.fit(X_train_trans, y_reg_train)

    # Evaluate XGBoost
    y_reg_pred_xgb = np.clip(xgb_model.predict(X_test_trans), 0.0, 1.0)
    xgb_rmse = float(np.sqrt(mean_squared_error(y_reg_test, y_reg_pred_xgb)))
    xgb_mae = float(mean_absolute_error(y_reg_test, y_reg_pred_xgb))
    xgb_r2 = float(r2_score(y_reg_test, y_reg_pred_xgb))
    xgb_auc = float(roc_auc_score(y_clf_test, y_reg_pred_xgb))

    print(f"  [XGBoost] Test RMSE: {xgb_rmse:.4f}, MAE: {xgb_mae:.4f}, R2: {xgb_r2:.4f}, ROC-AUC: {xgb_auc:.4f}")

    # 3. Train Random Forest Baseline
    print("Training Random Forest Regressor (Ensemble Benchmark)...")
    rf_model = RandomForestRegressor(
        n_estimators=180,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1,
    )
    rf_model.fit(X_train_trans, y_reg_train)

    y_reg_pred_rf = np.clip(rf_model.predict(X_test_trans), 0.0, 1.0)
    rf_rmse = float(np.sqrt(mean_squared_error(y_reg_test, y_reg_pred_rf)))
    rf_mae = float(mean_absolute_error(y_reg_test, y_reg_pred_rf))
    rf_r2 = float(r2_score(y_reg_test, y_reg_pred_rf))
    rf_auc = float(roc_auc_score(y_clf_test, y_reg_pred_rf))

    print(f"  [Random Forest] Test RMSE: {rf_rmse:.4f}, MAE: {rf_mae:.4f}, R2: {rf_r2:.4f}, ROC-AUC: {rf_auc:.4f}")

    # 4. Save artifacts
    xgb_path = os.path.join(models_full, "risk_predictor_xgboost.joblib")
    rf_path = os.path.join(models_full, "risk_predictor_rf.joblib")
    preproc_path = os.path.join(models_full, "risk_preprocessor.joblib")
    metadata_path = os.path.join(models_full, "model_metadata.json")

    joblib.dump(xgb_model, xgb_path)
    joblib.dump(rf_model, rf_path)
    joblib.dump(preprocessor, preproc_path)

    # Feature Importance
    cat_feature_names = list(preprocessor.named_transformers_["cat"].get_feature_names_out())
    all_feature_names = [
        "lat", "lng", "speed_limit", "lane_count", "is_weekend", "nearby_defect_count_500m",
        "defect_severity_index", "hour_sin", "hour_cos", "day_sin", "day_cos", "month_sin", "month_cos"
    ] + cat_feature_names

    importance_dict = dict(zip(all_feature_names, [float(v) for v in xgb_model.feature_importances_]))
    top_importances = dict(sorted(importance_dict.items(), key=lambda item: item[1], reverse=True)[:10])

    metadata = {
        "project": "RoadGuard AI",
        "target_city": "Prayagraj, Uttar Pradesh, India",
        "geographic_bounds": PRAYAGRAJ_BOUNDS,
        "models": {
            "xgboost_risk_predictor": {
                "file": "risk_predictor_xgboost.joblib",
                "metrics": {
                    "test_rmse": round(xgb_rmse, 4),
                    "test_mae": round(xgb_mae, 4),
                    "test_r2": round(xgb_r2, 4),
                    "roc_auc": round(xgb_auc, 4),
                },
                "parameters": xgb_model.get_params(),
            },
            "random_forest_risk_predictor": {
                "file": "risk_predictor_rf.joblib",
                "metrics": {
                    "test_rmse": round(rf_rmse, 4),
                    "test_mae": round(rf_mae, 4),
                    "test_r2": round(rf_r2, 4),
                    "roc_auc": round(rf_auc, 4),
                },
            }
        },
        "top_feature_importances": top_importances,
        "classes_risk_level": {
            "Low": [0.0, 0.30],
            "Medium": [0.30, 0.55],
            "High": [0.55, 0.75],
            "Critical": [0.75, 1.00]
        },
        "defect_categories": ["Pothole", "Streetlight Defect", "Garbage Accumulation", "Drainage Issues"]
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nAll models, preprocessor and metadata saved to {models_full}")
    return metadata


if __name__ == "__main__":
    train_risk_models()
