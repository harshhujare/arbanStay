import { useState, useEffect } from "react";
import { X, Upload, Trash2, Loader2 } from "lucide-react";

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 4,
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      alert(
        `You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`,
      );
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs with loading state
    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      loading: true, // Start with loading state
      uploaded: false,
    }));

    // Add images immediately
    const updatedImages = [...images, ...newImages];
    onImagesChange(updatedImages);

    // Simulate upload progress for each image (in real implementation, this would track actual upload)
    newImages.forEach((img, idx) => {
      setTimeout(
        () => {
          const imageIndex = images.length + idx;
          const imagesWithProgress = [...updatedImages];
          if (imagesWithProgress[imageIndex]) {
            imagesWithProgress[imageIndex] = {
              ...imagesWithProgress[imageIndex],
              loading: false,
              uploaded: true,
            };
            onImagesChange(imagesWithProgress);
          }
        },
        1000 + idx * 500,
      ); // Stagger completion for visual effect
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    e.preventDefault();
    handleFiles(e.target.files);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div>
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-[#FF5A5F] bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">
            Drop your images here, or click to browse
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, WEBP up to 5MB each (max {maxImages} images)
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {images.length} / {maxImages} uploaded
          </p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              {/* Image */}
              <img
                src={image.preview || image}
                alt={`Upload ${index + 1}`}
                className={`w-full h-full object-cover rounded-lg border border-gray-200 transition-opacity ${
                  image.loading ? "opacity-50" : "opacity-100"
                }`}
              />

              {/* Loading Overlay */}
              {image.loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <span className="text-white text-xs font-medium">
                      Uploading...
                    </span>
                  </div>
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={() => removeImage(index)}
                disabled={image.loading}
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>

              {/* Cover Badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {images.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {images.length} / {maxImages} images
          </p>
          {images.some((img) => img.loading) && (
            <p className="text-sm text-[#FF5A5F] font-medium">
              Processing images...
            </p>
          )}
        </div>
      )}

      {/* Max Images Warning */}
      {images.length >= maxImages && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Maximum {maxImages} images reached. Remove an image to upload a
            different one.
          </p>
        </div>
      )}
    </div>
  );
}
