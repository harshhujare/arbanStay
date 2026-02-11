import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  Loader2,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ImageUploader from "../../components/Property/ImageUploader";
import propertyService from "../../api/propertyService";

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Kitchen",
  "TV",
  "Parking",
  "Pool",
  "Gym",
  "Washer",
  "Workspace",
  "Balcony",
  "Pet Friendly",
  "Garden",
];

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Stage 1: Basic Information
    title: "",
    description: "",
    amenities: [],
    rentType: "entire_property",
    rentAmount: "",
    maxGuests: 2,

    // Stage 2: Location
    location: {
      city: "",
      address: "",
    },
    coordinates: {
      latitude: 19.076, // Default: Mumbai
      longitude: 72.8777,
    },

    // Stage 3: Images
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  const setCoordinates = (lat, lng) => {
    setFormData({
      ...formData,
      coordinates: {
        latitude: lat,
        longitude: lng,
      },
    });
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError("Unable to get current location: " + error.message);
        },
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  const validateStage1 = () => {
    if (!formData.title || formData.title.length < 10) {
      setError("Property title must be at least 10 characters");
      return false;
    }
    if (!formData.description || formData.description.length < 50) {
      setError("Description must be at least 50 characters");
      return false;
    }
    if (!formData.rentAmount || parseFloat(formData.rentAmount) < 500) {
      setError("Rent amount must be at least ₹500 per month");
      return false;
    }
    setError("");
    return true;
  };

  const validateStage2 = () => {
    if (!formData.location.city) {
      setError("Please enter a city name");
      return false;
    }
    if (!formData.coordinates.latitude || !formData.coordinates.longitude) {
      setError("Please select a location on the map");
      return false;
    }
    setError("");
    return true;
  };

  const validateStage3 = () => {
    if (imageFiles.length === 0) {
      setError("Please upload at least one image");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStage === 1) isValid = validateStage1();
    if (currentStage === 2) isValid = validateStage2();

    if (isValid) {
      setCurrentStage(currentStage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStage(currentStage - 1);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStage3()) return;

    try {
      setLoading(true);
      setError("");

      // Step 1: Upload images
      const formDataToUpload = new FormData();
      imageFiles.forEach((img) => {
        if (img.file) {
          formDataToUpload.append("images", img.file);
        }
      });

      const uploadResult = await propertyService.uploadImages(formDataToUpload);

      // Step 2: Create property with all data
      const propertyData = {
        title: formData.title,
        description: formData.description,
        amenities: formData.amenities,
        rentType: formData.rentType,
        rentAmount: parseFloat(formData.rentAmount),
        maxGuests: parseInt(formData.maxGuests),
        location: formData.location,
        coordinates: formData.coordinates,
        images: uploadResult.images,
      };

      await propertyService.createProperty(propertyData);

      // Success! Navigate back to dashboard
      navigate("/host/dashboard");
    } catch (error) {
      setError(error.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Add New Property
          </h1>

          {/* Progress Indicator */}
          <div className="mt-6 flex items-center justify-between">
            {[1, 2, 3].map((stage) => (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex items-center relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                      stage < currentStage
                        ? "bg-green-500 text-white"
                        : stage === currentStage
                          ? "bg-[#FF5A5F] text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stage < currentStage ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      stage
                    )}
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium hidden sm:block ${
                      stage === currentStage
                        ? "text-[#FF5A5F]"
                        : "text-gray-600"
                    }`}
                  >
                    {stage === 1 && "Basic Info"}
                    {stage === 2 && "Location"}
                    {stage === 3 && "Images"}
                  </span>
                </div>
                {stage < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      stage < currentStage ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Stage 1: Basic Information */}
          {currentStage === 1 && (
            <Stage1
              formData={formData}
              handleChange={handleChange}
              toggleAmenity={toggleAmenity}
            />
          )}

          {/* Stage 2: Location */}
          {currentStage === 2 && (
            <Stage2
              formData={formData}
              handleChange={handleChange}
              setCoordinates={setCoordinates}
              useCurrentLocation={useCurrentLocation}
            />
          )}

          {/* Stage 3: Images */}
          {currentStage === 3 && (
            <Stage3 images={imageFiles} onImagesChange={setImageFiles} />
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={currentStage === 1 || loading}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {currentStage < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white rounded-lg hover:shadow-lg transition font-medium"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Create Property
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stage 1 Component
function Stage1({ formData, handleChange, toggleAmenity }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <p className="text-gray-600 mb-6">
          Tell us about your property and what makes it special
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Property Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
          placeholder="e.g., Cozy Studio Apartment in Bandra"
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.title.length}/100 characters (min 10)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent resize-none"
          placeholder="Describe your property, its features, nearby attractions, and what makes it special..."
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.description.length}/2000 characters (min 50)
        </p>
      </div>

      {/* Rent Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Rent Type *
          </label>
          <select
            name="rentType"
            value={formData.rentType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
          >
            <option value="entire_property">Entire Property Per Month</option>
            <option value="per_person">Per Person Per Month</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Rent Amount (₹/month) *
          </label>
          <input
            type="number"
            name="rentAmount"
            value={formData.rentAmount}
            onChange={handleChange}
            min="500"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
            placeholder="5000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Maximum Guests *
        </label>
        <input
          type="number"
          name="maxGuests"
          value={formData.maxGuests}
          onChange={handleChange}
          min="1"
          max="20"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Amenities
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {AMENITIES.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                formData.amenities.includes(amenity)
                  ? "border-[#FF5A5F] bg-red-50 text-[#FF5A5F] font-medium"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stage 2 Component
function Stage2({
  formData,
  handleChange,
  setCoordinates,
  useCurrentLocation,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Location Details
        </h2>
        <p className="text-gray-600 mb-6">
          Help guests find your property with precise location information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            City *
          </label>
          <input
            type="text"
            name="location.city"
            value={formData.location.city}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
            placeholder="Mumbai"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Address (Optional)
          </label>
          <input
            type="text"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
            placeholder="Street address"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-900">
            Pin Location on Map *
          </label>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <MapPin className="w-4 h-4" />
            Use Current Location
          </button>
        </div>

        <div className="h-80 rounded-lg overflow-hidden border-2 border-gray-300">
          <MapContainer
            center={[
              formData.coordinates.latitude,
              formData.coordinates.longitude,
            ]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker setCoordinates={setCoordinates} />
            <Marker
              position={[
                formData.coordinates.latitude,
                formData.coordinates.longitude,
              ]}
            />
          </MapContainer>
        </div>

        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Selected Coordinates:</strong>
          </p>
          <p className="text-sm text-gray-600">
            Latitude: {formData.coordinates.latitude.toFixed(6)}, Longitude:{" "}
            {formData.coordinates.longitude.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component to handle map clicks
function LocationMarker({ setCoordinates }) {
  useMapEvents({
    click(e) {
      setCoordinates(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Stage 3 Component
function Stage3({ images, onImagesChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Property Images
        </h2>
        <p className="text-gray-600 mb-6">
          Upload high-quality photos to showcase your property
        </p>
      </div>

      <ImageUploader images={images} onImagesChange={onImagesChange} />

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tips for great photos:</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>Use natural lighting when possible</li>
          <li>Show different angles of each room</li>
          <li>Include photos of amenities and outdoor spaces</li>
          <li>Make sure images are clear and well-lit</li>
        </ul>
      </div>
    </div>
  );
}
