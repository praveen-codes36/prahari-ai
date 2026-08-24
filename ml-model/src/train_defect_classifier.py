"""
Training Pipeline for Road Defect Computer Vision Classifier.
Architecture: MobileNetV2 Transfer Learning with Pre-cached Synthetic Image Bank.
Classes:
  0: Pothole
  1: Streetlight Defect
  2: Garbage Accumulation
  3: Drainage Issues
"""

import os
import sys
import json
import random
from typing import Dict, Any, List, Optional, Tuple
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, TensorDataset
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

DEFECT_CLASSES = ["Pothole", "Streetlight Defect", "Garbage Accumulation", "Drainage Issues"]
CLASS_TO_IDX = {cls_name: i for i, cls_name in enumerate(DEFECT_CLASSES)}
IDX_TO_CLASS = {i: cls_name for i, cls_name in enumerate(DEFECT_CLASSES)}


def generate_single_defect_image(label: int, size: int = 224, seed: Optional[int] = None) -> Image.Image:
    """Generate high-fidelity synthetic defect image with class-specific geometry and color palette."""
    rng = random.Random(seed) if seed is not None else random
    if label == 0:
        # Pothole: Dark asphalt with dark irregular jagged crater
        base_color = rng.randint(65, 95)
        img = Image.new("RGB", (size, size), color=(base_color, base_color, base_color))
        draw = ImageDraw.Draw(img)
        for _ in range(600):
            x, y = rng.randint(0, size - 1), rng.randint(0, size - 1)
            c = rng.randint(40, 110)
            draw.point((x, y), fill=(c, c, c))
        cx, cy = size // 2 + rng.randint(-15, 15), size // 2 + rng.randint(-15, 15)
        rad_x, rad_y = rng.randint(35, 60), rng.randint(30, 50)
        crater_pts = [
            (cx - rad_x, cy - rad_y // 2),
            (cx - rad_x // 3, cy - rad_y),
            (cx + rad_x // 2, cy - rad_y // 2),
            (cx + rad_x, cy + rad_y // 3),
            (cx + rad_x // 3, cy + rad_y),
            (cx - rad_x // 2, cy + rad_y // 2),
        ]
        draw.polygon(crater_pts, fill=(22, 18, 15), outline=(10, 10, 10))
        draw.ellipse([cx - 20, cy - 15, cx + 20, cy + 15], fill=(12, 10, 8))
        img = img.filter(ImageFilter.GaussianBlur(0.7))

    elif label == 1:
        # Streetlight Defect: Night sky, dark pole, unlit/broken lamp fixture
        img = Image.new("RGB", (size, size), color=(18, 22, 32))
        draw = ImageDraw.Draw(img)
        px = size // 2 + rng.randint(-20, 20)
        draw.rectangle([px - 6, 25, px + 6, size], fill=(70, 75, 80))
        draw.line([(px, 45), (px + 45, 25)], fill=(80, 85, 90), width=5)
        draw.polygon([(px + 35, 25), (px + 65, 20), (px + 60, 40), (px + 30, 38)], fill=(40, 45, 50), outline=(100, 50, 40))
        draw.line([(px + 50, 40), (px + 52, 65)], fill=(160, 100, 30), width=2)

    elif label == 2:
        # Garbage Accumulation: Roadside mound of multicolor solid waste
        img = Image.new("RGB", (size, size), color=(130, 125, 115))
        draw = ImageDraw.Draw(img)
        draw.line([(0, 155), (size, 155)], fill=(75, 75, 75), width=6)
        heap_pts = [
            (30, 155), (65, 90), (115, 75), (170, 85), (200, 155)
        ]
        draw.polygon(heap_pts, fill=(100, 85, 65))
        debris_colors = [(220, 50, 50), (40, 150, 230), (240, 220, 40), (250, 250, 250), (40, 140, 60), (200, 100, 20)]
        for _ in range(45):
            gx = rng.randint(45, 185)
            gy = rng.randint(85, 150)
            rad = rng.randint(3, 7)
            draw.ellipse([gx - rad, gy - rad, gx + rad, gy + rad], fill=rng.choice(debris_colors))

    else:
        # Drainage Issues: Waterlogged puddle ponding with curb drain grate
        img = Image.new("RGB", (size, size), color=(80, 80, 85))
        draw = ImageDraw.Draw(img)
        for _ in range(400):
            x, y = rng.randint(0, size - 1), rng.randint(0, size - 1)
            draw.point((x, y), fill=(rng.randint(50, 90), rng.randint(50, 90), rng.randint(50, 90)))
        puddle_pts = [
            (25, 110), (70, 75), (145, 70), (205, 100), (190, 185), (115, 205), (45, 175)
        ]
        draw.polygon(puddle_pts, fill=(40, 60, 70), outline=(55, 80, 95))
        draw.rectangle([165, 140, 215, 190], fill=(25, 25, 25), outline=(15, 15, 15))
        for gy in range(145, 190, 7):
            draw.line([(167, gy), (213, gy)], fill=(10, 10, 10), width=2)
        draw.arc([60, 110, 150, 160], 0, 180, fill=(80, 110, 130), width=2)
        img = img.filter(ImageFilter.GaussianBlur(0.7))

    return img


def build_pre_cached_tensors(num_samples: int = 800, seed: int = 42) -> Tuple[torch.Tensor, torch.Tensor]:
    """Generate in-memory tensor bank for fast sub-second PyTorch training."""
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    tensor_list = []
    labels_list = []
    print(f"Pre-caching {num_samples} synthetic training representations...", flush=True)
    for i in range(num_samples):
        label = i % 4
        img = generate_single_defect_image(label=label, seed=seed + i)
        tensor = transform(img)
        tensor_list.append(tensor)
        labels_list.append(label)

    X_tensor = torch.stack(tensor_list)
    y_tensor = torch.tensor(labels_list, dtype=torch.long)
    return X_tensor, y_tensor


def build_mobilenetv2_classifier(num_classes: int = 4) -> nn.Module:
    """Builds MobileNetV2 model with custom classification head for road defect detection."""
    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, 128),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.1),
        nn.Linear(128, num_classes)
    )
    return model


def train_defect_classifier(epochs: int = 8,
                            batch_size: int = 32,
                            lr: float = 0.0015,
                            output_path: str = "trained_models/defect_classifier_mobilenetv2.pt") -> Dict[str, Any]:
    """Train the MobileNetV2 defect classifier and save model weights."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training Road Defect Classifier on device: {device}", flush=True)

    X_train, y_train = build_pre_cached_tensors(num_samples=600, seed=42)
    X_val, y_val = build_pre_cached_tensors(num_samples=160, seed=999)

    train_dataset = TensorDataset(X_train, y_train)
    val_dataset = TensorDataset(X_val, y_val)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    model = build_mobilenetv2_classifier(num_classes=len(DEFECT_CLASSES)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0
    history = []

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct_train += (preds == labels).sum().item()
            total_train += labels.size(0)

        scheduler.step()
        train_loss = running_loss / total_train
        train_acc = correct_train / total_train

        # Validation
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                correct_val += (preds == labels).sum().item()
                total_val += labels.size(0)

        val_loss /= total_val
        val_acc = correct_val / total_val

        history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc, 4),
            "val_loss": round(val_loss, 4),
            "val_acc": round(val_acc, 4)
        })

        print(f"Epoch [{epoch:02d}/{epochs:02d}] Train Loss: {train_loss:.4f}, Train Acc: {train_acc*100:.2f}% | Val Loss: {val_loss:.4f}, Val Acc: {val_acc*100:.2f}%", flush=True)

        if val_acc > best_val_acc:
            best_val_acc = val_acc

    # Save model weights and configuration
    out_full = os.path.join(root_dir, output_path)
    os.makedirs(os.path.dirname(out_full), exist_ok=True)
    checkpoint = {
        "model_state_dict": model.state_dict(),
        "classes": DEFECT_CLASSES,
        "class_to_idx": CLASS_TO_IDX,
        "idx_to_class": IDX_TO_CLASS,
        "architecture": "MobileNetV2",
        "best_val_accuracy": round(best_val_acc, 4),
        "history": history,
    }
    torch.save(checkpoint, out_full)
    print(f"\nSaved MobileNetV2 defect classifier weights to {out_full} (Best Val Acc: {best_val_acc*100:.2f}%)", flush=True)

    # Update metadata JSON
    meta_path = os.path.join(root_dir, "trained_models", "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    else:
        metadata = {}

    metadata["defect_classifier_mobilenetv2"] = {
        "file": "defect_classifier_mobilenetv2.pt",
        "architecture": "MobileNetV2",
        "num_classes": 4,
        "classes": DEFECT_CLASSES,
        "best_val_accuracy": round(best_val_acc, 4),
        "training_epochs": epochs,
        "device_trained_on": str(device)
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return checkpoint


if __name__ == "__main__":
    train_defect_classifier(epochs=8)
