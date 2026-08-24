import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.train_defect_classifier import generate_single_defect_image

out_dir = os.path.join(root_dir, "data", "sample_images")
os.makedirs(out_dir, exist_ok=True)

filenames = ["pothole.jpg", "streetlight_defect.jpg", "garbage_accumulation.jpg", "drainage_issue.jpg"]
for label, fname in enumerate(filenames):
    img = generate_single_defect_image(label=label, seed=1234 + label)
    img.save(os.path.join(out_dir, fname), quality=95)
    print(f"Regenerated sample image {fname} for class {label}")
