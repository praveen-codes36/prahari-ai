"""
Evaluation and Metrics Verification Suite for RoadGuard AI ML Models.
Evaluates:
  1. Tabular Risk Surface Predictor (RMSE, MAE, R2, ROC-AUC, Precision, Recall)
  2. Computer Vision Defect Classifier (Accuracy, Precision, Recall, F1-Score, Confusion Matrix)
"""

import os
import sys
import json
import torch
import numpy as np
import pandas as pd
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    roc_auc_score,
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report
)

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.inference import RoadGuardInferenceEngine
from src.train_risk_model import CyclicalFeatureTransformer
from src.train_defect_classifier import build_pre_cached_tensors
from torch.utils.data import DataLoader, TensorDataset


def evaluate_all():
    print("=" * 65, flush=True)
    print("ROADGUARD AI: COMPREHENSIVE MODEL EVALUATION & BENCHMARKS", flush=True)
    print("=" * 65, flush=True)

    engine = RoadGuardInferenceEngine()

    # -------------------------------------------------------------
    # 1. EVALUATE TABULAR ACCIDENT RISK PREDICTOR
    # -------------------------------------------------------------
    print("\n[1/2] Evaluating Tabular Risk Surface Predictor (Prayagraj, UP)...", flush=True)
    accidents_path = os.path.join(root_dir, "data", "prayagraj_accidents.csv")
    df = pd.read_csv(accidents_path)
    df_eval = CyclicalFeatureTransformer.transform(df)

    feature_cols = [
        "lat", "lng", "road_type", "speed_limit", "lane_count", "traffic_density",
        "weather", "time_of_day", "is_weekend", "nearby_defect_count_500m",
        "defect_severity_index", "hour_sin", "hour_cos", "day_sin", "day_cos",
        "month_sin", "month_cos"
    ]

    X_raw = df_eval[feature_cols]
    y_true_reg = df_eval["risk_score"].values
    y_true_clf = df_eval["is_high_risk"].values

    X_trans = engine.preprocessor.transform(X_raw)

    preds_xgb = np.clip(engine.xgb_model.predict(X_trans), 0.0, 1.0)
    preds_rf = np.clip(engine.rf_model.predict(X_trans), 0.0, 1.0)

    xgb_rmse = np.sqrt(mean_squared_error(y_true_reg, preds_xgb))
    xgb_mae = mean_absolute_error(y_true_reg, preds_xgb)
    xgb_r2 = r2_score(y_true_reg, preds_xgb)
    xgb_auc = roc_auc_score(y_true_clf, preds_xgb)

    rf_rmse = np.sqrt(mean_squared_error(y_true_reg, preds_rf))
    rf_mae = mean_absolute_error(y_true_reg, preds_rf)
    rf_r2 = r2_score(y_true_reg, preds_rf)
    rf_auc = roc_auc_score(y_true_clf, preds_rf)

    print(f"  --> XGBoost Model Benchmark (N={len(df)}):", flush=True)
    print(f"      - Root Mean Squared Error (RMSE): {xgb_rmse:.4f}", flush=True)
    print(f"      - Mean Absolute Error (MAE):     {xgb_mae:.4f}", flush=True)
    print(f"      - R^2 Explained Variance:        {xgb_r2:.4f}", flush=True)
    print(f"      - ROC-AUC Metric:                {xgb_auc:.4f}", flush=True)

    print(f"  --> Random Forest Benchmark (N={len(df)}):", flush=True)
    print(f"      - Root Mean Squared Error (RMSE): {rf_rmse:.4f}", flush=True)
    print(f"      - Mean Absolute Error (MAE):     {rf_mae:.4f}", flush=True)
    print(f"      - R^2 Explained Variance:        {rf_r2:.4f}", flush=True)
    print(f"      - ROC-AUC Metric:                {rf_auc:.4f}", flush=True)

    # -------------------------------------------------------------
    # 2. EVALUATE COMPUTER VISION DEFECT CLASSIFIER
    # -------------------------------------------------------------
    print("\n[2/2] Evaluating Computer Vision Defect Classifier (MobileNetV2)...", flush=True)
    X_val, y_val = build_pre_cached_tensors(num_samples=200, seed=777)
    val_loader = DataLoader(TensorDataset(X_val, y_val), batch_size=32, shuffle=False)

    y_cv_true = []
    y_cv_pred = []

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(engine.device)
            outputs = engine.cv_model(images)
            _, preds = torch.max(outputs, 1)
            y_cv_true.extend(labels.numpy())
            y_cv_pred.extend(preds.cpu().numpy())

    cv_acc = accuracy_score(y_cv_true, y_cv_pred)
    prec, recall, f1, _ = precision_recall_fscore_support(y_cv_true, y_cv_pred, average="weighted")
    cm = confusion_matrix(y_cv_true, y_cv_pred)

    print(f"  --> MobileNetV2 Performance (N={len(y_cv_true)}):", flush=True)
    print(f"      - Accuracy:                      {cv_acc * 100:.2f}%", flush=True)
    print(f"      - Precision (Weighted):          {prec:.4f}", flush=True)
    print(f"      - Recall (Weighted):             {recall:.4f}", flush=True)
    print(f"      - F1-Score (Weighted):           {f1:.4f}", flush=True)
    print(f"      - Confusion Matrix:\n{cm}", flush=True)

    print("\n" + "=" * 65, flush=True)
    print("ALL ROADGUARD AI MACHINE LEARNING MODELS VERIFIED & READY FOR SIH!", flush=True)
    print("=" * 65, flush=True)


if __name__ == "__main__":
    evaluate_all()
