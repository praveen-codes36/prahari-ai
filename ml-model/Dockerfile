# Hugging Face Spaces (Docker SDK) deployment for the Prahari-AI ML server.
# CPU-only PyTorch wheel is used deliberately — the default PyPI torch wheel
# pulls in ~2GB of CUDA libraries that are useless (and won't even install
# cleanly) on a CPU-only free host. This keeps the image small and the build
# fast enough to fit in free build-time limits.

FROM python:3.11-slim

WORKDIR /app

# System deps needed by Pillow/opencv-style image libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install CPU-only torch/torchvision first (smaller, faster), then the rest
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

# Hugging Face Spaces sets $PORT (defaults to 7860); server.py reads it.
ENV PORT=7860
EXPOSE 7860

CMD ["python", "server.py"]
