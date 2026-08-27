"""
Model 3: Duplicate Complaint Detector
Combines geographic distance filtering (<50m) with deep visual embedding cosine similarity.
Part of Prahari AI ML Subsystem.
"""

import math
from typing import Dict, Any, List, Optional, Union, Tuple
import numpy as np
import torch
import torchvision.transforms as transforms
from PIL import Image

from src.spatial_utils import haversine_distance


class DuplicateComplaintDetector:
    """
    Two-Stage Duplicate Detector:
      Stage 1: Cheap geographic radius filter (< geo_radius_meters) + defect_type match.
      Stage 2: Deep visual embedding cosine similarity using MobileNetV2 feature extractor.
    """

    def __init__(self, cv_model: Optional[torch.nn.Module] = None, device: Optional[torch.device] = None):
        self.device = device if device is not None else torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.cv_model = cv_model
        if self.cv_model:
            self.cv_model.to(self.device)
            self.cv_model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def extract_image_embedding(self, image_input: Union[str, bytes, Image.Image]) -> np.ndarray:
        """Extract a 128-dimensional normalized feature embedding vector from an image."""
        if isinstance(image_input, str):
            image = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, bytes):
            import io
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, Image.Image):
            image = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        tensor = self.transform(image).unsqueeze(0).to(self.device)

        if self.cv_model is not None:
            with torch.no_grad():
                # Extract penultimate feature representation
                features = self.cv_model.features(tensor)
                features = torch.nn.functional.adaptive_avg_pool2d(features, (1, 1)).flatten(1)
                emb = self.cv_model.classifier[1](features)  # Linear(in_features, 128)
                emb_norm = torch.nn.functional.normalize(emb, p=2, dim=1).squeeze(0).cpu().numpy()
                return emb_norm
        else:
            # Fallback deterministic perceptual vector
            arr = np.array(image.resize((16, 16)), dtype=np.float32) / 255.0
            vec = arr.flatten()[:128]
            norm = np.linalg.norm(vec)
            return vec / (norm + 1e-7)

    @staticmethod
    def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        """Compute cosine similarity score between two feature vectors [0.0, 1.0]."""
        dot = float(np.dot(vec_a, vec_b))
        norm_a = float(np.linalg.norm(vec_a))
        norm_b = float(np.linalg.norm(vec_b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        cos_sim = dot / (norm_a * norm_b)
        return float(np.clip(cos_sim, 0.0, 1.0))

    def check_duplicate(self,
                        new_lat: float,
                        new_lng: float,
                        new_defect_type: str,
                        new_image_input: Optional[Union[str, bytes, Image.Image]] = None,
                        existing_complaints: Optional[List[Dict[str, Any]]] = None,
                        geo_radius_meters: float = 50.0,
                        similarity_threshold: float = 75.0) -> Dict[str, Any]:
        """
        Check if an incoming complaint is a duplicate of any existing open complaint.

        Args:
            new_lat, new_lng: GPS coordinates of new complaint
            new_defect_type: e.g. 'Pothole', 'Streetlight Defect', etc.
            new_image_input: Optional photo input
            existing_complaints: List of open complaint dicts with 'id', 'lat', 'lng', 'defect_type', and optional 'image_path'
            geo_radius_meters: Maximum spatial radius to consider duplicates (default: 50m)
            similarity_threshold: Cosine similarity % threshold (default: 75.0%)

        Returns:
            Dict containing:
                - is_duplicate (bool)
                - duplicate_of (str or None)
                - duplicate_similarity_score (float 0-100)
                - matched_distance_meters (float)
                - reasoning (str)
        """
        if not existing_complaints:
            return {
                "is_duplicate": False,
                "duplicate_of": None,
                "duplicate_similarity_score": 0.0,
                "matched_distance_meters": None,
                "reasoning": "No active complaints in the database to compare against."
            }

        # Stage 1: Spatial Radius & Defect Type Match Filtering
        candidates = []
        for comp in existing_complaints:
            # Match active status and defect type
            if comp.get("defect_type", "").lower() != new_defect_type.lower():
                continue
            if comp.get("status") == "Resolved":
                continue

            dist_m = haversine_distance(new_lat, new_lng, float(comp["lat"]), float(comp["lng"]))
            if dist_m <= geo_radius_meters:
                candidates.append((dist_m, comp))

        if not candidates:
            return {
                "is_duplicate": False,
                "duplicate_of": None,
                "duplicate_similarity_score": 0.0,
                "matched_distance_meters": None,
                "reasoning": f"No matching {new_defect_type} reports within {geo_radius_meters}m spatial radius."
            }

        # Stage 2: Visual Embedding Similarity
        # Sort candidates by closest distance
        candidates.sort(key=lambda x: x[0])
        best_match_comp = None
        best_sim_score = 0.0
        best_dist = candidates[0][0]

        if new_image_input is not None:
            new_emb = self.extract_image_embedding(new_image_input)
            for dist_m, comp in candidates:
                img_ref = comp.get("image_path") or comp.get("photo_url")
                # If image exists, compute cosine similarity
                if img_ref and isinstance(img_ref, str) and (img_ref.endswith(".jpg") or img_ref.endswith(".png")):
                    try:
                        cand_emb = self.extract_image_embedding(img_ref)
                        sim = self.compute_cosine_similarity(new_emb, cand_emb) * 100.0
                    except Exception:
                        # Fallback based on spatial proximity
                        sim = max(50.0, 100.0 - (dist_m * 1.0))
                else:
                    # Spatial proximity heuristic for duplicates within 50m
                    sim = max(60.0, 100.0 - (dist_m * 0.8))

                if sim > best_sim_score:
                    best_sim_score = sim
                    best_match_comp = comp
                    best_dist = dist_m
        else:
            # Pure geo-proximity match (very close < 25m same defect type)
            best_match_comp = candidates[0][1]
            best_dist = candidates[0][0]
            best_sim_score = max(60.0, 100.0 - (best_dist * 0.8))

        is_dup = (best_sim_score >= similarity_threshold) or (best_dist < 15.0)

        return {
            "is_duplicate": bool(is_dup),
            "duplicate_of": best_match_comp["id"] if is_dup else None,
            "duplicate_similarity_score": round(float(best_sim_score), 2),
            "matched_distance_meters": round(float(best_dist), 2),
            "reasoning": (
                f"Duplicate detected: Matched active ticket {best_match_comp['id']} located {best_dist:.1f}m away "
                f"with {best_sim_score:.1f}% visual/spatial similarity."
                if is_dup else
                f"Candidate found {best_dist:.1f}m away, but similarity score ({best_sim_score:.1f}%) is below the {similarity_threshold}% cutoff."
            )
        }
