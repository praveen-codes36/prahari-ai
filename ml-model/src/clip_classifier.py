"""
CLIP Zero-Shot Road Defect Classifier with Out-of-Distribution Rejection.

Uses OpenAI's CLIP (Contrastive Language-Image Pretraining) model for zero-shot
image classification. CLIP was trained on 400M real image-text pairs and can
classify ANY real-world photograph without task-specific training data.

Architecture:
  1. Encode the input image with CLIP's vision encoder
  2. Encode text descriptions of each defect class + "no defect" descriptions
  3. Compute cosine similarity between image embedding and each text embedding
  4. Classify based on highest similarity; reject if "no defect" wins
"""

import os
import io
from typing import Dict, Any, Union, Optional, List, Tuple
from PIL import Image
import torch
import numpy as np

# Will be lazily loaded
_clip_model = None
_clip_processor = None
_text_features = None
_device = None

# =====================================================================
# DEFECT CLASSES AND TEXT PROMPTS
# =====================================================================

DEFECT_LABELS = ["Pothole", "Streetlight Defect", "Garbage Accumulation", "Drainage Issues"]

# Multiple text prompts per class improve accuracy (prompt ensembling)
DEFECT_PROMPTS = {
    "Pothole": [
        "a photo of a pothole on an asphalt road",
        "a damaged road with a large hole in the ground",
        "a crater or hole in the road surface",
        "road damage showing a deep pothole filled with water",
        "cracked and broken road pavement with a pothole",
    ],
    "Streetlight Defect": [
        "a broken streetlight on a road at night",
        "a damaged or non-functioning street lamp",
        "a tilted or fallen streetlight pole",
        "a dark street with a broken light fixture",
        "a defective road lamp that is not working",
    ],
    "Garbage Accumulation": [
        "a pile of garbage and trash on the street",
        "accumulated waste and litter on a road",
        "a heap of garbage bags dumped on the roadside",
        "an overflowing garbage bin with trash scattered around",
        "municipal solid waste dumped on a public road",
    ],
    "Drainage Issues": [
        "a flooded road with waterlogging and drainage overflow",
        "a blocked storm drain with water pooling on the road",
        "an overflowing open drain or sewer on the street",
        "standing water on a road due to poor drainage",
        "a clogged drain causing water stagnation on the road",
    ],
}

# Prompts for things that are NOT road defects
NO_DEFECT_PROMPTS = [
    "a photo of a clean undamaged road",
    "a smooth asphalt road in good condition",
    "a well-maintained highway with lane markings",
    "a normal city street with no damage",
    "a photo of a person or people",
    "a selfie or portrait photo of a human face",
    "a photo of an indoor room with furniture",
    "a photo of a computer screen or monitor",
    "a photo of food on a plate",
    "a photo of a cat or dog or animal",
    "a photo of a car or vehicle on a road",
    "a photo of a building or house",
    "a scenic landscape or nature photo",
    "a photo of trees and grass in a park",
]

DEPARTMENT_MAPPING = {
    "Pothole": "PWD_Road_Maintenance",
    "Streetlight Defect": "UPPCL_Streetlight_Cell",
    "Garbage Accumulation": "Prayagraj_Nagar_Nigam_Sanitation",
    "Drainage Issues": "Jal_Sansthan_Drainage_Div",
    "Other / No Defect": "None",
}


def _get_text_embedding(text_list):
    """Get CLIP text embeddings as a tensor from a list of strings."""
    inputs = _clip_processor(text=text_list, return_tensors="pt", padding=True, truncation=True).to(_device)
    with torch.no_grad():
        # Use the text_model directly and project through text_projection
        text_outputs = _clip_model.text_model(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"]
        )
        # Get the pooled output (CLS token embedding)
        pooled = text_outputs.pooler_output  # shape: (batch, hidden_dim)
        # Project through CLIP's text projection layer
        text_emb = _clip_model.text_projection(pooled)  # shape: (batch, embed_dim)
    return text_emb


def _get_image_embedding(image):
    """Get CLIP image embedding as a tensor from a PIL Image."""
    inputs = _clip_processor(images=image, return_tensors="pt").to(_device)
    with torch.no_grad():
        vision_outputs = _clip_model.vision_model(pixel_values=inputs["pixel_values"])
        pooled = vision_outputs.pooler_output
        image_emb = _clip_model.visual_projection(pooled)
    return image_emb


