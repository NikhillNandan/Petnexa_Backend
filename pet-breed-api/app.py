from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io
import os

from class_names import CLASS_NAMES
from breed_info import get_breed_info

app = FastAPI(
    title="Pet Breed Classification API",
    description="Predicts dog/cat breed from an image",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Robust model loading
MODEL_PATH = "pet_breed_model_fixed.keras"
if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model file {MODEL_PATH} not found.")
    model = None
else:
    try:
        model = load_model(MODEL_PATH)
        print(f"Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"ERROR loading model: {e}")
        model = None

IMG_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 0.50


def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    img_array = np.array(image, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def predict_breed(image: Image.Image) -> dict:
    if model is None:
        return {
            "status": "error",
            "message": "Model not loaded. Please contact administrator."
        }

    processed_image = preprocess_image(image)
    predictions = model.predict(processed_image, verbose=0)
    
    # Ensure predictions are within bounds
    if predictions.shape[1] > len(CLASS_NAMES):
        print(f"Warning: Model output classes ({predictions.shape[1]}) exceed CLASS_NAMES ({len(CLASS_NAMES)})")
    
    class_id = int(np.argmax(predictions))
    confidence = float(np.max(predictions))

    breed = CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else "unknown"
    animal = "cat" if breed.startswith("cat") else "dog"

    # Base result
    result = {
        "status": "success",
        "animal": animal,
        "breed": breed,
        "confidence": round(confidence, 3)
    }

    if confidence < CONFIDENCE_THRESHOLD:
        result.update({
            "breed": "uncertain",
            "status": "uncertain",
            "message": f"Breed is uncertain (looks like a {animal}). Unable to predict accurately. Please try a clearer photo."
        })
        # We still try to provide info if we matched a breed partially
        # return result # Or continue to provide data as 'best guess'
    
    breed_data = get_breed_info(breed)
    if breed_data:
        # Standardize keys to match what the website/PHP backend expects
        result.update({
            "breed_name": breed_data["breed_name"],
            "animal_type": breed_data["animal_type"],
            "food_best": breed_data["recommended_food"]["best_choice"],
            "food_secondary": breed_data["recommended_food"]["secondary_option"],
            "feeding_frequency": breed_data["recommended_food"]["feeding_frequency"],
            "vet_checkup": breed_data["health_care_tips"]["vet_checkup_frequency"],
            "dental_care": breed_data["health_care_tips"]["dental_care"],
            "exercise": breed_data["health_care_tips"]["exercise_needs"],
            "grooming": breed_data["health_care_tips"]["grooming_needs"],
            "dos": breed_data["dos"],
            "donts": breed_data["donts"],
            "best_suited": breed_data["lifestyle_guidance"]["best_suited_for"],
            "climate": breed_data["lifestyle_guidance"]["climate_preference"],
            "great_with": breed_data["lifestyle_guidance"]["great_with"]
        })
        
        # Keep original nested structure as fallback for mobile app compatibility
        result["recommended_food"] = breed_data["recommended_food"]
        result["health_care_tips"] = breed_data["health_care_tips"]
        result["lifestyle_guidance"] = breed_data["lifestyle_guidance"]

    return result


@app.get("/")
def home():
    return {
        "message": "Pet Breed Classification API is running",
        "total_classes": len(CLASS_NAMES)
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()

    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    result = predict_breed(image)
    return result
