"""
Generate 16 diverse, realistic sample defect images for testing Model 1 & 2 (Defect Detection & Severity Estimation).
"""
import os
import sys
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "sample_images")
os.makedirs(out_dir, exist_ok=True)

def generate_pothole(severity="HIGH", seed=101):
    random.seed(seed)
    np.random.seed(seed)
    asphalt_c = random.randint(55, 80)
    img = Image.new("RGB", (224, 224), (asphalt_c, asphalt_c, asphalt_c))
    draw = ImageDraw.Draw(img)
    
    # Asphalt texture noise
    for _ in range(1200):
        nx, ny = random.randint(0, 223), random.randint(0, 223)
        col = asphalt_c + random.randint(-15, 15)
        draw.point((nx, ny), fill=(col, col, col))

    cx, cy = 112, 112
    if severity == "CRITICAL":
        rx, ry = 70, 50
        depth_col = (10, 8, 7)
    elif severity == "HIGH":
        rx, ry = 55, 38
        depth_col = (18, 14, 12)
    elif severity == "MEDIUM":
        rx, ry = 40, 28
        depth_col = (25, 20, 18)
    else: # LOW
        rx, ry = 25, 18
        depth_col = (35, 30, 25)

    # Jagged crater contour
    num_pts = 16
    pts = []
    for i, a in enumerate(np.linspace(0, 2 * np.pi, num_pts, endpoint=False)):
        rad_x = rx * random.uniform(0.8, 1.25)
        rad_y = ry * random.uniform(0.8, 1.25)
        pts.append((int(cx + np.cos(a) * rad_x), int(cy + np.sin(a) * rad_y)))

    draw.polygon(pts, fill=depth_col, outline=(12, 10, 8))
    # Inner shadow / deep crater core
    draw.ellipse([cx - rx//2, cy - ry//2, cx + rx//2, cy + ry//2], fill=(5, 4, 3))
    
    # Road cracks spreading outwards
    for _ in range(6):
        start_pt = random.choice(pts)
        curr = list(start_pt)
        for _ in range(random.randint(4, 8)):
            nxt = [curr[0] + random.randint(-8, 8), curr[1] + random.randint(-8, 8)]
            draw.line([tuple(curr), tuple(nxt)], fill=(20, 18, 16), width=random.randint(1, 2))
            curr = nxt

    return img.filter(ImageFilter.GaussianBlur(0.4))

def generate_streetlight(severity="HIGH", seed=201):
    random.seed(seed)
    np.random.seed(seed)
    sky_col = (random.randint(15, 30), random.randint(20, 40), random.randint(45, 70))
    img = Image.new("RGB", (224, 224), sky_col)
    draw = ImageDraw.Draw(img)
    
    px = 112
    if severity == "CRITICAL":
        # Fallen / severely tilted pole
        draw.line([(60, 224), (160, 80)], fill=(70, 75, 80), width=9)
        draw.line([(160, 80), (190, 60)], fill=(80, 85, 90), width=6)
        draw.polygon([(185, 55), (210, 50), (205, 70), (180, 68)], fill=(40, 45, 50), outline=(180, 50, 40))
        # Exposed sparks / broken wires
        draw.line([(190, 60), (200, 75)], fill=(255, 200, 50), width=2)
        draw.line([(192, 62), (205, 68)], fill=(255, 120, 30), width=2)
    elif severity == "HIGH":
        # Upright pole, smashed fixture
        draw.rectangle([px - 5, 25, px + 5, 224], fill=(75, 80, 85))
        draw.line([(px, 45), (px + 55, 25)], fill=(85, 90, 95), width=5)
        draw.polygon([(px + 45, 25), (px + 75, 20), (px + 70, 42), (px + 40, 40)], fill=(35, 40, 45), outline=(180, 80, 50))
    elif severity == "MEDIUM":
        # Upright pole, unlit / dark bulb
        draw.rectangle([px - 4, 30, px + 4, 224], fill=(80, 85, 90))
        draw.line([(px, 50), (px + 50, 30)], fill=(90, 95, 100), width=4)
        draw.polygon([(px + 40, 30), (px + 65, 26), (px + 60, 45), (px + 35, 43)], fill=(50, 55, 60))
    else: # LOW
        # Flickering fixture
        draw.rectangle([px - 4, 30, px + 4, 224], fill=(85, 90, 95))
        draw.line([(px, 50), (px + 48, 32)], fill=(95, 100, 105), width=4)
        draw.polygon([(px + 38, 32), (px + 62, 28), (px + 58, 45), (px + 34, 43)], fill=(70, 75, 80))
        draw.ellipse([px + 42, 45, px + 54, 57], fill=(240, 230, 140, 120))

    return img.filter(ImageFilter.GaussianBlur(0.4))

def generate_garbage(severity="HIGH", seed=301):
    random.seed(seed)
    np.random.seed(seed)
    pavement_c = (120, 115, 105)
    img = Image.new("RGB", (224, 224), pavement_c)
    draw = ImageDraw.Draw(img)
    # Road border / curb
    draw.rectangle([0, 150, 224, 224], fill=(65, 65, 70))
    draw.line([(0, 150), (224, 150)], fill=(180, 180, 180), width=4)
    
    if severity == "CRITICAL":
        heap_poly = [(15, 150), (60, 60), (130, 50), (180, 70), (210, 150)]
        num_items = 90
    elif severity == "HIGH":
        heap_poly = [(35, 150), (75, 80), (140, 75), (190, 150)]
        num_items = 60
    elif severity == "MEDIUM":
        heap_poly = [(50, 150), (85, 105), (135, 100), (170, 150)]
        num_items = 35
    else: # LOW
        heap_poly = [(70, 150), (95, 125), (130, 120), (150, 150)]
        num_items = 15

    draw.polygon(heap_poly, fill=(85, 75, 60))
    for _ in range(num_items):
        gx = random.randint(heap_poly[0][0], heap_poly[-1][0])
        gy = random.randint(heap_poly[1][1], 148)
        color = (random.randint(40, 240), random.randint(40, 240), random.randint(40, 240))
        draw.ellipse([gx-4, gy-4, gx+4, gy+4], fill=color)

    return img.filter(ImageFilter.GaussianBlur(0.5))

def generate_drainage(severity="HIGH", seed=401):
    random.seed(seed)
    np.random.seed(seed)
    img = Image.new("RGB", (224, 224), (55, 60, 65))
    draw = ImageDraw.Draw(img)
    
    if severity == "CRITICAL":
        # Deep submerged flood covering whole lane
        draw.rectangle([0, 60, 224, 224], fill=(35, 55, 75))
        for y in range(70, 224, 8):
            draw.line([(0, y), (224, y + random.randint(-3, 3))], fill=(50, 80, 110), width=3)
        # Open submerged manhole vortex
        draw.ellipse([80, 120, 144, 160], fill=(15, 25, 35), outline=(60, 95, 130), width=3)
    elif severity == "HIGH":
        # Severe waterlogging across half lane
        draw.rectangle([0, 110, 224, 224], fill=(40, 60, 80))
        for y in range(115, 224, 10):
            draw.line([(0, y), (224, y + random.randint(-2, 2))], fill=(55, 85, 115), width=2)
        # Clogged drain grate with debris
        draw.rectangle([70, 80, 150, 120], fill=(30, 30, 35))
        for x in range(75, 148, 8):
            draw.line([(x, 82), (x, 118)], fill=(70, 70, 75), width=2)
    elif severity == "MEDIUM":
        # Moderate curb ponding
        draw.rectangle([30, 140, 224, 224], fill=(45, 65, 85))
        draw.rectangle([80, 120, 140, 150], fill=(35, 35, 40))
        for x in range(85, 138, 10):
            draw.line([(x, 122), (x, 148)], fill=(75, 75, 80), width=2)
    else: # LOW
        draw.rectangle([60, 160, 200, 220], fill=(50, 70, 90))

    return img.filter(ImageFilter.GaussianBlur(0.4))

def generate_clean_road(seed=501):
    random.seed(seed)
    np.random.seed(seed)
    asphalt_c = 85
    img = Image.new("RGB", (224, 224), (asphalt_c, asphalt_c, asphalt_c))
    draw = ImageDraw.Draw(img)
    # Perspective clean lane lines
    draw.polygon([(95, 0), (108, 0), (75, 224), (98, 224)], fill=(235, 205, 45))
    draw.polygon([(116, 0), (129, 0), (126, 224), (149, 224)], fill=(235, 205, 45))
    draw.line([(15, 0), (0, 224)], fill=(245, 245, 245), width=4)
    draw.line([(209, 0), (224, 224)], fill=(245, 245, 245), width=4)
    return img.filter(ImageFilter.GaussianBlur(0.3))

# Generate all 16 distinct test images
samples = [
    ("pothole_critical_deep.jpg", generate_pothole("CRITICAL", 101)),
    ("pothole_severe_waterlogged.jpg", generate_pothole("HIGH", 102)),
    ("pothole_moderate_cracked.jpg", generate_pothole("MEDIUM", 103)),
    ("pothole_minor_surface.jpg", generate_pothole("LOW", 104)),
    
    ("streetlight_pole_fallen.jpg", generate_streetlight("CRITICAL", 201)),
    ("streetlight_lamp_damaged.jpg", generate_streetlight("HIGH", 202)),
    ("streetlight_day_burn.jpg", generate_streetlight("MEDIUM", 203)),
    ("streetlight_flickering.jpg", generate_streetlight("LOW", 204)),
    
    ("garbage_massive_illegal_dump.jpg", generate_garbage("CRITICAL", 301)),
    ("garbage_overflowing_bin.jpg", generate_garbage("HIGH", 302)),
    ("garbage_litter_shoulder.jpg", generate_garbage("MEDIUM", 303)),
    ("garbage_minor_leaf_pile.jpg", generate_garbage("LOW", 304)),
    
    ("drainage_severe_submerged_road.jpg", generate_drainage("CRITICAL", 401)),
    ("drainage_clogged_grate.jpg", generate_drainage("HIGH", 402)),
    ("drainage_manhole_pond.jpg", generate_drainage("MEDIUM", 403)),
    
    ("clear_clean_asphalt.jpg", generate_clean_road(501)),
]

for fname, im in samples:
    path = os.path.join(out_dir, fname)
    im.save(path, quality=95)
    print(f"Generated sample image: {fname}")

print(f"\nSuccessfully generated {len(samples)} diverse test images in {out_dir}")
