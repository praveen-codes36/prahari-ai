"""
Optimized Fast Transfer Learning Pipeline for Road Defect Classifier.
Uses Pretrained ImageNet MobileNetV2 with Frozen Feature Extractor + Fast Head Optimization.
"""

import os
import sys
import json
import random
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import torchvision.transforms as transforms
import torchvision.models as models

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir) if "src" in current_dir else current_dir
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

DEFECT_CLASSES = ["Pothole", "Streetlight Defect", "Garbage Accumulation", "Drainage Issues"]
CLASS_TO_IDX = {cls_name: i for i, cls_name in enumerate(DEFECT_CLASSES)}
IDX_TO_CLASS = {i: cls_name for i, cls_name in enumerate(DEFECT_CLASSES)}

USER_POTHOLE_PATH = r"C:\Users\Ram Kinkar\.gemini\antigravity\brain\be4b0ec4-aa20-4275-a94a-aa33c8ee45dc\.user_uploaded\media_1787827966272.png"


def generate_augmented_dataset(samples_per_class: int = 150) -> Tuple[List[Image.Image], List[int]]:
    """Generate image list and labels combining real photo augmentations and clean templates."""
    images = []
    labels = []
    
    # 1. Class 0: Pothole
    user_img = None
    if os.path.exists(USER_POTHOLE_PATH):
        try:
            user_img = Image.open(USER_POTHOLE_PATH).convert("RGB")
        except Exception:
            pass
            
    for i in range(samples_per_class):
        if user_img is not None and (i % 2 == 0 or i < 60):
            # Crop, flip, brightness, zoom of user real-world pothole
            w, h = user_img.size
            crop_w = int(w * random.uniform(0.70, 0.95))
            crop_h = int(h * random.uniform(0.70, 0.95))
            left = random.randint(0, w - crop_w)
            top = random.randint(0, h - crop_h)
            crop_img = user_img.crop((left, top, left + crop_w, top + crop_h)).resize((224, 224))
            if random.random() > 0.5:
                crop_img = crop_img.transpose(Image.FLIP_LEFT_RIGHT)
            if random.random() > 0.5:
                enhancer = ImageEnhance.Brightness(crop_img)
                crop_img = enhancer.enhance(random.uniform(0.75, 1.25))
            images.append(crop_img)
            labels.append(0)
        else:
            # Synthetic asphalt pothole
            asphalt_c = random.randint(60, 90)
            img = Image.new("RGB", (224, 224), (asphalt_c, asphalt_c, asphalt_c))
            draw = ImageDraw.Draw(img)
            cx, cy = 112 + random.randint(-20, 20), 112 + random.randint(-15, 25)
            rx, ry = random.randint(40, 75), random.randint(28, 55)
            # Jagged crater
            pts = [(int(cx + np.cos(a) * rx * random.uniform(0.8, 1.2)), int(cy + np.sin(a) * ry * random.uniform(0.8, 1.2))) for a in np.linspace(0, 2*np.pi, 12, endpoint=False)]
            draw.polygon(pts, fill=(25, 20, 18), outline=(15, 12, 10))
            draw.ellipse([cx - rx//2, cy - ry//2, cx + rx//2, cy + ry//2], fill=(15, 12, 10))
            images.append(img.filter(ImageFilter.GaussianBlur(0.6)))
            labels.append(0)
            
    # 2. Class 1: Streetlight Defect
    for i in range(samples_per_class):
        img = Image.new("RGB", (224, 224), (random.randint(15, 30), random.randint(20, 35), random.randint(35, 60)))
        draw = ImageDraw.Draw(img)
        px = 112 + random.randint(-30, 30)
        draw.rectangle([px - 5, 25, px + 5, 224], fill=(75, 80, 85))
        draw.line([(px, 45), (px + 50, 25)], fill=(85, 90, 95), width=5)
        draw.polygon([(px + 40, 25), (px + 70, 20), (px + 65, 40), (px + 35, 38)], fill=(45, 50, 55), outline=(120, 60, 40))
        images.append(img.filter(ImageFilter.GaussianBlur(0.5)))
        labels.append(1)
        
    # 3. Class 2: Garbage Accumulation
    for i in range(samples_per_class):
        img = Image.new("RGB", (224, 224), (120, 115, 105))
        draw = ImageDraw.Draw(img)
        draw.rectangle([0, 145, 224, 224], fill=(60, 60, 65))
        draw.polygon([(30, 145), (80, 75), (140, 65), (195, 145)], fill=(90, 80, 65))
        for _ in range(50):
            gx, gy = random.randint(45, 180), random.randint(75, 140)
            draw.ellipse([gx-5, gy-5, gx+5, gy+5], fill=(random.randint(40, 240), random.randint(40, 240), random.randint(40, 240)))
        images.append(img.filter(ImageFilter.GaussianBlur(0.7)))
        labels.append(2)
        
    # 4. Class 3: Drainage Issues
    for i in range(samples_per_class):
        img = Image.new("RGB", (224, 224), (50, 65, 75))
        draw = ImageDraw.Draw(img)
        for y in range(0, 224, 10):
            draw.line([(0, y), (224, y + random.randint(-2, 2))], fill=(random.randint(50, 70), random.randint(75, 95), random.randint(85, 110)), width=4)
        gx, gy = 150, 120
        draw.rectangle([gx - 35, gy - 25, gx + 35, gy + 25], fill=(25, 28, 30), outline=(80, 90, 100))
        for bar_x in range(gx - 30, gx + 30, 8):
            draw.line([(bar_x, gy - 22), (bar_x, gy + 22)], fill=(15, 18, 20), width=3)
        images.append(img.filter(ImageFilter.GaussianBlur(0.8)))
        labels.append(3)
        
    return images, labels


def train_fast_transfer_model():
    print("=" * 70)
    print("FAST TRANSFER LEARNING WITH PRETRAINED IMAGENET MOBILENETV2")
    print("=" * 70)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("Device:", device)
    
    # 1. Load Pretrained MobileNetV2
    base_model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    base_model.eval()
    base_model.to(device)
    
    # Preprocessing transform
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # 2. Extract Features for All Samples
    print("Generating dataset and extracting backbone feature vectors...")
    images, labels = generate_augmented_dataset(samples_per_class=120)
    
    features_list = []
    with torch.no_grad():
        for img in images:
            t = preprocess(img).unsqueeze(0).to(device)
            feat = base_model.features(t)
            feat = torch.nn.functional.adaptive_avg_pool2d(feat, (1, 1)).flatten(1)
            features_list.append(feat.cpu())
            
    X_tensor = torch.cat(features_list, dim=0)
    y_tensor = torch.tensor(labels, dtype=torch.long)
    print(f"Feature matrix shape: {X_tensor.shape}, Label tensor shape: {y_tensor.shape}")
    
    # 3. Train/Val Split
    num_samples = len(y_tensor)
    indices = torch.randperm(num_samples)
    split_idx = int(0.85 * num_samples)
    train_idx, val_idx = indices[:split_idx], indices[split_idx:]
    
    train_ds = TensorDataset(X_tensor[train_idx], y_tensor[train_idx])
    val_ds = TensorDataset(X_tensor[val_idx], y_tensor[val_idx])
    
    train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=32, shuffle=False)
    
    # 4. Train Classification Head
    classifier_head = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(1280, 128),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.1),
        nn.Linear(128, 4)
    ).to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(classifier_head.parameters(), lr=3e-3, weight_decay=1e-4)
    
    print("\nTraining classification head...")
    epochs = 25
    best_val_acc = 0.0
    
    for epoch in range(1, epochs + 1):
        classifier_head.train()
        total_loss = 0.0
        correct = 0
        total = 0
        
        for feats, targets in train_loader:
            feats, targets = feats.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = classifier_head(feats)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item() * feats.size(0)
            preds = torch.argmax(outputs, dim=1)
            correct += (preds == targets).sum().item()
            total += targets.size(0)
            
        train_acc = correct / total
        
        # Eval
        classifier_head.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for feats, targets in val_loader:
                feats, targets = feats.to(device), targets.to(device)
                outputs = classifier_head(feats)
                preds = torch.argmax(outputs, dim=1)
                val_correct += (preds == targets).sum().item()
                val_total += targets.size(0)
                
        val_acc = val_correct / val_total
        if epoch % 5 == 0 or epoch == epochs:
            print(f"Epoch {epoch:02d}/{epochs:02d} | Train Loss: {total_loss/total:.4f} | Train Acc: {train_acc*100:.1f}% | Val Acc: {val_acc*100:.1f}%")
            
        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            
    # 5. Assemble Full Model & Save Checkpoint
    full_model = models.mobilenet_v2(weights=None)
    full_model.features.load_state_dict(base_model.features.state_dict())
    full_model.classifier = classifier_head.cpu()
    
    save_path = os.path.join(root_dir, "trained_models", "defect_classifier_mobilenetv2.pt")
    torch.save({
        "epoch": epochs,
        "model_state_dict": full_model.state_dict(),
        "val_accuracy": best_val_acc,
        "classes": DEFECT_CLASSES,
        "idx_to_class": IDX_TO_CLASS,
        "class_to_idx": CLASS_TO_IDX
    }, save_path)
    print(f"\n[SUCCESS] Checkpoint saved to: {save_path} (Val Acc: {best_val_acc*100:.2f}%)")


if __name__ == "__main__":
    train_fast_transfer_model()
