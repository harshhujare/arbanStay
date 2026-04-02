import { User } from "lucide-react";
import { useState, useRef } from "react";
import apiClient from "../../api/config";

export default function ProfileImageUpload({ currentImage, onImageUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [tempPreview, setTempPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Show temporary preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient.post(
        "/upload/profile-picture",
        formData,
      );

      console.log("Upload successful, URL:", response.image);

      // Clear temp preview and update parent with new image URL
      setTempPreview(null);
      onImageUpdate(response.image);

      alert(
        "Profile picture uploaded successfully! Click 'Save' to update your profile.",
      );
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(`Upload failed: ${error.message || "Please try again."}`);
      setTempPreview(null);
    } finally {
      setUploading(false);
    }
  };

  // Simple: show temp preview during upload, otherwise show current image
  const displayImage = tempPreview || currentImage;

  console.log("displayImage:", displayImage);
  console.log("uploading:", uploading);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Simple circular image - just like PropertyCard */}
      <div
        onClick={handleImageClick}
        className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 hover:border-gray-300 cursor-pointer bg-gray-100"
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        disabled={uploading}
      />

      <button
        onClick={handleImageClick}
        disabled={uploading}
        className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Change Photo"}
      </button>

      <p className="text-xs text-gray-500">Max size: 5MB</p>
    </div>
  );
}