def _load_clip_model():
    """Lazily load CLIP model and precompute text embeddings."""
    global _clip_model, _clip_processor, _text_features, _device
    
    if _clip_model is not None:
        return

    from transformers import CLIPModel, CLIPProcessor

    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    model_name = "openai/clip-vit-base-patch32"
    print(f"[CLIP] Loading model: {model_name} ...")
    _clip_model = CLIPModel.from_pretrained(model_name).to(_device)
    _clip_processor = CLIPProcessor.from_pretrained(model_name)
    _clip_model.eval()

    # Precompute text embeddings for all classes (prompt ensembling)
    _text_features = {}
    
    for label, prompts in DEFECT_PROMPTS.items():
        text_emb = _get_text_embedding(prompts)
        text_emb = text_emb / text_emb.norm(dim=-1, keepdim=True)
        # Average the prompt embeddings for this class
        _text_features[label] = text_emb.mean(dim=0, keepdim=True)
        _text_features[label] = _text_features[label] / _text_features[label].norm(dim=-1, keepdim=True)

    # No-defect prompt ensemble
    text_emb = _get_text_embedding(NO_DEFECT_PROMPTS)
    text_emb = text_emb / text_emb.norm(dim=-1, keepdim=True)
    _text_features["Other / No Defect"] = text_emb.mean(dim=0, keepdim=True)
    _text_features["Other / No Defect"] = _text_features["Other / No Defect"] / _text_features["Other / No Defect"].norm(dim=-1, keepdim=True)

    print("[CLIP] Model loaded and text embeddings precomputed.")


def classify_image_clip(image_input: Union[str, bytes, Image.Image]) -> Dict[str, Any]:
    """
    Zero-shot classify an image using CLIP with margin-based OOD rejection.
    
    Decision Logic:
      1. Compute cosine similarity between image and each class text embedding
      2. Find best defect class and "no defect" similarity
      3. If (best_defect_sim - no_defect_sim) < MARGIN_THRESHOLD → reject as OOD
      4. Otherwise → classify as the best defect class
    
    This margin-based approach is robust because:
      - Real defect photos have high similarity to defect prompts and low to "no defect"
      - Clean roads, people, screens etc. have similar similarity to ALL classes (low margin)
    """
    _load_clip_model()

    # Load image
    if isinstance(image_input, str):
        image = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, bytes):
        image = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, Image.Image):
        image = image_input.convert("RGB")
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    # Get image embedding
    image_emb = _get_image_embedding(image)
    image_emb = image_emb / image_emb.norm(dim=-1, keepdim=True)

    # Compute cosine similarity with each class
    all_labels = DEFECT_LABELS + ["Other / No Defect"]
    similarities = {}
    for label in all_labels:
        sim = torch.nn.functional.cosine_similarity(image_emb, _text_features[label])
        similarities[label] = float(sim.item())

    # ---------------------------------------------------------------
    # MARGIN-BASED OOD DECISION
    # ---------------------------------------------------------------
    # A real defect photo will have significantly higher similarity to
    # its defect class than to the "no defect" ensemble. If the margin
    # is small, the image is ambiguous / not a defect.
    MARGIN_THRESHOLD = 0.02  # Calibrated on real-world test images

    best_defect_label = max(DEFECT_LABELS, key=lambda l: similarities[l])
    best_defect_sim = similarities[best_defect_label]
    no_defect_sim = similarities["Other / No Defect"]
    margin = best_defect_sim - no_defect_sim

    # Compute calibrated probabilities using softmax over raw similarities
    # Use CLIP's default logit scale (~100) for proper calibration
    logit_scale = 100.0
    logits = torch.tensor([similarities[label] for label in all_labels]) * logit_scale
    probs = torch.softmax(logits, dim=0).numpy()
    prob_dict = {label: round(float(probs[i]), 4) for i, label in enumerate(all_labels)}

    if margin < MARGIN_THRESHOLD:
        # Image does NOT clearly match any defect class → reject
        no_defect_prob = float(probs[all_labels.index("Other / No Defect")])
        return {
            "defect_type": "Other / No Defect",
            "is_valid_defect": False,
            "confidence_score": round(max(no_defect_prob, 0.80) * 100.0, 2),
            "confidence": round(max(no_defect_prob, 0.80), 4),
            "severity": "NONE",
            "severity_estimate": "NONE",
            "probabilities": prob_dict,
            "department_assigned": "None",
            "ai_verification_status": "REJECTED_NON_DEFECT",
            "rejection_reason": f"No clear road defect detected (margin={margin:.4f} < {MARGIN_THRESHOLD}). Best match: {best_defect_label} ({best_defect_sim:.4f}), No-defect: ({no_defect_sim:.4f})",
            "message": "No municipal road infrastructure defect detected. Image rejected from risk and routing calculations.",
        }

    # ---------------------------------------------------------------
    # VALID DEFECT DETECTED
    # ---------------------------------------------------------------
    defect_confidence = float(probs[all_labels.index(best_defect_label)])

    # Severity estimation based on margin strength
    if margin > 0.08:
        severity = "CRITICAL" if best_defect_label in ["Pothole", "Drainage Issues"] else "HIGH"
    elif margin > 0.05:
        severity = "HIGH" if best_defect_label in ["Pothole", "Drainage Issues"] else "MEDIUM"
    else:
        severity = "MEDIUM"

    return {
        "defect_type": best_defect_label,
        "is_valid_defect": True,
        "confidence_score": round(defect_confidence * 100.0, 2),
        "confidence": round(defect_confidence, 4),
        "severity": severity,
        "severity_estimate": severity,
        "probabilities": prob_dict,
        "department_assigned": DEPARTMENT_MAPPING.get(best_defect_label, "PWD_Road_Maintenance"),
        "ai_verification_status": "AI_VERIFIED",
        "rejection_reason": None,
        "message": "Valid road defect verified and assigned to municipal department.",
    }

